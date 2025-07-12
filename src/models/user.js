const qs = require('qs');
const { SHA1 } = require('crypto-js');
const { Model, Op } = require('sequelize');

/**
 * @param {import('sequelize').Sequelize} sequelize
 * @param {import('sequelize').DataTypes} DataTypes
 */
module.exports = (sequelize, DataTypes) => {
  class UserModel extends Model {
    /**
     * Data tables query
     *
     * @param {import('express').Request} req
     */
    static dataTablesQuery(req) {
      const order = [];
      const where = {};
      const reqQuery = qs.parse(req.query);
      const fieldsName = Object.keys(UserModel.getAttributes());

      /**
       * Order query
       */
      if (Object.hasOwn(reqQuery, 'order') && Array.isArray(reqQuery.order)) {
        reqQuery.order.forEach((item) => {
          const fieldExist = fieldsName.indexOf(item.name) !== -1;

          if (fieldExist) {
            order.push([item.name, item.dir]);
          }
        });
      }

      /**
       * Search query
       */
      if (Object.hasOwn(req.query, 'search')) {
        const { search } = req.query;
        if (search?.value && search.value.length > 0) {
          if (search?.regex === 'true') {
            Object.assign(where, {
              [Op.or]: [
                {
                  username: {
                    [Op.regexp]: search.value,
                  },
                },
                {
                  fullName: {
                    [Op.regexp]: search.value,
                  },
                },
              ],
            });
          } else {
            Object.assign(where, {
              [Op.or]: [
                {
                  username: {
                    [Op.eq]: search.value,
                  },
                },
                {
                  fullName: {
                    [Op.substring]: search.value,
                  },
                },
              ],
            });
          }
        }
      }

      /**
       * Individual column searching
       */
      if (Object.hasOwn(reqQuery, 'columns') && Array.isArray(reqQuery.columns)) {
        for (let i = 0; i < reqQuery.columns.length; i++) {
          if (typeof reqQuery.columns[i] === 'object') {
            const column = reqQuery.columns[i];
            if (Object.hasOwn(column, 'name') && Object.hasOwn(column, 'search')) {
              if (column['search']?.value && column['search'].value.length > 0) {
                if (column['search']?.regex === 'true') {
                  if (fieldsName.indexOf(column['name']) !== -1) {
                    Object.assign(where, {
                      [column['name']]: {
                        [Op.regexp]: column['search'].value,
                      },
                    });
                  }
                } else {
                  if (fieldsName.indexOf(column['name']) !== -1) {
                    if (column['name'] === 'gender') {
                      Object.assign(where, {
                        [column['name']]: {
                          [Op.eq]: column['search'].value,
                        },
                      });
                    } else {
                      Object.assign(where, {
                        [column['name']]: {
                          [Op.substring]: column['search'].value,
                        },
                      });
                    }
                  }
                }
              }
            }
          }
        }
      }

      /**
       * Trashed data
       */
      if (reqQuery['in-trash']) {
        Object.assign(where, {
          deletedAt: { [Op.not]: null },
        });
      }

      return { order, where };
    }
  }

  UserModel.init(
    {
      email: {
        type: DataTypes.STRING,
        set(value) {
          this.setDataValue('email', value?.toLowerCase());
        },
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING(30),
        set(value) {
          this.setDataValue('username', value?.toLowerCase());
        },
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        set(value) {
          this.setDataValue('password', SHA1(value).toString());
        },
        allowNull: false,
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      gender: DataTypes.ENUM('male', 'female'),
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      photoProfile: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'UserModel',
      tableName: 'users',
      paranoid: true,
      defaultScope: {
        attributes: {
          exclude: ['password'],
        },
      },
    },
  );

  return UserModel;
};
