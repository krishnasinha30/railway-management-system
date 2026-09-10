const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const localFallback = process.env.NODE_ENV === 'production'
      ? null
      : 'mongodb://127.0.0.1:27017/railway-management-system';

    const connectionString = process.env.MONGO_URI || process.env.MONGODB_URI || localFallback;

    if (!connectionString) {
      throw new Error('MONGO_URI is required in production. Set it in your Render environment or provide a local MongoDB URL.');
    }

    const conn = await mongoose.connect(connectionString);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
