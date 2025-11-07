const qs = require('qs');
const axios = require('axios');
const express = require('express');
const { asyncRoute } = require('@exzly-middlewares');
const { UserModel, AuthProviderModel } = require('@exzly-models');

const app = express.Router();

/**
 * Oauth google redirect
 */
app.get('/google', (req, res) => {
  const redirect = `https://accounts.google.com/o/oauth2/v2/auth?${qs.stringify({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'email profile',
    access_type: 'offline',
    prompt: 'consent',
  })}`;

  return res.redirect(redirect);
});

/**
 * Oauth google callback
 */
app.get(
  '/google/callback',
  asyncRoute(async (req, res) => {
    const code = req.query.code;
    const oauthGoogle = await axios.post(
      'https://oauth2.googleapis.com/token',
      qs.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );
    const { access_token } = oauthGoogle.data;
    const googleUserProfile = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const profile = googleUserProfile.data;
    const isGoogleProviderRegistered = await AuthProviderModel.findOne({
      where: { provider: 'google', providerId: profile.id },
      include: [
        {
          model: UserModel,
          as: 'user',
        },
      ],
    });
    const isUserEmailRegistered = await UserModel.findOne({ where: { email: profile.email } });

    if (!isGoogleProviderRegistered) {
      const user = !isUserEmailRegistered
        ? await UserModel.create({
            email: profile.email,
            fullName: profile.name,
            photoProfile: profile.picture,
          })
        : isUserEmailRegistered;

      await AuthProviderModel.create({
        provider: 'google',
        providerId: profile.id,
        userId: user.id,
        metadata: JSON.stringify(profile),
      });

      req.session.userId = user.id;
    } else {
      req.session.userId = isGoogleProviderRegistered.user.id;
    }

    req.session.save(() => res.redirect('/'));
  }),
);

/**
 * Oauth facebook redirect
 */
app.get('/facebook', (req, res) => {
  const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?${qs.stringify({
    client_id: process.env.FACEBOOK_APP_ID,
    redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
    scope: 'email,public_profile',
    response_type: 'code',
  })}`;

  return res.redirect(authUrl);
});

/**
 * Oauth facebook callback
 */
app.get(
  '/facebook/callback',
  asyncRoute(async (req, res) => {
    const code = req.query.code;
    const oauthFacebook = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
        code,
      },
    });
    const { access_token } = oauthFacebook.data;
    const facebookUserProfile = await axios.get('https://graph.facebook.com/me', {
      params: {
        fields: 'id,name,email',
        access_token,
      },
    });
    const profile = facebookUserProfile.data;
    const isFacebookProviderRegistered = await AuthProviderModel.findOne({
      where: { provider: 'facebook', providerId: profile.id },
      include: [
        {
          model: UserModel,
          as: 'user',
        },
      ],
    });
    const isUserEmailRegistered = await UserModel.findOne({ where: { email: profile.email } });

    if (!isFacebookProviderRegistered) {
      const user = !isUserEmailRegistered
        ? await UserModel.create({
            email: profile.email,
            fullName: profile.name,
            photoProfile: profile.picture,
          })
        : isUserEmailRegistered;

      await AuthProviderModel.create({
        provider: 'facebook',
        providerId: profile.id,
        userId: user.id,
        metadata: JSON.stringify(profile),
      });

      req.session.userId = user.id;
    } else {
      req.session.userId = isFacebookProviderRegistered.user.id;
    }

    req.session.save(() => res.redirect('/'));
  }),
);

module.exports = app;
