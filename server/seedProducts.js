import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

// Import Product model
import Product from './models/Product.js';
import Category from './models/Category.js';

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/nexusmart');
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Sample Products Data
const getSampleProducts = (sellerId) => [
  {
    name: 'Premium Wireless Headphones',
    description: 'High-quality wireless headphones with active noise cancellation, 30-hour battery life, and premium sound quality. Perfect for music lovers and professionals.',
    price: 199.99,
    originalPrice: 299.99,
    stock: 50,
    ratings: 4.8,
    numOfReviews: 156,
    brand: 'AudioTech',
    specifications: [
      { name: 'Battery Life', value: '30 hours' },
      { name: 'Connectivity', value: 'Bluetooth 5.0' },
      { name: 'Weight', value: '250g' },
      { name: 'Noise Cancellation', value: 'Active' }
    ],
    seller: sellerId,
    featured: true,
    newArrival: true
  },
  {
    name: 'Smart Fitness Watch',
    description: 'Advanced fitness tracker with heart rate monitoring, GPS, sleep tracking, and 50+ sport modes. Water resistant up to 50m.',
    price: 149.99,
    originalPrice: 199.99,
    stock: 75,
    ratings: 4.6,
    numOfReviews: 203,
    brand: 'FitPro',
    specifications: [
      { name: 'Display', value: '1.4" AMOLED' },
      { name: 'Battery', value: '7 days' },
      { name: 'Water Resistance', value: '50m' },
      { name: 'GPS', value: 'Built-in' }
    ],
    seller: sellerId,
    featured: true,
    bestSeller: true
  },
  {
    name: 'Mechanical Gaming Keyboard',
    description: 'RGB mechanical keyboard with custom switches, programmable keys, and premium build quality. Perfect for gaming and typing.',
    price: 129.99,
    originalPrice: 179.99,
    stock: 60,
    ratings: 4.7,
    numOfReviews: 189,
    brand: 'GameGear',
    specifications: [
      { name: 'Switch Type', value: 'Mechanical Blue' },
      { name: 'RGB', value: 'Per-key' },
      { name: 'Connectivity', value: 'USB-C' },
      { name: 'Build', value: 'Aluminum Frame' }
    ],
    seller: sellerId,
    featured: true
  },
  {
    name: 'Classic Leather Jacket',
    description: 'Premium genuine leather jacket with modern cut. Timeless style perfect for any occasion. Soft, durable, and comfortable.',
    price: 249.99,
    originalPrice: 399.99,
    stock: 30,
    ratings: 4.9,
    numOfReviews: 142,
    brand: 'UrbanStyle',
    specifications: [
      { name: 'Material', value: '100% Genuine Leather' },
      { name: 'Lining', value: 'Polyester' },
      { name: 'Fit', value: 'Regular' },
      { name: 'Care', value: 'Professional Clean Only' }
    ],
    seller: sellerId,
    bestSeller: true
  },
  {
    name: 'Casual Denim Jeans',
    description: 'Comfortable slim-fit denim jeans with stretch fabric. Perfect for everyday wear with a modern look.',
    price: 79.99,
    originalPrice: 119.99,
    stock: 100,
    ratings: 4.5,
    numOfReviews: 287,
    brand: 'DenimCo',
    specifications: [
      { name: 'Material', value: '98% Cotton, 2% Elastane' },
      { name: 'Fit', value: 'Slim' },
      { name: 'Wash', value: 'Dark Blue' },
      { name: 'Style', value: 'Casual' }
    ],
    seller: sellerId,
    bestSeller: true
  },
  {
    name: 'Sports Running Shoes',
    description: 'Lightweight running shoes with superior cushioning and breathable mesh. Designed for performance and comfort.',
    price: 89.99,
    originalPrice: 129.99,
    stock: 80,
    ratings: 4.6,
    numOfReviews: 234,
    brand: 'SportMax',
    specifications: [
      { name: 'Upper', value: 'Mesh' },
      { name: 'Sole', value: 'Rubber' },
      { name: 'Cushioning', value: 'Air' },
      { name: 'Weight', value: '250g per shoe' }
    ],
    seller: sellerId,
    featured: true
  },
  {
    name: 'Elegant Summer Dress',
    description: 'Beautiful floral summer dress with a flattering silhouette. Light, breathable fabric perfect for warm weather.',
    price: 89.99,
    originalPrice: 139.99,
    stock: 45,
    ratings: 4.8,
    numOfReviews: 167,
    brand: 'FashionHub',
    specifications: [
      { name: 'Material', value: '100% Cotton' },
      { name: 'Pattern', value: 'Floral' },
      { name: 'Length', value: 'Knee-length' },
      { name: 'Occasion', value: 'Casual' }
    ],
    seller: sellerId,
    newArrival: true,
    featured: true
  },
  {
    name: 'Designer Handbag',
    description: 'Luxury leather handbag with elegant design. Spacious interior with multiple compartments. Perfect for work or special occasions.',
    price: 299.99,
    originalPrice: 449.99,
    stock: 25,
    ratings: 4.9,
    numOfReviews: 98,
    brand: 'LuxeBags',
    specifications: [
      { name: 'Material', value: 'Genuine Leather' },
      { name: 'Interior', value: 'Fabric Lining' },
      { name: 'Compartments', value: '3 main + 2 side' },
      { name: 'Closure', value: 'Magnetic Snap' }
    ],
    seller: sellerId,
    featured: true,
    bestSeller: true
  },
  {
    name: 'Stylish Sunglasses',
    description: 'Trendy sunglasses with UV protection and polarized lenses. Fashion-forward design with premium quality.',
    price: 129.99,
    originalPrice: 199.99,
    stock: 60,
    ratings: 4.7,
    numOfReviews: 145,
    brand: 'VisionStyle',
    specifications: [
      { name: 'Lens', value: 'Polarized' },
      { name: 'UV Protection', value: '100%' },
      { name: 'Frame', value: 'Acetate' },
      { name: 'Style', value: 'Cat-eye' }
    ],
    seller: sellerId,
    newArrival: true
  },
  {
    name: 'Wireless Gaming Mouse',
    description: 'High-precision wireless gaming mouse with customizable RGB lighting, programmable buttons, and ergonomic design.',
    price: 79.99,
    originalPrice: 99.99,
    stock: 90,
    ratings: 4.6,
    numOfReviews: 201,
    brand: 'GameGear',
    specifications: [
      { name: 'DPI', value: 'Up to 16000' },
      { name: 'Connectivity', value: 'Wireless 2.4GHz' },
      { name: 'Battery', value: '70 hours' },
      { name: 'Buttons', value: '8 Programmable' }
    ],
    seller: sellerId,
    bestSeller: true
  },
  {
    name: 'Formal Business Shirt',
    description: 'Premium cotton formal shirt with a slim fit. Perfect for office and business meetings. Easy care and wrinkle-resistant.',
    price: 59.99,
    originalPrice: 89.99,
    stock: 70,
    ratings: 4.5,
    numOfReviews: 178,
    brand: 'BusinessWear',
    specifications: [
      { name: 'Material', value: '100% Cotton' },
      { name: 'Fit', value: 'Slim' },
      { name: 'Collar', value: 'Spread' },
      { name: 'Care', value: 'Machine Washable' }
    ],
    seller: sellerId
  },
  {
    name: 'Cozy Winter Sweater',
    description: 'Warm and comfortable knit sweater perfect for cold weather. Soft fabric with a modern design.',
    price: 69.99,
    originalPrice: 99.99,
    stock: 55,
    ratings: 4.7,
    numOfReviews: 134,
    brand: 'CozyWear',
    specifications: [
      { name: 'Material', value: '80% Cotton, 20% Polyester' },
      { name: 'Style', value: 'Pullover' },
      { name: 'Fit', value: 'Regular' },
      { name: 'Wash', value: 'Hand Wash Recommended' }
    ],
    seller: sellerId,
    newArrival: true
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();

    // Import User model
    const User = (await import('./models/User.js')).default;

    // First, create or get admin user as seller
    console.log('👤 Creating/getting admin user...');
    let adminUser = await User.findOne({ email: 'admin@nexusmart.com' });

    if (!adminUser) {
      adminUser = await User.create({
        firstName: 'NexusMart',
        lastName: 'Admin',
        email: 'admin@nexusmart.com',
        password: 'admin123',
        role: 'admin',
        isVerified: true
      });
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user found');
    }    // Create categories
    console.log('🏷️  Creating categories...');
    await Category.deleteMany({});

    const categories = await Category.insertMany([
      {
        name: 'Electronics',
        description: 'Electronic devices and gadgets',
        slug: 'electronics',
        isActive: true
      },
      {
        name: 'Men',
        description: 'Men\'s fashion and accessories',
        slug: 'men',
        isActive: true
      },
      {
        name: 'Women',
        description: 'Women\'s fashion and accessories',
        slug: 'women',
        isActive: true
      }
    ]);

    const categoryMap = {
      'Electronics': categories[0]._id,
      'Men': categories[1]._id,
      'Women': categories[2]._id
    };

    console.log(`✅ Created ${categories.length} categories`);

    // Get sample products with admin as seller
    const sampleProducts = getSampleProducts(adminUser._id);

    // Product images mapping
    const productImages = {
      'Premium Wireless Headphones': [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500',
        'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=500'
      ],
      'Smart Fitness Watch': [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
        'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=500',
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500'
      ],
      'Mechanical Gaming Keyboard': [
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
        'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500',
        'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500'
      ],
      'Classic Leather Jacket': [
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
        'https://images.unsplash.com/photo-1520975867597-0af37a22e31e?w=500',
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500'
      ],
      'Casual Denim Jeans': [
        'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
        'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=500',
        'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500'
      ],
      'Sports Running Shoes': [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500'
      ],
      'Elegant Summer Dress': [
        'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500',
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500',
        'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500'
      ],
      'Designer Handbag': [
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500',
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500',
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500'
      ],
      'Stylish Sunglasses': [
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500',
        'https://images.unsplash.com/photo-1577803645773-f96470509666?w=500',
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500'
      ],
      'Wireless Gaming Mouse': [
        'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500',
        'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500',
        'https://images.unsplash.com/photo-1613141411244-0e4ac46c5ebb?w=500'
      ],
      'Formal Business Shirt': [
        'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=500',
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500',
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500'
      ],
      'Cozy Winter Sweater': [
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500',
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500'
      ]
    };

    // Assign categories to products
    const categoryAssignment = {
      'Premium Wireless Headphones': 'Electronics',
      'Smart Fitness Watch': 'Electronics',
      'Mechanical Gaming Keyboard': 'Electronics',
      'Wireless Gaming Mouse': 'Electronics',
      'Classic Leather Jacket': 'Men',
      'Casual Denim Jeans': 'Men',
      'Sports Running Shoes': 'Men',
      'Formal Business Shirt': 'Men',
      'Elegant Summer Dress': 'Women',
      'Designer Handbag': 'Women',
      'Stylish Sunglasses': 'Women',
      'Cozy Winter Sweater': 'Women'
    };

    // Update sample products with category ObjectIds, images and SKU
    const productsWithIds = sampleProducts.map((product, index) => ({
      ...product,
      category: categoryMap[categoryAssignment[product.name]],
      sku: `SKU-${Date.now()}-${index}`,
      images: (productImages[product.name] || []).map((url, imgIndex) => ({
        public_id: `product_${index}_${imgIndex}`,
        url: url,
        isPrimary: imgIndex === 0
      })),
      seo: {
        slug: product.name.toLowerCase().replace(/\s+/g, '-'),
        metaTitle: product.name,
        metaDescription: product.description.substring(0, 160)
      }
    }));

    // Clear existing products
    console.log('🗑️  Clearing existing products...');
    await Product.deleteMany({});

    // Insert sample products
    console.log('📦 Inserting sample products...');
    const products = await Product.insertMany(productsWithIds);

    console.log(`✅ Successfully added ${products.length} products to database!`);
    console.log('\n📋 Sample Products:');
    products.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} - $${product.price} (${product.brand || 'N/A'})`);
    });

    console.log('\n✨ Database seeding completed successfully!');
    console.log('🚀 You can now refresh your frontend to see the products!');
    console.log('\n📧 Admin Login: admin@nexusmart.com / admin123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}; seedDatabase();
