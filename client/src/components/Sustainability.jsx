import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Carbon Footprint Calculator
export const CarbonFootprintDisplay = ({ productId }) => {
  const [footprint, setFootprint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCarbonFootprint();
  }, [productId]);

  const fetchCarbonFootprint = async () => {
    try {
      const response = await axios.get(`/api/next-gen/sustainability/carbon-footprint/product/${productId}`);
      setFootprint(response.data);
    } catch (error) {
      console.error('Error fetching carbon footprint:', error);
    }
    setLoading(false);
  };

  if (loading) return <div>Calculating carbon footprint...</div>;

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <h3 className="font-bold text-lg mb-3 flex items-center">
        🌍 Carbon Footprint
      </h3>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-2xl font-bold">{footprint.totalCO2} kg CO2e</span>
          {footprint.comparisonToAverage?.betterThanAverage && (
            <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm">
              ✓ {Math.abs(footprint.comparisonToAverage.percentage)}% Better than Average
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Manufacturing:</span>
          <span className="font-semibold">{footprint.breakdown.manufacturing} kg</span>
        </div>
        <div className="flex justify-between">
          <span>Transportation:</span>
          <span className="font-semibold">{footprint.breakdown.transportation} kg</span>
        </div>
        <div className="flex justify-between">
          <span>Packaging:</span>
          <span className="font-semibold">{footprint.breakdown.packaging} kg</span>
        </div>
        <div className="flex justify-between">
          <span>Distribution:</span>
          <span className="font-semibold">{footprint.breakdown.distribution} kg</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-green-300">
        <p className="text-sm font-semibold mb-2">Offset Options:</p>
        <div className="space-y-2">
          {footprint.offsetOptions?.map((option, index) => (
            <button
              key={index}
              className="w-full text-left p-2 bg-white rounded border hover:border-green-500 text-sm"
            >
              <div className="flex justify-between">
                <span>{option.description}</span>
                <span className="font-bold">${option.cost}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Eco-Friendly Badges Display
export const EcoBadges = ({ badges }) => {
  const badgeIcons = {
    'carbon-neutral': '🌿',
    'organic': '🌾',
    'recycled': '♻️',
    'fair-trade': '🤝',
    'eco-friendly': '🌍'
  };

  return (
    <div className="flex flex-wrap gap-2">
      {badges?.map((badge, index) => (
        <div
          key={index}
          className="px-3 py-2 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-full text-sm font-semibold flex items-center gap-1 cursor-pointer hover:scale-105 transition-transform"
          title={badge.certificationDetails?.certifyingBody}
        >
          <span>{badgeIcons[badge.badgeType] || '🌿'}</span>
          <span>{badge.badgeType.replace('-', ' ').toUpperCase()}</span>
        </div>
      ))}
    </div>
  );
};

// Sustainable Packaging Options
export const PackagingSelector = ({ orderId, onSelect }) => {
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchPackagingOptions();
  }, []);

  const fetchPackagingOptions = async () => {
    try {
      const response = await axios.get('/api/next-gen/sustainability/packaging/options');
      setOptions(response.data.packagingOptions);
    } catch (error) {
      console.error('Error fetching packaging options:', error);
    }
  };

  const selectPackaging = async (optionId) => {
    try {
      const response = await axios.post('/api/next-gen/sustainability/packaging/select', {
        orderId,
        packagingOptionId: optionId
      });
      setSelected(optionId);
      onSelect(response.data);
    } catch (error) {
      console.error('Error selecting packaging:', error);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Choose Packaging</h3>
      
      {options.map(option => (
        <div
          key={option.optionId}
          onClick={() => selectPackaging(option.optionId)}
          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
            selected === option.optionId
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-green-300'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-bold text-lg">{option.name}</h4>
              {option.isEcoFriendly && (
                <span className="inline-block px-2 py-1 bg-green-500 text-white rounded text-xs mt-1">
                  🌿 Eco-Friendly
                </span>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {option.cost === 0 ? 'Free' : `+$${option.cost}`}
              </p>
              {option.discount > 0 && (
                <p className="text-green-600 font-semibold text-sm">
                  {option.discount}% discount!
                </p>
              )}
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mb-3">{option.description}</p>
          
          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-gray-600">CO2 Impact:</span>
              <span className="font-semibold ml-1">{option.co2Impact} kg</span>
            </div>
            <div>
              <span className="text-gray-600">Materials:</span>
              <span className="font-semibold ml-1">{option.materials.join(', ')}</span>
            </div>
          </div>
          
          <div className="mt-2 flex gap-2">
            {option.recyclable && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                ♻️ Recyclable
              </span>
            )}
            {option.biodegradable && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                🌱 Biodegradable
              </span>
            )}
            {option.compostable && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                🍂 Compostable
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Green Shipping Options
export const GreenShipping = ({ orderId }) => {
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchShippingOptions();
  }, []);

  const fetchShippingOptions = async () => {
    try {
      const response = await axios.get('/api/next-gen/sustainability/green-shipping', {
        params: { orderId }
      });
      setOptions(response.data.greenShippingOptions);
    } catch (error) {
      console.error('Error fetching shipping options:', error);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Green Shipping Options</h3>
      
      {options.map(option => (
        <div
          key={option.optionId}
          onClick={() => setSelected(option.optionId)}
          className={`border-2 rounded-lg p-4 cursor-pointer ${
            selected === option.optionId
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-green-300'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-bold">{option.name}</h4>
              <p className="text-sm text-gray-600">{option.description}</p>
            </div>
            <p className="text-xl font-bold">${option.cost}</p>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-sm mt-3">
            <div className="bg-blue-50 rounded p-2 text-center">
              <p className="text-gray-600 text-xs">Delivery</p>
              <p className="font-bold">{option.estimatedDays} days</p>
            </div>
            <div className="bg-green-50 rounded p-2 text-center">
              <p className="text-gray-600 text-xs">CO2 Emissions</p>
              <p className="font-bold">{option.co2Emissions} kg</p>
            </div>
            <div className="bg-yellow-50 rounded p-2 text-center">
              <p className="text-gray-600 text-xs">Net CO2</p>
              <p className="font-bold text-green-600">{option.netCO2} kg</p>
            </div>
          </div>
          
          {option.carbonOffset && (
            <div className="mt-3 bg-green-100 rounded p-2 text-sm">
              ✓ Includes carbon offset of {option.co2Offset} kg
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Sustainability Dashboard
export const SustainabilityDashboard = ({ userId }) => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, [userId]);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(`/api/next-gen/sustainability/dashboard/${userId}`);
      setDashboard(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
    setLoading(false);
  };

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold">Your Sustainability Impact</h2>
      
      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-400 to-green-600 text-white rounded-lg p-6">
          <p className="text-sm opacity-90">Total Orders</p>
          <p className="text-4xl font-bold">{dashboard.metrics.totalOrders}</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-lg p-6">
          <p className="text-sm opacity-90">CO2 Saved</p>
          <p className="text-4xl font-bold">{dashboard.metrics.totalCO2Saved} kg</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white rounded-lg p-6">
          <p className="text-sm opacity-90">Eco Purchases</p>
          <p className="text-4xl font-bold">{dashboard.metrics.ecoFriendlyPurchases}</p>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded-lg p-6">
          <p className="text-sm opacity-90">Sustainability Score</p>
          <p className="text-4xl font-bold">{dashboard.metrics.sustainabilityScore}/100</p>
        </div>
      </div>

      {/* Equivalent Impact */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">Your Impact Equals To:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-4xl mb-2">🌳</p>
            <p className="text-2xl font-bold">{dashboard.equivalentImpact.treesPlanted}</p>
            <p className="text-sm text-gray-600">Trees Planted</p>
          </div>
          <div className="text-center">
            <p className="text-4xl mb-2">🚗</p>
            <p className="text-2xl font-bold">{dashboard.equivalentImpact.milesDriven}</p>
            <p className="text-sm text-gray-600">Miles Not Driven</p>
          </div>
          <div className="text-center">
            <p className="text-4xl mb-2">📱</p>
            <p className="text-2xl font-bold">{dashboard.equivalentImpact.smartphoneCharges}</p>
            <p className="text-sm text-gray-600">Phone Charges</p>
          </div>
          <div className="text-center">
            <p className="text-4xl mb-2">💡</p>
            <p className="text-2xl font-bold">{dashboard.equivalentImpact.daysOfElectricity}</p>
            <p className="text-sm text-gray-600">Days of Electricity</p>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">Achievements</h3>
        <div className="flex flex-wrap gap-4">
          {dashboard.achievements?.map((achievement, index) => (
            <div key={index} className="flex items-center gap-2 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg px-4 py-3">
              <span className="text-3xl">{achievement.icon}</span>
              <span className="font-semibold">{achievement.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">Recommendations</h3>
        <ul className="space-y-2">
          {dashboard.recommendations?.map((rec, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-blue-500">💡</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Carbon Offset Purchase
export const CarbonOffsetPurchase = ({ orderId, carbonAmount }) => {
  const [offsetType, setOffsetType] = useState('reforestation');
  const [purchasing, setPurchasing] = useState(false);

  const offsetOptions = [
    {
      type: 'reforestation',
      name: 'Plant Trees',
      icon: '🌳',
      description: 'Support reforestation projects'
    },
    {
      type: 'renewable-energy',
      name: 'Renewable Energy',
      icon: '⚡',
      description: 'Fund solar and wind projects'
    },
    {
      type: 'ocean-cleanup',
      name: 'Ocean Cleanup',
      icon: '🌊',
      description: 'Remove plastic from oceans'
    }
  ];

  const purchaseOffset = async () => {
    setPurchasing(true);
    try {
      const response = await axios.post('/api/next-gen/sustainability/carbon-offset', {
        orderId,
        offsetAmount: carbonAmount,
        offsetType
      });
      alert('Carbon offset purchased! Certificate: ' + response.data.carbonOffset.certificateUrl);
    } catch (error) {
      console.error('Error purchasing offset:', error);
    }
    setPurchasing(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4">Offset Your Carbon Footprint</h3>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-600">Your carbon footprint:</p>
        <p className="text-3xl font-bold">{carbonAmount} kg CO2</p>
      </div>

      <p className="mb-4">Choose how to offset:</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {offsetOptions.map(option => (
          <button
            key={option.type}
            onClick={() => setOffsetType(option.type)}
            className={`p-4 rounded-lg border-2 ${
              offsetType === option.type
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300'
            }`}
          >
            <div className="text-4xl mb-2">{option.icon}</div>
            <h4 className="font-bold">{option.name}</h4>
            <p className="text-sm text-gray-600">{option.description}</p>
          </button>
        ))}
      </div>

      <button
        onClick={purchaseOffset}
        disabled={purchasing}
        className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400"
      >
        {purchasing ? 'Processing...' : 'Purchase Carbon Offset'}
      </button>
    </div>
  );
};

export default {
  CarbonFootprintDisplay,
  EcoBadges,
  PackagingSelector,
  GreenShipping,
  SustainabilityDashboard,
  CarbonOffsetPurchase
};
