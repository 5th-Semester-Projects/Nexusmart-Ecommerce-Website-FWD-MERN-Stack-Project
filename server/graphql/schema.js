import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { PubSub } from 'graphql-subscriptions';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import Category from '../models/Category.js';

const pubsub = new PubSub();

// GraphQL Type Definitions
const typeDefs = `#graphql
  scalar Date
  scalar JSON

  type Image {
    public_id: String
    url: String!
  }

  type User {
    _id: ID!
    name: String!
    email: String!
    avatar: Image
    role: String!
    createdAt: Date
    orders: [Order]
    reviews: [Review]
    wishlist: [Product]
    rewardPoints: Int
    tier: String
  }

  type Product {
    _id: ID!
    name: String!
    description: String!
    price: Float!
    originalPrice: Float
    discount: Int
    category: String!
    brand: String
    stock: Int!
    images: [Image]
    rating: Float
    numReviews: Int
    seller: User
    reviews: [Review]
    tags: [String]
    attributes: JSON
    views: Int
    sales: Int
    createdAt: Date
    updatedAt: Date
    isOnSale: Boolean
    isFeatured: Boolean
    similarProducts: [Product]
  }

  type Review {
    _id: ID!
    user: User!
    product: Product!
    rating: Float!
    title: String
    comment: String!
    images: [Image]
    helpful: Int
    verified: Boolean
    createdAt: Date
  }

  type OrderItem {
    product: Product!
    name: String!
    price: Float!
    quantity: Int!
    image: String
  }

  type ShippingInfo {
    address: String!
    city: String!
    state: String
    country: String!
    postalCode: String!
    phone: String
  }

  type PaymentInfo {
    id: String
    status: String
    method: String
  }

  type Order {
    _id: ID!
    user: User!
    orderItems: [OrderItem]!
    shippingInfo: ShippingInfo!
    paymentInfo: PaymentInfo
    itemsPrice: Float!
    taxPrice: Float!
    shippingPrice: Float!
    totalPrice: Float!
    orderStatus: String!
    deliveredAt: Date
    createdAt: Date
  }

  type Category {
    _id: ID!
    name: String!
    slug: String!
    description: String
    image: Image
    parent: Category
    children: [Category]
    productCount: Int
  }

  type CartItem {
    product: Product!
    quantity: Int!
    price: Float!
  }

  type Cart {
    items: [CartItem]!
    totalItems: Int!
    totalPrice: Float!
    discount: Float
    finalPrice: Float!
  }

  type SearchResult {
    products: [Product]!
    total: Int!
    page: Int!
    pages: Int!
    aggregations: SearchAggregations
  }

  type SearchAggregations {
    categories: [AggBucket]
    brands: [AggBucket]
    priceRanges: [AggBucket]
    avgPrice: Float
    avgRating: Float
  }

  type AggBucket {
    key: String!
    doc_count: Int!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type DashboardStats {
    totalProducts: Int!
    totalOrders: Int!
    totalUsers: Int!
    totalRevenue: Float!
    recentOrders: [Order]
    topProducts: [Product]
    salesByCategory: [CategorySales]
  }

  type CategorySales {
    category: String!
    sales: Float!
    count: Int!
  }

  # Queries
  type Query {
    # Products
    products(
      page: Int
      limit: Int
      category: String
      minPrice: Float
      maxPrice: Float
      minRating: Float
      brand: String
      sortBy: String
      search: String
    ): SearchResult!
    
    product(id: ID!): Product
    productBySlug(slug: String!): Product
    featuredProducts(limit: Int): [Product]!
    newArrivals(limit: Int): [Product]!
    bestSellers(limit: Int): [Product]!
    similarProducts(productId: ID!, limit: Int): [Product]!
    
    # Categories
    categories: [Category]!
    category(id: ID!): Category
    categoryBySlug(slug: String!): Category
    
    # Users
    me: User
    user(id: ID!): User
    users(page: Int, limit: Int): [User]!
    
    # Orders
    myOrders(page: Int, limit: Int): [Order]!
    order(id: ID!): Order
    orders(page: Int, limit: Int, status: String): [Order]!
    
    # Reviews
    productReviews(productId: ID!, page: Int, limit: Int): [Review]!
    
    # Cart
    cart: Cart!
    
    # Search
    search(query: String!, page: Int, limit: Int, filters: JSON): SearchResult!
    autocomplete(prefix: String!, limit: Int): [String]!
    trendingSearches(limit: Int): [String]!
    
    # Analytics (Admin)
    dashboardStats: DashboardStats!
  }

  # Mutations
  type Mutation {
    # Auth
    register(name: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    logout: Boolean!
    forgotPassword(email: String!): Boolean!
    resetPassword(token: String!, password: String!): Boolean!
    updateProfile(name: String, email: String, avatar: String): User!
    changePassword(oldPassword: String!, newPassword: String!): Boolean!
    
    # Products (Admin)
    createProduct(input: ProductInput!): Product!
    updateProduct(id: ID!, input: ProductInput!): Product!
    deleteProduct(id: ID!): Boolean!
    
    # Reviews
    createReview(productId: ID!, rating: Float!, title: String, comment: String!, images: [String]): Review!
    updateReview(id: ID!, rating: Float, title: String, comment: String): Review!
    deleteReview(id: ID!): Boolean!
    markReviewHelpful(id: ID!): Review!
    
    # Cart
    addToCart(productId: ID!, quantity: Int!): Cart!
    updateCartItem(productId: ID!, quantity: Int!): Cart!
    removeFromCart(productId: ID!): Cart!
    clearCart: Cart!
    applyCoupon(code: String!): Cart!
    
    # Orders
    createOrder(orderItems: [OrderItemInput]!, shippingInfo: ShippingInfoInput!, paymentMethod: String!): Order!
    updateOrderStatus(id: ID!, status: String!): Order!
    cancelOrder(id: ID!): Order!
    
    # Wishlist
    addToWishlist(productId: ID!): User!
    removeFromWishlist(productId: ID!): User!
    
    # Categories (Admin)
    createCategory(input: CategoryInput!): Category!
    updateCategory(id: ID!, input: CategoryInput!): Category!
    deleteCategory(id: ID!): Boolean!
  }

  # Subscriptions
  type Subscription {
    orderStatusChanged(orderId: ID!): Order!
    newProduct: Product!
    priceDropAlert(productId: ID!): Product!
    stockAlert(productId: ID!): Product!
  }

  # Input Types
  input ProductInput {
    name: String!
    description: String!
    price: Float!
    originalPrice: Float
    category: String!
    brand: String
    stock: Int!
    images: [ImageInput]
    tags: [String]
    attributes: JSON
  }

  input ImageInput {
    public_id: String
    url: String!
  }

  input OrderItemInput {
    product: ID!
    quantity: Int!
  }

  input ShippingInfoInput {
    address: String!
    city: String!
    state: String
    country: String!
    postalCode: String!
    phone: String
  }

  input CategoryInput {
    name: String!
    description: String
    image: ImageInput
    parent: ID
  }
`;

