import mongoose from 'mongoose';
import Product from './models/Product.js';
import Category from './models/Category.js';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const fixCategories = async () => {
  try {
    await connectDB();

    // Create categories if they don't exist
    const categories = [
      { name: 'Men', description: "Men's clothing and accessories", slug: 'men' },
      { name: 'Women', description: "Women's fashion and accessories", slug: 'women' },
      { name: 'Electronics', description: 'Electronic gadgets and devices', slug: 'electronics' }
    ];

    console.log('\n📦 Creating categories...');
    const categoryDocs = {};

    for (const cat of categories) {
      let category = await Category.findOne({ name: cat.name });
      if (!category) {
        category = await Category.create(cat);
        console.log(`✅ Created category: ${cat.name}`);
      } else {
        console.log(`✓ Category exists: ${cat.name}`);
      }
      categoryDocs[cat.name.toLowerCase()] = category._id;
    }

    // Define exact product lists for each category
    const menProducts = [
      'Premium Leather Wallet', 'Classic Business Suit', 'Formal Dress Shoes', 'Casual Polo Shirt', 'Designer Sunglasses',
      'Sports Running Shoes', 'Winter Puffer Jacket', 'Casual Denim Jeans', 'Athletic Gym Shorts', 'Basic Cotton T-Shirt',
      'Luxury Watch', 'Leather Belt', 'Woolen Blazer', 'Silk Tie', 'Oxford Shirt',
      'Loafers', 'Track Pants', 'Hooded Sweatshirt', 'Swim Shorts', 'Rain Jacket',
      'Cargo Pants', 'V-Neck Sweater', 'Bomber Jacket', 'Chino Shorts', 'Turtleneck Sweater',
      'Sports Cap', 'Crossbody Bag', 'Backpack', 'Canvas Sneakers', 'Dress Watch'
    ];

    const womenProducts = [
      'Designer Handbag', 'Elegant Evening Gown', 'High Heel Pumps', 'Floral Summer Dress', 'Statement Necklace',
      'Yoga Leggings', 'Winter Wool Coat', 'Casual Sneakers', 'Fashion Scarf', 'Basic Tank Top',
      'Leather Clutch', 'Cocktail Dress', 'Ballet Flats', 'Maxi Dress', 'Diamond Earrings',
      'Sports Bra', 'Trench Coat', 'Ankle Boots', 'Silk Blouse', 'Cardigan Sweater',
      'Tote Bag', 'Pencil Skirt', 'Wedge Sandals', 'Wrap Dress', 'Pearl Bracelet',
      'Running Tights', 'Puffer Vest', 'Slip-On Sneakers', 'Crop Top', 'Denim Jacket'
    ];

    const electronicsProducts = [
      'Premium Wireless Headphones', 'Smart Fitness Watch', 'Wireless Gaming Mouse', 'Mechanical Keyboard', 'Bluetooth Speaker',
      'USB-C Hub Adapter', 'Wireless Earbuds', 'Phone Stand Holder', 'Screen Protector', 'Power Bank',
      'Webcam HD 1080p', 'Laptop Cooling Pad', 'External SSD Drive', 'Graphics Tablet', 'Smart Light Bulb',
      'Wireless Charger Pad', 'Noise Cancelling Headset', 'Gaming Controller', 'Action Camera 4K', 'Drone with Camera',
      'Smart Door Lock', 'WiFi Router Mesh', 'Streaming Microphone', 'Ring Light LED', 'Tablet Stand',
      'Cable Management Kit', 'Surge Protector', 'USB Flash Drive', 'HDMI Cable 4K', 'Laptop Sleeve Case'
    ];

    // Update products with category ObjectIds based on exact names
    console.log('\n🔧 Updating products with categories...');

    const allProducts = await Product.find({});
    console.log(`Found ${allProducts.length} products`);

    let updated = 0;
    for (const product of allProducts) {
      let categoryId = null;
      const productName = product.name;

      if (menProducts.includes(productName)) {
        categoryId = categoryDocs['men'];
        console.log(`✓ MEN: ${product.name}`);
      } else if (womenProducts.includes(productName)) {
        categoryId = categoryDocs['women'];
        console.log(`✓ WOMEN: ${product.name}`);
      } else if (electronicsProducts.includes(productName)) {
        categoryId = categoryDocs['electronics'];
        console.log(`✓ ELECTRONICS: ${product.name}`);
      } else {
        console.log(`⚠ UNKNOWN PRODUCT: ${product.name}`);
        continue;
      }

      await Product.updateOne(
        { _id: product._id },
        { $set: { category: categoryId } }
      );
      updated++;
    } console.log(`\n✅ Updated ${updated} products with category ObjectIds`);

    // Verify
    console.log('\n📊 Verification:');
    for (const catName of ['men', 'women', 'electronics']) {
      const count = await Product.countDocuments({ category: categoryDocs[catName] });
      console.log(`${catName.toUpperCase()}: ${count} products`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixCategories();
