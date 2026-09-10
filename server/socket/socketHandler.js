const { Server } = require('socket.io');

const getAllowedOrigins = () => {
  const origins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
    process.env.VERCEL_FRONTEND_URL,
  ].filter(Boolean);

  return [...new Set(origins)];
};

function configureSocket(httpServer) {
  // Socket.io lets the backend push updates to connected clients in real time.
  // This project uses a simulated railway feed, so each event is an academic demo of
  // how a live status update would reach the UI without reloading the page.
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        const allowed = getAllowedOrigins();

        if (!origin || allowed.includes(origin) || /https:\/\/.*\.(vercel\.app|netlify\.app|netlify\.com|github\.dev)/i.test(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`Origin ${origin} is not allowed by Socket.io CORS`));
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', socket => {
    // Clients join a station room so the server can emit station-specific updates.
    socket.on('joinStation', stationId => { if (stationId) socket.join(`station:${stationId}`); });
    socket.on('leaveStation', stationId => { if (stationId) socket.leave(`station:${stationId}`); });

    // A live demo can also listen for connection-level events if needed in the future.
  });

  return io;
}

module.exports = configureSocket;
