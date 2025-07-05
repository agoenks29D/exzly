/**
 * @typedef {typeof import('sequelize').Model} Model
 *
 * Sequelize model.
 *
 * @typedef {Object} DB
 * @property {import('sequelize').Sequelize} sequelize - Database.
 * @property {typeof import('sequelize').Sequelize} Sequelize - Sequelize.
 * @property {Model} AuthProviderModel - Auth provider model.
 * @property {Model} AuthTokenModel - Auth token model.
 * @property {Model} AuthVerifyModel - Auth verify model.
 * @property {Model} UserModel - User model.
 */

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

/** @type {DB} */
const db = {};
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

/**
 * @type {import('sequelize').Options}
 */
const config = require(`${process.cwd()}/database/${process.env.DATABASE_CONFIG}`)[env];

/**
 * @type {import('sequelize').Sequelize}
 */
let sequelize;
if (config.use_env_variable !== false) {
  sequelize = new Sequelize(config.use_env_variable, config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs.readdirSync(__dirname)
  .filter(
    (file) =>
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1,
  )
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
