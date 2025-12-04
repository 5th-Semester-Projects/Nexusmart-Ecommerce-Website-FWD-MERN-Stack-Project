import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Internationalization Context
const I18nContext = createContext(null);

// Available languages
export const languages = {
  en: { name: 'English', nativeName: 'English', direction: 'ltr', flag: '🇺🇸' },
  es: { name: 'Spanish', nativeName: 'Español', direction: 'ltr', flag: '🇪🇸' },
  fr: { name: 'French', nativeName: 'Français', direction: 'ltr', flag: '🇫🇷' },
  de: { name: 'German', nativeName: 'Deutsch', direction: 'ltr', flag: '🇩🇪' },
  it: { name: 'Italian', nativeName: 'Italiano', direction: 'ltr', flag: '🇮🇹' },
  pt: { name: 'Portuguese', nativeName: 'Português', direction: 'ltr', flag: '🇧🇷' },
  zh: { name: 'Chinese', nativeName: '中文', direction: 'ltr', flag: '🇨🇳' },
  ja: { name: 'Japanese', nativeName: '日本語', direction: 'ltr', flag: '🇯🇵' },
  ko: { name: 'Korean', nativeName: '한국어', direction: 'ltr', flag: '🇰🇷' },
  ar: { name: 'Arabic', nativeName: 'العربية', direction: 'rtl', flag: '🇸🇦' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी', direction: 'ltr', flag: '🇮🇳' },
  ru: { name: 'Russian', nativeName: 'Русский', direction: 'ltr', flag: '🇷🇺' },
  tr: { name: 'Turkish', nativeName: 'Türkçe', direction: 'ltr', flag: '🇹🇷' },
  nl: { name: 'Dutch', nativeName: 'Nederlands', direction: 'ltr', flag: '🇳🇱' },
  pl: { name: 'Polish', nativeName: 'Polski', direction: 'ltr', flag: '🇵🇱' }
};

// Translation files (embedded for demo)
const translations = {
  en: {
    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.submit': 'Submit',
    'common.confirm': 'Confirm',
    'common.yes': 'Yes',
    'common.no': 'No',

    // Navigation
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.categories': 'Categories',
    'nav.cart': 'Cart',
    'nav.wishlist': 'Wishlist',
    'nav.account': 'My Account',
    'nav.orders': 'Orders',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    'nav.login': 'Login',
    'nav.register': 'Register',

    // Products
    'product.addToCart': 'Add to Cart',
    'product.buyNow': 'Buy Now',
    'product.addToWishlist': 'Add to Wishlist',
    'product.removeFromWishlist': 'Remove from Wishlist',
    'product.inStock': 'In Stock',
    'product.outOfStock': 'Out of Stock',
    'product.lowStock': 'Only {{count}} left',
    'product.price': 'Price',
    'product.originalPrice': 'Original Price',
    'product.discount': '{{percent}}% OFF',
    'product.reviews': '{{count}} Reviews',
    'product.rating': '{{rating}} out of 5',
    'product.description': 'Description',
    'product.specifications': 'Specifications',
    'product.relatedProducts': 'Related Products',
    'product.recentlyViewed': 'Recently Viewed',

    // Cart
    'cart.title': 'Shopping Cart',
    'cart.empty': 'Your cart is empty',
    'cart.continueShopping': 'Continue Shopping',
    'cart.subtotal': 'Subtotal',
    'cart.shipping': 'Shipping',
    'cart.tax': 'Tax',
    'cart.total': 'Total',
    'cart.checkout': 'Proceed to Checkout',
    'cart.remove': 'Remove',
    'cart.quantity': 'Quantity',
    'cart.updateCart': 'Update Cart',

    // Checkout
    'checkout.title': 'Checkout',
    'checkout.shippingAddress': 'Shipping Address',
    'checkout.billingAddress': 'Billing Address',
    'checkout.paymentMethod': 'Payment Method',
    'checkout.orderSummary': 'Order Summary',
    'checkout.placeOrder': 'Place Order',
    'checkout.processing': 'Processing...',
    'checkout.success': 'Order placed successfully!',
    'checkout.error': 'Failed to place order',

    // Account
    'account.profile': 'Profile',
    'account.orders': 'My Orders',
    'account.addresses': 'Addresses',
    'account.payments': 'Payment Methods',
    'account.notifications': 'Notifications',
    'account.security': 'Security',
    'account.preferences': 'Preferences',

    // Auth
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.rememberMe': 'Remember me',
    'auth.createAccount': 'Create Account',
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.dontHaveAccount': "Don't have an account?",
    'auth.orContinueWith': 'Or continue with',

    // Errors
    'error.required': 'This field is required',
    'error.invalidEmail': 'Invalid email address',
    'error.passwordMismatch': 'Passwords do not match',
    'error.minLength': 'Must be at least {{min}} characters',
    'error.maxLength': 'Must be less than {{max}} characters',
    'error.serverError': 'Server error. Please try again later.',
    'error.networkError': 'Network error. Check your connection.',
    'error.notFound': 'Page not found',
    'error.unauthorized': 'Please login to continue',

    // Success messages
    'success.addedToCart': 'Added to cart successfully',
    'success.removedFromCart': 'Removed from cart',
    'success.orderPlaced': 'Order placed successfully!',
    'success.profileUpdated': 'Profile updated successfully',
    'success.passwordChanged': 'Password changed successfully',
    'success.addressAdded': 'Address added successfully',

    // Footer
    'footer.about': 'About Us',
    'footer.contact': 'Contact',
    'footer.help': 'Help Center',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.shipping': 'Shipping Info',
    'footer.returns': 'Returns',
    'footer.newsletter': 'Subscribe to our newsletter',
    'footer.copyright': '© {{year}} NexusMart. All rights reserved.'
  },
  es: {
    'common.loading': 'Cargando...',
    'common.error': 'Ocurrió un error',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.search': 'Buscar',
    'nav.home': 'Inicio',
    'nav.products': 'Productos',
    'nav.categories': 'Categorías',
    'nav.cart': 'Carrito',
    'nav.wishlist': 'Lista de deseos',
    'nav.account': 'Mi Cuenta',
    'nav.orders': 'Pedidos',
    'nav.settings': 'Configuración',
    'nav.logout': 'Cerrar sesión',
    'nav.login': 'Iniciar sesión',
    'nav.register': 'Registrarse',
    'product.addToCart': 'Añadir al carrito',
    'product.buyNow': 'Comprar ahora',
    'product.inStock': 'En stock',
    'product.outOfStock': 'Agotado',
    'cart.title': 'Carrito de compras',
    'cart.empty': 'Tu carrito está vacío',
    'cart.checkout': 'Proceder al pago',
    'cart.total': 'Total',
    'checkout.title': 'Finalizar compra',
    'checkout.placeOrder': 'Realizar pedido'
  },
  fr: {
    'common.loading': 'Chargement...',
    'common.error': 'Une erreur est survenue',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'nav.home': 'Accueil',
    'nav.products': 'Produits',
    'nav.categories': 'Catégories',
    'nav.cart': 'Panier',
    'nav.wishlist': 'Liste de souhaits',
    'nav.account': 'Mon Compte',
    'nav.orders': 'Commandes',
    'nav.login': 'Connexion',
    'nav.register': "S'inscrire",
    'product.addToCart': 'Ajouter au panier',
    'product.buyNow': 'Acheter maintenant',
    'product.inStock': 'En stock',
    'product.outOfStock': 'Rupture de stock',
    'cart.title': 'Panier',
    'cart.empty': 'Votre panier est vide',
    'cart.checkout': 'Passer la commande',
    'checkout.title': 'Paiement'
  },
  de: {
    'common.loading': 'Wird geladen...',
    'common.error': 'Ein Fehler ist aufgetreten',
    'common.save': 'Speichern',
    'common.cancel': 'Abbrechen',
    'nav.home': 'Startseite',
    'nav.products': 'Produkte',
    'nav.cart': 'Warenkorb',
    'nav.wishlist': 'Wunschliste',
    'nav.account': 'Mein Konto',
    'nav.orders': 'Bestellungen',
    'nav.login': 'Anmelden',
    'nav.register': 'Registrieren',
    'product.addToCart': 'In den Warenkorb',
    'product.buyNow': 'Jetzt kaufen',
    'product.inStock': 'Auf Lager',
    'product.outOfStock': 'Nicht verfügbar',
    'cart.title': 'Warenkorb',
    'cart.empty': 'Ihr Warenkorb ist leer',
    'cart.checkout': 'Zur Kasse'
  },
  ar: {
    'common.loading': 'جاري التحميل...',
    'common.error': 'حدث خطأ',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'nav.home': 'الرئيسية',
    'nav.products': 'المنتجات',
    'nav.cart': 'السلة',
    'nav.wishlist': 'قائمة الرغبات',
    'nav.account': 'حسابي',
    'nav.orders': 'الطلبات',
    'nav.login': 'تسجيل الدخول',
    'nav.register': 'إنشاء حساب',
    'product.addToCart': 'أضف إلى السلة',
    'product.buyNow': 'اشتر الآن',
    'product.inStock': 'متوفر',
    'product.outOfStock': 'غير متوفر',
    'cart.title': 'سلة التسوق',
    'cart.empty': 'سلتك فارغة',
    'cart.checkout': 'إتمام الشراء'
  },
  zh: {
    'common.loading': '加载中...',
    'common.error': '发生错误',
    'common.save': '保存',
    'common.cancel': '取消',
    'nav.home': '首页',
    'nav.products': '产品',
    'nav.cart': '购物车',
    'nav.wishlist': '心愿单',
    'nav.account': '我的账户',
    'nav.orders': '订单',
    'nav.login': '登录',
    'nav.register': '注册',
    'product.addToCart': '加入购物车',
    'product.buyNow': '立即购买',
    'product.inStock': '有库存',
    'product.outOfStock': '缺货',
    'cart.title': '购物车',
    'cart.empty': '购物车是空的',
    'cart.checkout': '结账'
  },
  ja: {
    'common.loading': '読み込み中...',
    'common.error': 'エラーが発生しました',
    'common.save': '保存',
    'common.cancel': 'キャンセル',
    'nav.home': 'ホーム',
    'nav.products': '商品',
    'nav.cart': 'カート',
    'nav.wishlist': 'お気に入り',
    'nav.account': 'マイアカウント',
    'nav.orders': '注文履歴',
    'nav.login': 'ログイン',
    'nav.register': '登録',
    'product.addToCart': 'カートに追加',
    'product.buyNow': '今すぐ購入',
    'product.inStock': '在庫あり',
    'product.outOfStock': '在庫切れ',
    'cart.title': 'ショッピングカート',
    'cart.empty': 'カートは空です',
    'cart.checkout': '購入手続きへ'
  },
  hi: {
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'एक त्रुटि हुई',
    'common.save': 'सहेजें',
    'common.cancel': 'रद्द करें',
    'nav.home': 'होम',
    'nav.products': 'उत्पाद',
    'nav.cart': 'कार्ट',
    'nav.wishlist': 'विशलिस्ट',
    'nav.account': 'मेरा खाता',
    'nav.orders': 'ऑर्डर',
    'nav.login': 'लॉगिन',
    'nav.register': 'रजिस्टर',
    'product.addToCart': 'कार्ट में जोड़ें',
    'product.buyNow': 'अभी खरीदें',
    'product.inStock': 'स्टॉक में',
    'product.outOfStock': 'स्टॉक में नहीं',
    'cart.title': 'शॉपिंग कार्ट',
    'cart.empty': 'आपका कार्ट खाली है',
    'cart.checkout': 'चेकआउट करें'
  }
};

// Currency formatting
const currencies = {
  USD: { symbol: '$', code: 'USD', position: 'before' },
  EUR: { symbol: '€', code: 'EUR', position: 'after' },
  GBP: { symbol: '£', code: 'GBP', position: 'before' },
  JPY: { symbol: '¥', code: 'JPY', position: 'before' },
  CNY: { symbol: '¥', code: 'CNY', position: 'before' },
  INR: { symbol: '₹', code: 'INR', position: 'before' },
  AED: { symbol: 'د.إ', code: 'AED', position: 'after' },
  SAR: { symbol: 'ر.س', code: 'SAR', position: 'after' },
  BRL: { symbol: 'R$', code: 'BRL', position: 'before' },
  RUB: { symbol: '₽', code: 'RUB', position: 'after' }
};

// I18n Provider
export const I18nProvider = ({ children }) => {
  const [locale, setLocale] = useState(() => {
    const saved = localStorage.getItem('locale');
    if (saved && languages[saved]) return saved;
    
    // Detect browser language
    const browserLang = navigator.language.split('-')[0];
    return languages[browserLang] ? browserLang : 'en';
  });

  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('currency');
    return saved && currencies[saved] ? saved : 'USD';
  });

  // Set document direction for RTL languages
  useEffect(() => {
    const direction = languages[locale]?.direction || 'ltr';
    document.documentElement.dir = direction;
    document.documentElement.lang = locale;
    localStorage.setItem('locale', locale);
    localStorage.setItem('currency', currency);
  }, [locale, currency]);

  // Translation function
  const t = useCallback((key, params = {}) => {
    let text = translations[locale]?.[key] || translations.en?.[key] || key;
    
    // Replace template parameters
    Object.entries(params).forEach(([param, value]) => {
      text = text.replace(new RegExp(`{{${param}}}`, 'g'), value);
    });
    
    return text;
  }, [locale]);

  // Format currency
  const formatCurrency = useCallback((amount, customCurrency) => {
    const curr = currencies[customCurrency || currency];
    const formatted = new Intl.NumberFormat(locale, {
      style: 'decimal',
      minimumFractionDigits: curr?.code === 'JPY' ? 0 : 2,
      maximumFractionDigits: curr?.code === 'JPY' ? 0 : 2
    }).format(amount);

    return curr?.position === 'after' 
      ? `${formatted} ${curr.symbol}`
      : `${curr.symbol}${formatted}`;
  }, [locale, currency]);

  // Format date
  const formatDate = useCallback((date, options = {}) => {
    const defaultOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(new Date(date));
  }, [locale]);

  // Format number
  const formatNumber = useCallback((number, options = {}) => {
    return new Intl.NumberFormat(locale, options).format(number);
  }, [locale]);

  // Format relative time
  const formatRelativeTime = useCallback((date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (days > 0) return rtf.format(-days, 'day');
    if (hours > 0) return rtf.format(-hours, 'hour');
    if (minutes > 0) return rtf.format(-minutes, 'minute');
    return rtf.format(-seconds, 'second');
  }, [locale]);

  const value = {
    locale,
    setLocale,
    currency,
    setCurrency,
    t,
    formatCurrency,
    formatDate,
    formatNumber,
    formatRelativeTime,
    languages,
    currencies,
    direction: languages[locale]?.direction || 'ltr',
    isRTL: languages[locale]?.direction === 'rtl'
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

// Hook to use i18n
export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
};

