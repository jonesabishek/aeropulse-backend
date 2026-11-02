const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const uri = process.argv[2] || process.env.MONGODB_URI;

if (!uri) {
  console.error('\n❌ Please provide a MongoDB Atlas URI!');
  console.log('Usage: node test-atlas.js "mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/aeropulse_wind?retryWrites=true&w=majority"\n');
  process.exit(1);
}

console.log('\n⏳ Connecting to MongoDB Atlas...');
console.log('Target URI:', uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));

mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
  .then(async (conn) => {
    console.log('\n✅ SUCCESS: Connected to MongoDB Atlas Cloud Database!');
    console.log('Database Name:', conn.connection.name);
    console.log('Host:', conn.connection.host);

    const collections = await conn.connection.db.listCollections().toArray();
    console.log('\n--- Cloud Collections in ' + conn.connection.name + ' ---');
    if (collections.length === 0) {
      console.log('Database is currently empty. Running auto-seeder to populate initial data...');
      const seedDatabase = require('./config/seed');
      await seedDatabase();
      console.log('✅ Auto-seed completed successfully!');
    } else {
      for (const c of collections) {
        const count = await conn.connection.db.collection(c.name).countDocuments();
        console.log(` • ${c.name.padEnd(22)}: ${count} documents`);
      }
    }

    await mongoose.disconnect();
    console.log('\n🎉 Atlas connection test completed successfully!\n');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ FAILED to connect to MongoDB Atlas:');
    console.error('Error Message:', err.message);
    console.log('\nCommon causes:');
    console.log(' 1. Invalid username or password (check for special characters that need URL encoding).');
    console.log(' 2. Network Access: Ensure IP "0.0.0.0/0" (Allow from anywhere) is enabled in Atlas Network Access tab.');
    console.log(' 3. Database user does not have read/write privileges on the database.\n');
    process.exit(1);
  });
