import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://nexusmart:nexusmart123@cluster0.46lpntt.mongodb.net/nexusmart?retryWrites=true&w=majority';

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  role: { type: String, default: 'user' },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { strict: false });

const User = mongoose.model('User', userSchema);

async function cleanupUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all non-admin users
    const allUsers = await User.find({});
    console.log(`\n📊 Total users in database: ${allUsers.length}`);

    // Show all users
    console.log('\n👥 All users:');
    allUsers.forEach(u => {
      console.log(`   - ${u.email} (${u.role}) ${u.isVerified ? '✅ Verified' : '❌ Not Verified'}`);
    });

    // Delete test users (emails with 'students.au' or test patterns)
    const testUsers = await User.find({
      email: { $regex: /students\.au|test|233599/i },
      role: { $ne: 'admin' }
    });

    if (testUsers.length > 0) {
      console.log(`\n🗑️ Found ${testUsers.length} test users to delete:`);
      testUsers.forEach(u => console.log(`   - ${u.email}`));

      const deleteResult = await User.deleteMany({
        email: { $regex: /students\.au|test|233599/i },
        role: { $ne: 'admin' }
      });
      console.log(`✅ Deleted ${deleteResult.deletedCount} test users`);
    } else {
      console.log('\n✅ No test users found to delete');
    }

    // Mark all remaining users as verified (for development)
    const updateResult = await User.updateMany(
      { isVerified: false },
      { isVerified: true }
    );
    console.log(`\n✅ Marked ${updateResult.modifiedCount} users as verified`);

    // Final count
    const finalCount = await User.countDocuments();
    console.log(`\n📊 Final user count: ${finalCount}`);

    await mongoose.disconnect();
    console.log('\n✅ Cleanup complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

cleanupUsers();
