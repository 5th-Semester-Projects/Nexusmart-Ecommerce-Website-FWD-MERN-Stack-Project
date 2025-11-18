describe('Complete User Flow: Browse to Purchase', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should complete full purchase flow', () => {
    // Step 1: Browse products on home page
    cy.get('[data-testid="hero-section"]').should('be.visible');
    cy.get('[data-testid="browse-products"]').click();

    // Step 2: View products page
    cy.url().should('include', '/products');
    cy.get('[data-testid="product-card"]').should('have.length.greaterThan', 0);

    // Step 3: Apply filters
    cy.get('[data-testid="category-electronics"]').check();
    cy.setPriceRange('0', '100');
    cy.waitForPageLoad();

    // Step 4: View product details
    cy.get('[data-testid="product-card"]').first().click();
    cy.url().should('include', '/products/');
    cy.get('[data-testid="product-name"]').should('be.visible');
    cy.get('[data-testid="product-price"]').should('be.visible');

    // Step 5: Add to cart
    cy.get('[data-testid="add-to-cart"]').click();
    cy.checkToast('Added to cart', 'success');
    cy.get('[data-testid="cart-count"]').should('contain', '1');

    // Step 6: View cart
    cy.get('[data-testid="cart-icon"]').click();
    cy.url().should('include', '/cart');
    cy.get('[data-testid="cart-item"]').should('have.length', 1);

    // Step 7: Update quantity
    cy.get('[data-testid="increase-quantity"]').click();
    cy.get('[data-testid="item-quantity"]').should('contain', '2');

    // Step 8: Proceed to checkout
    cy.get('[data-testid="checkout-button"]').click();

    // Step 9: Login (if not authenticated)
    cy.url().then((url) => {
      if (url.includes('/login')) {
        cy.login();
      }
    });

    // Step 10: Fill shipping information
    cy.url().should('include', '/checkout');
    cy.get('[data-testid="full-name"]').type('John Doe');
    cy.get('[data-testid="address"]').type('123 Main Street');
    cy.get('[data-testid="city"]').type('New York');
    cy.get('[data-testid="state"]').select('NY');
    cy.get('[data-testid="postal-code"]').type('10001');
    cy.get('[data-testid="phone"]').type('+1234567890');
    cy.get('[data-testid="continue-payment"]').click();

    // Step 11: Select payment method
    cy.get('[data-testid="payment-cod"]').check();
    cy.get('[data-testid="continue-review"]').click();

    // Step 12: Review order
    cy.get('[data-testid="order-summary"]').should('be.visible');
    cy.get('[data-testid="shipping-info"]').should('contain', 'John Doe');
    cy.get('[data-testid="payment-method"]').should('contain', 'Cash on Delivery');

    // Step 13: Accept terms
    cy.get('[data-testid="terms-checkbox"]').check();

    // Step 14: Place order
    cy.get('[data-testid="place-order"]').click();

    // Step 15: Verify order success
    cy.url().should('include', '/order-success');
    cy.get('[data-testid="order-number"]').should('be.visible');
    cy.checkToast('Order placed successfully', 'success');
  });

  it('should handle guest checkout', () => {
    // Add product to cart as guest
    cy.visit('/products');
    cy.get('[data-testid="product-card"]').first().click();
    cy.get('[data-testid="add-to-cart"]').click();

    // Go to cart
    cy.get('[data-testid="cart-icon"]').click();
    cy.get('[data-testid="checkout-button"]').click();

    // Should redirect to login
    cy.url().should('include', '/login');

    // Option to continue as guest
    cy.get('[data-testid="guest-checkout"]').click();
    cy.url().should('include', '/checkout');
  });

  it('should save items in cart across sessions', () => {
    // Add items to cart
    cy.visit('/products');
    cy.get('[data-testid="product-card"]').first().find('[data-testid="add-to-cart"]').click();
    cy.get('[data-testid="product-card"]').eq(1).find('[data-testid="add-to-cart"]').click();

    // Verify cart count
    cy.get('[data-testid="cart-count"]').should('contain', '2');

    // Reload page
    cy.reload();

    // Cart should still have items
    cy.get('[data-testid="cart-count"]').should('contain', '2');
  });

  it('should handle out of stock products', () => {
    // Mock out of stock product
    cy.intercept('GET', '/api/products/*', {
      body: {
        _id: '1',
        name: 'Out of Stock Product',
        price: 99.99,
        stock: 0,
        images: ['image.jpg'],
      },
    });

    cy.visit('/products/1');
    cy.get('[data-testid="add-to-cart"]').should('be.disabled');
    cy.get('[data-testid="out-of-stock"]').should('contain', 'Out of Stock');
  });

  it('should apply coupon code', () => {
    // Add product and go to cart
    cy.visit('/products');
    cy.get('[data-testid="product-card"]').first().find('[data-testid="add-to-cart"]').click();
    cy.visit('/cart');

    // Apply coupon
    cy.get('[data-testid="coupon-input"]').type('SAVE10');
    cy.get('[data-testid="apply-coupon"]').click();

    // Verify discount
    cy.checkToast('Coupon applied', 'success');
    cy.get('[data-testid="discount-amount"]').should('be.visible');
  });

  it('should remove item from cart', () => {
    // Add multiple items
    cy.visit('/products');
    cy.get('[data-testid="product-card"]').first().find('[data-testid="add-to-cart"]').click();
    cy.get('[data-testid="product-card"]').eq(1).find('[data-testid="add-to-cart"]').click();

    // Go to cart
    cy.visit('/cart');
    cy.get('[data-testid="cart-item"]').should('have.length', 2);

    // Remove first item
    cy.get('[data-testid="remove-item"]').first().click();
    cy.get('[data-testid="confirm-remove"]').click();

    // Verify removal
    cy.get('[data-testid="cart-item"]').should('have.length', 1);
    cy.checkToast('Item removed', 'success');
  });

  it('should calculate shipping correctly', () => {
    cy.visit('/products');
    cy.get('[data-testid="product-card"]').first().find('[data-testid="add-to-cart"]').click();

    cy.visit('/cart');

    // Check subtotal
    cy.get('[data-testid="subtotal"]').invoke('text').then((subtotal) => {
      const subtotalValue = parseFloat(subtotal.replace('$', ''));

      // Free shipping for orders over $50
      if (subtotalValue >= 50) {
        cy.get('[data-testid="shipping"]').should('contain', 'Free');
      } else {
        cy.get('[data-testid="shipping"]').should('not.contain', 'Free');
      }
    });
  });

  it('should handle payment errors gracefully', () => {
    // Mock payment error
    cy.intercept('POST', '/api/orders', {
      statusCode: 400,
      body: { message: 'Payment failed' },
    });

    // Complete checkout flow
    cy.login();
    cy.visit('/products');
    cy.get('[data-testid="product-card"]').first().find('[data-testid="add-to-cart"]').click();
    cy.visit('/cart');
    cy.get('[data-testid="checkout-button"]').click();

    // Fill shipping and payment
    cy.get('[data-testid="full-name"]').type('John Doe');
    cy.get('[data-testid="address"]').type('123 Main St');
    cy.get('[data-testid="city"]').type('NYC');
    cy.get('[data-testid="postal-code"]').type('10001');
    cy.get('[data-testid="phone"]').type('+1234567890');
    cy.get('[data-testid="continue-payment"]').click();

    cy.get('[data-testid="payment-cod"]').check();
    cy.get('[data-testid="continue-review"]').click();

    cy.get('[data-testid="terms-checkbox"]').check();
    cy.get('[data-testid="place-order"]').click();

    // Should show error
    cy.checkToast('Payment failed', 'error');
    cy.url().should('include', '/checkout');
  });
});
