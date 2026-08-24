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
const moment = require('moment');
const { faker } = require('@faker-js/faker');

let lastDate = moment().subtract(1, 'years');
const startDate = moment().subtract(1, 'years');
const sha1 = (string) => crypto.createHash('sha1').update(string).digest('hex');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    /**
     * Generate username
     *
     * @param {string} firstName
     * @param {string} lastName
     * @returns {string}
     */
    const generateUsername = (firstName, lastName) => {
      let username = '';
      const regex = /^[a-zA-Z0-9](?!.*?[._]{2})[a-zA-Z0-9._]{0,28}[a-zA-Z0-9]$/u;

      do {
        const separator = faker.helpers.arrayElement(['.', '_']);
        const number = faker.helpers.arrayElement([null, faker.number.int({ min: 1, max: 99 })]);

        const cleanFirstName = firstName.replace(/[^a-zA-Z0-9]/g, '');
        const cleanLastName = lastName.replace(/[^a-zA-Z0-9]/g, '');

        username = `${cleanFirstName}${separator}${cleanLastName}`;

        if (number) {
          username = `${username}${number}`;
        }

        username = username.substring(0, 30).toLowerCase();
      } while (!regex.test(username));

      return username;
    };

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
        created_at: startDate.toDate(),
        updated_at: startDate.toDate(),
      },
      {
        email: 'member@exzly.dev',
        username: 'member',
        password: sha1('member').toString(),
        is_admin: false,
        full_name: 'Member',
        created_at: startDate.toDate(),
        updated_at: startDate.toDate(),
      },
    ];

    /**
     * Generate users as member
     *
     * @type {User[]}
     */
    const users = defaultUsers.concat(
      [...Array(998)].map(() => {
        const sexType = faker.person.sexType();
        const firstName = faker.person.firstName(sexType);
        const lastName = faker.person.lastName(sexType);
        const fullName = faker.person.fullName({
          firstName,
          lastName,
          sex: sexType,
        });
        const email = faker.internet.email({ firstName, lastName }).toLowerCase();
        const username = generateUsername(firstName, lastName);
        const password = sha1('member').toString();
        const photo_profile = faker.image.personPortrait({ sex: sexType, size: '512' });

        lastDate = lastDate.clone().add(8.8, 'hours');

        return {
          email,
          username,
          password,
          is_admin: false,
          gender: sexType,
          full_name: fullName,
          photo_profile,
          created_at: lastDate.toDate(),
          updated_at: lastDate.toDate(),
        };
      }),
    );

    // Insert users data
    await queryInterface.bulkInsert('users', users);
  },
  async down(queryInterface) {
    // Delete users data
    await queryInterface.bulkDelete('users', null, {
      truncate: true,
    });
  },
};
