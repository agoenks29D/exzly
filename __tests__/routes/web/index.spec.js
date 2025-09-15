const request = require('supertest');
const createHttpError = require('http-errors');
const app = require('@exzly-routes');
const webErrorHandler = require('@exzly-routes/web/error');
const { createRoute } = require('@exzly-utils');

let adminAuthCookie, memberAuthCookie;

beforeAll(async () => {
  const signInAsAdmin = await request(app)
    .post(createRoute('api', '/auth/sign-in'))
    .send({ identity: 'admin', password: 'admin' });

  const signInAsMember = await request(app)
    .post(createRoute('api', '/auth/sign-in'))
    .send({ identity: 'member', password: 'member' });

  adminAuthCookie = signInAsAdmin.headers['set-cookie'];
  memberAuthCookie = signInAsMember.headers['set-cookie'];
});

describe('Web Routes', () => {
  describe('Authentication pages', () => {
    it('test 1: should return 200 when accessing home page', async () => {
      await request(app).get(createRoute('web')).expect(200);
    });

    it('test 2: should return 200 when accessing sign-up page', async () => {
      await request(app).get(createRoute('web', 'sign-up')).expect(200);
    });

    it('test 3: should return 200 when accessing sign-in page', async () => {
      await request(app).get(createRoute('web', 'sign-in')).expect(200);
    });

    it('test 4: should return 200 when accessing forgot-password page', async () => {
      await request(app).get(createRoute('web', 'forgot-password')).expect(200);
    });

    it('test 5: should return 200 when accessing verification-code page', async () => {
      await request(app).get(createRoute('web', 'verification')).expect(200);
    });

    it('test 6: should return 400 when accessing verification page with invalid token', async () => {
      await request(app)
        .get(createRoute('web', '/verification'))
        .query({ token: 'invalid' })
        .expect(400);
    });

    it('test 7: should return 200 when accessing test page', async () => {
      await request(app).get(createRoute('web', '/test')).query({ a: 1, b: 2, c: 3 }).expect(200);
    });
  });

  describe('Authenticated pages', () => {
    it('test 1: should return 200 when member accesses account overview page', async () => {
      await request(app)
        .get(createRoute('web', 'account'))
        .set('Cookie', memberAuthCookie)
        .expect(200);
    });

    it('test 2: should return 200 when member accesses account settings page', async () => {
      await request(app)
        .get(createRoute('web', 'account/setting'))
        .set('Cookie', memberAuthCookie)
        .expect(200);
    });
  });

  describe('Error and redirect pages', () => {
    it('test 1: should return 404 when accessing unknown route', async () => {
      await request(app).get(createRoute('web', 'unknown')).expect(404);
    });

    it('test 2: should return 404 when accessing reset-password page without session', async () => {
      await request(app).get(createRoute('web', 'reset-password')).expect(404);
    });

    it('test 3: should redirect to sign-in when accessing account overview without session', async () => {
      const response = await request(app).get(createRoute('web', 'account')).expect(302);
      expect(response.header.location).toBe(createRoute('web', 'sign-in'));
    });

    it('test 4: should redirect to sign-in when accessing account setting without session', async () => {
      const response = await request(app).get(createRoute('web', 'account/setting')).expect(302);
      expect(response.header.location).toBe(createRoute('web', 'sign-in'));
    });

    it('test 5: should redirect to home page when accessing sign-in with active session', async () => {
      const response = await request(app)
        .get(createRoute('web', 'sign-in'))
        .set('Cookie', adminAuthCookie)
        .expect(302);
      expect(response.header.location).toBe(createRoute('web'));
    });

    it('test 6: should redirect to home page after signing out with active session', async () => {
      const response = await request(app)
        .get(createRoute('web', 'sign-out'))
        .set('Cookie', adminAuthCookie)
        .expect(302);
      expect(response.header.location).toBe(createRoute('web'));
    });

    it('test 7: should handle generic error (500)', () => {
      const err = createHttpError(500);

      const req = { user: { id: 1 } };
      const res = {
        headersSent: false,
        status: jest.fn().mockReturnThis(),
        render: jest.fn(),
      };
      const next = jest.fn();

      webErrorHandler(err, req, res, next);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.render).toHaveBeenCalledWith('web/errors/default.njk', {
        error: err,
        statusCode: 500,
      });
    });

    it('test 8: should render error page with status 500 if headers have not been sent', () => {
      const err = new Error('Test error');
      const req = { user: { id: 1 } };
      const res = {
        headersSent: false,
        status: jest.fn().mockReturnThis(),
        render: jest.fn(),
      };
      const next = jest.fn();

      webErrorHandler(err, req, res, next);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.render).toHaveBeenCalledWith('web/errors/default.njk', {
        error: err,
        statusCode: 500,
      });
    });

    it('test 9: should call next when headers already sent', () => {
      const err = new Error('Test error');
      const req = { user: { id: 1 } };
      const res = {
        headersSent: true,
        status: jest.fn().mockReturnThis(),
        render: jest.fn(),
      };
      const next = jest.fn();

      webErrorHandler(err, req, res, next);
      expect(next).toHaveBeenCalledWith(err);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.render).not.toHaveBeenCalled();
    });
  });
});
