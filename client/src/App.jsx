import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Styles
import './styles/index.css';

// Utilities
import { cleanAllStorage } from './utils/cleanStorage';

// Common Components
import ErrorBoundary from './components/common/ErrorBoundary';
import { PageLoader } from './components/common/Loader';
import MagicalParticles, { FloatingOrbs } from './components/common/MagicalParticles';
import RoboticWelcome from './components/common/RoboticWelcome';

// Layout Components - Import directly
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const DealsPage = lazy(() => import('./pages/DealsPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const UserDashboard = lazy(() => import('./pages/dashboard/UserDashboard'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const TestAPIPage = lazy(() => import('./pages/TestAPIPage'));

function App() {
  const [showWelcome, setShowWelcome] = useState(() => {
    // Show lightning welcome only once per session
    return !sessionStorage.getItem('welcomeShown');
  });

  useEffect(() => {
    // Clean localStorage on mount to fix category object issues
    cleanAllStorage();
    
    // Apply theme on mount
    const theme = localStorage.getItem('theme') || 'light';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleWelcomeComplete = () => {
    sessionStorage.setItem('welcomeShown', 'true');
    setShowWelcome(false);
  };

  return (
    <ErrorBoundary>
      <Router>
        {/* Robotic Welcome Animation */}
        {showWelcome && <RoboticWelcome onComplete={handleWelcomeComplete} />}
        
        <div className="App min-h-screen flex flex-col relative">
          {/* Global Magical Background */}
          <MagicalParticles density={30} />
          <FloatingOrbs />
          
          <Navbar />
          
          <main className="flex-grow">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/deals" element={<DealsPage />} />
                <Route path="/test-api" element={<TestAPIPage />} />
                
                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Protected Routes */}
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                <Route path="/dashboard/*" element={<UserDashboard />} />
                
                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </main>
          
          <Footer />
          
          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
