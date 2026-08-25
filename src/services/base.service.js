/**
 * @typedef {import('sequelize').Model} SequelizeModel
 * @typedef {import('sequelize').FindOptions} FindOptions
 * @typedef {import('sequelize').CreateOptions} CreateOptions
 * @typedef {import('sequelize').UpdateOptions} UpdateOptions
 * @typedef {import('sequelize').DestroyOptions} DestroyOptions
 * @typedef {import('sequelize').FindAndCountOptions} FindAndCountOptions
 */

/**
 * BaseService
 *
 * A thin, Nest.js-inspired "repository/service" layer that sits between
 * routes/controllers and Sequelize models.
 *
 * Routes must never import a Model directly (`@exzly-models`) to read or
 * write data anymore — they should go through a Service instead. This keeps
 * query logic, authorization-agnostic business rules, and data shaping in
 * one reusable place, which also makes the eventual TypeScript migration
 * (v2) considerably easier since each service can become an injectable
 * class with a well-defined public contract.
 */
class BaseService {
  /**
   * @param {typeof SequelizeModel} model - The Sequelize model this service wraps.
   */
  constructor(model) {
    if (!model) {
      throw new Error('BaseService requires a Sequelize model');
    }

    this.model = model;
  }

  /**
   * Find a single record by primary key.
   *
   * @param {number|string} id
   * @param {FindOptions} [options]
   * @returns {Promise<SequelizeModel|null>}
   */
  findById(id, options = {}) {
    return this.model.findByPk(id, options);
  }

  /**
   * Find a single record matching the given options.
   *
   * @param {FindOptions} [options]
   * @returns {Promise<SequelizeModel|null>}
   */
  findOne(options = {}) {
    return this.model.findOne(options);
  }

  /**
   * Find every record matching the given options.
   *
   * @param {FindOptions} [options]
   * @returns {Promise<SequelizeModel[]>}
   */
  findAll(options = {}) {
    return this.model.findAll(options);
  }

  /**
   * Find and count records matching the given options (pagination helper).
   *
   * @param {FindAndCountOptions} [options]
   * @returns {Promise<{count: number, rows: SequelizeModel[]}>}
   */
  findAndCountAll(options = {}) {
    return this.model.findAndCountAll(options);
  }

  /**
   * Count records matching the given options.
   *
   * @param {FindOptions} [options]
   * @returns {Promise<number>}
   */
  count(options = {}) {
    return this.model.count(options);
  }

  /**
   * Create a new record.
   *
   * @param {object} data
   * @param {CreateOptions} [options]
   * @returns {Promise<SequelizeModel>}
   */
  create(data, options = {}) {
    return this.model.create(data, options);
  }

  /**
   * Update a record instance in place. Throws nothing — returns null when
   * the record can't be found so callers decide how to respond (404, etc).
   *
   * @param {number|string} id
   * @param {object} data
   * @param {FindOptions} [findOptions]
   * @returns {Promise<SequelizeModel|null>}
   */
  async updateById(id, data, findOptions = {}) {
    const record = await this.model.findByPk(id, findOptions);

    if (!record) {
      return null;
    }

    return record.update(data);
  }

  /**
   * Soft or hard delete a record by primary key.
   *
   * @param {number|string} id
   * @param {DestroyOptions & FindOptions} [options] - `force: true` performs a hard delete.
   * @returns {Promise<boolean>} whether a record was found and destroyed.
   */
  async deleteById(id, options = {}) {
    const record = await this.model.findByPk(id, { paranoid: !options.force, ...options });

    if (!record) {
      return false;
    }

    await record.destroy({ force: options.force });
    return true;
  }

  /**
   * Restore a soft-deleted record by primary key.
   *
   * @param {number|string} id
   * @returns {Promise<boolean>} whether a record was found and restored.
   */
  async restoreById(id) {
    const record = await this.model.findByPk(id, { paranoid: false });

    if (!record) {
      return false;
    }

    await record.restore();
    return true;
  }
}

module.exports = BaseService;
