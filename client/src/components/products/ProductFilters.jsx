import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiChevronDown, FiChevronUp, FiStar } from 'react-icons/fi';
import Button from '../common/Button';

const ProductFilters = ({ filters, onFilterChange, onClearFilters, products = [] }) => {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    rating: true,
  });

  // Calculate category counts dynamically from products
  const categories = useMemo(() => {
    const categoryCounts = {};
    
    products.forEach(product => {
      const categoryName = typeof product.category === 'object' ? product.category?.name : product.category;
      if (categoryName) {
        categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
      }
    });

    return [
      { value: 'Men', label: '👔 Men', count: categoryCounts['Men'] || 0 },
      { value: 'Women', label: '👗 Women', count: categoryCounts['Women'] || 0 },
      { value: 'Electronics', label: '📱 Electronics', count: categoryCounts['Electronics'] || 0 },
    ];
  }, [products]);

  const priceRanges = [
    { label: 'Under $50', min: 0, max: 50 },
    { label: '$50 - $100', min: 50, max: 100 },
    { label: '$100 - $200', min: 100, max: 200 },
    { label: '$200 - $500', min: 200, max: 500 },
    { label: 'Above $500', min: 500, max: 10000 },
  ];

  const ratingOptions = [
    { value: 5, label: '5' },
    { value: 4, label: '4' },
    { value: 3, label: '3' },
    { value: 2, label: '2' },
    { value: 1, label: '1' },
  ];

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCategoryChange = (category) => {
    onFilterChange({
      ...filters,
      category: filters.category === category ? '' : category,
    });
  };

  const handlePriceRangeChange = (min, max) => {
    onFilterChange({
      ...filters,
      minPrice: min,
      maxPrice: max,
    });
  };

  const handleRatingChange = (rating) => {
    onFilterChange({
      ...filters,
      rating: filters.rating === rating ? 0 : rating,
    });
  };

  const FilterSection = ({ title, sectionKey, children }) => (
    <div className="mb-6">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between mb-4 text-purple-300 hover:text-cyan-400
                 transition-colors duration-300"
      >
        <h3 className="text-lg font-bold" style={{ fontFamily: 'Orbitron, sans-serif' }}>
          {title}
        </h3>
        {expandedSections[sectionKey] ? (
          <FiChevronUp className="text-xl" />
        ) : (
          <FiChevronDown className="text-xl" />
        )}
      </button>
      
      {expandedSections[sectionKey] && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3"
        >
          {children}
        </motion.div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <FilterSection title="Category" sectionKey="category">
        {categories.map((cat) => (
          <motion.button
            key={cat.value}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCategoryChange(cat.value)}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 relative z-10 cursor-pointer ${
              filters.category === cat.value
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-purple-500/5 hover:bg-purple-500/10 text-purple-300 border border-purple-500/20'
            }`}
            style={{ pointerEvents: 'auto' }}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">{cat.label}</span>
              <span className="text-sm opacity-70">({cat.count})</span>
            </div>
          </motion.button>
        ))}
      </FilterSection>

      {/* Price Range Filter */}
      <FilterSection title="Price Range" sectionKey="price">
        {priceRanges.map((range, idx) => {
          const isSelected = filters.minPrice === range.min && filters.maxPrice === range.max;
          return (
            <motion.button
              key={idx}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlePriceRangeChange(range.min, range.max);
              }}
              style={{ pointerEvents: 'auto' }}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer relative z-10 ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                  : 'bg-purple-500/5 hover:bg-purple-500/10 text-purple-300 border border-purple-500/20'
              }`}
            >
              <span className="font-semibold">{range.label}</span>
            </motion.button>
          );
        })}
      </FilterSection>

      {/* Rating Filter */}
      <FilterSection title="Customer Rating" sectionKey="rating">
        {ratingOptions.map((option) => (
          <motion.button
            key={option.value}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleRatingChange(option.value);
            }}
            style={{ pointerEvents: 'auto' }}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer relative z-10 ${
              filters.rating === option.value
                ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg shadow-yellow-500/30'
                : 'bg-purple-500/5 hover:bg-purple-500/10 text-purple-300 border border-purple-500/20'
            }`}
          >
            <div className="flex items-center space-x-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FiStar
                    key={i}
                    className={`text-sm ${
                      i < Math.floor(option.value)
                        ? filters.rating === option.value
                          ? 'text-white fill-white'
                          : 'text-yellow-400 fill-yellow-400'
                        : i === Math.floor(option.value) && option.value % 1 !== 0
                        ? filters.rating === option.value
                          ? 'text-white fill-white opacity-50'
                          : 'text-yellow-400 fill-yellow-400 opacity-50'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="font-semibold">{option.label} Stars</span>
            </div>
          </motion.button>
        ))}
      </FilterSection>

      {/* Clear All Button */}
      {(filters.category || filters.minPrice || filters.rating) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="cyber"
            fullWidth
            onClick={onClearFilters}
          >
            Clear All Filters
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default ProductFilters;
