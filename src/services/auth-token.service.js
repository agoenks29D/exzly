const { AuthTokenModel } = require('@exzly-models');
const BaseService = require('./base.service');

class AuthTokenService extends BaseService {
  constructor() {
    super(AuthTokenModel);
  }

  /**
   * @param {string} token
   */
  findByToken(token) {
    return this.findOne({ where: { token } });
  }

  /**
   * Persist a freshly issued access/refresh token pair.
   *
   * @param {string} accessToken
   * @param {string} refreshToken
   */
  issueTokenPair(accessToken, refreshToken) {
    return Promise.all([
      this.create({ type: 'access-token', token: accessToken }),
      this.create({ type: 'refresh-token', token: refreshToken }),
    ]);
  }

  /**
   * Revoke every token belonging to the given where-clause (e.g. all
   * tokens tied to a refresh token, or a user session).
   *
   * @param {object} where
   */
  revokeWhere(where) {
    return this.model.update({ isRevoked: true }, { where });
  }
}

module.exports = new AuthTokenService();
module.exports.AuthTokenService = AuthTokenService;
