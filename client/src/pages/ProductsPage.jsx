import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGrid, FiList, FiX, FiFilter, FiChevronDown, FiSearch } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../redux/slices/productSlice';
import ProductGrid from '../components/products/ProductGrid';
import ProductFilters from '../components/products/ProductFilters';
import ProductQuickView from '../components/products/ProductQuickView';
import Button from '../components/common/Button';
import { PageLoader } from '../components/common/Loader';
// Removed MagicalParticles import for performance
import MagicalGenie from '../components/common/MagicalGenie';

const ProductsPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products = [], loading, error } = useSelector((state) => state.products);

  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const getFiltersFromURL = () => ({
    category: (searchParams.get('category') || '').toLowerCase(),
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : '',
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : '',
    rating: parseFloat(searchParams.get('rating')) || 0,
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || 'newest',
  });

  const [filters, setFilters] = useState(getFiltersFromURL());

  // Fetch products from API
  useEffect(() => {
    console.log('🚀 Fetching products...');
    dispatch(fetchProducts()).then((result) => {
      console.log('✅ Products fetched:', result);
    }).catch((error) => {
      console.error('❌ Products fetch failed:', error);
    });
  }, [dispatch]);

  // Memoized filtered products for better performance
  const displayProducts = useMemo(() => {
    console.log('🔄 Filtering products - count:', products.length);
    
    if (products.length === 0) {
      console.log('⚠️ No products available');
      return [];
    }

    let filtered = [...products];

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(p => {
        const categoryName = typeof p.category === 'object' ? p.category?.name : p.category;
        return categoryName?.toLowerCase() === filters.category.toLowerCase();
      });
    }

    // Price range filter
    if (filters.minPrice !== '') {
      filtered = filtered.filter(p => p.price >= filters.minPrice);
    }
    if (filters.maxPrice !== '') {
      filtered = filtered.filter(p => p.price <= filters.maxPrice);
    }

    // Rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(p => {
        const productRating = p.ratings || p.rating || 0;
        return Math.floor(productRating) === filters.rating;
      });
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(p => {
        const categoryName = typeof p.category === 'object' ? p.category?.name : p.category;
        return p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          (categoryName && categoryName.toLowerCase().includes(searchLower));
      });
    }

    // Sort
    const sorted = [...filtered];
    switch (filters.sort) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
        sorted.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
        break;
      default:
        break;
    }

    return sorted;
  }, [filters, products]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      category: '', minPrice: '', maxPrice: '', rating: 0, search: '', sort: 'newest'
    };
    setFilters(clearedFilters);
  };

  const handleQuickView = (product) => {
    setQuickViewProduct(product);
  };

  const getRelatedProducts = (currentProduct) => {
    if (!currentProduct) return [];
    return displayProducts
      .filter(p => 
        p._id !== currentProduct._id && 
        (typeof p.category === 'object' ? p.category?.name : p.category) === 
        (typeof currentProduct.category === 'object' ? currentProduct.category?.name : currentProduct.category)
      )
      .slice(0, 6);
  };

  const activeFiltersCount = [
    filters.category,
    filters.minPrice,
    filters.maxPrice,
    filters.rating,
    filters.search
  ].filter(v => v && v !== 0).length;

  if (loading && displayProducts.length === 0) {
    return <PageLoader text="Loading magical products..." />;
  }

  return (
    <>
      <Helmet>
        <title>Products - NexusMart | Explore Magical Collection</title>
        <meta name="description" content="Browse our extensive collection of magical products with AI-powered recommendations." />
      </Helmet>

      <div className="min-h-screen relative">
        {/* Lightweight CSS Background - Removed heavy MagicalParticles */}
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950"></div>

        {/* Magical Genie */}
        <MagicalGenie />

        {/* Hero Section with Cyber Grid */}
        <div className="relative py-16 cyber-grid">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950/50 to-gray-950"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                <span className="gradient-text">Explore Products</span>
              </h1>
              <p className="text-xl text-purple-300/70 mb-8">
                Discover {displayProducts.length} magical items in our collection
              </p>

              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="max-w-2xl mx-auto"
              >
                <div className="relative">
                  <FiSearch className="absolute left-6 top-1/2 transform -translate-y-1/2 text-2xl text-purple-400 z-30 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search for products..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full pl-16 pr-6 py-5 bg-gray-900/50 border-2 border-purple-500/30 rounded-2xl
                             text-white text-lg placeholder-purple-400/50
                             focus:border-cyan-500 focus:outline-none
                             transition-all duration-300 backdrop-blur-sm relative z-20 cursor-text"
                    style={{ pointerEvents: 'auto' }}
                  />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Toolbar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 glass-card p-4 rounded-2xl"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              
              {/* Filter Toggle & Active Count */}
              <div className="flex items-center space-x-4">
                <Button
                  variant="glass"
                  onClick={() => setShowFilters(!showFilters)}
                  icon={FiFilter}
                  className="relative"
                >
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-pink-500 to-red-500 
                                   text-white text-xs rounded-full flex items-center justify-center font-bold
                                   shadow-lg shadow-pink-500/50">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>

                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    onClick={handleClearFilters}
                    icon={FiX}
                    size="sm"
                  >
                    Clear All
                  </Button>
                )}

                <span className="text-purple-300/70">
                  {displayProducts.length} Products Found
                </span>
              </div>

              {/* Sort & View Mode */}
              <div className="flex items-center space-x-4">
                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={filters.sort}
                    onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                    className="pl-4 pr-10 py-3 bg-gray-900/50 border-2 border-purple-500/30 rounded-xl
                             text-purple-300 appearance-none cursor-pointer
                             focus:border-cyan-500 focus:outline-none
                             transition-all duration-300 relative z-10"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="popular">Most Popular</option>
                    <option value="rating">Top Rated</option>
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 pointer-events-none z-20" />
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center space-x-2 p-1 bg-gray-900/50 border border-purple-500/30 rounded-xl">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 rounded-lg transition-all duration-300 ${
                      viewMode === 'grid'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'text-purple-400 hover:text-cyan-400'
                    }`}
                  >
                    <FiGrid className="text-xl" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 rounded-lg transition-all duration-300 ${
                      viewMode === 'list'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'text-purple-400 hover:text-cyan-400'
                    }`}
                  >
                    <FiList className="text-xl" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Filters Sidebar (Mobile Drawer) */}
          <AnimatePresence>
            {showFilters && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowFilters(false)}
                  className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-40 lg:hidden"
                />

                {/* Filters Panel */}
                <motion.div
                  initial={{ x: -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  className="fixed left-0 top-0 bottom-0 w-80 z-50 lg:hidden"
                >
                  <div className="h-full glass-card rounded-r-3xl p-6 overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold gradient-text" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                        Filters
                      </h3>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="text-purple-300 hover:text-cyan-400"
                      >
                        <FiX className="text-2xl" />
                      </button>
                    </div>
                    <ProductFilters
                      filters={filters}
                      onFilterChange={handleFilterChange}
                      onClearFilters={handleClearFilters}
                      products={products}
                    />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Desktop Filters Sidebar */}
          <div className="grid lg:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block"
            >
              <div className="glass-card p-6 rounded-2xl sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto filter-scroll">
                <h3 className="text-xl font-bold gradient-text mb-6" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  Filters
                </h3>
                <ProductFilters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={handleClearFilters}
                  products={products}
                />
              </div>
            </motion.div>

            {/* Products Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-3"
            >
              {loading ? (
                <div className="text-center py-20">
                  <div className="inline-block w-16 h-16 border-4 border-purple-500 border-t-cyan-500 rounded-full animate-spin"></div>
                  <p className="mt-4 text-purple-300">Loading magical products...</p>
                </div>
              ) : displayProducts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card p-16 rounded-2xl text-center"
                >
                  <div className="text-8xl mb-6">🔍</div>
                  <h3 className="text-3xl font-bold gradient-text mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    No Products Found
                  </h3>
                  <p className="text-purple-300/70 mb-8">
                    Try adjusting your filters or search terms
                  </p>
                  <Button variant="neon" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                </motion.div>
              ) : (
                <ProductGrid 
                  products={displayProducts} 
                  loading={loading} 
                  onQuickView={handleQuickView}
                />
              )}
            </motion.div>
          </div>
        </div>

        {/* Quick View Modal */}
        {quickViewProduct && (
          <ProductQuickView
            product={quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
            relatedProducts={getRelatedProducts(quickViewProduct)}
          />
        )}
      </div>
    </>
  );
};

export default ProductsPage;
