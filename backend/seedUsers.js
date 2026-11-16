/**
 * Creates one admin account.
 *
 *   cd backend && npm run seed:users
 *
 * Override with env vars if you like: ADMIN_EMAIL, ADMIN_PASSWORD.
 * Safe to re-run: existing accounts are left alone (use the Users page to change them).
 */
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const User = require('./models/User');

const ADMIN = {
  name: 'Admin',
  email: process.env.ADMIN_EMAIL || 'admin@worksphere.com',
  password: process.env.ADMIN_PASSWORD || 'Admin@12345',
  role: 'admin'
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const email = ADMIN.email.toLowerCase();

    if (await User.findOne({ email })) {
      console.log(`= ${email} already exists, skipped`);
    } else {
      await User.create({ ...ADMIN, email });
      console.log(`+ created ${ADMIN.role}: ${email}`);
    }
  } catch (error) {
    console.error('Seeding error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

run();
