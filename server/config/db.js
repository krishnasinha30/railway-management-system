const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connectionString = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!connectionString) {
      throw new Error('MONGO_URI is required. Copy server/.env.example to server/.env and set it.');
    }

    const conn = await mongoose.connect(connectionString);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
