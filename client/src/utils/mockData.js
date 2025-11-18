// Mock Products Data for Development
export const mockProducts = [
  // Men's Fashion
  {
    _id: '1',
    name: 'Premium Men\'s Leather Jacket',
    price: 299,
    originalPrice: 449,
    discount: 33,
    category: 'Men',
    subcategory: 'Jackets',
    rating: 4.9,
    reviews: 1247,
    stock: 45,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80' },
      { url: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=500&q=80' }
    ],
    description: 'Classic genuine leather jacket with premium finish. Perfect for any occasion.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Brown', 'Navy']
  },
  {
    _id: '2',
    name: 'Men\'s Casual Denim Jeans',
    price: 89,
    originalPrice: 129,
    discount: 31,
    category: 'Men',
    subcategory: 'Jeans',
    rating: 4.7,
    reviews: 2834,
    stock: 156,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&q=80' },
      { url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&q=80' }
    ],
    description: 'Comfortable slim-fit denim jeans with stretch fabric.',
    sizes: ['28', '30', '32', '34', '36', '38'],
    colors: ['Blue', 'Black', 'Grey']
  },
  {
    _id: '3',
    name: 'Men\'s Designer Sneakers',
    price: 179,
    originalPrice: 249,
    discount: 28,
    category: 'Men',
    subcategory: 'Shoes',
    rating: 4.8,
    reviews: 1923,
    stock: 89,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&q=80' },
      { url: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500&q=80' }
    ],
    description: 'Modern designer sneakers with superior comfort and style.',
    sizes: ['7', '8', '9', '10', '11', '12'],
    colors: ['White', 'Black', 'Grey', 'Blue']
  },
  {
    _id: '4',
    name: 'Men\'s Formal Dress Shirt',
    price: 69,
    originalPrice: 99,
    discount: 30,
    category: 'Men',
    subcategory: 'Shirts',
    rating: 4.6,
    reviews: 1456,
    stock: 203,
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&q=80' },
      { url: 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=500&q=80' }
    ],
    description: 'Premium cotton dress shirt for professional look.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White', 'Blue', 'Black', 'Pink']
  },
  {
    _id: '5',
    name: 'Men\'s Sports Watch',
    price: 249,
    originalPrice: 349,
    discount: 29,
    category: 'Men',
    subcategory: 'Accessories',
    rating: 4.9,
    reviews: 3421,
    stock: 67,
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&q=80' },
      { url: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&q=80' }
    ],
    description: 'Luxury sports watch with multiple features and water resistance.',
    colors: ['Silver', 'Gold', 'Black']
  },
  {
    _id: '6',
    name: 'Men\'s Leather Wallet',
    price: 49,
    originalPrice: 79,
    discount: 38,
    category: 'Men',
    subcategory: 'Accessories',
    rating: 4.7,
    reviews: 2156,
    stock: 234,
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&q=80' }
    ],
    description: 'Genuine leather wallet with RFID protection.',
    colors: ['Brown', 'Black', 'Tan']
  },

  // Women's Fashion
  {
    _id: '7',
    name: 'Women\'s Elegant Evening Dress',
    price: 199,
    originalPrice: 299,
    discount: 33,
    category: 'Women',
    subcategory: 'Dresses',
    rating: 4.9,
    reviews: 1834,
    stock: 78,
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&q=80' },
      { url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500&q=80' }
    ],
    description: 'Stunning evening dress perfect for special occasions.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black', 'Red', 'Navy', 'Emerald']
  },
  {
    _id: '8',
    name: 'Women\'s Designer Handbag',
    price: 349,
    originalPrice: 499,
    discount: 30,
    category: 'Women',
    subcategory: 'Bags',
    rating: 4.8,
    reviews: 2647,
    stock: 54,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&q=80' },
      { url: 'https://images.unsplash.com/photo-1591561954555-607968d269fa?w=500&q=80' }
    ],
    description: 'Luxury designer handbag with premium leather finish.',
    colors: ['Brown', 'Black', 'Beige', 'Red']
  },
  {
    _id: '9',
    name: 'Women\'s Casual Blouse',
    price: 59,
    originalPrice: 89,
    discount: 34,
    category: 'Women',
    subcategory: 'Tops',
    rating: 4.6,
    reviews: 1923,
    stock: 187,
    image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=500&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=500&q=80' },
      { url: 'https://images.unsplash.com/photo-1590330297626-d7aff25a0431?w=500&q=80' }
    ],
    description: 'Comfortable and stylish casual blouse for everyday wear.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['White', 'Pink', 'Blue', 'Black']
  },
  {
    _id: '10',
    name: 'Women\'s High Heel Sandals',
    price: 129,
    originalPrice: 189,
    discount: 32,
    category: 'Women',
    subcategory: 'Shoes',
    rating: 4.7,
    reviews: 1456,
    stock: 92,
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&q=80' },
      { url: 'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=500&q=80' }
    ],
    description: 'Elegant high heel sandals for formal occasions.',
    sizes: ['5', '6', '7', '8', '9', '10'],
    colors: ['Nude', 'Black', 'Red', 'Silver']
  },
  {
    _id: '11',
    name: 'Women\'s Denim Jacket',
    price: 89,
    originalPrice: 139,
    discount: 36,
    category: 'Women',
    subcategory: 'Jackets',
    rating: 4.8,
    reviews: 2134,
    stock: 123,
    image: 'https://images.unsplash.com/photo-1601333144130-8cbb312386b6?w=500&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1601333144130-8cbb312386b6?w=500&q=80' },
      { url: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=500&q=80' }
    ],
    description: 'Classic denim jacket with modern fit and style.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Blue', 'Black', 'White']
  },
  {
    _id: '12',
    name: 'Women\'s Diamond Necklace',
    price: 599,
    originalPrice: 899,
    discount: 33,
    category: 'Women',
    subcategory: 'Jewelry',
    rating: 4.9,
    reviews: 876,
    stock: 34,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80' }
    ],
    description: 'Elegant diamond necklace with 18K gold plating.',
    colors: ['Gold', 'Silver', 'Rose Gold']
  },

  // Electronics
  {
    _id: '13',
    name: 'Wireless Noise-Cancelling Headphones',
    price: 299,
    originalPrice: 399,
    discount: 25,
    category: 'Electronics',
    subcategory: 'Audio',
    rating: 4.8,
    reviews: 2847,
    stock: 145,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80' },
      { url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&q=80' }
    ],
    description: 'Premium wireless headphones with active noise cancellation and 30-hour battery.',
    colors: ['Black', 'Silver', 'Rose Gold']
  },
  {
    _id: '14',
    name: 'Smart Fitness Watch Pro',
    price: 199,
    originalPrice: 299,
    discount: 33,
    category: 'Electronics',
    subcategory: 'Wearables',
    rating: 4.6,
    reviews: 1523,
    stock: 198,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80' },
      { url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&q=80' }
    ],
    description: 'Track your fitness goals with advanced health monitoring features.',
    colors: ['Black', 'White', 'Blue']
  },
  {
    _id: '15',
    name: 'Portable Bluetooth Speaker',
    price: 79,
    originalPrice: 129,
    discount: 39,
    category: 'Electronics',
    subcategory: 'Audio',
    rating: 4.5,
    reviews: 1876,
    stock: 203,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80' }
    ],
    description: '360° sound with deep bass and 12-hour battery life.',
    colors: ['Black', 'Blue', 'Red']
  },
];


export const getTrendingProducts = () => {
  return mockProducts.filter(p => p.rating >= 4.7).slice(0, 6);
};

export const getNewArrivals = () => {
  return mockProducts.slice(0, 6);
};

export const getAllProducts = () => {
  return mockProducts;
};

export const getProductsByCategory = (category) => {
  if (!category) return mockProducts;
  return mockProducts.filter(p => p.category.toLowerCase() === category.toLowerCase());
};

export const getMenProducts = () => {
  return mockProducts.filter(p => p.category === 'Men');
};

export const getWomenProducts = () => {
  return mockProducts.filter(p => p.category === 'Women');
};

export const getElectronicsProducts = () => {
  return mockProducts.filter(p => p.category === 'Electronics');
};
