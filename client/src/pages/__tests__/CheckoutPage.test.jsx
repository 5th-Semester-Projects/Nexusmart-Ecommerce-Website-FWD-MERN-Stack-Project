import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import CheckoutPage from '../CheckoutPage';

const mockStore = configureStore([]);

describe('CheckoutPage Integration Tests', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      cart: {
        items: [
          {
            product: {
              _id: '1',
              name: 'Product 1',
              price: 29.99,
              images: ['image1.jpg'],
            },
            quantity: 2,
          },
        ],
        subtotal: 59.98,
        tax: 5.40,
        shipping: 10.00,
        total: 75.38,
      },
      auth: {
        user: {
          _id: 'user1',
          email: 'test@example.com',
          name: 'Test User',
        },
        isAuthenticated: true,
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

  it('renders checkout page with 3 steps', () => {
    renderWithProviders(<CheckoutPage />);
    expect(screen.getByText(/shipping/i)).toBeInTheDocument();
    expect(screen.getByText(/payment/i)).toBeInTheDocument();
    expect(screen.getByText(/review/i)).toBeInTheDocument();
  });

  it('displays order summary', () => {
    renderWithProviders(<CheckoutPage />);
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('$59.98')).toBeInTheDocument();
    expect(screen.getByText('$75.38')).toBeInTheDocument();
  });

  describe('Step 1: Shipping Information', () => {
    it('validates required shipping fields', async () => {
      const user = userEvent.setup();
      renderWithProviders(<CheckoutPage />);
      
      const continueButton = screen.getByText(/continue to payment/i);
      await user.click(continueButton);
      
      await waitFor(() => {
        expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/address is required/i)).toBeInTheDocument();
      });
    });

    it('fills shipping form successfully', async () => {
      const user = userEvent.setup();
      renderWithProviders(<CheckoutPage />);
      
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/address/i), '123 Main St');
      await user.type(screen.getByLabelText(/city/i), 'New York');
      await user.type(screen.getByLabelText(/postal code/i), '10001');
      await user.type(screen.getByLabelText(/phone/i), '+1234567890');
      
      const continueButton = screen.getByText(/continue to payment/i);
      await user.click(continueButton);
      
      await waitFor(() => {
        expect(screen.getByText(/payment method/i)).toBeInTheDocument();
      });
    });

    it('saves shipping address', async () => {
      const user = userEvent.setup();
      renderWithProviders(<CheckoutPage />);
      
      const saveCheckbox = screen.getByLabelText(/save this address/i);
      await user.click(saveCheckbox);
      
      expect(saveCheckbox).toBeChecked();
    });
  });

  describe('Step 2: Payment Method', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      renderWithProviders(<CheckoutPage />);
      
      // Fill shipping info
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/address/i), '123 Main St');
      await user.type(screen.getByLabelText(/city/i), 'New York');
      await user.type(screen.getByLabelText(/postal code/i), '10001');
      await user.type(screen.getByLabelText(/phone/i), '+1234567890');
      
      await user.click(screen.getByText(/continue to payment/i));
    });

    it('displays payment method options', async () => {
      await waitFor(() => {
        expect(screen.getByText(/credit card/i)).toBeInTheDocument();
        expect(screen.getByText(/crypto/i)).toBeInTheDocument();
        expect(screen.getByText(/cash on delivery/i)).toBeInTheDocument();
      });
    });

    it('selects credit card payment', async () => {
      const user = userEvent.setup();
      
      const creditCardOption = screen.getByLabelText(/credit card/i);
      await user.click(creditCardOption);
      
      expect(creditCardOption).toBeChecked();
      expect(screen.getByText(/card number/i)).toBeInTheDocument();
    });

    it('validates credit card fields', async () => {
      const user = userEvent.setup();
      
      const creditCardOption = screen.getByLabelText(/credit card/i);
      await user.click(creditCardOption);
      
      const continueButton = screen.getByText(/continue to review/i);
      await user.click(continueButton);
      
      await waitFor(() => {
        expect(screen.getByText(/card number is required/i)).toBeInTheDocument();
      });
    });

    it('selects crypto payment', async () => {
      const user = userEvent.setup();
      
      const cryptoOption = screen.getByLabelText(/crypto/i);
      await user.click(cryptoOption);
      
      expect(cryptoOption).toBeChecked();
      expect(screen.getByText(/connect wallet/i)).toBeInTheDocument();
    });

    it('selects cash on delivery', async () => {
      const user = userEvent.setup();
      
      const codOption = screen.getByLabelText(/cash on delivery/i);
      await user.click(codOption);
      
      expect(codOption).toBeChecked();
    });
  });

  describe('Step 3: Review Order', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      renderWithProviders(<CheckoutPage />);
      
      // Complete shipping
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/address/i), '123 Main St');
      await user.type(screen.getByLabelText(/city/i), 'New York');
      await user.type(screen.getByLabelText(/postal code/i), '10001');
      await user.type(screen.getByLabelText(/phone/i), '+1234567890');
      await user.click(screen.getByText(/continue to payment/i));
      
      // Complete payment
      await waitFor(() => screen.getByLabelText(/cash on delivery/i));
      await user.click(screen.getByLabelText(/cash on delivery/i));
      await user.click(screen.getByText(/continue to review/i));
    });

    it('displays order review', async () => {
      await waitFor(() => {
        expect(screen.getByText(/review your order/i)).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('123 Main St')).toBeInTheDocument();
      });
    });

    it('allows editing shipping information', async () => {
      const user = userEvent.setup();
      
      const editShippingButton = screen.getByText(/edit shipping/i);
      await user.click(editShippingButton);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      });
    });

    it('allows editing payment method', async () => {
      const user = userEvent.setup();
      
      const editPaymentButton = screen.getByText(/edit payment/i);
      await user.click(editPaymentButton);
      
      await waitFor(() => {
        expect(screen.getByText(/payment method/i)).toBeInTheDocument();
      });
    });

    it('places order successfully', async () => {
      const user = userEvent.setup();
      
      const placeOrderButton = screen.getByText(/place order/i);
      await user.click(placeOrderButton);
      
      await waitFor(() => {
        const actions = store.getActions();
        expect(actions).toContainEqual(
          expect.objectContaining({
            type: expect.stringContaining('order/create'),
          })
        );
      });
    });

    it('shows loading state when placing order', async () => {
      const user = userEvent.setup();
      
      const placeOrderButton = screen.getByText(/place order/i);
      await user.click(placeOrderButton);
      
      expect(placeOrderButton).toBeDisabled();
      expect(screen.getByText(/processing/i)).toBeInTheDocument();
    });

    it('accepts terms and conditions', async () => {
      const user = userEvent.setup();
      
      const termsCheckbox = screen.getByLabelText(/terms and conditions/i);
      await user.click(termsCheckbox);
      
      expect(termsCheckbox).toBeChecked();
    });
  });

  it('navigates back to cart', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CheckoutPage />);
    
    const backButton = screen.getByText(/back to cart/i);
    await user.click(backButton);
    
    // Would check navigation in real implementation
    expect(backButton.closest('a')).toHaveAttribute('href', '/cart');
  });

  it('redirects to login if not authenticated', () => {
    store = mockStore({
      cart: { items: [], subtotal: 0, tax: 0, shipping: 0, total: 0 },
      auth: { user: null, isAuthenticated: false },
      ui: { theme: 'light' },
    });

    renderWithProviders(<CheckoutPage />);
    
    expect(screen.getByText(/please login/i)).toBeInTheDocument();
  });

  it('shows empty cart message', () => {
    store = mockStore({
      cart: { items: [], subtotal: 0, tax: 0, shipping: 0, total: 0 },
      auth: { user: { _id: 'user1' }, isAuthenticated: true },
      ui: { theme: 'light' },
    });

    renderWithProviders(<CheckoutPage />);
    
    expect(screen.getByText(/cart is empty/i)).toBeInTheDocument();
  });
});
