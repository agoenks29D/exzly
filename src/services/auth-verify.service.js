const { AuthVerifyModel, UserModel } = require('@exzly-models');
const BaseService = require('./base.service');

class AuthVerifyService extends BaseService {
  constructor() {
    super(AuthVerifyModel);
  }

  /**
   * @param {string} code
   */
  findByCode(code) {
    return this.findOne({ where: { code } });
  }

  /**
   * @param {object} where
   */
  findLatest(where) {
    return this.findOne({ where, order: [['createdAt', 'DESC']] });
  }

  /**
   * Find a verification record together with its related user. Kept as a
   * dedicated method (instead of leaking `include: [{ model: UserModel }]`
   * to callers) so routes never need to know about Sequelize associations.
   *
   * @param {object} where
   */
  findWithUser(where) {
    return this.findOne({
      where,
      include: [{ model: UserModel, as: 'user' }],
    });
  }
}

module.exports = new AuthVerifyService();
module.exports.AuthVerifyService = AuthVerifyService;
