import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Risk Score Display
export const RiskScoreIndicator = ({ riskScore, riskLevel }) => {
  const getColor = () => {
    if (riskLevel === 'high') return 'red';
    if (riskLevel === 'medium') return 'yellow';
    return 'green';
  };

  const color = getColor();

  return (
    <div className={`bg-${color}-50 border-2 border-${color}-500 rounded-lg p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Risk Score</p>
          <p className="text-3xl font-bold">{riskScore}/100</p>
        </div>
        <div className={`px-4 py-2 bg-${color}-500 text-white rounded-full font-bold`}>
          {riskLevel.toUpperCase()}
        </div>
      </div>
    </div>
  );
};

// Transaction Risk Analyzer
export const TransactionRiskAnalyzer = ({ orderData }) => {
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const analyzeRisk = async () => {
    setAnalyzing(true);
    try {
      const response = await axios.post('/api/next-gen/fraud-detection/analyze', orderData);
      setRiskAnalysis(response.data);
    } catch (error) {
      console.error('Error analyzing risk:', error);
    }
    setAnalyzing(false);
  };

  useEffect(() => {
    analyzeRisk();
  }, []);

  if (analyzing) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="mt-4">Analyzing transaction risk...</p>
      </div>
    );
  }

  if (!riskAnalysis) return null;

  return (
    <div className="space-y-4">
      <RiskScoreIndicator 
        riskScore={riskAnalysis.riskScore} 
        riskLevel={riskAnalysis.riskLevel} 
      />

      {/* Risk Factors */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">Risk Factors Detected</h3>
        
        {riskAnalysis.riskFactors.length === 0 ? (
          <p className="text-green-600">✓ No significant risk factors detected</p>
        ) : (
          <div className="space-y-3">
            {riskAnalysis.riskFactors.map((factor, index) => (
              <div key={index} className="border-l-4 border-red-500 bg-red-50 p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{factor.factor}</p>
                    <p className="text-sm text-gray-600">Severity: {factor.severity}</p>
                  </div>
                  <span className="text-lg font-bold text-red-600">+{factor.points}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Action */}
      <div className={`rounded-lg p-4 ${
        riskAnalysis.recommendedAction === 'approve' 
          ? 'bg-green-50 border border-green-200' 
          : riskAnalysis.recommendedAction === 'review'
          ? 'bg-yellow-50 border border-yellow-200'
          : 'bg-red-50 border border-red-200'
      }`}>
        <h4 className="font-bold mb-2">Recommended Action</h4>
        <p className="text-lg font-semibold capitalize">{riskAnalysis.recommendedAction}</p>
        
        {riskAnalysis.additionalChecks?.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-semibold mb-1">Additional Checks Required:</p>
            <ul className="text-sm space-y-1">
              {riskAnalysis.additionalChecks.map((check, index) => (
                <li key={index}>• {check.replace('-', ' ')}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* AI Confidence */}
      <div className="text-center text-sm text-gray-600">
        <p>AI Confidence: {(riskAnalysis.aiConfidence * 100).toFixed(1)}%</p>
      </div>
    </div>
  );
};

// Identity Verification Component
export const IdentityVerification = ({ userId }) => {
  const [verificationType, setVerificationType] = useState('email');
  const [session, setSession] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [verified, setVerified] = useState(false);

  const verificationTypes = [
    { type: 'email', icon: '📧', name: 'Email Verification' },
    { type: 'phone', icon: '📱', name: 'Phone Verification' },
    { type: 'document', icon: '📄', name: 'Document Upload' },
    { type: 'biometric', icon: '👤', name: 'Biometric Scan' }
  ];

  const initiateVerification = async () => {
    try {
      const response = await axios.post('/api/next-gen/fraud-detection/identity/initiate', {
        userId,
        verificationType
      });
      setSession(response.data.verificationSession);
    } catch (error) {
      console.error('Error initiating verification:', error);
    }
  };

  const verifyIdentity = async () => {
    try {
      const response = await axios.post('/api/next-gen/fraud-detection/identity/verify', {
        sessionId: session.sessionId,
        verificationCode
      });
      setVerified(true);
      alert('Identity verified successfully!');
    } catch (error) {
      console.error('Error verifying identity:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Identity Verification</h2>
      
      {!session ? (
        <div>
          <p className="mb-4">Choose verification method:</p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {verificationTypes.map(type => (
              <button
                key={type.type}
                onClick={() => setVerificationType(type.type)}
                className={`p-4 rounded-lg border-2 ${
                  verificationType === type.type
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300'
                }`}
              >
                <div className="text-3xl mb-2">{type.icon}</div>
                <p className="font-semibold">{type.name}</p>
              </button>
            ))}
          </div>
          
          <button
            onClick={initiateVerification}
            className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Start Verification
          </button>
        </div>
      ) : !verified ? (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              ℹ️ Verification session expires in 30 minutes
            </p>
          </div>

          {(verificationType === 'email' || verificationType === 'phone') && (
            <div>
              <label className="block mb-2 font-semibold">Enter Verification Code</label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full p-3 border rounded-lg text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength="6"
              />
            </div>
          )}

          {verificationType === 'document' && (
            <div>
              <label className="block mb-2 font-semibold">Upload Document</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-4xl mb-2">📄</p>
                <p className="text-gray-600">Drag and drop or click to upload</p>
                <input type="file" className="mt-4" accept="image/*,.pdf" />
              </div>
            </div>
          )}

          <button
            onClick={verifyIdentity}
            className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Verify Identity
          </button>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">✓</div>
          <h3 className="text-2xl font-bold text-green-600 mb-2">Identity Verified!</h3>
          <p className="text-gray-600">Your identity has been successfully verified</p>
        </div>
      )}
    </div>
  );
};

// Chargeback Risk Predictor
export const ChargebackRiskPredictor = ({ orderId }) => {
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChargebackRisk();
  }, [orderId]);

  const fetchChargebackRisk = async () => {
    try {
      const response = await axios.get(`/api/next-gen/fraud-detection/chargeback-risk/${orderId}`);
      setRisk(response.data);
    } catch (error) {
      console.error('Error fetching chargeback risk:', error);
    }
    setLoading(false);
  };

  if (loading) return <div>Analyzing chargeback risk...</div>;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4">Chargeback Risk Assessment</h3>
      
      <div className={`mb-4 p-4 rounded-lg ${
        risk.riskLevel === 'high' 
          ? 'bg-red-50 border border-red-200' 
          : risk.riskLevel === 'medium'
          ? 'bg-yellow-50 border border-yellow-200'
          : 'bg-green-50 border border-green-200'
      }`}>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Chargeback Probability</p>
            <p className="text-3xl font-bold">{risk.probability}</p>
          </div>
          <div className={`px-4 py-2 rounded-full font-bold ${
            risk.riskLevel === 'high' 
              ? 'bg-red-500 text-white' 
              : risk.riskLevel === 'medium'
              ? 'bg-yellow-500 text-white'
              : 'bg-green-500 text-white'
          }`}>
            {risk.riskLevel.toUpperCase()} RISK
          </div>
        </div>
      </div>

      {risk.riskIndicators?.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Risk Indicators:</h4>
          <div className="space-y-2">
            {risk.riskIndicators.map((indicator, index) => (
              <div key={index} className="bg-gray-50 rounded p-3">
                <p className="font-semibold">{indicator.indicator}</p>
                <p className="text-sm text-gray-600">{indicator.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-semibold mb-2">Prevention Recommendations:</h4>
        <ul className="text-sm space-y-1">
          {risk.preventionRecommendations?.map((rec, index) => (
            <li key={index}>• {rec}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Fraud Detection Dashboard
export const FraudDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState(7);

  useEffect(() => {
    fetchDashboard();
  }, [timeframe]);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get('/api/next-gen/fraud-detection/dashboard', {
        params: { timeframe }
      });
      setDashboard(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
    setLoading(false);
  };

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Fraud Detection Dashboard</h2>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="p-2 border rounded-lg"
        >
          <option value="1">Last 24 Hours</option>
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-lg p-6">
          <p className="text-sm opacity-90">Total Transactions</p>
          <p className="text-4xl font-bold">{dashboard.totalTransactions}</p>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded-lg p-6">
          <p className="text-sm opacity-90">Flagged</p>
          <p className="text-4xl font-bold">{dashboard.flaggedTransactions}</p>
        </div>
        
        <div className="bg-gradient-to-br from-red-400 to-red-600 text-white rounded-lg p-6">
          <p className="text-sm opacity-90">Blocked</p>
          <p className="text-4xl font-bold">{dashboard.blockedTransactions}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-400 to-green-600 text-white rounded-lg p-6">
          <p className="text-sm opacity-90">Loss Prevented</p>
          <p className="text-4xl font-bold">${dashboard.totalLossPrevented?.toFixed(0)}</p>
        </div>
      </div>

      {/* Risk Distribution */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">Risk Distribution</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{dashboard.riskDistribution?.low || 0}</p>
            <p className="text-sm text-gray-600">Low Risk</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-3xl font-bold text-yellow-600">{dashboard.riskDistribution?.medium || 0}</p>
            <p className="text-sm text-gray-600">Medium Risk</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-3xl font-bold text-red-600">{dashboard.riskDistribution?.high || 0}</p>
            <p className="text-sm text-gray-600">High Risk</p>
          </div>
        </div>
      </div>

      {/* Top Risk Factors */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">Top Risk Factors</h3>
        <div className="space-y-2">
          {dashboard.topRiskFactors?.map((factor, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-semibold">{factor.factor}</span>
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-bold">
                {factor.occurrences} occurrences
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">Recent Alerts</h3>
        <div className="space-y-2">
          {dashboard.recentAlerts?.slice(0, 5).map((alert, index) => (
            <div key={index} className="flex justify-between items-center p-3 border-l-4 border-red-500 bg-red-50">
              <div>
                <p className="font-semibold">Order: {alert.orderId}</p>
                <p className="text-sm text-gray-600">
                  {new Date(alert.timestamp).toLocaleString()}
                </p>
              </div>
              <span className="text-lg font-bold text-red-600">
                Risk: {alert.riskScore}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default {
  RiskScoreIndicator,
  TransactionRiskAnalyzer,
  IdentityVerification,
  ChargebackRiskPredictor,
  FraudDashboard
};
