/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

/**
 * Load environment
 */
require('dotenv').config({ path: '../.env' });

/**
 * Webpack
 *
 * @param {'development' | 'production'} env
 * @returns {import('webpack').Configuration[]}
 */
module.exports = (env) => {
  if (process.env.NODE_ENV === 'production') {
    env.production = true;
  }

  const mode = env.production ? 'production' : 'development';

  /**
   * Common webpack config
   *
   * @type {import('webpack').Configuration}
   */
  const CommonConfig = {
    mode,
    devtool: false,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
      extensions: ['.ts', '.js'],
    },
    target: 'web',
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        ENVIRONMENT: JSON.stringify(process.env.NODE_ENV),
        PUBLIC_VAPID_KEY: JSON.stringify(process.env.PUBLIC_VAPID_KEY),
        WEB_ROUTE: JSON.stringify(process.env.WEB_ROUTE),
        API_ROUTE: JSON.stringify(process.env.API_ROUTE),
        ADMIN_ROUTE: JSON.stringify(process.env.ADMIN_ROUTE),
      }),
    ],
  };

  /**
   * Exzly Client
   *
   * @type {import('webpack').Configuration}
   */
  const ExzlyClient = {
    ...CommonConfig,
    entry: path.join(__dirname, 'src/main'),
    output: {
      clean: false, // Be careful when changing this, as other static assets in the same directory will be deleted
      filename: 'exzly.bundle.js',
      path: path.join(__dirname, '../public'),
      library: {
        name: 'Exzly',
        type: 'umd',
        export: 'default',
      },
      globalObject: 'this',
    },
  };

  /**
   * Service Worker
   *
   * @type {import('webpack').Configuration}
   */
  const ServiceWorker = {
    ...CommonConfig,
    entry: path.join(__dirname, 'src/service-worker'),
    output: {
      clean: true,
      filename: 'service-worker.bundle.js',
      path: path.join(__dirname, '../public/service-worker'),
    },
  };

  /**
   * Production mode
   */
  if (mode === 'production') {
    ExzlyClient.plugins.push(new CompressionPlugin());
    ExzlyClient.optimization = {
      minimize: true,
      minimizer: [new TerserPlugin()],
    };

    ServiceWorker.plugins.push(new CompressionPlugin());
    ServiceWorker.optimization = {
      minimize: true,
      minimizer: [new TerserPlugin()],
    };
  }

  return [ExzlyClient, ServiceWorker];
};
