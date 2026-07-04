const dotenv = require('dotenv');
const { connectDB, disconnectDB } = require('./db');
const User = require('../models/User');
const Table = require('../models/Table');
const Reservation = require('../models/Reservation');

// Load env vars
dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Table.deleteMany();
    await Reservation.deleteMany();

    console.log('Database cleared.');

    // Seed Users
    const admin = await User.create({
      username: 'admin',
      password: 'adminpassword123',
      role: 'admin',
    });

    const customer = await User.create({
      username: 'customer',
      password: 'customerpassword123',
      role: 'customer',
    });

    console.log('Seeded Users:');
    console.log(`- Admin: admin / adminpassword123`);
    console.log(`- Customer: customer / customerpassword123`);

    // Seed Tables
    const tables = [
      { tableNumber: 1, capacity: 2 },
      { tableNumber: 2, capacity: 2 },
      { tableNumber: 3, capacity: 4 },
      { tableNumber: 4, capacity: 4 },
      { tableNumber: 5, capacity: 6 },
      { tableNumber: 6, capacity: 8 },
    ];

    await Table.insertMany(tables);
    console.log('Seeded Tables successfully.');

    await disconnectDB();
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding data: ${error.message}`);
    process.exit(1);
  }
};

seedData();