// Shorthand hook for translation only
export const useTranslation = () => {
  const { t, locale } = useI18n();
  return { t, locale };
};

// Language Selector Component
export const LanguageSelector = ({ className = '' }) => {
  const { locale, setLocale, languages } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 transition-colors"
      >
        <span className="text-xl">{languages[locale].flag}</span>
        <span className="text-sm dark:text-white">{languages[locale].nativeName}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full mt-2 right-0 w-56 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-xl z-20 max-h-80 overflow-y-auto">
            {Object.entries(languages).map(([code, lang]) => (
              <button
                key={code}
                onClick={() => {
                  setLocale(code);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  locale === code ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <div className="text-left">
                  <p className="text-sm font-medium dark:text-white">{lang.nativeName}</p>
                  <p className="text-xs text-gray-500">{lang.name}</p>
                </div>
                {locale === code && (
                  <svg className="w-4 h-4 ml-auto text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Currency Selector Component
export const CurrencySelector = ({ className = '' }) => {
  const { currency, setCurrency, currencies, formatCurrency } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 transition-colors"
      >
        <span className="font-medium dark:text-white">{currencies[currency].symbol}</span>
        <span className="text-sm dark:text-white">{currency}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full mt-2 right-0 w-48 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-xl z-20 max-h-80 overflow-y-auto">
            {Object.entries(currencies).map(([code, curr]) => (
              <button
                key={code}
                onClick={() => {
                  setCurrency(code);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  currency === code ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                }`}
              >
                <span className="font-medium dark:text-white w-8">{curr.symbol}</span>
                <span className="text-sm dark:text-white">{code}</span>
                {currency === code && (
                  <svg className="w-4 h-4 ml-auto text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default I18nProvider;
