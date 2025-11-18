import { lazy, Suspense } from 'react';

// Page Loader Component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
  </div>
);

// Component Loader (smaller)
const ComponentLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
  </div>
);

/**
 * Lazy load a component with Suspense wrapper
 * @param {Function} importFunc - Dynamic import function
 * @param {React.Component} fallback - Optional fallback component
 * @returns {React.Component} - Lazy loaded component wrapped in Suspense
 */
export const lazyLoad = (importFunc, fallback = <PageLoader />) => {
  const LazyComponent = lazy(importFunc);
  
  return (props) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

/**
 * Lazy load a component with custom loading component
 * @param {Function} importFunc - Dynamic import function
 * @param {React.Component} LoadingComponent - Custom loading component
 * @returns {React.Component} - Lazy loaded component
 */
export const lazyLoadWithCustomLoader = (importFunc, LoadingComponent) => {
  const LazyComponent = lazy(importFunc);
  
  return (props) => (
    <Suspense fallback={<LoadingComponent />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

/**
 * Preload a lazy loaded component
 * @param {Function} importFunc - Dynamic import function
 */
export const preloadComponent = (importFunc) => {
  importFunc();
};

// Export loaders
export { PageLoader, ComponentLoader };

// Lazy loaded pages
export const LazyHomePage = lazyLoad(() => import('@pages/HomePage'));
export const LazyProductsPage = lazyLoad(() => import('@pages/ProductsPage'));
export const LazyProductDetailPage = lazyLoad(() => import('@pages/ProductDetailPage'));
export const LazyCartPage = lazyLoad(() => import('@pages/CartPage'));
export const LazyCheckoutPage = lazyLoad(() => import('@pages/CheckoutPage'));
export const LazyUserDashboard = lazyLoad(() => import('@pages/dashboard/UserDashboard'));
export const LazyLoginPage = lazyLoad(() => import('@pages/auth/LoginPage'));
export const LazyRegisterPage = lazyLoad(() => import('@pages/auth/RegisterPage'));

// Lazy loaded heavy components
export const LazyProduct3DViewer = lazyLoad(
  () => import('@components/3d/Product3DViewer'),
  <ComponentLoader />
);

export const LazyARTryOn = lazyLoad(
  () => import('@components/3d/ARTryOn'),
  <ComponentLoader />
);

export const LazyVirtualShowroom = lazyLoad(
  () => import('@pages/VirtualShowroom'),
  <PageLoader />
);

export const LazyAdminDashboard = lazyLoad(
  () => import('@components/dashboard/AdminDashboard'),
  <ComponentLoader />
);

export const LazyCryptoPayment = lazyLoad(
  () => import('@components/web3/CryptoPayment'),
  <ComponentLoader />
);

export const LazyNFTLoyalty = lazyLoad(
  () => import('@components/web3/NFTLoyalty'),
  <ComponentLoader />
);
