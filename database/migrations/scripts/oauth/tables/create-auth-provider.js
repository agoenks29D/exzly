/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'auth_provider',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        provider: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        provider_id: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        metadata: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      },
      {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
      },
    );

    await queryInterface.addConstraint('auth_provider', {
      type: 'unique',
      name: 'auth_provider_provider_provider_id',
      fields: ['provider', 'provider_id'],
    });
  },

  async down(queryInterface) {
    if (await queryInterface.tableExists('auth_provider')) {
      await queryInterface.dropTable('auth_provider');
    }
  },
};
