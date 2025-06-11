/**
 * @typedef {import('socket.io').Socket} Socket
 * @typedef {(socket: Socket, next: Function) => void} SocketioMiddleware
 */

const { Server } = require('socket.io');
const { jwtVerify, jwtDecode } = require('@exzly-utils');
const { UserModel } = require('@exzly-models');

// Load namespace files
const rootNamespace = require('./root');
const onlineNamespace = require('./online');

// Initialize socket.io server
const io = new Server({
  path: '/ws',
  transports: ['websocket', 'polling'],
});

// Initialize namespace
const initRoot = io.of(rootNamespace.ns);
const initOnline = io.of(onlineNamespace.ns);

/**
 * @type {SocketioMiddleware}
 */
const authMiddleware = async (socket, next) => {
  if (socket.handshake.auth?.token) {
    const authToken = socket.handshake.auth.token;
    try {
      const verifyToken = jwtVerify(authToken);

      if (verifyToken?.userId) {
        const user = await UserModel.findByPk(verifyToken.userId);
        socket.data.authenticatedBy = 'user';
        socket.data.authenticatedId = user.id;

        if (user.isAdmin) {
          socket.join('admin');
        }
      }
    } catch {
      socket.data.invalidToken = true;
      const decodedToken = jwtDecode(authToken);

      if (decodedToken?.userId) {
        socket.data.tokenType = 'user';
      } else if (decodedToken?.guestId) {
        socket.data.tokenType = 'guest';
      }
    }
  }

  return next();
};

/**
 * @type {SocketioMiddleware}
 */
const rejectInvalidToken = (socket, next) => {
  if (socket.data.invalidToken) {
    return next(new Error('INVALID_TOKEN'));
  }

  return next();
};

// Common middleware
initRoot.use(authMiddleware).use(rejectInvalidToken);
initOnline.use(authMiddleware).use(rejectInvalidToken);

// Load middleware
rootNamespace.middleware.forEach((middleware) => initRoot.use(middleware));
onlineNamespace.middleware.forEach((middleware) => initOnline.use(middleware));

// Handle connection from namespace: /
initRoot.on('connection', (socket) => {
  rootNamespace.onConnect(socket);
});

// Handle connection from namespace: /chat
initOnline.on('connection', (socket) => {
  onlineNamespace.onConnect(socket);
});

module.exports = {
  websocket: io,
  rootSocket: initRoot,
  onlineSocket: initOnline,
};
