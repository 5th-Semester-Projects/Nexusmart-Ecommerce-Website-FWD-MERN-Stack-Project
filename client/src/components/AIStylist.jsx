import React, { useState } from 'react';
import axios from 'axios';

// AI Stylist - Style Quiz Component
export const StyleQuiz = ({ userId, onComplete }) => {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState({
    stylePreference: '',
    favoriteColors: [],
    budget: '',
    occasions: [],
    bodyType: '',
    favoriteCategories: []
  });

  const styleOptions = ['casual', 'formal', 'sporty', 'elegant', 'bohemian', 'minimalist'];
  const colorOptions = ['black', 'white', 'blue', 'red', 'green', 'yellow', 'pink', 'purple'];
  const occasionOptions = ['work', 'party', 'casual', 'formal', 'sports', 'vacation'];

  const handleSubmit = async () => {
    try {
      const response = await axios.post('/api/next-gen/ai-stylist/style-quiz', {
        userId,
        preferences
      });
      onComplete(response.data);
    } catch (error) {
      console.error('Error submitting style quiz:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center">AI Style Quiz</h2>
      
      {step === 1 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">What's your style?</h3>
          <div className="grid grid-cols-2 gap-4">
            {styleOptions.map(style => (
              <button
                key={style}
                onClick={() => setPreferences({ ...preferences, stylePreference: style })}
                className={`p-4 rounded-lg border-2 ${
                  preferences.stylePreference === style 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300'
                }`}
              >
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Favorite Colors</h3>
          <div className="grid grid-cols-4 gap-4">
            {colorOptions.map(color => (
              <button
                key={color}
                onClick={() => {
                  const colors = preferences.favoriteColors.includes(color)
                    ? preferences.favoriteColors.filter(c => c !== color)
                    : [...preferences.favoriteColors, color];
                  setPreferences({ ...preferences, favoriteColors: colors });
                }}
                className={`h-16 rounded-lg border-4 ${
                  preferences.favoriteColors.includes(color)
                    ? 'border-blue-500'
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Budget Range</h3>
          <select
            value={preferences.budget}
            onChange={(e) => setPreferences({ ...preferences, budget: e.target.value })}
            className="w-full p-3 border rounded-lg"
          >
            <option value="">Select budget</option>
            <option value="50">Under $50</option>
            <option value="100">$50 - $100</option>
            <option value="200">$100 - $200</option>
            <option value="500">$200 - $500</option>
            <option value="1000">$500+</option>
          </select>
        </div>
      )}

      <div className="mt-6 flex justify-between">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="px-6 py-2 bg-gray-300 rounded-lg"
          >
            Back
          </button>
        )}
        {step < 3 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg ml-auto"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-500 text-white rounded-lg ml-auto"
          >
            Complete
          </button>
        )}
      </div>
    </div>
  );
};

// AI Stylist - Outfit Recommendations
export const OutfitRecommendations = ({ userId }) => {
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = async (occasion = 'casual') => {
    setLoading(true);
    try {
      const response = await axios.get('/api/next-gen/ai-stylist/outfit-recommendations', {
        params: { userId, occasion }
      });
      setOutfits(response.data.outfits);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    fetchRecommendations();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Your Outfit Recommendations</h2>
      
      <div className="mb-4 flex gap-2">
        {['casual', 'formal', 'party', 'work'].map(occasion => (
          <button
            key={occasion}
            onClick={() => fetchRecommendations(occasion)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            {occasion}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {outfits.map((outfit, index) => (
            <div key={outfit.outfitId} className="border rounded-lg p-4 shadow-lg">
              <h3 className="font-semibold mb-2">Outfit {index + 1}</h3>
              <div className="mb-2">
                <span className="text-sm text-gray-600">
                  Style Match: {outfit.styleMatch}%
                </span>
              </div>
              <div className="space-y-2">
                {outfit.items.map((item, idx) => (
                  <div key={idx} className="text-sm">
                    {item.name} - ${item.price}
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full py-2 bg-green-500 text-white rounded-lg">
                Add All to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Virtual Styling Session Booking
export const StylingSessionBooking = ({ userId }) => {
  const [formData, setFormData] = useState({
    stylistId: '',
    preferredDate: '',
    preferredTime: '',
    sessionType: 'video',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/next-gen/ai-stylist/styling-session', {
        userId,
        ...formData
      });
      alert('Styling session booked successfully!');
    } catch (error) {
      console.error('Error booking session:', error);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Book Virtual Styling Session</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">Session Type</label>
          <select
            value={formData.sessionType}
            onChange={(e) => setFormData({ ...formData, sessionType: e.target.value })}
            className="w-full p-3 border rounded-lg"
          >
            <option value="video">Video Call</option>
            <option value="chat">Text Chat</option>
            <option value="in-person">In-Person</option>
          </select>
        </div>

        <div>
          <label className="block mb-2">Preferred Date</label>
          <input
            type="date"
            value={formData.preferredDate}
            onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
            className="w-full p-3 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block mb-2">Preferred Time</label>
          <input
            type="time"
            value={formData.preferredTime}
            onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
            className="w-full p-3 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block mb-2">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full p-3 border rounded-lg"
            rows="3"
            placeholder="Tell us about your styling needs..."
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Book Session
        </button>
      </form>
    </div>
  );
};

export default { StyleQuiz, OutfitRecommendations, StylingSessionBooking };
