// ***********************************************
// Cypress custom commands
// ***********************************************

// Login command
Cypress.Commands.add('login', (email = 'test@example.com', password = 'password123') => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('not.include', '/login');
});

// Logout command
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click();
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should('include', '/');
});

// Add to cart command
Cypress.Commands.add('addToCart', (productName) => {
  cy.contains(productName).parents('.product-card').find('[data-testid="add-to-cart"]').click();
  cy.get('[data-testid="cart-notification"]').should('be.visible');
});

// Clear cart command
Cypress.Commands.add('clearCart', () => {
  cy.visit('/cart');
  cy.get('body').then(($body) => {
    if ($body.find('[data-testid="clear-cart"]').length > 0) {
      cy.get('[data-testid="clear-cart"]').click();
      cy.get('[data-testid="confirm-clear"]').click();
    }
  });
});

// Search products command
Cypress.Commands.add('searchProduct', (query) => {
  cy.get('[data-testid="search-input"]').clear().type(query);
  cy.get('[data-testid="search-button"]').click();
});

// Select category filter
Cypress.Commands.add('selectCategory', (category) => {
  cy.get(`[data-testid="category-${category}"]`).check();
});

// Set price range
Cypress.Commands.add('setPriceRange', (min, max) => {
  cy.get('[data-testid="min-price"]').clear().type(min);
  cy.get('[data-testid="max-price"]').clear().type(max);
  cy.get('[data-testid="apply-filters"]').click();
});

// API mocking
Cypress.Commands.add('mockProducts', () => {
  cy.intercept('GET', '/api/products*', {
    fixture: 'products.json',
  }).as('getProducts');
});

Cypress.Commands.add('mockUser', () => {
  cy.intercept('GET', '/api/auth/me', {
    fixture: 'user.json',
  }).as('getUser');
});

// Wait for page load
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('[data-testid="page-loader"]').should('not.exist');
});

// Check toast notification
Cypress.Commands.add('checkToast', (message, type = 'success') => {
  cy.get(`[data-testid="toast-${type}"]`).should('contain', message);
});
