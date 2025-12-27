import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Styles
import './styles/index.css';
import './styles/accessibility.css';

// Utilities
import { cleanAllStorage } from './utils/cleanStorage';

// Context Providers
import { ThemeProvider } from './context/ThemeContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { I18nProvider } from './context/I18nContext';
import { GestureProvider } from './components/gestures/GestureController';

// Common Components
import ErrorBoundary from './components/common/ErrorBoundary';
import { PageLoader } from './components/common/Loader';
import RoboticWelcome from './components/common/RoboticWelcome';
import CursorTrail from './components/common/CursorTrail';

// Product Comparison
import ProductComparisonModal, { 
  ComparisonProvider, 
  CompareFloatingButton 
} from './components/products/ProductComparison';

// Real-time Features
import { LiveChatSupport } from './components/realtime';

// Layout Components - Import directly
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AdminLayout from './components/layout/AdminLayout';

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
const SecuritySettingsPage = lazy(() => import('./pages/SecuritySettingsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const TestAPIPage = lazy(() => import('./pages/TestAPIPage'));
const GamificationPage = lazy(() => import('./pages/GamificationPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));

// Admin Pages
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/ProductsPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/OrdersPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/UsersPage'));
const AdminCategoriesPage = lazy(() => import('./pages/admin/CategoriesPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/SettingsPage'));

function App() {
  const [showWelcome, setShowWelcome] = useState(() => {
    // Show lightning welcome only once per session
    return !sessionStorage.getItem('welcomeShown');
  });
  
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    // Clean localStorage on mount to fix category object issues
    cleanAllStorage();
    
    // Apply theme on mount
    const theme = localStorage.getItem('theme') || 'magical';
    const validThemes = ['magical', 'light', 'dark'];
    const activeTheme = validThemes.includes(theme) ? theme : 'magical';
    
    // Remove all theme classes first
    document.documentElement.classList.remove('theme-magical', 'theme-light', 'theme-dark', 'dark');
    
    // Add theme class
    document.documentElement.classList.add(`theme-${activeTheme}`);
    
    // Add dark class for magical and dark themes
    if (activeTheme === 'dark' || activeTheme === 'magical') {
      document.documentElement.classList.add('dark');
    }
    
    // Set body data attribute
    document.body.setAttribute('data-theme', activeTheme);
  }, []);

  const handleWelcomeComplete = () => {
    sessionStorage.setItem('welcomeShown', 'true');
    setShowWelcome(false);
  };

  // Check if current path is admin
  const isAdminRoute = window.location.pathname.startsWith('/admin');

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <I18nProvider>
          <AccessibilityProvider>
            <GestureProvider>
              <ComparisonProvider>
        <Router>
          {/* Magical Cursor Trail Effect ✨ */}
          <CursorTrail />
          
          {/* Product Comparison Modal */}
          <ProductComparisonModal 
            isOpen={showComparison} 
            onClose={() => setShowComparison(false)} 
          />
          
          {/* Floating Compare Button */}
          <CompareFloatingButton onClick={() => setShowComparison(true)} />
          
          {/* Robotic Welcome Animation - Only on non-admin routes */}
          {showWelcome && !isAdminRoute && <RoboticWelcome onComplete={handleWelcomeComplete} />}
        
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Admin Routes - Separate layout without Navbar/Footer */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            {/* Main Site Routes with Navbar/Footer */}
            <Route path="/*" element={
              <div className="App min-h-screen flex flex-col relative w-full max-w-[100vw] overflow-x-hidden">
                <Navbar />
                <main className="flex-grow w-full">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/products/:id" element={<ProductDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/categories" element={<CategoriesPage />} />
                    <Route path="/deals" element={<DealsPage />} />
                    <Route path="/rewards" element={<GamificationPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/test-api" element={<TestAPIPage />} />
                    
                    {/* Auth Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    
                    {/* Protected Routes */}
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                    <Route path="/dashboard/*" element={<UserDashboard />} />
                    <Route path="/security" element={<SecuritySettingsPage />} />
                    
                    {/* 404 */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </main>
                <Footer />
                
                {/* Live Chat Support Button */}
                <LiveChatSupport />
              </div>
            } />
          </Routes>
        </Suspense>

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
      </Router>
    </ComparisonProvider>
            </GestureProvider>
          </AccessibilityProvider>
        </I18nProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
