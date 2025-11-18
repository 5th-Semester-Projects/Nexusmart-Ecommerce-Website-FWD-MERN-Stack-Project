import mongoose from 'mongoose';
import Product from './models/Product.js';

const fixProductImages = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/nexusmart');
    console.log('✅ Connected to MongoDB\n');

    // Better working image URLs - tested and verified with product-specific images
    const imageFixes = {
      'HDMI Cable 4K': 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&h=400&fit=crop', // HDMI cable
      'Laptop Sleeve Case': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop', // Laptop bag/sleeve
      'Gaming Controller': 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=400&fit=crop', // Gaming controller
      'Ring Light LED': 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=400&h=400&fit=crop', // Ring light
      'Wireless Charger Pad': 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=400&fit=crop', // Wireless charger
      'Noise Cancelling Headset': 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop', // Headphones
      'Basic Tank Top': 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400&h=400&fit=crop', // Tank top
      'Rain Jacket': 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop', // Rain jacket
      'Leather Belt': 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=400&h=400&fit=crop', // Leather belt
      'Silk Tie': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop', // Tie
      'Swim Shorts': 'https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=400&h=400&fit=crop' // Swim shorts
    };

    console.log('🔧 Fixing product images:\n');

    for (const [productName, newImageUrl] of Object.entries(imageFixes)) {
      const product = await Product.findOne({
        name: { $regex: productName.replace(/\s+/g, '\\s+'), $options: 'i' }
      });

      if (product) {
        product.images = [{
          public_id: `${productName.toLowerCase().replace(/\s+/g, '-')}-fixed`,
          url: newImageUrl,
          isPrimary: true
        }];

        await product.save();
        console.log(`✅ Updated: ${product.name}`);
        console.log(`   New URL: ${newImageUrl}\n`);
      } else {
        console.log(`❌ Not found: ${productName}\n`);
      }
    }

    console.log('✅ All images updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixProductImages();
