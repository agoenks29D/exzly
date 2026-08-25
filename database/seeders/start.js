/**
 * @typedef {Object} User
 * @property {string} email - The user's email.
 * @property {string} username - The username for logging in.
 * @property {string} password - The user's password in hashed format.
 * @property {boolean} is_admin - Indicates whether the user is an admin.
 * @property {'male' | 'female'} [gender] - The user's gender, can be 'male' or 'female' (optional).
 * @property {string} full_name - The user's full name.
 * @property {string} [photo_profile] - The URL of the user's profile picture (optional).
 * @property {Date} created_at - The time when the user was created.
 * @property {Date} updated_at - The time when the user's data was last updated.
 */

const crypto = require('node:crypto');
const sha1 = (string) => crypto.createHash('sha1').update(string).digest('hex');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    /**
     * Generate users as admin
     *
     * @type {User[]}
     */
    const defaultUsers = [
      {
        email: 'admin@exzly.dev',
        username: 'admin',
        password: sha1('admin').toString(),
        is_admin: true,
        full_name: 'Administrator',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        email: 'member@exzly.dev',
        username: 'member',
        password: sha1('member').toString(),
        is_admin: false,
        full_name: 'Member',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    // Insert users data
    await queryInterface.bulkInsert('users', defaultUsers);
  },
  async down(queryInterface) {
    // Delete users data
    await queryInterface.bulkDelete('users', null, {
      truncate: true,
    });
  },
};
