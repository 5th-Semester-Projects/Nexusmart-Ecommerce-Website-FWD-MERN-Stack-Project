import mongoose from 'mongoose';

const checkMultipleImages = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/nexusmart');
    console.log('✅ Connected\n');

    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

    const problemProduct = await Product.findOne({ name: /HDMI Cable 4K/i }).lean();

    console.log('🔍 HDMI Cable 4K - Images array:');
    console.log(JSON.stringify(problemProduct.images, null, 2));
    console.log(`\n📊 Total images: ${problemProduct.images.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkMultipleImages();
