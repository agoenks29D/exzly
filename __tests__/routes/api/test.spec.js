const fs = require('fs');
const path = require('path');
const request = require('supertest');
const { jwtHelper } = require('@exzly-helpers');
const app = require('@exzly-routes');
const { createRoute } = require('@exzly-utils');

const usersToken = {
  adminAccessToken: '',
  adminRefreshToken: '',
  memberAccessToken: '',
  memberRefreshToken: '',
};

beforeAll(async () => {
  const adminSignIn = await request(app)
    .post(createRoute('api', '/auth/sign-in'))
    .send({ identity: 'admin', password: 'admin' })
    .expect(200);

  // Set authorization token
  usersToken.adminAccessToken = adminSignIn.body.accessToken;
  usersToken.adminRefreshToken = adminSignIn.body.refreshToken;

  const memberSignIn = await request(app)
    .post(createRoute('api', '/auth/sign-in'))
    .send({ identity: 'member', password: 'member' })
    .expect(200);

  // Set authorization token
  usersToken.memberAccessToken = memberSignIn.body.accessToken;
  usersToken.memberRefreshToken = memberSignIn.body.refreshToken;
});

describe('RESTful-API: Test', () => {
  let uploadedDiskStorage;

  describe('Upload file', () => {
    describe('Memory storage', () => {
      it('test 1: should successfully upload a file (single memory storage)', async () => {
        const filePath = path.join(__dirname, '100x100.png');
        const file = fs.createReadStream(filePath);

        const response = await request(app)
          .post(createRoute('api', '/test/single-memory-storage'))
          .attach('photo', file, '100x100.png')
          .expect(200);

        expect(response.body).toHaveProperty('fieldname', 'photo');
        expect(response.body).toHaveProperty('originalname');
        expect(response.body).toHaveProperty('mimetype', 'image/png');
        expect(response.body).toHaveProperty('size');
        expect(response.body).toHaveProperty('ext', 'png');
      });
    });

    describe('Disk storage', () => {
      it('test 1: should successfully upload a file', async () => {
        const filePath = path.join(__dirname, '100x100.png');
        const file = fs.createReadStream(filePath);

        const response = await request(app)
          .post(createRoute('api', '/test/single-disk-storage'))
          .attach('photo', file, '100x100.png')
          .expect(200);

        expect(response.body).toHaveProperty('fieldname', 'photo');
        expect(response.body).toHaveProperty('originalname');
        expect(response.body).toHaveProperty('encoding');
        expect(response.body).toHaveProperty('mimetype', 'image/png');
        expect(response.body).toHaveProperty('destination');
        expect(response.body).toHaveProperty('filename');
        expect(response.body).toHaveProperty('path');
        expect(response.body).toHaveProperty('size');
        expect(response.body).toHaveProperty('ext', 'png');

        uploadedDiskStorage = response.body.filename;
      });

      it('test 2: should successfully upload a file exist', async () => {
        await request(app)
          .get(createRoute('web', `/storage/${uploadedDiskStorage}`))
          .expect(200);
      });

      it('test 3: should return 200 and resize image when valid width and height parameters are provided', async () => {
        await request(app)
          .get(createRoute('web', `/storage/${uploadedDiskStorage}`))
          .query({ height: 200, width: 200 })
          .expect(200);
      });
    });
  });

  describe('Access token', () => {
    it('test 1: should return 401 when an invalid access token is provided', async () => {
      await request(app)
        .get(createRoute('api', '/test/access-token'))
        .set('Authorization', 'unknown token')
        .expect(401);
    });

    it('test 2: should return 401 when an invalid token type is provided', async () => {
      await request(app)
        .get(createRoute('api', '/test/access-token'))
        .set('Authorization', `Bearer ${usersToken.adminRefreshToken}`)
        .expect(401);
    });

    it('test 3: should return 401 when no user id is present in the payload', async () => {
      await request(app)
        .get(createRoute('api', '/test/access-token'))
        .set('Authorization', `Bearer ${jwtHelper.createPasswordResetToken(1337)}`)
        .expect(401);
    });

    it('test 4: should return 401 when valid token does not exist in the database', async () => {
      await request(app)
        .get(createRoute('api', '/test/access-token'))
        .set('Authorization', `Bearer ${jwtHelper.createUserToken('access-token', 99999)}`)
        .expect(401);
    });

    it('test 5: should return 200 when sign out request is made to revoke the token', async () => {
      await request(app)
        .post(createRoute('api', '/auth/sign-out'))
        .send({ refreshToken: usersToken.memberRefreshToken })
        .set('Authorization', `Bearer ${usersToken.memberAccessToken}`)
        .expect(200);
    });

    it('test 6: should return 401 when using a revoked token', async () => {
      await request(app)
        .get(createRoute('api', '/test/access-token'))
        .set('Authorization', `Bearer ${usersToken.memberAccessToken}`)
        .expect(401);
    });
  });
});
