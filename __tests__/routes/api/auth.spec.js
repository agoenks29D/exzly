const request = require('supertest');
const { faker } = require('@faker-js/faker');
const { securityConfig } = require('@exzly-config');
const { AuthVerifyModel } = require('@exzly-models');
const app = require('@exzly-routes');
const { createRoute, randomInt } = require('@exzly-utils');

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

describe('RESTful-API: Authentication', () => {
  let accessToken, refreshToken;

  describe('Sign up', () => {
    it('test 1: should return 400 when no data is sent', async () => {
      await request(app).post(createRoute('api', '/auth/sign-up')).expect(400);
    });

    it('test 2: should return 400 when username is already taken', async () => {
      const sexType = faker.person.sexType();
      const firstName = faker.person.firstName(sexType);
      const lastName = faker.person.lastName(sexType);
      const fullName = faker.person.fullName({
        firstName,
        lastName,
        sex: sexType,
      });
      const email = faker.internet.email({ firstName, lastName }).toLowerCase();

      await request(app)
        .post(createRoute('api', '/auth/sign-up'))
        .send({
          email,
          username: 'admin',
          password: 'password',
          fullName,
        })
        .expect(400);
    });

    it('test 3: should return 400 when email is already in use', async () => {
      const sexType = faker.person.sexType();
      const firstName = faker.person.firstName(sexType);
      const lastName = faker.person.lastName(sexType);
      const fullName = faker.person.fullName({
        firstName,
        lastName,
        sex: sexType,
      });
      const email = 'member@exzly.dev';

      await request(app)
        .post(createRoute('api', '/auth/sign-up'))
        .send({
          email,
          username: 'admin',
          password: 'password',
          fullName,
        })
        .expect(400);
    });

    it('test 4: should return 201 when valid registration data is provided', async () => {
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

      const response = await request(app)
        .post(createRoute('api', '/auth/sign-up'))
        .send({
          email,
          username,
          password: 'password',
          fullName,
        })
        .expect(201);

      // Verify properties of the response
      expect(response.body).toHaveProperty('user');

      // Verify properties of the user object
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email');
      expect(response.body.user).toHaveProperty('username');
      expect(response.body.user).toHaveProperty('isAdmin');
      expect(response.body.user).toHaveProperty('fullName');

      // Verify the value of isAdmin, it should be false on sign-up
      expect(response.body.user.isAdmin).toBe(false);
    });
  });

  describe('Sign in', () => {
    it('test 1: should return 401 when password is incorrect', async () => {
      await request(app)
        .post(createRoute('api', '/auth/sign-in'))
        .send({ identity: 'admin', password: 'test' })
        .expect(401);
    });

    it('test 2: should return 401 when username does not exist', async () => {
      await request(app)
        .post(createRoute('api', '/auth/sign-in'))
        .send({ identity: 'test', password: 'admin' })
        .expect(401);
    });

    it('test 3: should return 200 when credentials are valid', async () => {
      const response = await request(app)
        .post(createRoute('api', '/auth/sign-in'))
        .send({ identity: 'admin', password: 'admin' })
        .expect(200);

      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;

      // Verify properties of the response
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');

      // Verify properties of the user object
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email');
      expect(response.body.user).toHaveProperty('username');
      expect(response.body.user).toHaveProperty('isAdmin');
      expect(response.body.user).toHaveProperty('fullName');
    });
  });

  describe('Refresh token', () => {
    it('test 1: should return 400 when no refresh token is sent', async () => {
      await request(app).post(createRoute('api', '/auth/refresh-token')).expect(400);
    });

    it('test 2: should return 400 when refresh token is invalid', async () => {
      await request(app)
        .post(createRoute('api', '/auth/refresh-token'))
        .send({ refreshToken: accessToken })
        .expect(400);
    });

    it('test 3: should return 200 when refresh token is valid', async () => {
      await request(app)
        .post(createRoute('api', '/auth/refresh-token'))
        .send({ refreshToken })
        .expect(200);
    });
  });

  describe('Verification code', () => {
    it('should return 400 when the verification code is invalid', async () => {
      await request(app)
        .post(createRoute('api', '/auth/verification'))
        .send({ code: randomInt(1, 10, 6) })
        .expect(400);
    });
  });

  describe('Reset password', () => {
    it('should return 400 when the reset token is invalid', async () => {
      await request(app)
        .post(createRoute('api', '/auth/reset-password'))
        .send({ token: 'invalid token' })
        .expect(400);
    });
  });

  describe('Sign out', () => {
    it('test 1: should return 400 when no refresh token is sent', async () => {
      await request(app).post(createRoute('api', '/auth/sign-out')).expect(400);
    });

    it('test 2: should return 400 when refresh token is invalid', async () => {
      await request(app)
        .post(createRoute('api', '/auth/sign-out'))
        .send({ refreshToken: accessToken })
        .expect(400);
    });

    it('test 3: should return 401 when authorization header is not provided', async () => {
      await request(app)
        .post(createRoute('api', '/auth/sign-out'))
        .send({ refreshToken })
        .expect(401);
    });

    it('test 4: should return 200 when user is authenticated and refresh token is valid', async () => {
      await request(app)
        .post(createRoute('api', '/auth/sign-out'))
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(200);
    });
  });
});

