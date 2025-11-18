/**
 * API Integration Example
 * 
 * This file demonstrates how to properly use the centralized API utility
 * with Redux and React components
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, setFilters } from '../redux/slices/productSlice';
import { addItemToCart } from '../redux/slices/cartSlice';
import { addItemToWishlist } from '../redux/slices/wishlistSlice';
import ProductGrid from '../components/products/ProductGrid';
import ProductFilters from '../components/products/ProductFilters';
import Button from '../components/common/Button';
import { PageLoader } from '../components/common/Loader';
import toast from 'react-hot-toast';

/**
 * Example: Product Listing Page with Filters
 */
const ExampleProductsPage = () => {
  const dispatch = useDispatch();
  const { products, loading, error, filters } = useSelector((state) => state.products);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Fetch products on component mount and when filters change
  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Dispatch Redux action - automatically uses productsAPI.getAll()
        await dispatch(fetchProducts({
          category: filters.category,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          sort: filters.sort,
          page: 1,
          limit: 12,
        })).unwrap();
      } catch (err) {
        toast.error('Failed to load products');
        console.error(err);
      }
    };

    loadProducts();
  }, [dispatch, filters]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
  };

  // Add product to cart
  const handleAddToCart = (product) => {
    dispatch(addItemToCart({
      product: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url,
      stock: product.stock,
      quantity: 1,
    }));
    toast.success('Added to cart!');
  };

  // Add product to wishlist
  const handleAddToWishlist = (product) => {
    dispatch(addItemToWishlist(product));
    toast.success('Added to wishlist!');
  };

  // Show loading state
  if (loading && products.length === 0) {
    return <PageLoader />;
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Products</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <ProductFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={() => handleFilterChange({})}
          />
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          <ProductGrid
            products={products}
            loading={loading}
            onQuickView={setQuickViewProduct}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Example: Direct API Call (without Redux)
 * Use this when you need to make a one-off API call
 */
import { productsAPI, cartAPI, ordersAPI } from '../utils/api';

const DirectAPIExample = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch single product directly
  const fetchProduct = async (productId) => {
    setLoading(true);
    try {
      const response = await productsAPI.getById(productId);
      setProduct(response.data.product);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  // Add to cart directly via API
  const addToCartDirect = async (productId, quantity) => {
    try {
      const response = await cartAPI.add({
        productId,
        quantity,
      });
      toast.success('Added to cart!');
      return response.data;
    } catch (error) {
      toast.error('Failed to add to cart');
      console.error(error);
    }
  };

  // Create order directly
  const createOrder = async (orderData) => {
    try {
      const response = await ordersAPI.create(orderData);
      toast.success('Order placed successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to create order');
      console.error(error);
    }
  };

  return (
    <div>
      {/* Component UI */}
    </div>
  );
};

/**
 * Example: Form with Input Component
 */
import Input from '../components/common/Input';
import { FiMail, FiLock, FiUser } from 'react-icons/fi';
import { useForm } from 'react-hook-form';

const LoginFormExample = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Your login logic here
      console.log(data);
    } catch (error) {
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Email"
        type="email"
        icon={FiMail}
        error={errors.email?.message}
        required
        {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address',
          },
        })}
      />

      <Input
        label="Password"
        type="password"
        icon={FiLock}
        error={errors.password?.message}
        required
        {...register('password', {
          required: 'Password is required',
          minLength: {
            value: 6,
            message: 'Password must be at least 6 characters',
          },
        })}
      />

      <Button
        type="submit"
        variant="primary"
        fullWidth
        loading={loading}
      >
        Login
      </Button>
    </form>
  );
};

/**
 * Example: Button Variants
 */
const ButtonExamples = () => {
  return (
    <div className="space-y-4">
      {/* Primary Button */}
      <Button variant="primary" size="md">
        Primary Button
      </Button>

      {/* Secondary Button */}
      <Button variant="secondary" size="md">
        Secondary Button
      </Button>

      {/* Outline Button */}
      <Button variant="outline" size="md">
        Outline Button
      </Button>

      {/* Loading Button */}
      <Button variant="primary" loading={true}>
        Loading...
      </Button>

      {/* Button with Icon */}
      <Button variant="primary" icon={FiUser} iconPosition="left">
        Profile
      </Button>

      {/* Full Width Button */}
      <Button variant="primary" fullWidth>
        Full Width Button
      </Button>

      {/* Danger Button */}
      <Button variant="danger" size="sm">
        Delete
      </Button>
    </div>
  );
};

/**
 * Example: Product Search with Debounce
 */
import { searchProducts } from '../redux/slices/productSlice';
import { useDebounce } from '../hooks/useDebounce'; // You may need to create this hook

const SearchExample = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearch) {
      dispatch(searchProducts(debouncedSearch));
    }
  }, [debouncedSearch, dispatch]);

  return (
    <Input
      placeholder="Search products..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  );
};

/**
 * Example: Authenticated API Call with Error Handling
 */
import { authAPI } from '../utils/api';
import { login } from '../redux/slices/authSlice';

const AuthExample = () => {
  const dispatch = useDispatch();

  const handleLogin = async (email, password) => {
    try {
      // Using Redux action (recommended)
      const result = await dispatch(login({ email, password })).unwrap();
      toast.success('Login successful!');
      // Token is automatically stored by the slice
      // Navigate to dashboard
    } catch (error) {
      // Error is handled by Redux slice and returned here
      toast.error(error || 'Login failed');
    }
  };

  const handleUpdateProfile = async (profileData) => {
    try {
      // Direct API call (for non-Redux operations)
      const response = await authAPI.updateProfile(profileData);
      toast.success('Profile updated!');
      return response.data;
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    }
  };

  return <div>{/* Component UI */}</div>;
};

/**
 * Example: Error Boundary Usage
 */
import ErrorBoundary from '../components/common/ErrorBoundary';

const AppWithErrorBoundary = () => {
  return (
    <ErrorBoundary>
      <ExampleProductsPage />
    </ErrorBoundary>
  );
};

// Export examples
export {
  ExampleProductsPage,
  DirectAPIExample,
  LoginFormExample,
  ButtonExamples,
  SearchExample,
  AuthExample,
  AppWithErrorBoundary,
};

export default ExampleProductsPage;
