import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Progress } from './ui/progress';

const PlacementPrediction = () => {
  const { user } = useSelector(store => store.auth);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchPrediction = async () => {
    if (!user || !user.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/v1/predict/${user.id}`);
      if (response.data.success) {
        setPrediction(response.data.prediction);
      } else {
        setError(response.data.error || 'Failed to get prediction');
      }
    } catch (error) {
      setError(error.response?.data?.error || error.message || 'Failed to fetch placement prediction');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction();
  }, [user]);

  const getStatusColor = (probability) => {
    if (probability >= 80) return 'bg-green-500';
    if (probability >= 60) return 'bg-blue-500';
    if (probability >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusText = (probability) => {
    if (probability >= 80) return 'Excellent';
    if (probability >= 60) return 'Good';
    if (probability >= 40) return 'Needs Improvement';
    return 'Critical';
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-center h-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
        <p className="text-center text-gray-500">Loading your placement prediction...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="text-red-500 mb-2">Error loading prediction</div>
        <p className="text-gray-700">{error}</p>
        <button 
          onClick={fetchPrediction}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="text-gray-700 mb-2">No prediction available</div>
        <p>We couldn't generate a placement prediction. Please complete your profile to get accurate predictions.</p>
        <button 
          onClick={fetchPrediction}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-xl">Placement Probability</h3>
          <div className={`px-3 py-1 rounded-full text-white text-sm ${getStatusColor(prediction.placement_probability)}`}>
            {getStatusText(prediction.placement_probability)}
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Likelihood</span>
            <span className="font-semibold">{prediction.placement_probability.toFixed(1)}%</span>
          </div>
          <Progress 
            value={prediction.placement_probability} 
            indicatorClassName={getStatusColor(prediction.placement_probability)}
          />
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Key Factors</h4>
            <div className="grid grid-cols-2 gap-3">
              {prediction.factors && prediction.factors.map((factor, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-500">{factor.name}</p>
                  <p className="font-medium">{factor.value}</p>
                </div>
              ))}
            </div>
          </div>
          
          {showDetails && prediction.recommendations && prediction.recommendations.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Recommendations</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {prediction.recommendations.map((recommendation, index) => (
                  <li key={index}>{recommendation}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="flex justify-between mt-6">
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-500 hover:text-blue-700"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
          <button 
            onClick={fetchPrediction}
            className="text-gray-500 hover:text-gray-700 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlacementPrediction; 