const mongoose = require('mongoose');



const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      console.error('CRITICAL: MONGODB_URI environment variable is missing.');
      process.exit(1);
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Auto-seed if running locally or empty
    const Table = require('../models/Table');
    const User = require('../models/User');
    
    const tableCount = await Table.countDocuments();
    if (tableCount === 0) {
      console.log('No tables found. Seeding default tables and users...');
      
      // Seed default tables
      const tables = [
        { tableNumber: 1, capacity: 2 },
        { tableNumber: 2, capacity: 2 },
        { tableNumber: 3, capacity: 4 },
        { tableNumber: 4, capacity: 4 },
        { tableNumber: 5, capacity: 6 },
        { tableNumber: 6, capacity: 8 },
      ];
      await Table.insertMany(tables);
      console.log('Default tables seeded.');

      // Check if admin user exists
      const adminExists = await User.findOne({ role: 'admin' });
      if (!adminExists) {
        await User.create({
          username: 'admin',
          password: 'adminpassword123',
          role: 'admin',
        });
        console.log('Default admin user seeded (admin / adminpassword123).');
      }

      // Check if customer user exists
      const customerExists = await User.findOne({ username: 'customer' });
      if (!customerExists) {
        await User.create({
          username: 'customer',
          password: 'customerpassword123',
          role: 'customer',
        });
        console.log('Default customer user seeded (customer / customerpassword123).');
      }
    }
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
  } catch (error) {
    console.error(`Error disconnecting MongoDB: ${error.message}`);
  }
};

module.exports = { connectDB, disconnectDB };
