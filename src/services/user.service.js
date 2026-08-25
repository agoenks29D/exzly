const _ = require('lodash');
const { UserModel } = require('@exzly-models');
const BaseService = require('./base.service');

/**
 * UserService
 *
 * Every user-related read/write used to be scattered across
 * `routes/api/users.js`, `routes/admin/index.js`, `routes/web/index.js`,
 * `middlewares/auth/*` and `validators/*`, each calling `UserModel`
 * directly. That made the same authorization/business rules (e.g. "an
 * admin can't demote a user created before them") easy to duplicate or
 * drift apart.
 *
 * This service is the single place those rules live now. It mirrors the
 * shape of a Nest.js `@Injectable()` service on purpose, so promoting it to
 * a real class with dependency injection during the TypeScript migration
 * is a copy/paste job rather than a redesign.
 */
class UserService extends BaseService {
  constructor() {
    super(UserModel);
  }

  /**
   * Build a Sequelize `{ order, where }` clause from a DataTables-style
   * request query. Thin wrapper kept here (instead of only on the model)
   * so routes never need to know the model exists.
   *
   * @param {import('express').Request} req
   */
  buildDataTablesQuery(req) {
    return this.model.dataTablesQuery(req);
  }

  /**
   * Paginated user listing, mirrors the previous `/api/users` handler.
   *
   * @param {import('express').Request} req
   * @param {{size: number, skip: number, inTrash: boolean}} pagination
   */
  async paginate(req, pagination) {
    const { order, where } = this.buildDataTablesQuery(req);
    const { size, skip, inTrash } = pagination;

    const queryOptions = {
      where,
      order,
      paranoid: !inTrash,
      limit: size,
      offset: skip,
    };

    const [{ count, rows }, totalCount] = await Promise.all([
      this.findAndCountAll(queryOptions),
      this.count({ paranoid: !inTrash }),
    ]);

    return {
      rows,
      count,
      totalCount,
      hasNext: queryOptions.offset + rows.length < count,
    };
  }

  /**
   * @param {string} email
   */
  findByEmail(email) {
    return this.findOne({ where: { email } });
  }

  /**
   * @param {string} username
   */
  findByUsername(username) {
    return this.findOne({ where: { username } });
  }

  /**
   * Find a user by email OR username, used for sign-in / forgot-password
   * where the caller doesn't know which one was provided.
   *
   * @param {string} identity
   * @param {{withPassword?: boolean}} [options]
   */
  findByIdentity(identity, options = {}) {
    const { Op } = require('sequelize');

    return this.findOne({
      where: { [Op.or]: [{ email: identity }, { username: identity }] },
      ...(options.withPassword ? { attributes: { include: ['password'] } } : {}),
    });
  }

  /**
   * Count soft-deleted (trashed) users.
   */
  countTrashed() {
    const { Op } = require('sequelize');
    return this.count({ where: { deletedAt: { [Op.ne]: null } }, paranoid: false });
  }

  /**
   * Create a new user account.
   *
   * @param {{email: string, username: string, password: string, isAdmin?: boolean, gender?: string, fullName: string}} data
   */
  createUser(data) {
    return this.create({
      email: data.email,
      username: data.username,
      password: data.password,
      isAdmin: data.isAdmin,
      gender: data.gender,
      fullName: data.fullName,
    });
  }

  /**
   * Return a plain JSON representation with select fields stripped, used
   * whenever the caller isn't allowed to see everything (e.g. viewing
   * someone else's profile).
   *
   * @param {InstanceType<typeof UserModel>} user
   * @param {string[]} fieldsToOmit
   */
  toSafeJSON(user, fieldsToOmit = []) {
    return _.omit(user.toJSON(), fieldsToOmit);
  }

  /**
   * Update a user's own profile (full name / gender only).
   *
   * @param {number|string} userId
   * @param {{fullName?: string, gender?: string}} data
   */
  updateProfile(userId, data) {
    return this.updateById(userId, { fullName: data.fullName, gender: data.gender });
  }

  /**
   * Update login credentials.
   *
   * @param {number|string} userId
   * @param {{email?: string, username?: string, newPassword?: string}} data
   */
  updateCredentials(userId, data) {
    return this.updateById(userId, {
      email: data.email,
      username: data.username,
      password: data.newPassword,
    });
  }

  /**
   * Set or clear a user's profile photo.
   *
   * @param {number|string} userId
   * @param {string|null} photoProfile - pass `null` to remove the photo.
   */
  updatePhoto(userId, photoProfile) {
    return this.updateById(userId, { photoProfile });
  }

  /**
   * Promote a user to admin. Business rule: a user cannot be promoted
   * twice — caller is responsible for surfacing that as an HTTP error.
   *
   * @param {number|string} userId
   */
  async promote(userId) {
    const user = await this.findById(userId);

    if (!user) {
      return { user: null, alreadyAdmin: false };
    }

    if (user.isAdmin) {
      return { user, alreadyAdmin: true };
    }

    await user.update({ isAdmin: true });
    return { user, alreadyAdmin: false };
  }

  /**
   * Demote an admin back to a regular user. Business rule: an admin can
   * only demote another admin whose account is *older* than their own,
   * and never themselves.
   *
   * @param {number|string} actingAdminId
   * @param {number|string} targetUserId
   */
  async demote(actingAdminId, targetUserId) {
    const [actingAdmin, targetUser] = await Promise.all([
      this.findById(actingAdminId),
      this.findById(targetUserId),
    ]);

    if (!targetUser) {
      return { status: 'not-found' };
    }

    if (!targetUser.isAdmin) {
      return { status: 'not-admin' };
    }

    if (String(targetUser.id) === String(actingAdminId)) {
      return { status: 'self' };
    }

    if (new Date(actingAdmin.createdAt) > new Date(targetUser.createdAt)) {
      return { status: 'older-account' };
    }

    await targetUser.update({ isAdmin: false });
    return { status: 'ok', user: targetUser };
  }

  /**
   * Business rules around deleting a user account, shared between the
   * "delete own account" and "admin deletes a user" flows.
   *
   * @param {number|string} requesterId
   * @param {boolean} requesterIsAdmin
   * @param {number|string} targetUserId
   * @param {boolean} force - hard-delete an already-trashed user.
   */
  async deleteAccount(requesterId, requesterIsAdmin, targetUserId, force) {
    const target = await this.findById(targetUserId, { paranoid: !force });

    if (!target) {
      return { status: 'not-found' };
    }

    if (String(target.id) === String(requesterId) && requesterIsAdmin) {
      return { status: 'self-admin' };
    }

    if (String(target.id) !== String(requesterId)) {
      if (!requesterIsAdmin) {
        return { status: 'forbidden' };
      }

      const requester = await this.findById(requesterId);
      if (new Date(requester.createdAt) > new Date(target.createdAt)) {
        return { status: 'older-account' };
      }
    }

    await target.destroy({ force });
    return { status: 'ok' };
  }
}

// Services are simple singletons for now (no DI container yet), mirroring
// how `@exzly-models` already exposes ready-to-use model instances.
module.exports = new UserService();
module.exports.UserService = UserService;
