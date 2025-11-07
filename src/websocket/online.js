/**
 * @typedef {import('socket.io').Socket} Socket
 * @typedef {(socket: Socket, next: Function) => void} SocketioMiddleware
 */

const ns = '/online';

/** @type {SocketioMiddleware[]} */
const middleware = [];

/**
 * @param {import('socket.io').Socket} socket
 */
const onConnect = async (socket) => {
  // do action after connected

  // disconnected
  socket.on('disconnect', () => {
    // do action after disconnected
  });
};

module.exports = { ns, middleware, onConnect };
