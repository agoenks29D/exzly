/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // add column
    await queryInterface.addColumn('auth_provider', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    // add constraint
    await queryInterface.addConstraint('auth_provider', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'auth_provider_users_user_id',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },
  async down(queryInterface) {
    if (await queryInterface.tableExists('auth_provider')) {
      // remove constraint
      await queryInterface.removeConstraint('auth_provider', 'auth_provider_users_user_id');

      // remove column
      await queryInterface.removeColumn('auth_provider', 'user_id');
    }
  },
};
