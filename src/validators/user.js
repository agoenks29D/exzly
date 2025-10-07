/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 * @typedef {(req: Request, res: Response, next: NextFunction) => void} ExpressMiddleware
 */

const { body } = require('express-validator');
const { runValidation } = require('@exzly-middlewares');
const { UserModel } = require('@exzly-models');

const dataValidation = {
  fullNameMin: 2,
  fullNameMax: 80,
  usernameRegEx: /^[a-zA-Z0-9](?!.*?[._]{2})[a-zA-Z0-9._]{0,28}[a-zA-Z0-9]$/u,
  passwordMin: 6,
};

/**
 * @type {ExpressMiddleware[]}
 */
const createNew = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .custom(async (value) => {
      const isRegistered = await UserModel.findOne({ where: { email: value } });

      if (!isRegistered) {
        return true;
      }

      throw new Error('Email is already in use');
    }),

  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .isString()
    .withMessage('This field must be a string')
    .custom((value) => {
      const regex = dataValidation.usernameRegEx;
      return regex.test(value);
    })
    .withMessage(
      'Username format is invalid. Use letters, numbers, "_", or ".", and avoid consecutive symbols like ".." or "__"',
    )
    .custom(async (value) => {
      const isRegistered = await UserModel.findOne({ where: { username: value } });

      if (!isRegistered) {
        return true;
      }

      throw new Error('Username is already taken');
    }),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isString()
    .withMessage('This field must be a string')
    .isLength({ min: dataValidation.passwordMin })
    .withMessage(`Password must be at least ${dataValidation.passwordMin} characters long`),

  body('isAdmin')
    .default(false)
    .optional()
    .isBoolean()
    .withMessage('This field must be a boolean value'),

  body('gender')
    .optional()
    .isIn(['male', 'female'])
    .withMessage('Gender must be either "male" or "female"'),

  body('fullName')
    .notEmpty()
    .withMessage('Full name is required')
    .isString()
    .withMessage('This field must be a string')
    .isLength({ min: dataValidation.fullNameMin })
    .withMessage(`Full name must be at least ${dataValidation.fullNameMin} characters long`)
    .isLength({ max: dataValidation.fullNameMax })
    .withMessage(`Full name must be no more than ${dataValidation.fullNameMax} characters long`)
    .escape(),

  runValidation,
];

/**
 * @type {ExpressMiddleware[]}
 */
const updateProfile = [
  body('fullName')
    .optional()
    .isString()
    .withMessage('This field must be a string')
    .isLength({ min: dataValidation.fullNameMin })
    .withMessage(`Full name must be at least ${dataValidation.fullNameMin} characters long`)
    .isLength({ max: dataValidation.fullNameMax })
    .withMessage(`Full name must be no more than ${dataValidation.fullNameMax} characters long`)
    .escape(),

  body('gender')
    .optional()
    .isIn(['male', 'female'])
    .withMessage('Gender must be either "male" or "female"'),

  runValidation,
];

const updateCredentials = [
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .custom(async (value, { req }) => {
      const isRegistered = await UserModel.findOne({ where: { email: value } });

      if (!isRegistered) {
        return true;
      }

      if (req.userId === isRegistered.id) {
        return true;
      }

      if (req.params.userId == isRegistered.id) {
        return true;
      }

      throw new Error('Email is already in use');
    }),

  body('username')
    .optional()
    .isString()
    .withMessage('This field must be a string')
    .custom((value) => {
      const regex = dataValidation.usernameRegEx;
      return regex.test(value);
    })
    .withMessage(
      'Username format is invalid. Use letters, numbers, "_", or ".", and avoid consecutive symbols like ".." or "__"',
    )
    .custom(async (value, { req }) => {
      const isRegistered = await UserModel.findOne({ where: { username: value } });

      if (!isRegistered) {
        return true;
      }

      if (req.userId === isRegistered.id) {
        return true;
      }

      if (req.params.userId == isRegistered.id) {
        return true;
      }

      throw new Error('Username is already taken');
    }),

  body('newPassword')
    .optional()
    .isString()
    .withMessage('This field must be a string')
    .isLength({ min: dataValidation.passwordMin })
    .withMessage(`Password must be at least ${dataValidation.passwordMin} characters long`),

  body('confirmPassword')
    .if(body('newPassword').notEmpty())
    .isString()
    .withMessage('This field must be a string')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Confirm password do not match'),

  runValidation,
];

module.exports = {
  createNew,
  updateProfile,
  updateCredentials,
  dataValidation,
};
