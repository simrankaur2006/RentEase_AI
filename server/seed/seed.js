/**
 * RentEase AI database seed.
 *
 * Authentication is handled by Clerk, so these MongoDB users carry PLACEHOLDER
 * Clerk ids (seed_admin_001, seed_owner_001, ...). No passwords are stored.
 *
 * To sign in as a demo account:
 *   1. Create the account in your Clerk dashboard (or sign up in the app).
 *   2. Copy the Clerk user id (looks like user_2abc...).
 *   3. Replace the placeholder in MongoDB, e.g. in mongosh:
 *        db.users.updateOne({ clerkUserId: "seed_owner_001" },
 *                           { $set: { clerkUserId: "user_2abc..." } })
 *   4. For the admin demo, either do the same for seed_admin_001 or run:
 *        db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
 */
require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = require('../config/db');
const User = require('../models/User');
const Property = require('../models/Property');
const Review = require('../models/Review');
const Inquiry = require('../models/Inquiry');
const Favourite = require('../models/Favourite');
const RecentlyViewed = require('../models/RecentlyViewed');
const { recalculatePropertyRating } = require('../services/ratingService');
const propertySeed = require('./properties');

const adminSeed = {
  clerkUserId: 'seed_admin_001',
  name: 'Ananya Verma',
  email: 'admin@rentease.ai',
  phone: '9810000001',
  role: 'admin',
  city: 'Delhi',
  profileImage: 'https://i.pravatar.cc/150?img=47'
};

const ownerSeed = [
  {
    clerkUserId: 'seed_owner_001', name: 'Rakesh Malhotra', email: 'rakesh.owner@rentease.ai',
    phone: '9810000011', role: 'owner', city: 'Delhi', profileImage: 'https://i.pravatar.cc/150?img=12'
  },
  {
    clerkUserId: 'seed_owner_002', name: 'Sunita Sharma', email: 'sunita.owner@rentease.ai',
    phone: '9810000012', role: 'owner', city: 'Noida', profileImage: 'https://i.pravatar.cc/150?img=32'
  },
  {
    clerkUserId: 'seed_owner_003', name: 'Imran Qureshi', email: 'imran.owner@rentease.ai',
    phone: '9810000013', role: 'owner', city: 'Pune', profileImage: 'https://i.pravatar.cc/150?img=15'
  }
];

const tenantSeed = [
  {
    clerkUserId: 'seed_tenant_001', name: 'Aditya Rana', email: 'aditya.tenant@rentease.ai',
    phone: '9810000021', role: 'tenant', city: 'Delhi', profileImage: 'https://i.pravatar.cc/150?img=68',
    preferences: {
      preferredCity: 'Delhi', preferredLocality: 'GTB Nagar', minRent: 6000, maxRent: 11000,
      propertyType: 'PG', roomType: 'Single', requiredAmenities: ['WiFi', 'Food', 'Study Table'],
      foodRequired: true, genderPreference: 'Male', isCompleted: true
    }
  },
  {
    clerkUserId: 'seed_tenant_002', name: 'Priya Nair', email: 'priya.tenant@rentease.ai',
    phone: '9810000022', role: 'tenant', city: 'Noida', profileImage: 'https://i.pravatar.cc/150?img=45',
    preferences: {
      preferredCity: 'Noida', preferredLocality: 'Sector 62', minRent: 8000, maxRent: 13000,
      propertyType: 'Room', roomType: 'Single', requiredAmenities: ['WiFi', 'AC', 'Attached Washroom'],
      foodRequired: false, genderPreference: 'Female', isCompleted: true
    }
  },
  {
    clerkUserId: 'seed_tenant_003', name: 'Karthik Iyer', email: 'karthik.tenant@rentease.ai',
    phone: '9810000023', role: 'tenant', city: 'Bangalore', profileImage: 'https://i.pravatar.cc/150?img=53',
    preferences: {
      preferredCity: 'Bangalore', preferredLocality: 'Koramangala', minRent: 10000, maxRent: 20000,
      propertyType: 'Apartment', roomType: 'Single', requiredAmenities: ['WiFi', 'AC', 'Parking'],
      foodRequired: false, genderPreference: 'Any', isCompleted: true
    }
  },
  {
    clerkUserId: 'seed_tenant_004', name: 'Meera Joshi', email: 'meera.tenant@rentease.ai',
    phone: '9810000024', role: 'tenant', city: 'Pune', profileImage: 'https://i.pravatar.cc/150?img=26',
    preferences: {
      preferredCity: 'Pune', preferredLocality: 'Viman Nagar', minRent: 5000, maxRent: 9500,
      propertyType: 'PG', roomType: 'Single', requiredAmenities: ['WiFi', 'Food', 'CCTV'],
      foodRequired: true, genderPreference: 'Female', isCompleted: true
    }
  },
  {
    clerkUserId: 'seed_tenant_005', name: 'Rohit Bansal', email: 'rohit.tenant@rentease.ai',
    phone: '9810000025', role: 'tenant', city: 'Gurugram', profileImage: 'https://i.pravatar.cc/150?img=59',
    preferences: {
      preferredCity: 'Gurugram', preferredLocality: 'DLF Phase 3', minRent: 10000, maxRent: 18000,
      propertyType: 'Flat', roomType: 'Shared', requiredAmenities: ['WiFi', 'Parking', 'Gym'],
      foodRequired: false, genderPreference: 'Any', isCompleted: true
    }
  }
];

