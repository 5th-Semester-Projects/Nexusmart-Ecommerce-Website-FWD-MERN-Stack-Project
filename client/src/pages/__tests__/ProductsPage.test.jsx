import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import ProductsPage from '../ProductsPage';

const mockStore = configureStore([]);

describe('ProductsPage Integration Tests', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      products: {
        items: [
          {
            _id: '1',
            name: 'Product 1',
            price: 29.99,
            category: 'electronics',
            images: ['image1.jpg'],
            rating: 4.5,
            stock: 10,
          },
          {
            _id: '2',
            name: 'Product 2',
            price: 49.99,
            category: 'fashion',
            images: ['image2.jpg'],
            rating: 4.0,
            stock: 5,
          },
        ],
        loading: false,
        error: null,
        pagination: {
          total: 2,
          page: 1,
          pages: 1,
        },
      },
      ui: {
        theme: 'light',
      },
    });
  });

  const renderWithProviders = (component) => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </Provider>
    );
  };

  it('renders products page with product grid', () => {
    renderWithProviders(<ProductsPage />);
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
  });

  it('displays filter sidebar', () => {
    renderWithProviders(<ProductsPage />);
    expect(screen.getByText(/filters/i)).toBeInTheDocument();
    expect(screen.getByText(/category/i)).toBeInTheDocument();
    expect(screen.getByText(/price/i)).toBeInTheDocument();
  });

  it('filters products by category', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductsPage />);
    
    const categoryFilter = screen.getByLabelText(/electronics/i);
    await user.click(categoryFilter);
    
    await waitFor(() => {
      const actions = store.getActions();
      expect(actions).toContainEqual(
        expect.objectContaining({
          type: expect.stringContaining('filter'),
        })
      );
    });
  });

  it('filters products by price range', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductsPage />);
    
    const minPriceInput = screen.getByLabelText(/min price/i);
    const maxPriceInput = screen.getByLabelText(/max price/i);
    
    await user.type(minPriceInput, '20');
    await user.type(maxPriceInput, '50');
    
    await waitFor(() => {
      expect(minPriceInput).toHaveValue(20);
      expect(maxPriceInput).toHaveValue(50);
    });
  });

  it('sorts products', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductsPage />);
    
    const sortDropdown = screen.getByLabelText(/sort by/i);
    await user.selectOptions(sortDropdown, 'price-low-high');
    
    await waitFor(() => {
      const actions = store.getActions();
      expect(actions).toContainEqual(
        expect.objectContaining({
          type: expect.stringContaining('sort'),
        })
      );
    });
  });

  it('searches products', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductsPage />);
    
    const searchInput = screen.getByPlaceholderText(/search/i);
    await user.type(searchInput, 'laptop');
    
    await waitFor(() => {
      expect(searchInput).toHaveValue('laptop');
    });
  });

  it('handles pagination', async () => {
    store = mockStore({
      products: {
        items: Array(20).fill(null).map((_, i) => ({
          _id: String(i),
          name: `Product ${i}`,
          price: 29.99,
          category: 'electronics',
          images: ['image.jpg'],
          rating: 4.5,
          stock: 10,
        })),
        loading: false,
        error: null,
        pagination: {
          total: 50,
          page: 1,
          pages: 3,
        },
      },
      ui: { theme: 'light' },
    });

    const user = userEvent.setup();
    renderWithProviders(<ProductsPage />);
    
    const nextButton = screen.getByText(/next/i);
    await user.click(nextButton);
    
    await waitFor(() => {
      const actions = store.getActions();
      expect(actions).toContainEqual(
        expect.objectContaining({
          type: expect.stringContaining('page'),
        })
      );
    });
  });

  it('displays loading state', () => {
    store = mockStore({
      products: {
        items: [],
        loading: true,
        error: null,
        pagination: { total: 0, page: 1, pages: 0 },
      },
      ui: { theme: 'light' },
    });

    renderWithProviders(<ProductsPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays error state', () => {
    store = mockStore({
      products: {
        items: [],
        loading: false,
        error: 'Failed to fetch products',
        pagination: { total: 0, page: 1, pages: 0 },
      },
      ui: { theme: 'light' },
    });

    renderWithProviders(<ProductsPage />);
    expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
  });

  it('displays empty state when no products', () => {
    store = mockStore({
      products: {
        items: [],
        loading: false,
        error: null,
        pagination: { total: 0, page: 1, pages: 0 },
      },
      ui: { theme: 'light' },
    });

    renderWithProviders(<ProductsPage />);
    expect(screen.getByText(/no products found/i)).toBeInTheDocument();
  });

  it('adds product to cart', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductsPage />);
    
    const addToCartButtons = screen.getAllByText(/add to cart/i);
    await user.click(addToCartButtons[0]);
    
    await waitFor(() => {
      const actions = store.getActions();
      expect(actions).toContainEqual(
        expect.objectContaining({
          type: expect.stringContaining('cart/add'),
        })
      );
    });
  });

  it('adds product to wishlist', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductsPage />);
    
    const wishlistButtons = screen.getAllByLabelText(/add to wishlist/i);
    await user.click(wishlistButtons[0]);
    
    await waitFor(() => {
      const actions = store.getActions();
      expect(actions).toContainEqual(
        expect.objectContaining({
          type: expect.stringContaining('wishlist/add'),
        })
      );
    });
  });

  it('navigates to product detail page', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductsPage />);
    
    const productLink = screen.getByText('Product 1');
    await user.click(productLink);
    
    // Would check navigation in real implementation
    expect(productLink.closest('a')).toHaveAttribute('href', '/products/1');
  });

  it('toggles grid and list view', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductsPage />);
    
    const listViewButton = screen.getByLabelText(/list view/i);
    await user.click(listViewButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('product-list')).toBeInTheDocument();
    });

    const gridViewButton = screen.getByLabelText(/grid view/i);
    await user.click(gridViewButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('product-grid')).toBeInTheDocument();
    });
  });

  it('clears all filters', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductsPage />);
    
    // Apply filters first
    const categoryFilter = screen.getByLabelText(/electronics/i);
    await user.click(categoryFilter);
    
    // Clear filters
    const clearButton = screen.getByText(/clear all/i);
    await user.click(clearButton);
    
    await waitFor(() => {
      const actions = store.getActions();
      expect(actions).toContainEqual(
        expect.objectContaining({
          type: expect.stringContaining('clear'),
        })
      );
    });
  });
});
