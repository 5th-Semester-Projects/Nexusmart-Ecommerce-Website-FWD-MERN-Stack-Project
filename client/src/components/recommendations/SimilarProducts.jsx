import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import axios from 'axios';
import ProductCard from '../products/ProductCard';
import { Spinner } from '../common/Loader';

const SimilarProducts = ({ productId, category }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (productId) {
      loadSimilarProducts();
    }
  }, [productId]);

  const loadSimilarProducts = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/products/${productId}/similar`);
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to load similar products:', error);
      // Fallback: load by category
      if (category) {
        try {
          const { data } = await axios.get(`/api/products?category=${category}&limit=8`);
          setProducts(data.products || []);
        } catch (err) {
          console.error('Failed to load category products:', err);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const itemsPerView = {
    mobile: 1,
    tablet: 2,
    desktop: 4,
  };

  const next = () => {
    setCurrentIndex((prev) => 
      prev + 4 >= products.length ? 0 : prev + 4
    );
  };

  const prev = () => {
    setCurrentIndex((prev) => 
      prev - 4 < 0 ? Math.max(0, products.length - 4) : prev - 4
    );
  };

  if (loading) {
    return (
      <div className="py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Similar Products</h2>
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (!products.length) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          You May Also Like
        </h2>
        {products.length > 4 && (
          <div className="flex gap-2">
            <button
              onClick={prev}
              disabled={currentIndex === 0}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              disabled={currentIndex + 4 >= products.length}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <div className="overflow-hidden">
        <motion.div
          animate={{ x: `-${currentIndex * 25}%` }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="flex gap-6"
        >
          {products.map((product) => (
            <div key={product._id} className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/4">
              <ProductCard product={product} />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Dots Indicator */}
      {products.length > 4 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: Math.ceil(products.length / 4) }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx * 4)}
              className={`w-2 h-2 rounded-full transition-all ${
                Math.floor(currentIndex / 4) === idx
                  ? 'bg-primary-600 w-8'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default SimilarProducts;
