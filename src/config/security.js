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

module.exports = {
  allowedImageMimeTypes,
  refreshTokenExpires,
  passwordResetExpires,
  rateLimit,
};
