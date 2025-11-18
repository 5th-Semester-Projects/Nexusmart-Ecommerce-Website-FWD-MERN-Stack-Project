import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1'],
          default: 1,
        },
        variant: {
          color: String,
          size: String,
          sku: String,
        },
        price: {
          type: Number,
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Pricing
    subtotal: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    shipping: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },

    // Coupon
    appliedCoupon: {
      code: String,
      discount: Number,
      type: String,
    },

    // Save for Later
    savedForLater: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        variant: {
          color: String,
          size: String,
        },
        savedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
// Note: user already has unique: true which creates index automatically
cartSchema.index({ 'items.product': 1 });

// Calculate cart totals before saving
cartSchema.pre('save', function (next) {
  // Calculate subtotal
  this.subtotal = this.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Calculate tax (example: 10%)
  this.tax = this.subtotal * 0.1;

  // Apply discount if coupon is present
  if (this.appliedCoupon) {
    if (this.appliedCoupon.type === 'percentage') {
      this.discount = (this.subtotal * this.appliedCoupon.discount) / 100;
    } else {
      this.discount = this.appliedCoupon.discount;
    }
  }

  // Calculate total
  this.total = this.subtotal + this.tax + this.shipping - this.discount;

  next();
});

// Method to add item to cart
cartSchema.methods.addItem = async function (productId, quantity = 1, variant = {}, price) {
  const itemIndex = this.items.findIndex(
    (item) =>
      item.product.toString() === productId.toString() &&
      JSON.stringify(item.variant) === JSON.stringify(variant)
  );

  if (itemIndex > -1) {
    // Update quantity if item exists
    this.items[itemIndex].quantity += quantity;
  } else {
    // Add new item
    this.items.push({
      product: productId,
      quantity,
      variant,
      price,
    });
  }

  return await this.save();
};

// Method to remove item from cart
cartSchema.methods.removeItem = async function (itemId) {
  this.items = this.items.filter(item => item._id.toString() !== itemId.toString());
  return await this.save();
};

// Method to update item quantity
cartSchema.methods.updateQuantity = async function (itemId, quantity) {
  const item = this.items.find(item => item._id.toString() === itemId.toString());
  if (item) {
    item.quantity = quantity;
    return await this.save();
  }
  throw new Error('Item not found in cart');
};

// Method to clear cart
cartSchema.methods.clearCart = async function () {
  this.items = [];
  this.appliedCoupon = null;
  return await this.save();
};

// Method to move item to saved for later
cartSchema.methods.saveForLater = async function (itemId) {
  const itemIndex = this.items.findIndex(item => item._id.toString() === itemId.toString());
  if (itemIndex > -1) {
    const item = this.items[itemIndex];
    this.savedForLater.push({
      product: item.product,
      variant: item.variant,
    });
    this.items.splice(itemIndex, 1);
    return await this.save();
  }
  throw new Error('Item not found in cart');
};

// Method to move item back to cart
cartSchema.methods.moveToCart = async function (savedItemId, price) {
  const savedIndex = this.savedForLater.findIndex(
    item => item._id.toString() === savedItemId.toString()
  );
  if (savedIndex > -1) {
    const savedItem = this.savedForLater[savedIndex];
    await this.addItem(savedItem.product, 1, savedItem.variant, price);
    this.savedForLater.splice(savedIndex, 1);
    return await this.save();
  }
  throw new Error('Saved item not found');
};

export default mongoose.model('Cart', cartSchema);
