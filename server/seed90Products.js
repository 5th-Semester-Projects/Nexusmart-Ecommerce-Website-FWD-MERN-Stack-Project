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

// Distribute ratings evenly from 1.0 to 5.0 (18 products per star rating)
const generateRatings = () => {
  const ratings = [];
  // 18 products each: 1.0-1.9, 2.0-2.9, 3.0-3.9, 4.0-4.9, 5.0
  for (let i = 0; i < 6; i++) ratings.push(1.0 + Math.random() * 0.9); // 1 star range
  for (let i = 0; i < 6; i++) ratings.push(2.0 + Math.random() * 0.9); // 2 star range
  for (let i = 0; i < 6; i++) ratings.push(3.0 + Math.random() * 0.9); // 3 star range
  for (let i = 0; i < 6; i++) ratings.push(4.0 + Math.random() * 0.9); // 4 star range
  for (let i = 0; i < 6; i++) ratings.push(parseFloat((5.0).toFixed(1))); // 5 star exactly
  return ratings.map(r => parseFloat(r.toFixed(1)));
};

const menRatings = generateRatings();
const womenRatings = generateRatings();
const electronicsRatings = generateRatings();

const products = [
  // Men's Products (30 products)
  ...Array.from({ length: 30 }, (_, i) => {
    const names = [
      'Premium Leather Wallet', 'Classic Business Suit', 'Formal Dress Shoes', 'Casual Polo Shirt', 'Designer Sunglasses',
      'Sports Running Shoes', 'Winter Puffer Jacket', 'Casual Denim Jeans', 'Athletic Gym Shorts', 'Basic Cotton T-Shirt',
      'Luxury Watch', 'Leather Belt', 'Woolen Blazer', 'Silk Tie', 'Oxford Shirt',
      'Loafers', 'Track Pants', 'Hooded Sweatshirt', 'Swim Shorts', 'Rain Jacket',
      'Cargo Pants', 'V-Neck Sweater', 'Bomber Jacket', 'Chino Shorts', 'Turtleneck Sweater',
      'Sports Cap', 'Crossbody Bag', 'Backpack', 'Canvas Sneakers', 'Dress Watch'
    ];
    const imageUrls = [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop', // wallet
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop', // suit
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=400&h=400&fit=crop', // dress shoes
      'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=400&h=400&fit=crop', // polo shirt
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=400&fit=crop', // sunglasses
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', // running shoes
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop', // puffer jacket
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop', // jeans
      'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=400&fit=crop', // gym shorts
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', // t-shirt
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop', // watch
      'https://images.unsplash.com/photo-1624222247344-550fb60583bb?w=400&h=400&fit=crop', // belt
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=400&fit=crop', // blazer
      'https://images.unsplash.com/photo-1589756823695-278bc8f0f1d0?w=400&h=400&fit=crop', // tie
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=400&fit=crop', // oxford shirt
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=400&h=400&fit=crop', // loafers
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=400&fit=crop', // track pants
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop', // hoodie
      'https://images.unsplash.com/photo-1558499932-45a211954b42?w=400&h=400&fit=crop', // swim shorts
      'https://images.unsplash.com/photo-1544923246-77307d654666?w=400&h=400&fit=crop', // rain jacket
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=400&fit=crop', // cargo pants
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop', // sweater
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop', // bomber jacket
      'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=400&fit=crop', // shorts
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&h=400&fit=crop', // turtleneck
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop', // cap
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop', // crossbody bag
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop', // backpack
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&h=400&fit=crop', // sneakers
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop'  // dress watch
    ];
    return {
      name: names[i],
      description: [
        'Genuine leather wallet with RFID protection', 'Professional business suit with modern fit',
        'Italian leather dress shoes', 'Comfortable cotton polo shirt', 'UV protection sunglasses',
        'Lightweight running shoes with cushioning', 'Warm puffer jacket water-resistant', 'Classic fit denim jeans',
        'Breathable gym shorts moisture-wicking', 'Comfortable everyday cotton t-shirt',
        'Elegant luxury timepiece', 'Premium quality leather belt', 'Sophisticated woolen blazer',
        'Classic silk tie for formal wear', 'Crisp oxford shirt for office',
        'Comfortable leather loafers', 'Athletic track pants with pockets', 'Cozy hooded sweatshirt',
        'Quick-dry swim shorts', 'Waterproof rain jacket',
        'Durable cargo pants multiple pockets', 'Soft v-neck sweater', 'Trendy bomber jacket',
        'Comfortable chino shorts', 'Warm turtleneck sweater',
        'Adjustable sports cap', 'Stylish crossbody bag', 'Spacious travel backpack',
        'Casual canvas sneakers', 'Sophisticated dress watch'
      ][i],
      price: [
        49.99, 399.99, 179.99, 39.99, 129.99, 119.99, 199.99, 69.99, 29.99, 19.99,
        499.99, 45.99, 299.99, 35.99, 59.99, 89.99, 49.99, 54.99, 24.99, 79.99,
        64.99, 74.99, 159.99, 44.99, 84.99, 24.99, 69.99, 99.99, 64.99, 249.99
      ][i],
      stock: 50 + (i * 10),
      ratings: menRatings[i],
      numOfReviews: 50 + (i * 15),
      category: 'Men',
      images: [{
        public_id: `men-product-${i + 1}`,
        url: imageUrls[i]
      }],
      featured: i % 5 === 0,
      newArrival: i % 3 === 0
    };
  }),

  // Women's Products (30 products)
  ...Array.from({ length: 30 }, (_, i) => {
    const names = [
      'Designer Handbag', 'Elegant Evening Gown', 'High Heel Pumps', 'Floral Summer Dress', 'Statement Necklace',
      'Yoga Leggings', 'Winter Wool Coat', 'Casual Sneakers', 'Fashion Scarf', 'Basic Tank Top',
      'Leather Clutch', 'Cocktail Dress', 'Ballet Flats', 'Maxi Dress', 'Diamond Earrings',
      'Sports Bra', 'Trench Coat', 'Ankle Boots', 'Silk Blouse', 'Cardigan Sweater',
      'Tote Bag', 'Pencil Skirt', 'Wedge Sandals', 'Wrap Dress', 'Pearl Bracelet',
      'Running Tights', 'Puffer Vest', 'Slip-On Sneakers', 'Crop Top', 'Denim Jacket'
    ];
    const imageUrls = [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop', // handbag
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=400&fit=crop', // evening gown
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop', // high heels
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=400&fit=crop', // summer dress
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop', // necklace
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=400&fit=crop', // yoga leggings
      'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=400&fit=crop', // wool coat
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=400&fit=crop', // sneakers
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=400&fit=crop', // scarf
      'https://images.unsplash.com/photo-1627225793904-39e9aa3f6b3c?w=400&h=400&fit=crop', // tank top
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&h=400&fit=crop', // clutch
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=400&fit=crop', // cocktail dress
      'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=400&h=400&fit=crop', // ballet flats
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop', // maxi dress
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop', // earrings
      'https://images.unsplash.com/photo-1518809595274-1471d16319b7?w=400&h=400&fit=crop', // sports bra
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop', // trench coat
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400&h=400&fit=crop', // ankle boots
      'https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=400&h=400&fit=crop', // silk blouse
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&fit=crop', // cardigan
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=400&fit=crop', // tote bag
      'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&h=400&fit=crop', // pencil skirt
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop', // wedge sandals
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop', // wrap dress
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop', // pearl bracelet
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=400&fit=crop', // running tights
      'https://images.unsplash.com/photo-1578932750355-5eb30ece487a?w=400&h=400&fit=crop', // puffer vest
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&h=400&fit=crop', // slip-on sneakers
      'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=400&h=400&fit=crop', // crop top
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop'  // denim jacket
    ];
    return {
      name: names[i],
      description: [
        'Luxury handbag with premium leather', 'Stunning evening gown for special occasions',
        'Classic high heel pumps cushioned', 'Light breezy summer dress floral', 'Bold statement necklace crystal',
        'Stretchy yoga leggings high waist', 'Elegant wool coat cold weather', 'Comfortable sneakers everyday wear',
        'Lightweight fashion scarf vibrant', 'Essential cotton tank top layering',
        'Compact leather clutch elegant', 'Stylish cocktail dress parties', 'Comfortable ballet flats casual',
        'Flowing maxi dress beach wear', 'Sparkling diamond stud earrings',
        'Supportive sports bra workouts', 'Classic trench coat rain', 'Fashionable ankle boots versatile',
        'Luxurious silk blouse office', 'Cozy cardigan sweater layering',
        'Spacious tote bag daily use', 'Professional pencil skirt work', 'Comfortable wedge sandals summer',
        'Flattering wrap dress occasions', 'Elegant pearl bracelet gift',
        'Compression running tights', 'Insulated puffer vest layers', 'Easy slip-on sneakers casual',
        'Trendy crop top summer', 'Classic denim jacket versatile'
      ][i],
      price: [
        349.99, 299.99, 89.99, 79.99, 59.99, 49.99, 229.99, 69.99, 24.99, 14.99,
        199.99, 149.99, 64.99, 94.99, 399.99, 39.99, 189.99, 119.99, 84.99, 74.99,
        79.99, 69.99, 79.99, 89.99, 129.99, 54.99, 99.99, 59.99, 29.99, 89.99
      ][i],
      stock: 40 + (i * 8),
      ratings: womenRatings[i],
      numOfReviews: 60 + (i * 12),
      category: 'Women',
      images: [{
        public_id: `women-product-${i + 1}`,
        url: imageUrls[i]
      }],
      featured: i % 4 === 0,
      newArrival: i % 3 === 0
    };
  }),

  // Electronics Products (30 products)
  ...(() => {
    const imageUrls = [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', // headphones
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop', // smartwatch
      'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop', // gaming mouse
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop', // keyboard
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop', // bluetooth speaker
      'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&h=400&fit=crop', // usb hub
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop', // earbuds
      'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=400&fit=crop', // phone stand
      'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=400&fit=crop', // screen protector
      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=400&fit=crop', // power bank
      'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=400&h=400&fit=crop', // webcam
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop', // laptop cooler
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=400&fit=crop', // external ssd
      'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=400&fit=crop', // graphics tablet
      'https://images.unsplash.com/photo-1550985543-49bee3167284?w=400&h=400&fit=crop', // smart bulb
      'https://images.unsplash.com/photo-1591290619762-c588837b2fdb?w=400&h=400&fit=crop', // wireless charger
      'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcf?w=400&h=400&fit=crop', // gaming headset
      'https://images.unsplash.com/photo-1592840062661-83e8ddf89f6e?w=400&h=400&fit=crop', // game controller
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop', // action camera
      'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&h=400&fit=crop', // drone
      'https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=400&fit=crop', // smart lock
      'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=400&h=400&fit=crop', // wifi router
      'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=400&h=400&fit=crop', // microphone
      'https://images.unsplash.com/photo-1611532736570-a8b77850279d?w=400&h=400&fit=crop', // ring light
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop', // tablet stand
      'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&h=400&fit=crop', // cable organizer
      'https://images.unsplash.com/photo-1588412079929-790b9f593d8e?w=400&h=400&fit=crop', // surge protector
      'https://images.unsplash.com/photo-1624823183493-ed5832f48f18?w=400&h=400&fit=crop', // usb drive
      'https://images.unsplash.com/photo-1628744404941-57cab2e9f9a8?w=400&h=400&fit=crop', // hdmi cable
      'https://images.unsplash.com/photo-1594906985830-02583c1d280f?w=400&h=400&fit=crop'  // laptop sleeve
    ];

    return Array.from({ length: 30 }, (_, i) => ({
      name: [
        'Premium Wireless Headphones', 'Smart Fitness Watch', 'Wireless Gaming Mouse', 'Mechanical Keyboard', 'Bluetooth Speaker',
        'USB-C Hub Adapter', 'Wireless Earbuds', 'Phone Stand Holder', 'Screen Protector', 'Power Bank',
        'Webcam HD 1080p', 'Laptop Cooling Pad', 'External SSD Drive', 'Graphics Tablet', 'Smart Light Bulb',
        'Wireless Charger Pad', 'Noise Cancelling Headset', 'Gaming Controller', 'Action Camera 4K', 'Drone with Camera',
        'Smart Door Lock', 'WiFi Router Mesh', 'Streaming Microphone', 'Ring Light LED', 'Tablet Stand',
        'Cable Management Kit', 'Surge Protector', 'USB Flash Drive', 'HDMI Cable 4K', 'Laptop Sleeve Case'
      ][i],
      description: [
        'High-quality wireless headphones noise cancellation', 'Advanced fitness tracker heart rate GPS',
        'Ergonomic gaming mouse RGB lighting', 'RGB mechanical keyboard blue switches', 'Waterproof bluetooth speaker 12-hour battery',
        'Multi-port USB-C hub HDMI USB3.0', 'True wireless earbuds charging case', 'Adjustable phone stand desk',
        'Tempered glass screen protector pack', 'High capacity power bank fast charging',
        'HD webcam 1080p streaming video', 'Laptop cooling pad quiet fans', 'Portable external SSD fast transfer',
        'Digital graphics tablet drawing pen', 'Smart LED bulb voice control',
        'Fast wireless charging pad Qi compatible', 'Premium noise cancelling headset calls', 'Wireless gaming controller vibration',
        '4K action camera waterproof sports', 'Foldable drone HD camera GPS',
        'Smart door lock fingerprint keyless', 'Mesh WiFi router whole home', 'USB streaming microphone podcasting',
        'LED ring light dimmable tripod', 'Adjustable tablet stand aluminum',
        'Cable management organizer kit', 'Surge protector USB ports', 'High speed USB flash drive',
        '4K HDMI cable gold plated', 'Padded laptop sleeve protective'
      ][i],
      price: [
        199.99, 149.99, 79.99, 129.99, 59.99, 39.99, 89.99, 19.99, 9.99, 49.99,
        69.99, 34.99, 159.99, 99.99, 24.99, 29.99, 119.99, 54.99, 299.99, 449.99,
        179.99, 199.99, 89.99, 44.99, 39.99, 24.99, 34.99, 19.99, 14.99, 29.99
      ][i],
      stock: 60 + (i * 12),
      ratings: electronicsRatings[i],
      numOfReviews: 80 + (i * 18),
      category: 'Electronics',
      images: [{
        public_id: `electronics-product-${i + 1}`,
        url: imageUrls[i]
      }],
      featured: i % 6 === 0,
      newArrival: i % 4 === 0
    }));
  })()
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
    console.log('📊 Rating distribution: 1.0 to 5.0 (equally distributed)');
    console.log('📦 Products per category: 30 Men, 30 Women, 30 Electronics');
    console.log('⭐ Each category has ~6 products in each star rating (1★, 2★, 3★, 4★, 5★)');
    console.log('⭐ Total: 90 products');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedProducts();
