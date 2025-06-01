const fs = require('fs');
const path = require('path');
const request = require('supertest');
const app = require('@exzly-routes');
const { createRoute } = require('@exzly-utils');

const usersToken = {
  adminAccessToken: '',
  adminRefreshToken: '',
  memberAccessToken: '',
  memberRefreshToken: '',
};

let adminProfile, memberProfile;

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

  const getAdminProfile = await request(app)
    .get(createRoute('api', '/users/profile'))
    .set('Authorization', `Bearer ${usersToken.adminAccessToken}`);

  const getMemberProfile = await request(app)
    .get(createRoute('api', '/users/profile'))
    .set('Authorization', `Bearer ${usersToken.memberAccessToken}`);

  adminProfile = getAdminProfile.body;
  memberProfile = getMemberProfile.body;
});

describe('RESTful-API: Users', () => {
  describe('Get users list', () => {
    it('test 1: test 1: should return 401 when access token is not provided', async () => {
      await request(app).get(createRoute('api', '/users')).expect(401);
    });

    it('test 2: should return 200 and user list when access token is valid', async () => {
      const response = await request(app)
        .get(createRoute('api', '/users'))
        .set('Authorization', `Bearer ${usersToken.adminAccessToken}`)
        .expect(200);

      // Verify the structure of the response body
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('hasNext');
      expect(typeof response.body.hasNext).toBe('boolean');

      // Verify properties of each user in the 'data' array
      response.body.data.forEach((user) => {
        expect(user).toHaveProperty('id');
        expect(typeof user.id).toBe('number');

        expect(user).toHaveProperty('email');
        expect(typeof user.email).toBe('string');

        expect(user).toHaveProperty('username');
        expect(typeof user.username).toBe('string');

        expect(user).toHaveProperty('isAdmin');
        expect(typeof user.isAdmin).toBe('boolean');

        expect(user).toHaveProperty('gender');
        expect(typeof user.gender === 'string' || user.gender === null).toBe(true);

        expect(user).toHaveProperty('fullName');
        expect(typeof user.fullName).toBe('string');

        expect(user).toHaveProperty('photoProfile');
        expect(typeof user.photoProfile === 'string' || user.photoProfile === null).toBe(true);

        expect(user).toHaveProperty('createdAt');
        expect(typeof user.createdAt).toBe('string');

        expect(user).toHaveProperty('updatedAt');
        expect(typeof user.updatedAt).toBe('string');

        expect(user).toHaveProperty('deletedAt');
        expect(typeof user.deletedAt === 'string' || user.deletedAt === null).toBe(true);
      });
    });

    it('test 3: should return 200 and paginated result with size=40', async () => {
      const response = await request(app)
        .get(createRoute('api', '/users'))
        .set('Authorization', `Bearer ${usersToken.adminAccessToken}`)
        .query({ size: 40, skip: 0 })
        .expect(200);

      // Verify the structure of the response body
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('hasNext');
      expect(typeof response.body.hasNext).toBe('boolean');
      expect(response.body.data.length).toBe(40);
    });

    it('test 4: should return 200 and paginated result with size=20 (datatables query)', async () => {
      const queryParams = {
        draw: 1,
        columns: [
          {
            data: 'function',
            name: 'id',
            searchable: false,
            orderable: true,
            search: {
              value: '',
              regex: false,
            },
          },
          {
            data: 'username',
            name: 'username',
            searchable: true,
            orderable: true,
            search: {
              value: '',
              regex: false,
            },
          },
          {
            data: 'gender',
            name: 'gender',
            searchable: false,
            orderable: true,
            search: {
              value: '',
              regex: false,
            },
          },
          {
            data: 'fullName',
            name: 'fullName',
            searchable: true,
            orderable: true,
            search: {
              value: '',
              regex: false,
            },
          },
          {
            data: 'createdAt',
            name: 'createdAt',
            searchable: false,
            orderable: true,
            search: {
              value: '',
              regex: false,
            },
          },
          {
            data: 'id',
            name: 'id',
            searchable: false,
            orderable: false,
            search: {
              value: '',
              regex: false,
            },
          },
        ],
        order: [
          {
            column: 0,
            dir: 'asc',
            name: 'id',
          },
        ],
        start: 0,
        length: 20,
        search: {
          value: '',
          regex: false,
        },
        skip: 0,
        size: 20,
        _: Date.now(),
      };

      const response = await request(app)
        .get(createRoute('api', '/users'))
        .set('Authorization', `Bearer ${usersToken.adminAccessToken}`)
        .query(queryParams)
        .expect(200);

      // Verify the structure of the response body
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('hasNext');
      expect(typeof response.body.hasNext).toBe('boolean');
      expect(response.body.data.length).toBe(20);
    });

    it('test 5: should return 403 when member access token is used to access user list', async () => {
      await request(app)
        .get(createRoute('api', '/users'))
        .set('Authorization', `Bearer ${usersToken.memberAccessToken}`)
        .expect(403);
    });
  });

  describe('Create user', () => {
    it('test 1: should return 401 when access token is not provided', async () => {
      await request(app).post(createRoute('api', '/users')).send({}).expect(401);
    });

    it('test 2: should return 403 when non-admin access token is used', async () => {
      await request(app)
        .post(createRoute('api', '/users'))
        .set('Authorization', `Bearer ${usersToken.memberAccessToken}`)
        .send({})
        .expect(403);
    });

    it('test 3: should return 201 when admin creates a valid user', async () => {
      const response = await request(app)
        .post(createRoute('api', '/users'))
        .set('Authorization', `Bearer ${usersToken.adminAccessToken}`)
        .send({
          email: `testuser_${Date.now()}@mail.com`,
          username: `testuser_${Date.now()}`,
          password: 'securepassword',
          isAdmin: false,
          gender: 'male',
          fullName: 'Test User',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).not.toHaveProperty('password');
      expect(response.body.username).toContain('testuser');
    });

    it('test 4: should return 400 when required fields are missing', async () => {
      await request(app)
        .post(createRoute('api', '/users'))
        .set('Authorization', `Bearer ${usersToken.adminAccessToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('View user profile', () => {
    let userId;

    beforeAll(async () => {
      const response = await request(app)
        .get(createRoute('api', '/users'))
        .set('Authorization', `Bearer ${usersToken.adminAccessToken}`)
        .query({ size: 1 })
        .expect(200);

      userId = response.body.data[0].id;
    });

    it('test 1: should return 200 and full profile for admin', async () => {
      const response = await request(app)
        .get(createRoute('api', `/users/profile/${userId}`))
        .set('Authorization', `Bearer ${usersToken.adminAccessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('email');
    });

    it('test 2: should return 403 or limited fields when accessed by non-owner member', async () => {
      const response = await request(app)
        .get(createRoute('api', `/users/profile/${userId}`))
        .set('Authorization', `Bearer ${usersToken.memberAccessToken}`)
        .expect(200);

      expect(response.body).not.toHaveProperty('email');
    });

    it('test 3: should return 404 for non-existing user', async () => {
      await request(app)
        .get(createRoute('api', '/users/profile/999999'))
        .set('Authorization', `Bearer ${usersToken.adminAccessToken}`)
        .expect(404);
    });
  });

  describe('Update user profile', () => {
    it('test 1: should allow user to update own profile', async () => {
      const response = await request(app)
        .put(createRoute('api', '/users/profile'))
        .set('Authorization', `Bearer ${usersToken.memberAccessToken}`)
        .send({ fullName: 'Updated Member', gender: 'female' })
        .expect(200);

      expect(response.body.fullName).toBe('Updated Member');
    });

    it('test 2: should return 403 if user tries to update another user without admin rights', async () => {
      await request(app)
        .put(createRoute('api', '/users/profile/999'))
        .set('Authorization', `Bearer ${usersToken.memberAccessToken}`)
        .send({ fullName: 'Hacker' })
        .expect(403);
    });

    it('test 3: should return 404 when updating non-existing user profile', async () => {
      await request(app)
        .put(createRoute('api', '/users/profile/0'))
        .set('Authorization', `Bearer ${usersToken.adminAccessToken}`)
        .send({ fullName: 'Hacker' })
        .expect(404);
    });
  });

  describe('Delete user account', () => {
    let userId;

    beforeAll(async () => {
      const createUser = await request(app)
        .post(createRoute('api', '/users'))
        .set('Authorization', `Bearer ${usersToken.adminAccessToken}`)
        .send({
          email: `deleteuser_${Date.now()}@mail.com`,
          username: `deleteuser_${Date.now()}`,
          password: 'securepassword',
          isAdmin: false,
          gender: 'male',
          fullName: 'Delete Me',
        });

      userId = createUser.body.id;
    });

    it('test 1: should return 403 when a non-admin user tries to delete another user account', async () => {
      await request(app)
        .delete(createRoute('api', `/users/profile/${userId}`))
        .set('Authorization', `Bearer ${usersToken.memberAccessToken}`)
        .expect(403);
    });

    it('test 2: should delete user when admin access is used', async () => {
      await request(app)
        .delete(createRoute('api', `/users/profile/${userId}`))
        .set('Authorization', `Bearer ${usersToken.adminAccessToken}`)
        .expect(200);
    });

    it('test 3: should return 404 when user is already deleted', async () => {
      await request(app)
        .delete(createRoute('api', `/users/profile/${userId}`))
        .set('Authorization', `Bearer ${usersToken.adminAccessToken}`)
        .expect(404);
    });

    it('test 4: should return 400 when admin attempts to delete their own profile', async () => {
      await request(app)
        .delete(createRoute('api', `/users/profile/${adminProfile.id}`))
        .set('Authorization', `Bearer ${usersToken.adminAccessToken}`)
        .expect(400);
    });
  });

  describe('Change or remove photo profile', () => {
    let userId;

    beforeAll(async () => {
      const userRes = await request(app)
        .get(createRoute('api', '/users'))
        .set('Authorization', `Bearer ${usersToken.adminAccessToken}`)
        .query({ size: 1 })
        .expect(200);

      userId = userRes.body.data[0].id;
    });

    it('test 1: should return 400 when neither file nor remove param is provided', async () => {
      await request(app)
        .put(createRoute('api', `/users/profile/${userId}/photo`))
        .set('Authorization', `Bearer ${usersToken.adminAccessToken}`)
        .expect(400);
    });

    it('test 2: should return 403 when non-owner member tries to change photo', async () => {
      await request(app)
        .put(createRoute('api', `/users/profile/${userId}/photo`))
        .set('Authorization', `Bearer ${usersToken.memberAccessToken}`)
        .query({ remove: true })
        .expect(403);
    });

    it('test 3: should return 404 when user not found', async () => {
      await request(app)
        .put(createRoute('api', `/users/profile/0/photo`))
        .set('Authorization', `Bearer ${usersToken.adminAccessToken}`)
        .query({ remove: true })
        .expect(404);
    });

    it('test 4: should return 200 when admin removes user profile photo', async () => {
      await request(app)
        .put(createRoute('api', `/users/profile/1/photo`))
        .set('Authorization', `Bearer ${usersToken.adminAccessToken}`)
        .query({ remove: true })
        .expect(200);
    });

    it('test 5: should return 200 when admin uploads a new user profile photo', async () => {
      const filePath = path.join(__dirname, '200x200.png');
      const file = fs.createReadStream(filePath);
      await request(app)
        .put(createRoute('api', `/users/profile/1/photo`))
        .attach('photo', file, '200x200.png')
        .set('Authorization', `Bearer ${usersToken.adminAccessToken}`)
        .expect(200);
    });
  });

  describe('Restore user account', () => {
    let deletedUserId;

    beforeAll(async () => {
      const createRes = await request(app)
        .post(createRoute('api', '/users'))
        .set('Authorization', `Bearer ${usersToken.adminAccessToken}`)
        .send({
          email: `restoreuser_${Date.now()}@mail.com`,
          username: `restoreuser_${Date.now()}`,
          password: 'securepassword',
          isAdmin: false,
          gender: 'male',
          fullName: 'Restore Me',
        });

      deletedUserId = createRes.body.id;

      await request(app)
        .delete(createRoute('api', `/users/profile/${deletedUserId}`))
        .set('Authorization', `Bearer ${usersToken.adminAccessToken}`)
        .expect(200);
    });

    it('test 1: should return 200 when admin restores deleted user', async () => {
      await request(app)
        .patch(createRoute('api', `/users/profile/${deletedUserId}`))
        .set('Authorization', `Bearer ${usersToken.adminAccessToken}`)
        .expect(200);
    });

    it('test 2: should return 403 when non-admin tries to restore user', async () => {
      await request(app)
        .patch(createRoute('api', `/users/profile/${deletedUserId}`))
        .set('Authorization', `Bearer ${usersToken.memberAccessToken}`)
        .expect(403);
    });

    it('test 3: should return 404 when trying to restore non-existing user', async () => {
      await request(app)
        .patch(createRoute('api', `/users/profile/0`))
        .set('Authorization', `Bearer ${usersToken.adminAccessToken}`)
        .expect(404);
    });
  });

  describe('Update user credentials', () => {
    it('test 1: should return 403 when member tries to update other user credentials', async () => {
      await request(app)
        .put(createRoute('api', `/users/credentials/${adminProfile.id}`))
        .set('Authorization', `Bearer ${usersToken.memberAccessToken}`)
        .send({ username: 'hacker' })
        .expect(403);
    });

    it('test 2: should return 404 when trying to update non-existing user', async () => {
      await request(app)
        .put(createRoute('api', `/users/credentials/0`))
        .set('Authorization', `Bearer ${usersToken.adminAccessToken}`)
        .send({ username: 'noone' })
        .expect(404);
    });

    it('test 3: should return 200 when admin updates member credentials with a new username', async () => {
      const newUsername = `updated_${Date.now()}`;

      await request(app)
        .put(createRoute('api', `/users/credentials/${memberProfile.id}`))
        .set('Authorization', `Bearer ${usersToken.adminAccessToken}`)
        .send({ username: newUsername })
        .expect(200);
    });

    it('test 4: should return 200 when admin resets member credentials to default username', async () => {
      await request(app)
        .put(createRoute('api', `/users/credentials/${memberProfile.id}`))
        .set('Authorization', `Bearer ${usersToken.adminAccessToken}`)
        .send({ username: 'member' })
        .expect(200);
    });

    it('test 5: should return 200 when admin updates member email address', async () => {
      const newEmail = 'new-member@exzly.dev';

      await request(app)
        .put(createRoute('api', `/users/credentials/${memberProfile.id}`))
        .set('Authorization', `Bearer ${usersToken.adminAccessToken}`)
        .send({ email: newEmail })
        .expect(200);
    });
  });
});
