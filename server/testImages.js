import mongoose from 'mongoose';

const testImageLoad = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/nexusmart');
    console.log('✅ Connected\n');

    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

    // Get the specific products showing blue placeholders
    const products = await Product.find({
      name: {
        $in: [/HDMI Cable 4K/i, /Laptop Sleeve/i, /Gaming Controller/i]
      }
    }).select('name images').lean();

    console.log('🔍 Products with blue placeholders:\n');

    products.forEach(p => {
      console.log(`${p.name}:`);
      console.log(`  URL: ${p.images[0]?.url}`);
      console.log(`  Full: ${JSON.stringify(p.images[0])}\n`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testImageLoad();