describe('RESTful-API: Authentication - Account recovery', () => {
  const memberUserId = 2;
  let resetPasswordCode, resetPaswordCookie, resetPasswordToken;

  describe('Valid account recovery', () => {
    it('test 1: should return 200 when identity exists', async () => {
      await request(app)
        .post(createRoute('api', '/auth/forgot-password'))
        .send({ identity: 'member' })
        .expect(200);
    });

    it('test 2: should return 200 when verification code is valid', async () => {
      const authVerify = await AuthVerifyModel.findOne({
        where: { userId: memberUserId },
        order: [['createdAt', 'DESC']],
      });

      if (authVerify) {
        resetPasswordCode = authVerify.code;
        const response = await request(app)
          .post(createRoute('api', '/auth/verification'))
          .send({ code: resetPasswordCode })
          .expect(200);

        resetPaswordCookie = response.headers['set-cookie'];
        resetPasswordToken = response.body.token;
      }
    });

    it('test 3: should return 200 when accessing reset-password page', async () => {
      await request(app)
        .get(createRoute('web', 'reset-password'))
        .set('Cookie', resetPaswordCookie)
        .expect(200);
    });

    it('test 4: should return 200 when reset-password token is valid', async () => {
      await request(app)
        .post(createRoute('api', '/auth/reset-password'))
        .send({ token: resetPasswordToken, newPassword: 'member', confirmPassword: 'member' })
        .expect(200);
    });
  });

  describe('Invalid account recovery', () => {
    it('test 1: should return 400 when verification code is reused', async () => {
      await request(app)
        .post(createRoute('api', '/auth/verification'))
        .send({ code: resetPasswordCode })
        .expect(400);
    });

    it('test 2: should return 400 when reset-password token is invalid', async () => {
      await request(app)
        .post(createRoute('api', '/auth/reset-password'))
        .send({ token: 'invalid token', newPassword: 'member', confirmPassword: 'member' })
        .expect(400);
    });

    it('test 3: should return 400 when reset-password token is reused', async () => {
      await request(app)
        .post(createRoute('api', '/auth/reset-password'))
        .send({ token: resetPasswordToken, newPassword: 'member', confirmPassword: 'member' })
        .expect(400);
    });

    it('test 4: should return 404 when forgot-password identity is unknown', async () => {
      await request(app)
        .post(createRoute('api', '/auth/forgot-password'))
        .send({ identity: 'unknown' })
        .expect(404);
    });
  });
});

describe('RESTful-API: Authentication - Rate limiter', () => {
  const { rateLimit } = securityConfig;

  describe('Sign up rate limiter', () => {
    const requests = [];
    const limit = rateLimit.maxSignUpAttempts;
    const overLimit = 3;

    it('should return 429 after exceeding max sign-up attempts', async () => {
      for (let i = 0; i < limit + overLimit; i++) {
        const sexType = faker.person.sexType();
        const firstName = faker.person.firstName(sexType);
        const lastName = faker.person.lastName(sexType);
        const fullName = faker.person.fullName({ firstName, lastName, sex: sexType });
        const email = faker.internet.email({ firstName, lastName }).toLowerCase();
        const username = generateUsername(firstName, lastName);

        requests.push(
          request(app)
            .post(createRoute('api', '/auth/sign-up'))
            .set('X-Forwarded-For', '123.123.123.123')
            .send({
              email,
              username,
              password: 'password',
              fullName,
            }),
        );
      }

      const responses = await Promise.all(requests);
      const successCount = responses.filter((res) => res.statusCode === 201).length;
      const rateLimitedCount = responses.filter((res) => res.statusCode === 429).length;

      expect(successCount).toBeLessThanOrEqual(limit);
      expect(rateLimitedCount).toBeGreaterThan(0);
    });
  });

  describe('Sign in rate limiter', () => {
    const requests = [];
    const limit = rateLimit.maxSignInAttempts;
    const overLimit = 3;

    it('should return 429 after exceeding max sign-in attempts', async () => {
      for (let i = 0; i < limit + overLimit; i++) {
        requests.push(
          request(app)
            .post(createRoute('api', '/auth/sign-in'))
            .set('X-Forwarded-For', '123.123.123.123')
            .send({
              identity: 'someuser',
              password: 'wrongpassword',
            }),
        );
      }

      const responses = await Promise.all(requests);
      const rateLimitedCount = responses.filter((res) => res.statusCode === 429).length;

      expect(rateLimitedCount).toBeGreaterThan(0);
    });
  });

  describe('Forgot password rate limiter', () => {
    const requests = [];
    const limit = rateLimit.maxForgotPasswordAttempts;
    const overLimit = 3;

    it('should return 429 after exceeding max forgot-password attempts', async () => {
      for (let i = 0; i < limit + overLimit; i++) {
        requests.push(
          request(app)
            .post(createRoute('api', '/auth/forgot-password'))
            .set('X-Forwarded-For', '123.123.123.123')
            .send({ identity: 'nonexistentuser' }),
        );
      }

      const responses = await Promise.all(requests);
      const rateLimitedCount = responses.filter((res) => res.statusCode === 429).length;

      expect(rateLimitedCount).toBeGreaterThan(0);
    });
  });

  describe('Verification code rate limiter', () => {
    const requests = [];
    const limit = rateLimit.maxVerificationAttempts;
    const overLimit = 3;

    it('should return 429 after exceeding max verification code attempts', async () => {
      for (let i = 0; i < limit + overLimit; i++) {
        requests.push(
          request(app)
            .post(createRoute('api', '/auth/verification'))
            .set('X-Forwarded-For', '123.123.123.123')
            .send({ code: randomInt(1, 10, 6) }),
        );
      }

      const responses = await Promise.all(requests);
      const rateLimitedCount = responses.filter((res) => res.statusCode === 429).length;

      expect(rateLimitedCount).toBeGreaterThan(0);
    });
  });
});
