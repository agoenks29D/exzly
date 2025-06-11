require('dotenv/config');
require('module-alias/register');

const fs = require('fs');
const net = require('net');
const http = require('http');
const https = require('https');
const CLITable3 = require('cli-table3');
const listEndpoints = require('express-list-endpoints');

let server;
const routes = require('@exzly-routes');
const { sequelize } = require('@exzly-models');
const { winstonLogger } = require('@exzly-utils');
const { websocket } = require('@exzly-websocket');

const checkPortAvailability = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.on('error', () => resolve(false));
    server.on('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
};

const tryListeningPort = async (startPort) => {
  let port = startPort;

  do {
    const isPortAvailable = await checkPortAvailability(port);
    if (isPortAvailable) {
      return port;
    } else {
      port = port + 1;
    }
  } while (port <= 65535);
};

(async () => {
  let chosenPort = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  chosenPort = await tryListeningPort(chosenPort);

  if (process.env.ENABLE_HTTPS === 'true') {
    const key = fs.readFileSync(process.env.SSL_KEY_FILE);
    const cert = fs.readFileSync(process.env.SSL_CERT_FILE);
    server = https.createServer({ key, cert }, routes);
  } else {
    server = http.createServer(routes);
  }

  server.on('listening', async () => {
    // attach http to websocket
    websocket.attach(server);

    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({
        [process.env.DB_MODE]: process.env.DB_SYNC === 'true',
      });
    }

    const endpoints = listEndpoints(routes);
    const endpointsTable = new CLITable3({
      head: ['Methods', 'Path', 'Middleware'],
    });

    const loadEndpoint = (e = 0) => {
      if (e < endpoints.length) {
        endpointsTable.push([
          endpoints[e].methods.join('|'),
          endpoints[e].path,
          endpoints[e].middlewares.length,
        ]);
        loadEndpoint(e + 1);
      }
    };

    loadEndpoint();
    console.log(endpointsTable.toString());
    winstonLogger.info(`Application started on port ${chosenPort}`);
  });

  server.listen(chosenPort);
})();
