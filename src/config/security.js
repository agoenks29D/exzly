/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 * @typedef {(req: Request, res: Response, next: NextFunction) => string} NonceFunction
 */

/**
 * @typedef {Object} CSPDirectives
 * @property {(string|NonceFunction)[]} defaultSrc - Default content sources. Restricts all resources to the same origin.
 * @property {(string|NonceFunction)[]} imgSrc - Allowed image sources. Includes self, data URIs, and trusted CDNs.
 * @property {(string|NonceFunction)[]} scriptSrc - Allowed JavaScript sources. Supports nonces for inline scripts.
 * @property {(string|NonceFunction)[]} scriptSrcElem - Allowed sources for script elements.
 * @property {(string|NonceFunction)[]} scriptSrcAttr - Allowed sources for inline script attributes.
 * @property {string} [reportUri] - Optional URI endpoint for reporting CSP violations.
 */

/**
 * @typedef {Object} ContentSecurityPolicy
 * @property {boolean} useDefaults - Enables Helmet’s default CSP directives.
 * @property {CSPDirectives} directives - Custom-defined CSP directives that specify allowed content sources.
 */

const { isValidDomain } = require('@exzly-utils');

/**
 * Allowed MIME types for image files.
 * These are the supported formats for image uploads.
 *
 * @type {string[]}
 */
const allowedImageMimeTypes = ['image/png', 'image/jpeg', 'image/heic', 'image/heif'];

/**
 * Refresh token expiration time.
 * This value is used by the 'ms' package to define the token validity duration.
 *
 * @type {string}
 */
const refreshTokenExpires = process.env.REFRESH_TOKEN_EXPIRES || '7d'; // default: 7 days

/**
 * Password reset expiration time.
 * This value is used by the 'ms' package to define the token validity duration.
 *
 * @type {string}
 */
const passwordResetExpires = process.env.PASSWORD_RESET_EXPIRES || '10m'; // default: 10 minutes

/**
 * Rate limit configuration.
 */
const rateLimit = {
  /**
   * Maximum number of sign-up attempts allowed.
   * This value sets the limit for failed sign-up attempts before temporarily restricting further attempts.
   *
   * @type {number}
   */
  maxSignUpAttempts: 20, // default: 20 times

  /**
   * Duration for the sign-up rate limit.
   * This value specifies the time window within which the number of sign-up attempts is counted and restricted.
   *
   * @type {string}
   */
  signUpRateLimitDuration: '10m', // default: 10 minutes

  /**
   * Max number of sign-in attempts allowed.
   * This value defines the maximum number of failed sign-in attempts before temporarily blocking further attempts.
   *
   * @type {number}
   */
  maxSignInAttempts: 30, // default: 30 times

  /**
   * Duration for the sign-in rate limit.
   * This value defines the time window within which the number of sign-in attempts is counted and limited.
   *
   * @type {string}
   */
  signInRateLimitDuration: '5m', // default: 5 minutes

  /**
   * Maximum number of verification attempts allowed.
   * This value limits the number of failed verification code submissions before imposing temporary restrictions.
   *
   * @type {number}
   */
  maxVerificationAttempts: 20, // default: 20 times

  /**
   * Duration for the verification rate limit.
   * This value determines the period within which the verification attempts are counted and limited.
   *
   * @type {string}
   */
  verificationRateLimitDuration: '5m', // default: 5 minutes

  /**
   * Maximum number of forgot password attempts allowed.
   * This value sets the limit for failed password reset requests before temporarily restricting further attempts.
   *
   * @type {number}
   */
  maxForgotPasswordAttempts: 40, // default: 40 times

  /**
   * Duration for the forgot password rate limit.
   * This value defines the time window within which password reset attempts are tracked and restricted.
   *
   * @type {string}
   */
  forgotPasswordRateLimitDuration: '10m', // default: 10 minutes
};

/**
 * Content Security Policy (CSP) configuration.
 * This policy defines the sources from which content can be loaded, helping to mitigate
 * cross-site scripting (XSS), data injection, and other code execution attacks.
 *
 * The configuration follows Helmet's CSP middleware format and can be customized
 * based on the application's asset sources and security needs.
 *
 * @type {ContentSecurityPolicy}
 */
const contentSecurityPolicy = {
  useDefaults: true,
  directives: {
    defaultSrc: ["'self'"],
    imgSrc: [
      'data:',
      "'self'",
      'https://picsum.photos',
      'https://loremflickr.com',
      'https://fastly.picsum.photos',
      'https://cdn.jsdelivr.net',
    ],
    scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`],
    scriptSrcElem: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`],
    scriptSrcAttr: [(req, res) => `'nonce-${res.locals.nonce}'`],
    // reportUri: `${process.env.API_ROUTE}/csp-violation-report`,
  },
};

if (isValidDomain(process.env.ASSETS_URL)) {
  const CDN_URL = process.env.ASSETS_URL;
  contentSecurityPolicy.directives.imgSrc.push(CDN_URL);
  contentSecurityPolicy.directives.scriptSrc.push(CDN_URL);
  contentSecurityPolicy.directives.scriptSrcElem.push(CDN_URL);
  contentSecurityPolicy.directives.scriptSrcAttr.push(CDN_URL);
}

module.exports = {
  allowedImageMimeTypes,
  refreshTokenExpires,
  passwordResetExpires,
  rateLimit,
  contentSecurityPolicy,
};
