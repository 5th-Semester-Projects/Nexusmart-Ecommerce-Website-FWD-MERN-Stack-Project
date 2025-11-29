import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://nexusmart:nexusmart123@cluster0.46lpntt.mongodb.net/nexusmart?retryWrites=true&w=majority';

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  role: { type: String, default: 'user' },
  avatar: Object,
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { strict: false });

const User = mongoose.model('User', userSchema);

async function setupAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // First, set all existing admins to 'user' role
    const result = await User.updateMany({ role: 'admin' }, { role: 'user' });
    console.log(`📝 Updated ${result.modifiedCount} previous admins to user role`);

    // Check if email already exists
    const existingUser = await User.findOne({ email: 'muhammadmaauz2018@gmail.com' });

    if (existingUser) {
      // Update existing user to admin
      existingUser.role = 'admin';
      existingUser.password = await bcrypt.hash('Scorpion4321', 10);
      existingUser.isVerified = true;
      await existingUser.save();
      console.log(`✅ Updated existing user to admin: ${existingUser.email}`);
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash('Scorpion4321', 10);
      const admin = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'muhammadmaauz2018@gmail.com',
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        createdAt: new Date()
      });
      await admin.save();
      console.log(`✅ Created new admin: ${admin.email}`);
    }

    // Verify only one admin exists
    const admins = await User.find({ role: 'admin' });
    console.log(`\n🔐 Total admins now: ${admins.length}`);
    admins.forEach(a => console.log(`   - ${a.email}`));

    await mongoose.disconnect();
    console.log('\n✅ Done!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

setupAdmin();
