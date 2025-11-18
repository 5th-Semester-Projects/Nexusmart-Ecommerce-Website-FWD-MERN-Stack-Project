import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TestAPIPage = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [trending, setTrending] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Test 1: All Products
        const res1 = await axios.get('http://localhost:5000/api/products');
        console.log('All Products Response:', res1.data);
        setAllProducts(res1.data.products || []);

        // Test 2: Trending
        const res2 = await axios.get('http://localhost:5000/api/products/trending');
        console.log('Trending Response:', res2.data);
        setTrending(res2.data.products || []);

        // Test 3: New Arrivals
        const res3 = await axios.get('http://localhost:5000/api/products/new-arrivals');
        console.log('New Arrivals Response:', res3.data);
        setNewArrivals(res3.data.products || []);

        setLoading(false);
      } catch (err) {
        console.error('API Error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-white text-2xl">Loading...</div>;
  if (error) return <div className="p-8 text-red-500 text-2xl">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-cyan-400">API Test Page</h1>

      <div className="space-y-8">
        {/* All Products */}
        <div className="border border-cyan-400/30 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4 text-cyan-400">
            All Products ({allProducts.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {allProducts.slice(0, 6).map((product) => (
              <div key={product._id} className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-bold text-lg">{product.name}</h3>
                <p className="text-green-400 text-xl font-bold">${product.price}</p>
                <p className="text-gray-400 text-sm">{product.brand}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trending */}
        <div className="border border-purple-400/30 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4 text-purple-400">
            Trending Products ({trending.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {trending.slice(0, 6).map((product) => (
              <div key={product._id} className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-bold text-lg">{product.name}</h3>
                <p className="text-green-400 text-xl font-bold">${product.price}</p>
                <p className="text-gray-400 text-sm">{product.brand}</p>
              </div>
            ))}
          </div>
        </div>

        {/* New Arrivals */}
        <div className="border border-red-400/30 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4 text-red-400">
            New Arrivals ({newArrivals.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {newArrivals.slice(0, 6).map((product) => (
              <div key={product._id} className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-bold text-lg">{product.name}</h3>
                <p className="text-green-400 text-xl font-bold">${product.price}</p>
                <p className="text-gray-400 text-sm">{product.brand}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 bg-gray-800 rounded-xl">
        <h3 className="text-xl font-bold mb-4 text-yellow-400">Debug Info</h3>
        <pre className="text-sm text-gray-300 overflow-auto">
          {JSON.stringify(
            {
              allProductsCount: allProducts.length,
              trendingCount: trending.length,
              newArrivalsCount: newArrivals.length,
              firstProduct: allProducts[0]
                ? {
                    name: allProducts[0].name,
                    price: allProducts[0].price,
                    hasImages: !!allProducts[0].images?.length,
                  }
                : null,
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
};

export default TestAPIPage;
