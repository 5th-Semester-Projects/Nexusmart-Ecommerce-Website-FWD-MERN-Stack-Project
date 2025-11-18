import mongoose from 'mongoose';

const updateProductFlags = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/nexusmart');
    console.log('✅ Connected to MongoDB');

    // Update all products to have proper flags
    const result = await mongoose.connection.db.collection('products').updateMany(
      {},
      {
        $set: {
          trendingScore: 100,
          featured: true
        }
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} products with trending flags`);

    // Update specific products as new arrivals (last 4)
    const products = await mongoose.connection.db.collection('products')
      .find({})
      .sort({ createdAt: -1 })
      .limit(6)
      .toArray();

    const productIds = products.map(p => p._id);

    const newArrivalResult = await mongoose.connection.db.collection('products').updateMany(
      { _id: { $in: productIds } },
      { $set: { newArrival: true } }
    );

    console.log(`✅ Marked ${newArrivalResult.modifiedCount} products as new arrivals`);

    console.log('\n📊 Summary:');
    console.log(`- Total products with trending flags: ${result.modifiedCount}`);
    console.log(`- Products marked as new arrivals: ${newArrivalResult.modifiedCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

updateProductFlags();
