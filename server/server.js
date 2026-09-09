require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const notFound = require('./middleware/notFoundMiddleware');
const errorHandler = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const trainRoutes = require('./routes/trainRoutes');
const stationRoutes = require('./routes/stationRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const taskRoutes = require('./routes/taskRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const walletRoutes = require('./routes/walletRoutes');
const foodRoutes = require('./routes/foodRoutes');
const http = require('http');
const configureSocket = require('./socket/socketHandler');

const app = express();
const httpServer = http.createServer(app);
const io = configureSocket(httpServer);
app.set('io', io);

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  process.env.VERCEL_FRONTEND_URL,
].filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  return /https:\/\/.*\.vercel\.app/i.test(origin);
};

// Connect to Database
connectDB();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// Health check route for Render and CI checks
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Railway Management System API is running',
    timestamp: new Date().toISOString(),
  });
});

// Basic Route
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Railway Management System API is running...', data: { version: '1.0.0' } });
});

app.use('/api/auth', authRoutes);
app.use('/api/trains', trainRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/food', foodRoutes);
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
