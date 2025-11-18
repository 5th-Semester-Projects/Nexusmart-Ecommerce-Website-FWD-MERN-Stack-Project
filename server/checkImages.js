import mongoose from 'mongoose';

const checkProductImages = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/nexusmart');
    console.log('✅ Connected to MongoDB\n');

    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

    const problemProducts = [
      'HDMI Cable 4K',
      'Laptop Sleeve Case',
      'Gaming Controller',
      'Ring Light Led',
      'Wireless Charger',
      'Noise Cancelling Headset',
      'Basic Tank Top',
      'Rain Jacket',
      'Leather Belt',
      'Silk Tie',
      'Swim Shorts'
    ];

    console.log('🔍 Checking problem products:\n');

    for (const productName of problemProducts) {
      const product = await Product.findOne({
        name: { $regex: productName.replace(/\s+/g, '\\s+'), $options: 'i' }
      }, { name: 1, images: 1 }).lean();

      if (product) {
        console.log(`✅ ${product.name}`);
        if (product.images && product.images.length > 0) {
          console.log(`   URL: ${product.images[0].url}`);
        } else {
          console.log(`   ❌ NO IMAGES!`);
        }
        console.log('');
      } else {
        console.log(`❌ ${productName}: NOT FOUND\n`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkProductImages();