// GraphQL Resolvers
const resolvers = {
  Query: {
    // Products
    products: async (_, args) => {
      const { page = 1, limit = 20, category, minPrice, maxPrice, minRating, brand, sortBy, search } = args;

      let query = {};

      if (search) {
        query.$text = { $search: search };
      }
      if (category) query.category = category;
      if (brand) query.brand = brand;
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = minPrice;
        if (maxPrice) query.price.$lte = maxPrice;
      }
      if (minRating) query.rating = { $gte: minRating };

      let sort = {};
      switch (sortBy) {
        case 'price_asc': sort.price = 1; break;
        case 'price_desc': sort.price = -1; break;
        case 'rating': sort.rating = -1; break;
        case 'newest': sort.createdAt = -1; break;
        default: sort.createdAt = -1;
      }

      const total = await Product.countDocuments(query);
      const products = await Product.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('seller', 'name');

      return {
        products,
        total,
        page,
        pages: Math.ceil(total / limit)
      };
    },

    product: async (_, { id }) => {
      return await Product.findById(id).populate('seller', 'name avatar');
    },

    featuredProducts: async (_, { limit = 8 }) => {
      return await Product.find({ isFeatured: true }).limit(limit);
    },

    newArrivals: async (_, { limit = 8 }) => {
      return await Product.find().sort({ createdAt: -1 }).limit(limit);
    },

    bestSellers: async (_, { limit = 8 }) => {
      return await Product.find().sort({ sales: -1 }).limit(limit);
    },

    // Categories
    categories: async () => {
      return await Category.find({ parent: null }).populate('children');
    },

    category: async (_, { id }) => {
      return await Category.findById(id).populate('children');
    },

    // User queries
    me: async (_, __, { user }) => {
      if (!user) return null;
      return await User.findById(user._id);
    },

    myOrders: async (_, { page = 1, limit = 10 }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return await Order.find({ user: user._id })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    },

    order: async (_, { id }, { user }) => {
      const order = await Order.findById(id).populate('user', 'name email');
      if (!order) throw new Error('Order not found');
      if (order.user._id.toString() !== user._id.toString() && user.role !== 'admin') {
        throw new Error('Not authorized');
      }
      return order;
    },

    productReviews: async (_, { productId, page = 1, limit = 10 }) => {
      return await Review.find({ product: productId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('user', 'name avatar');
    },

    search: async (_, { query, page = 1, limit = 20, filters }) => {
      // Use Elasticsearch if available, fallback to MongoDB
      const searchQuery = {
        $text: { $search: query }
      };

      if (filters) {
        if (filters.category) searchQuery.category = filters.category;
        if (filters.minPrice) searchQuery.price = { $gte: filters.minPrice };
        if (filters.maxPrice) searchQuery.price = { ...searchQuery.price, $lte: filters.maxPrice };
      }

      const total = await Product.countDocuments(searchQuery);
      const products = await Product.find(searchQuery)
        .skip((page - 1) * limit)
        .limit(limit);

      return {
        products,
        total,
        page,
        pages: Math.ceil(total / limit)
      };
    },

    autocomplete: async (_, { prefix, limit = 10 }) => {
      const products = await Product.find({
        name: { $regex: `^${prefix}`, $options: 'i' }
      }).select('name').limit(limit);

      return products.map(p => p.name);
    },

    dashboardStats: async (_, __, { user }) => {
      if (!user || user.role !== 'admin') throw new Error('Not authorized');

      const [totalProducts, totalOrders, totalUsers, orders] = await Promise.all([
        Product.countDocuments(),
        Order.countDocuments(),
        User.countDocuments(),
        Order.find().sort({ createdAt: -1 }).limit(10)
      ]);

      const totalRevenue = await Order.aggregate([
        { $match: { orderStatus: 'Delivered' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]);

      return {
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentOrders: orders
      };
    }
  },

  Mutation: {
    // Auth mutations
    register: async (_, { name, email, password }) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) throw new Error('Email already registered');

      const user = await User.create({ name, email, password });
      const token = user.getJwtToken();

      return { token, user };
    },

    login: async (_, { email, password }) => {
      const user = await User.findOne({ email }).select('+password');
      if (!user) throw new Error('Invalid email or password');

      const isMatch = await user.comparePassword(password);
      if (!isMatch) throw new Error('Invalid email or password');

      const token = user.getJwtToken();
      return { token, user };
    },

    // Product mutations
    createProduct: async (_, { input }, { user }) => {
      if (!user || user.role !== 'admin') throw new Error('Not authorized');
      const product = await Product.create({ ...input, seller: user._id });
      pubsub.publish('NEW_PRODUCT', { newProduct: product });
      return product;
    },

    updateProduct: async (_, { id, input }, { user }) => {
      if (!user || user.role !== 'admin') throw new Error('Not authorized');
      const product = await Product.findByIdAndUpdate(id, input, { new: true });
      return product;
    },

    deleteProduct: async (_, { id }, { user }) => {
      if (!user || user.role !== 'admin') throw new Error('Not authorized');
      await Product.findByIdAndDelete(id);
      return true;
    },

    // Review mutations
    createReview: async (_, { productId, rating, title, comment, images }, { user }) => {
      if (!user) throw new Error('Not authenticated');

      const review = await Review.create({
        user: user._id,
        product: productId,
        rating,
        title,
        comment,
        images
      });

      // Update product rating
      const reviews = await Review.find({ product: productId });
      const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
      await Product.findByIdAndUpdate(productId, {
        rating: avgRating,
        numReviews: reviews.length
      });

      return review;
    },

    // Order mutations
    createOrder: async (_, { orderItems, shippingInfo, paymentMethod }, { user }) => {
      if (!user) throw new Error('Not authenticated');

      let itemsPrice = 0;
      for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (!product) throw new Error(`Product ${item.product} not found`);
        itemsPrice += product.price * item.quantity;
      }

      const taxPrice = itemsPrice * 0.1;
      const shippingPrice = itemsPrice > 100 ? 0 : 10;
      const totalPrice = itemsPrice + taxPrice + shippingPrice;

      const order = await Order.create({
        user: user._id,
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo: { method: paymentMethod }
      });

      return order;
    },

    updateOrderStatus: async (_, { id, status }, { user }) => {
      if (!user || user.role !== 'admin') throw new Error('Not authorized');

      const order = await Order.findByIdAndUpdate(
        id,
        {
          orderStatus: status,
          ...(status === 'Delivered' ? { deliveredAt: new Date() } : {})
        },
        { new: true }
      );

      pubsub.publish(`ORDER_${id}`, { orderStatusChanged: order });
      return order;
    }
  },

  Subscription: {
    orderStatusChanged: {
      subscribe: (_, { orderId }) => pubsub.asyncIterator([`ORDER_${orderId}`])
    },
    newProduct: {
      subscribe: () => pubsub.asyncIterator(['NEW_PRODUCT'])
    }
  },

  // Field resolvers
  Product: {
    reviews: async (product) => {
      return await Review.find({ product: product._id }).populate('user', 'name avatar');
    },
    seller: async (product) => {
      return await User.findById(product.seller);
    },
    similarProducts: async (product) => {
      return await Product.find({
        category: product.category,
        _id: { $ne: product._id }
      }).limit(4);
    }
  },

  User: {
    orders: async (user) => {
      return await Order.find({ user: user._id });
    },
    reviews: async (user) => {
      return await Review.find({ user: user._id });
    }
  },

  Order: {
    user: async (order) => {
      return await User.findById(order.user);
    }
  }
};

// Create schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Create Apollo Server
const createGraphQLServer = async (app) => {
  const server = new ApolloServer({
    schema,
    introspection: true,
    plugins: [
      {
        requestDidStart: async () => ({
          willSendResponse: async ({ response }) => {
            // Add custom headers or logging
          }
        })
      }
    ]
  });

  await server.start();

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => {
        // Extract user from JWT token
        const token = req.headers.authorization?.replace('Bearer ', '');
        let user = null;

        if (token) {
          try {
            const jwt = await import('jsonwebtoken');
            const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
            user = await User.findById(decoded.id);
          } catch (error) {
            // Invalid token
          }
        }

        return { user, req };
      }
    })
  );

  console.log('🚀 GraphQL Server ready at /graphql');
  return server;
};

export { createGraphQLServer, pubsub };
export default createGraphQLServer;
