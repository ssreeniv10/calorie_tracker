import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Scale, Plus, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const WeightTrackingPage = () => {
  const { API_URL } = useAuth();
  const [weightEntries, setWeightEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newDate, setNewDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    fetchWeightEntries();
  }, []);

  const fetchWeightEntries = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/weight-entries`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setWeightEntries(response.data.entries || []);
    } catch (error) {
      console.error('Error fetching weight entries:', error);
      toast.error('Failed to load weight entries');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWeight = async () => {
    if (!newWeight || !newDate) {
      toast.error('Please enter both weight and date');
      return;
    }

    try {
      const weightEntry = {
        user_id: '', // Will be set by backend
        weight: parseFloat(newWeight),
        date: newDate
      };

      await axios.post(`${API_URL}/api/weight-entries`, weightEntry);
      
      toast.success('Weight logged successfully!');
      setShowAddModal(false);
      setNewWeight('');
      setNewDate(format(new Date(), 'yyyy-MM-dd'));
      
      // Refresh the entries
      await fetchWeightEntries();
    } catch (error) {
      console.error('Error adding weight:', error);
      toast.error('Failed to add weight entry');
    }
  };

  const calculateWeightChange = () => {
    if (weightEntries.length < 2) return null;
    
    const latest = weightEntries[0];
    const previous = weightEntries[1];
    
    return latest.weight - previous.weight;
  };

  const getWeightTrend = () => {
    if (weightEntries.length < 2) return null;
    
    const change = calculateWeightChange();
    if (change === null) return null;
    
    if (change > 0) return 'up';
    if (change < 0) return 'down';
    return 'stable';
  };

  const WeightCard = ({ entry, isLatest }) => (
    <div className={`card p-4 ${isLatest ? 'border-primary-200 bg-primary-50' : ''}`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-2xl font-bold text-gray-900">{entry.weight} kg</p>
          <p className="text-sm text-gray-600">
            {format(new Date(entry.date), 'MMM d, yyyy')}
          </p>
        </div>
        
        {isLatest && (
          <div className="text-primary-600">
            <Scale className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );

  const trend = getWeightTrend();
  const weightChange = calculateWeightChange();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading weight data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Weight Tracking</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Log Weight
          </button>
        </div>

        {/* Weight Summary */}
        {weightEntries.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Weight</h3>
              <p className="text-3xl font-bold text-primary-600">
                {weightEntries[0].weight} kg
              </p>
              <p className="text-sm text-gray-600">
                {format(new Date(weightEntries[0].date), 'MMM d, yyyy')}
              </p>
            </div>

            <div className="card p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Weight Change</h3>
              {weightChange !== null ? (
                <div className="flex items-center justify-center space-x-2">
                  {trend === 'up' && <TrendingUp className="h-6 w-6 text-red-500" />}
                  {trend === 'down' && <TrendingDown className="h-6 w-6 text-green-500" />}
                  {trend === 'stable' && <Minus className="h-6 w-6 text-gray-500" />}
                  <p className={`text-2xl font-bold ${
                    trend === 'up' ? 'text-red-500' : 
                    trend === 'down' ? 'text-green-500' : 
                    'text-gray-500'
                  }`}>
                    {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">No previous data</p>
              )}
            </div>

            <div className="card p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Entries</h3>
              <p className="text-3xl font-bold text-secondary-600">
                {weightEntries.length}
              </p>
              <p className="text-sm text-gray-600">Weight logs</p>
            </div>
          </div>
        )}

        {/* Weight History */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Weight History</h2>
          
          {weightEntries.length > 0 ? (
            <div className="space-y-4">
              {weightEntries.map((entry, index) => (
                <WeightCard 
                  key={entry.entry_id} 
                  entry={entry} 
                  isLatest={index === 0}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Scale className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No weight entries yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start tracking your weight to monitor your progress
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Log Your First Weight
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Weight Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Log Weight
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="500"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="input-field"
                  placeholder="Enter your weight"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddWeight}
                className="flex-1 btn-primary"
              >
                Log Weight
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeightTrackingPage;