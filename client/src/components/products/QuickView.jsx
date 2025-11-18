import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiHeart, FiStar, FiTruck, FiShield } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { addItemToCart } from '../../redux/slices/cartSlice';
import { addItemToWishlist, removeItemFromWishlist } from '../../redux/slices/wishlistSlice';
import Modal from '../common/Modal';
import Button from '../common/Button';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const QuickView = ({ product, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const isInWishlist = wishlistItems.some((item) => item._id === product._id);

  const handleWishlistToggle = () => {
    if (isInWishlist) {
      dispatch(removeItemFromWishlist(product._id));
      toast.success('Removed from wishlist');
    } else {
      dispatch(addItemToWishlist(product));
      toast.success('Added to wishlist');
    }
  };

  const handleAddToCart = () => {
    dispatch(
      addItemToCart({
        product: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0]?.url,
        stock: product.stock,
        quantity,
        variants: selectedVariants,
      })
    );
    toast.success('Added to cart');
    onClose();
  };

  const handleVariantChange = (type, value) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const discountPercentage = product.discount ||
    (product.originalPrice && product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" title="Quick View">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            <img
              src={product.images?.[selectedImage]?.url || '/placeholder-product.jpg'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnail Gallery */}
          {product.images?.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index
                      ? 'border-primary-500'
                      : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <img src={image.url} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Category */}
          {product.category?.name && (
            <p className="text-sm text-primary-600 dark:text-primary-400 font-medium uppercase tracking-wide">
              {product.category.name}
            </p>
          )}

          {/* Product Name */}
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{product.name}</h2>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(product.ratings || 0)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-600 dark:text-gray-400">
              {product.ratings?.toFixed(1)} ({product.numOfReviews || 0} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-4xl font-bold text-primary-600 dark:text-primary-400">
              ${product.price?.toFixed(2)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="text-xl text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
                <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                  {discountPercentage}% OFF
                </span>
              </>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-gray-600 dark:text-gray-400 line-clamp-3">{product.description}</p>
          )}

          {/* Variants */}
          {product.variants?.map((variant) => (
            <div key={variant.type} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {variant.type}: {selectedVariants[variant.type] || 'Select'}
              </label>
              <div className="flex flex-wrap gap-2">
                {variant.options.map((option) => (
                  <motion.button
                    key={option}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleVariantChange(variant.type, option)}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      selectedVariants[variant.type] === option
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity Selector */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
            <div className="flex items-center gap-3">
              <button
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                -
              </button>
              <span className="text-xl font-semibold text-gray-900 dark:text-white w-12 text-center">
                {quantity}
              </span>
              <button
                onClick={incrementQuantity}
                disabled={quantity >= product.stock}
                className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                +
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ({product.stock} available)
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="primary"
              fullWidth
              icon={FiShoppingCart}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              Add to Cart
            </Button>
            <Button
              variant={isInWishlist ? 'danger' : 'outline'}
              icon={FiHeart}
              onClick={handleWishlistToggle}
            >
              {isInWishlist ? 'Remove' : 'Wishlist'}
            </Button>
          </div>

          {/* View Full Details */}
          <Link to={`/products/${product._id}`}>
            <Button variant="ghost" fullWidth onClick={onClose}>
              View Full Details →
            </Button>
          </Link>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <FiTruck className="w-5 h-5 text-primary-600" />
              <span>Free Shipping</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <FiShield className="w-5 h-5 text-primary-600" />
              <span>Secure Payment</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default QuickView;
