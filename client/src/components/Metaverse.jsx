import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Virtual Store Component
export const VirtualStore = () => {
  const [store, setStore] = useState(null);

  const enterVirtualStore = async () => {
    try {
      const response = await axios.post('/api/next-gen/metaverse/store/create', {
        storeName: 'NexusMart VR Experience',
        theme: 'futuristic',
        layout: 'gallery'
      });
      setStore(response.data.virtualStore);
      window.open(response.data.accessUrl, '_blank');
    } catch (error) {
      console.error('Error entering virtual store:', error);
    }
  };

  return (
    <div className="relative h-96 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-lg overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white z-10">
          <h2 className="text-4xl font-bold mb-4">Enter the Metaverse</h2>
          <p className="text-lg mb-6">Shop in our immersive virtual reality store</p>
          
          <button
            onClick={enterVirtualStore}
            className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full text-xl font-bold hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition-all"
          >
            🥽 Enter VR Store
          </button>
          
          <div className="mt-6 flex justify-center gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <p className="text-sm">✓ VR Compatible</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <p className="text-sm">✓ 3D Products</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <p className="text-sm">✓ Avatar Shopping</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-pink-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
    </div>
  );
};

// Avatar Creator Component
export const AvatarCreator = ({ userId }) => {
  const [avatarConfig, setAvatarConfig] = useState({
    bodyType: 'default',
    skinTone: '#fdbcb4',
    hairStyle: 'short',
    hairColor: '#000000',
    eyeColor: '#8b4513',
    outfit: 'casual'
  });
  const [avatar, setAvatar] = useState(null);

  const createAvatar = async () => {
    try {
      const response = await axios.post('/api/next-gen/metaverse/avatar/create', {
        userId,
        avatarConfig
      });
      setAvatar(response.data.avatar);
      alert('Avatar created successfully!');
    } catch (error) {
      console.error('Error creating avatar:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white rounded-lg shadow-lg">
      <div>
        <h2 className="text-2xl font-bold mb-6">Create Your Avatar</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block mb-2 font-semibold">Body Type</label>
            <select
              value={avatarConfig.bodyType}
              onChange={(e) => setAvatarConfig({ ...avatarConfig, bodyType: e.target.value })}
              className="w-full p-3 border rounded-lg"
            >
              <option value="default">Default</option>
              <option value="slim">Slim</option>
              <option value="athletic">Athletic</option>
              <option value="plus">Plus Size</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-semibold">Skin Tone</label>
            <input
              type="color"
              value={avatarConfig.skinTone}
              onChange={(e) => setAvatarConfig({ ...avatarConfig, skinTone: e.target.value })}
              className="w-full h-12 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">Hair Style</label>
            <select
              value={avatarConfig.hairStyle}
              onChange={(e) => setAvatarConfig({ ...avatarConfig, hairStyle: e.target.value })}
              className="w-full p-3 border rounded-lg"
            >
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
              <option value="bald">Bald</option>
              <option value="curly">Curly</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-semibold">Hair Color</label>
            <input
              type="color"
              value={avatarConfig.hairColor}
              onChange={(e) => setAvatarConfig({ ...avatarConfig, hairColor: e.target.value })}
              className="w-full h-12 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">Outfit</label>
            <select
              value={avatarConfig.outfit}
              onChange={(e) => setAvatarConfig({ ...avatarConfig, outfit: e.target.value })}
              className="w-full p-3 border rounded-lg"
            >
              <option value="casual">Casual</option>
              <option value="formal">Formal</option>
              <option value="sporty">Sporty</option>
              <option value="elegant">Elegant</option>
            </select>
          </div>

          <button
            onClick={createAvatar}
            className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Create Avatar
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-64 h-64 bg-white rounded-lg shadow-lg mb-4 flex items-center justify-center">
            <span className="text-6xl">👤</span>
          </div>
          <p className="text-gray-600">Avatar Preview</p>
          {avatar && (
            <p className="text-sm text-green-600 mt-2">✓ Avatar Created Successfully</p>
          )}
        </div>
      </div>
    </div>
  );
};

// VR Shopping Session
export const VRSession = ({ userId }) => {
  const [session, setSession] = useState(null);
  const [isActive, setIsActive] = useState(false);

  const startVRSession = async () => {
    try {
      const response = await axios.post('/api/next-gen/metaverse/vr/start', {
        userId,
        deviceType: 'oculus'
      });
      setSession(response.data.vrSession);
      setIsActive(true);
    } catch (error) {
      console.error('Error starting VR session:', error);
    }
  };

  const endVRSession = async () => {
    try {
      await axios.post('/api/next-gen/metaverse/vr/end', {
        sessionId: session.sessionId
      });
      setIsActive(false);
      alert('VR session ended');
    } catch (error) {
      console.error('Error ending VR session:', error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">VR Shopping Experience</h2>
      
      {!isActive ? (
        <div className="text-center py-8">
          <div className="mb-6">
            <span className="text-8xl">🥽</span>
          </div>
          <h3 className="text-xl font-semibold mb-4">Start VR Shopping</h3>
          <p className="text-gray-600 mb-6">
            Immerse yourself in a virtual shopping experience
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <button className="p-4 border rounded-lg hover:border-blue-500">
              <p className="font-semibold">Oculus</p>
            </button>
            <button className="p-4 border rounded-lg hover:border-blue-500">
              <p className="font-semibold">HTC Vive</p>
            </button>
            <button className="p-4 border rounded-lg hover:border-blue-500">
              <p className="font-semibold">PSVR</p>
            </button>
            <button className="p-4 border rounded-lg hover:border-blue-500">
              <p className="font-semibold">Cardboard</p>
            </button>
          </div>
          
          <button
            onClick={startVRSession}
            className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Launch VR Experience
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-semibold">🟢 VR Session Active</p>
            <p className="text-sm text-green-600">Session ID: {session.sessionId}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Products Viewed</p>
              <p className="text-2xl font-bold">15</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Cart Items</p>
              <p className="text-2xl font-bold">3</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-semibold">VR Features:</p>
            <div className="flex flex-wrap gap-2">
              {session.features.handTracking && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  👋 Hand Tracking
                </span>
              )}
              {session.features.voiceCommands && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  🎤 Voice Commands
                </span>
              )}
              {session.features.spatialAudio && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  🔊 Spatial Audio
                </span>
              )}
            </div>
          </div>

          <button
            onClick={endVRSession}
            className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            End VR Session
          </button>
        </div>
      )}
    </div>
  );
};

// 3D Product Gallery
export const Product3DGallery = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/next-gen/metaverse/3d-gallery');
      setProducts(response.data.gallery);
    } catch (error) {
      console.error('Error fetching 3D gallery:', error);
    }
    setLoading(false);
  };

  const view3DModel = (productId) => {
    window.open(`/3d-viewer/${productId}`, '_blank');
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">3D Product Gallery</h2>
      
      {loading ? (
        <div className="text-center py-8">Loading 3D models...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product.productId} className="border rounded-lg overflow-hidden shadow-lg">
              <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <span className="text-6xl">📦</span>
                <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs">
                  3D
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                <p className="text-2xl font-bold text-blue-600 mb-3">${product.price}</p>
                
                <div className="flex gap-2 mb-3">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                    ✓ VR Ready
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                    ✓ AR Ready
                  </span>
                </div>
                
                <button
                  onClick={() => view3DModel(product.productId)}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  View in 3D
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Virtual Try-On
export const VirtualTryOn = ({ productId, userId }) => {
  const [tryOnSession, setTryOnSession] = useState(null);

  const startTryOn = async () => {
    try {
      const response = await axios.post('/api/next-gen/metaverse/avatar/try-on', {
        userId,
        productId,
        avatarId: 'user-avatar-id'
      });
      setTryOnSession(response.data.tryOnSession);
    } catch (error) {
      console.error('Error starting try-on:', error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">Virtual Try-On</h3>
      
      {!tryOnSession ? (
        <button
          onClick={startTryOn}
          className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Try On in VR
        </button>
      ) : (
        <div className="space-y-4">
          <div className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-6xl">👕</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">Size Match</p>
              <p className="text-xl font-bold">{tryOnSession.fitAnalysis.sizeMatch}%</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">Style Match</p>
              <p className="text-xl font-bold">{tryOnSession.fitAnalysis.styleMatch}%</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button className="flex-1 py-2 bg-green-500 text-white rounded-lg">
              Add to Cart
            </button>
            <button className="flex-1 py-2 bg-blue-500 text-white rounded-lg">
              View in AR
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default {
  VirtualStore,
  AvatarCreator,
  VRSession,
  Product3DGallery,
  VirtualTryOn
};
