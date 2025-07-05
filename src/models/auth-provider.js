const { Model } = require('sequelize');

/**
 * @param {import('sequelize').Sequelize} sequelize
 * @param {import('sequelize').DataTypes} DataTypes
 */
module.exports = (sequelize, DataTypes) => {
  class AuthProviderModel extends Model {
    /**
     * Model associations
     */
    static associate(models) {
      this.belongsTo(models.UserModel, {
        foreignKey: 'userId',
        as: 'user',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });
    }
  }

  AuthProviderModel.init(
    {
      provider: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      providerId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'AuthProviderModel',
      tableName: 'auth_provider',
      indexes: [
        {
          unique: true,
          fields: ['provider', 'provider_id'],
        },
      ],
    },
  );

  return AuthProviderModel;
};
