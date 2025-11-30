import { createSlice } from '@reduxjs/toolkit';

// Theme options: 'magical', 'light', 'dark'
const THEMES = ['magical', 'light', 'dark'];

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme && THEMES.includes(savedTheme)) return savedTheme;
  return 'magical'; // Default to magical theme
};

const applyThemeToDOM = (theme) => {
  // Remove all theme classes first
  document.documentElement.classList.remove('theme-magical', 'theme-light', 'theme-dark', 'dark');

  // Add the new theme class
  document.documentElement.classList.add(`theme-${theme}`);

  // Add 'dark' class for dark and magical themes (for Tailwind dark mode)
  if (theme === 'dark' || theme === 'magical') {
    document.documentElement.classList.add('dark');
  }

  // Set body data attribute for CSS targeting
  document.body.setAttribute('data-theme', theme);
};

const initialState = {
  theme: getInitialTheme(),
  sidebarOpen: false,
  mobileMenuOpen: false,
  searchModalOpen: false,
  cartDrawerOpen: false,
  wishlistDrawerOpen: false,
  loading: false,
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      const newTheme = action.payload;
      if (THEMES.includes(newTheme)) {
        state.theme = newTheme;
        localStorage.setItem('theme', newTheme);
        applyThemeToDOM(newTheme);
      }
    },
    toggleTheme: (state) => {
      // Cycle through themes: magical -> light -> dark -> magical
      const currentIndex = THEMES.indexOf(state.theme);
      const nextIndex = (currentIndex + 1) % THEMES.length;
      state.theme = THEMES[nextIndex];
      localStorage.setItem('theme', state.theme);
      applyThemeToDOM(state.theme);
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    toggleSearchModal: (state) => {
      state.searchModalOpen = !state.searchModalOpen;
    },
    toggleCartDrawer: (state) => {
      state.cartDrawerOpen = !state.cartDrawerOpen;
    },
    toggleWishlistDrawer: (state) => {
      state.wishlistDrawerOpen = !state.wishlistDrawerOpen;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload,
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const {
  setTheme,
  toggleTheme,
  toggleSidebar,
  toggleMobileMenu,
  toggleSearchModal,
  toggleCartDrawer,
  toggleWishlistDrawer,
  setLoading,
  addNotification,
  removeNotification,
  clearNotifications,
} = uiSlice.actions;

export default uiSlice.reducer;
