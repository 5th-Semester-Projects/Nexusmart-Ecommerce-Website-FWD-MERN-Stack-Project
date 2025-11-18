import mongoose from 'mongoose';
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

const products = [
  // Men's Products (10 products with varied ratings)
  {
    name: 'Premium Leather Wallet',
    description: 'Genuine leather wallet with RFID protection and multiple card slots',
    price: 49.99,
    stock: 100,
    ratings: 4.8,
    numOfReviews: 234,
    category: 'Men',
    images: [{ public_id: 'sample', url: 'https://via.placeholder.com/400' }],
    featured: true,
    newArrival: true
  },
  {
    name: 'Classic Business Suit',
    description: 'Professional business suit with modern fit and premium fabric',
    price: 399.99,
    stock: 50,
    ratings: 4.6,
    numOfReviews: 89,
    category: 'Men',
    images: [{ public_id: 'sample', url: 'https://via.placeholder.com/400' }],
    featured: true
  },
  {
    name: 'Formal Dress Shoes',
    description: 'Italian leather dress shoes for formal occasions',
    price: 179.99,
    stock: 75,
    ratings: 4.4,
    numOfReviews: 156,
    category: 'Men',
    images: [{ public_id: 'sample', url: 'https://via.placeholder.com/400' }]
  },
  {
    name: 'Casual Polo Shirt',
    description: 'Comfortable cotton polo shirt perfect for casual outings',
    price: 39.99,
    stock: 200,
    ratings: 4.2,
    numOfReviews: 312,
    category: 'Men',
    images: [{ public_id: 'sample', url: 'https://via.placeholder.com/400' }],
    newArrival: true
  },
  {
    name: 'Designer Sunglasses',
    description: 'UV protection sunglasses with polarized lenses',
    price: 129.99,
    stock: 80,
    ratings: 3.9,
    numOfReviews: 67,
    category: 'Men',
    images: [{ public_id: 'sample', url: 'https://via.placeholder.com/400' }]
  },
  {
    name: 'Sports Running Shoes',
    description: 'Lightweight running shoes with advanced cushioning',
    price: 119.99,
    stock: 150,
    ratings: 3.7,
    numOfReviews: 189,
    category: 'Men',
    images: [{ public_id: 'sample', url: 'https://via.placeholder.com/400' }],
    newArrival: true
  },
  {
    name: 'Winter Puffer Jacket',
    description: 'Warm puffer jacket with water-resistant outer shell',
    price: 199.99,
    stock: 60,
    ratings: 3.5,
    numOfReviews: 98,
    category: 'Men',
    images: [{ public_id: 'sample', url: 'https://via.placeholder.com/400' }]
  },
  {
    name: 'Casual Denim Jeans',
    description: 'Classic fit denim jeans with stretch comfort',
    price: 69.99,
    stock: 180,
    ratings: 3.2,
    numOfReviews: 245,
    category: 'Men',
    images: [{ public_id: 'sample', url: 'https://via.placeholder.com/400' }]
  },
  {
    name: 'Athletic Gym Shorts',
    description: 'Breathable gym shorts with moisture-wicking fabric',
    price: 29.99,
    stock: 220,
    ratings: 2.9,
    numOfReviews: 134,
    category: 'Men',
    images: [{ public_id: 'sample', url: 'https://via.placeholder.com/400' }]
  },
  {
    name: 'Basic Cotton T-Shirt',
    description: 'Comfortable everyday cotton t-shirt',
    price: 19.99,
    stock: 300,
    ratings: 2.5,
    numOfReviews: 456,
    category: 'Men',
    images: [{ public_id: 'sample', url: 'https://via.placeholder.com/400' }]
  },

  // Women's Products (10 products with varied ratings)
  {
    name: 'Designer Handbag',
    description: 'Luxury handbag with premium leather and elegant design',
    price: 349.99,
    stock: 45,
    ratings: 4.9,
    numOfReviews: 178,
    category: 'Women',
    images: [{ public_id: 'sample', url: 'https://via.placeholder.com/400' }],
    featured: true,
    newArrival: true
  },
  {
    name: 'Elegant Evening Gown',
    description: 'Stunning evening gown perfect for special occasions',
    price: 299.99,
    stock: 30,
    ratings: 4.7,
    numOfReviews: 92,
    category: 'Women',
    images: [{ public_id: 'sample', url: 'https://via.placeholder.com/400' }],
    featured: true
  },
  {
    name: 'High Heel Pumps',
    description: 'Classic high heel pumps with cushioned insole',
    price: 89.99,
    stock: 100,
    ratings: 4.5,
    numOfReviews: 234,
    category: 'Women',
    images: [{ public_id: 'sample', url: 'https://via.placeholder.com/400' }]
  },
  {
    name: 'Floral Summer Dress',
    description: 'Light and breezy summer dress with floral print',
    price: 79.99,
    stock: 120,
    ratings: 4.3,
    numOfReviews: 267,
    category: 'Women',
    images: [{ public_id: 'sample', url: 'https://via.placeholder.com/400' }],
    newArrival: true
  },
  {
    name: 'Statement Necklace',
    description: 'Bold statement necklace with crystal embellishments',
    price: 59.99,
    stock: 80,
    ratings: 4.0,
    numOfReviews: 145,
    category: 'Women',
    images: [{ public_id: 'sample', url: 'https://via.placeholder.com/400' }]
  },
  {
    name: 'Yoga Leggings',
    description: 'Stretchy yoga leggings with high waist design',
    price: 49.99,
    stock: 200,
    ratings: 3.8,
    numOfReviews: 312,
    category: 'Women',
    images: [{ public_id: 'sample', url: 'https://via.placeholder.com/400' }],
    newArrival: true
  },
  {
    name: 'Winter Wool Coat',
    description: 'Elegant wool coat for cold weather',
    price: 229.99,
    stock: 40,
    ratings: 3.6,
    numOfReviews: 78,
    category: 'Women',
    images: [{ public_id: 'sample', url: 'https://via.placeholder.com/400' }]
  },
  {
    name: 'Casual Sneakers',
    description: 'Comfortable sneakers for everyday wear',
    price: 69.99,
    stock: 150,
    ratings: 3.3,
    numOfReviews: 189,
    category: 'Women',
    images: [{ public_id: 'sample', url: 'https://via.placeholder.com/400' }]
  },
  {
    name: 'Fashion Scarf',
    description: 'Lightweight fashion scarf with vibrant patterns',
    price: 24.99,
    stock: 180,
    ratings: 3.0,
    numOfReviews: 223,
    category: 'Women',
    images: [{ public_id: 'sample', url: 'https://via.placeholder.com/400' }]
  },
  {
    name: 'Basic Tank Top',
    description: 'Essential cotton tank top for layering',
    price: 14.99,
    stock: 250,
    ratings: 2.7,
    numOfReviews: 401,
    category: 'Women',
    images: [{ public_id: 'sample', url: 'https://via.placeholder.com/400' }]
  },

  // Electronics (10 products with varied ratings)
  {
    name: 'Premium Wireless Headphones',
    description: 'High-quality wireless headphones with active noise cancellation',
    price: 199.99,
    stock: 75,
    ratings: 4.8,
    numOfReviews: 456,
    category: 'Electronics',
    images: [{ public_id: 'sample', url: 'https://via.placeholder.com/400' }],
    featured: true,
    newArrival: true
  },
  {
    name: 'Smart Fitness Watch',
    description: 'Advanced fitness tracker with heart rate monitoring',
    price: 149.99,
    stock: 90,
    ratings: 4.6,
    numOfReviews: 312,
    category: 'Electronics',
    images: [{ public_id: 'sample', url: 'https://via.placeholder.com/400' }],
    featured: true
  },
  {
    name: 'Wireless Gaming Mouse',
    description: 'Ergonomic gaming mouse with RGB lighting',
    price: 79.99,
    stock: 120,
    ratings: 4.4,
    numOfReviews: 267,
    category: 'Electronics',
    images: [{ public_id: 'sample', url: 'https://via.placeholder.com/400' }]
  },
  {
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard with blue switches',
    price: 129.99,
    stock: 85,
    ratings: 4.1,
    numOfReviews: 189,
    category: 'Electronics',
    images: [{ public_id: 'sample', url: 'https://via.placeholder.com/400' }],
    newArrival: true
  },
  {
    name: 'Portable Bluetooth Speaker',
    description: 'Waterproof bluetooth speaker with 12-hour battery',
    price: 59.99,
    stock: 150,
    ratings: 3.9,
    numOfReviews: 234,
    category: 'Electronics',
    images: [{ public_id: 'sample', url: 'https://via.placeholder.com/400' }]
  },
  {
    name: 'USB-C Hub Adapter',
    description: 'Multi-port USB-C hub with HDMI and USB 3.0',
    price: 39.99,
    stock: 200,
    ratings: 3.7,
    numOfReviews: 167,
    category: 'Electronics',
    images: [{ public_id: 'sample', url: 'https://via.placeholder.com/400' }],
    newArrival: true
  },
  {
    name: 'Wireless Earbuds',
    description: 'True wireless earbuds with charging case',
    price: 89.99,
    stock: 110,
    ratings: 3.4,
    numOfReviews: 298,
    category: 'Electronics',
    images: [{ public_id: 'sample', url: 'https://via.placeholder.com/400' }]
  },
  {
    name: 'Phone Stand Holder',
    description: 'Adjustable phone stand for desk use',
    price: 19.99,
    stock: 300,
    ratings: 3.1,
    numOfReviews: 423,
    category: 'Electronics',
    images: [{ public_id: 'sample', url: 'https://via.placeholder.com/400' }]
  },
  {
    name: 'Basic Phone Case',
    description: 'Protective phone case with slim design',
    price: 12.99,
    stock: 400,
    ratings: 2.8,
    numOfReviews: 567,
    category: 'Electronics',
    images: [{ public_id: 'sample', url: 'https://via.placeholder.com/400' }]
  },
  {
    name: 'Screen Protector Pack',
    description: 'Tempered glass screen protector 3-pack',
    price: 9.99,
    stock: 500,
    ratings: 2.4,
    numOfReviews: 789,
    category: 'Electronics',
    images: [{ public_id: 'sample', url: 'https://via.placeholder.com/400' }]
  }
];

const seedProducts = async () => {
  try {
    await connectDB();

    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    // Get or create categories
    const categoryMap = {};
    for (const categoryName of ['Men', 'Women', 'Electronics']) {
      let category = await Category.findOne({ name: categoryName });
      if (!category) {
        category = await Category.create({
          name: categoryName,
          description: `${categoryName} products`
        });
      }
      categoryMap[categoryName] = category._id;
    }
    console.log('✅ Categories ready');

    // Create a dummy seller ID
    const sellerId = new mongoose.Types.ObjectId();

    // Add category IDs, seller, SKU, and slug to products
    const productsWithCategories = products.map((product, index) => ({
      ...product,
      category: categoryMap[product.category],
      seller: sellerId,
      sku: `SKU${String(index + 1).padStart(4, '0')}`,
      seo: {
        slug: product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') + `-${index + 1}`,
        metaTitle: product.name,
        metaDescription: product.description
      }
    }));

    // Insert products
    await Product.insertMany(productsWithCategories);
    console.log(`✅ Successfully seeded ${products.length} products`);
    console.log('📊 Rating distribution: 2.4 to 4.9');
    console.log('📦 Products per category: 10 Men, 10 Women, 10 Electronics');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedProducts();