const REVIEW_COMMENTS = [
  'Rooms are clean and the owner responds quickly. Food quality is consistent.',
  'Great location, but the WiFi slows down in the evening.',
  'Stayed here for eight months. Safe, well managed and good value for the rent.',
  'Decent place for the price. Housekeeping could be more regular.',
  'Loved the natural light and the study area. Would recommend to students.',
  'Well connected to the metro. Water supply has never been an issue.'
];

const INQUIRY_MESSAGES = [
  'Hi, is this place still available from the 1st of next month? I am a final year student.',
  'Could you share a few more photos of the room and the washroom?',
  'Is the deposit negotiable if I sign a twelve month agreement?',
  'What are the timings and are guests allowed on weekends?',
  'I work night shifts. Is late entry allowed?'
];

const seed = async () => {
  await connectDB();

  console.log('Clearing existing collections...');
  await Promise.all([
    User.deleteMany({}),
    Property.deleteMany({}),
    Review.deleteMany({}),
    Inquiry.deleteMany({}),
    Favourite.deleteMany({}),
    RecentlyViewed.deleteMany({})
  ]);

  console.log('Creating users...');
  const admin = await User.create(adminSeed);
  const owners = await User.create(ownerSeed);
  const tenants = await User.create(tenantSeed);

  console.log('Creating properties...');
  const statusPattern = [
    'approved', 'approved', 'approved', 'approved', 'approved',
    'approved', 'approved', 'approved', 'approved', 'approved',
    'approved', 'approved', 'pending', 'pending', 'rejected'
  ];

  const properties = [];
  for (let i = 0; i < propertySeed.length; i += 1) {
    const { ownerIndex, ...data } = propertySeed[i];
    const status = statusPattern[i] || 'approved';
    const created = await Property.create({
      ...data,
      owner: owners[ownerIndex]._id,
      status,
      rejectionReason: status === 'rejected' ? 'Listing photos did not match the address provided' : '',
      availableFrom: new Date(Date.now() + (i % 5) * 7 * 24 * 60 * 60 * 1000)
    });
    properties.push(created);
  }

  console.log('Creating reviews...');
  const approved = properties.filter((p) => p.status === 'approved');
  let reviewCount = 0;
  for (let i = 0; i < approved.length; i += 1) {
    const reviewers = [tenants[i % tenants.length], tenants[(i + 2) % tenants.length]];
    for (let j = 0; j < reviewers.length; j += 1) {
      await Review.create({
        user: reviewers[j]._id,
        property: approved[i]._id,
        rating: [5, 4, 4, 3, 5, 4][(i + j) % 6],
        comment: REVIEW_COMMENTS[(i + j) % REVIEW_COMMENTS.length]
      });
      reviewCount += 1;
    }
    await recalculatePropertyRating(approved[i]._id);
  }

  console.log('Creating inquiries...');
  const statuses = ['pending', 'contacted', 'closed'];
  let inquiryCount = 0;
  for (let i = 0; i < 9; i += 1) {
    const property = approved[i % approved.length];
    await Inquiry.create({
      tenant: tenants[i % tenants.length]._id,
      owner: property.owner,
      property: property._id,
      message: INQUIRY_MESSAGES[i % INQUIRY_MESSAGES.length],
      status: statuses[i % statuses.length]
    });
    inquiryCount += 1;
  }

  console.log('Creating favourites and recently viewed entries...');
  for (let i = 0; i < tenants.length; i += 1) {
    for (let j = 0; j < 3; j += 1) {
      const property = approved[(i + j) % approved.length];
      await Favourite.updateOne(
        { user: tenants[i]._id, property: property._id },
        { $setOnInsert: { user: tenants[i]._id, property: property._id } },
        { upsert: true }
      );
      await RecentlyViewed.updateOne(
        { user: tenants[i]._id, property: property._id },
        { $set: { viewedAt: new Date(Date.now() - j * 3600000) } },
        { upsert: true }
      );
    }
  }

  console.log('\n--------------------------------------------');
  console.log('RentEase AI seed complete');
  console.log(`  Admin     : 1  (${admin.email})`);
  console.log(`  Owners    : ${owners.length}`);
  console.log(`  Tenants   : ${tenants.length}`);
  console.log(`  Properties: ${properties.length}`);
  console.log(`  Reviews   : ${reviewCount}`);
  console.log(`  Inquiries : ${inquiryCount}`);
  console.log('--------------------------------------------');
  console.log('These users hold PLACEHOLDER Clerk ids (seed_admin_001, seed_owner_001, ...).');
  console.log('Sign up through Clerk, then point a seeded record at your real Clerk id:');
  console.log('  db.users.updateOne({ clerkUserId: "seed_owner_001" }, { $set: { clerkUserId: "user_xxx" } })');
  console.log('Or simply promote your own account:');
  console.log('  db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })');
  console.log('--------------------------------------------\n');

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch(async (error) => {
  console.error('Seed failed:', error);
  await mongoose.connection.close();
  process.exit(1);
});
