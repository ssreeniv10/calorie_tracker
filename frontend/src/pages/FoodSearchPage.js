import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Search, Plus, Clock, Coffee, Sun, Moon, Cookie } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const FoodSearchPage = () => {
  const { API_URL } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [servings, setServings] = useState(1);

  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast', icon: Coffee },
    { value: 'lunch', label: 'Lunch', icon: Sun },
    { value: 'dinner', label: 'Dinner', icon: Moon },
    { value: 'snack', label: 'Snack', icon: Cookie }
  ];

  const searchFoods = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_URL}/api/foods/search`, {
        params: { query: searchQuery },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setSearchResults(response.data.foods || []);
    } catch (error) {
      console.error('Error searching foods:', error);
      toast.error('Failed to search foods');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchFoods();
    }
  };

  const openAddModal = (food) => {
    setSelectedFood(food);
    setServings(1);
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setSelectedFood(null);
    setServings(1);
  };

  const addFoodToLog = async () => {
    if (!selectedFood) return;

    try {
      const token = localStorage.getItem('authToken');
      const foodEntry = {
        user_id: '', // Will be set by backend
        food_id: selectedFood.fdcId.toString(),
        food_name: selectedFood.description,
        meal_type: selectedMeal,
        servings: servings,
        calories: selectedFood.calories * servings,
        protein: selectedFood.protein * servings,
        carbs: selectedFood.carbs * servings,
        fat: selectedFood.fat * servings,
        date: new Date().toISOString().split('T')[0]
      };

      await axios.post(`${API_URL}/api/food-entries`, foodEntry, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      toast.success(`Added ${selectedFood.description} to ${selectedMeal}!`);
      closeAddModal();
    } catch (error) {
      console.error('Error adding food:', error);
      toast.error('Failed to add food');
    }
  };

  const FoodCard = ({ food }) => (
    <div className="card p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 mb-1">{food.description}</h3>
          {food.brandName && (
            <p className="text-sm text-gray-600 mb-2">{food.brandName}</p>
          )}
          <p className="text-xs text-gray-500">
            Per {food.servingSize} {food.servingUnit}
          </p>
        </div>
        <button
          onClick={() => openAddModal(food)}
          className="btn-primary text-sm px-3 py-1"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </button>
      </div>
      
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-primary-50 p-2 rounded">
          <p className="text-xs text-primary-600 font-medium">Calories</p>
          <p className="text-sm font-semibold text-primary-700">{food.calories}</p>
        </div>
        <div className="bg-secondary-50 p-2 rounded">
          <p className="text-xs text-secondary-600 font-medium">Protein</p>
          <p className="text-sm font-semibold text-secondary-700">{food.protein}g</p>
        </div>
        <div className="bg-blue-50 p-2 rounded">
          <p className="text-xs text-blue-600 font-medium">Carbs</p>
          <p className="text-sm font-semibold text-blue-700">{food.carbs}g</p>
        </div>
        <div className="bg-purple-50 p-2 rounded">
          <p className="text-xs text-purple-600 font-medium">Fat</p>
          <p className="text-sm font-semibold text-purple-700">{food.fat}g</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Food Search</h1>

        {/* Meal Type Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add to meal:
          </label>
          <div className="flex flex-wrap gap-2">
            {mealTypes.map((meal) => {
              const Icon = meal.icon;
              return (
                <button
                  key={meal.value}
                  onClick={() => setSelectedMeal(meal.value)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    selectedMeal === meal.value
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{meal.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for foods (e.g., apple, chicken breast, oatmeal)"
              className="input-field pl-10 pr-24"
            />
            <button
              onClick={searchFoods}
              disabled={loading || !searchQuery.trim()}
              className="absolute right-2 top-2 btn-primary text-sm disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Search Results */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            <span className="ml-2 text-gray-600">Searching foods...</span>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Search Results ({searchResults.length})
            </h2>
            <div className="grid gap-4">
              {searchResults.map((food) => (
                <FoodCard key={food.fdcId} food={food} />
              ))}
            </div>
          </div>
        )}

        {!loading && searchQuery && searchResults.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No foods found
            </h3>
            <p className="text-gray-600">
              Try searching with different keywords or check your spelling
            </p>
          </div>
        )}

        {!searchQuery && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Search for foods
            </h3>
            <p className="text-gray-600">
              Enter a food name in the search bar to find nutrition information
            </p>
          </div>
        )}
      </div>

      {/* Add Food Modal */}
      {showAddModal && selectedFood && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add to {selectedMeal}
            </h3>
            
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">
                {selectedFood.description}
              </h4>
              {selectedFood.brandName && (
                <p className="text-sm text-gray-600 mb-2">{selectedFood.brandName}</p>
              )}
              <p className="text-xs text-gray-500">
                Per {selectedFood.servingSize} {selectedFood.servingUnit}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of servings:
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={servings}
                onChange={(e) => setServings(parseFloat(e.target.value) || 1)}
                className="input-field"
              />
            </div>

            <div className="mb-6">
              <h5 className="font-medium text-gray-900 mb-2">
                Nutrition (for {servings} serving{servings !== 1 ? 's' : ''}):
              </h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-primary-50 p-3 rounded">
                  <p className="text-primary-600 font-medium">Calories</p>
                  <p className="text-primary-700 font-semibold">
                    {(selectedFood.calories * servings).toFixed(0)}
                  </p>
                </div>
                <div className="bg-secondary-50 p-3 rounded">
                  <p className="text-secondary-600 font-medium">Protein</p>
                  <p className="text-secondary-700 font-semibold">
                    {(selectedFood.protein * servings).toFixed(1)}g
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-blue-600 font-medium">Carbs</p>
                  <p className="text-blue-700 font-semibold">
                    {(selectedFood.carbs * servings).toFixed(1)}g
                  </p>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <p className="text-purple-600 font-medium">Fat</p>
                  <p className="text-purple-700 font-semibold">
                    {(selectedFood.fat * servings).toFixed(1)}g
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={closeAddModal}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addFoodToLog}
                className="flex-1 btn-primary"
              >
                Add to {selectedMeal}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodSearchPage;