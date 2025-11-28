import React from 'react';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import { ProductCardSkeleton } from '../common/Loader';

const ProductGrid = ({ products = [], loading = false, onQuickView, eager = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          No Products Found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Try adjusting your filters or search terms
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {products.map((product, index) => (
        <motion.div
          key={product._id}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <ProductCard product={product} onQuickView={onQuickView} eager={eager && index < 8} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ProductGrid;
