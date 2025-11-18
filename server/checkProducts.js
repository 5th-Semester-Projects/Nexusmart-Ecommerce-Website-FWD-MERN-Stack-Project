import mongoose from 'mongoose';

const checkProducts = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/nexusmart');
    console.log('✅ Connected to MongoDB');

    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

    // Count by category
    const stats = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    console.log('\n📊 Products by category:', stats);

    // Count total
    const total = await Product.countDocuments();
    console.log('\n📦 Total products:', total);

    // Check ratings distribution
    const ratingStats = await Product.aggregate([
      {
        $project: {
          starRating: { $floor: '$ratings' }
        }
      },
      {
        $group: {
          _id: '$starRating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    console.log('\n⭐ Products by star rating:', ratingStats);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkProducts();
