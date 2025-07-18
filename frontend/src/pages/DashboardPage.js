import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Target, 
  TrendingUp, 
  Calendar,
  Activity,
  Scale,
  Search,
  Coffee,
  Sun,
  Moon,
  Cookie
} from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const { user, API_URL } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedDate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/dashboard`, {
        params: { date: selectedDate },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getMealIcon = (mealType) => {
    switch (mealType) {
      case 'breakfast':
        return Coffee;
      case 'lunch':
        return Sun;
      case 'dinner':
        return Moon;
      case 'snack':
        return Cookie;
      default:
        return Activity;
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-primary-500';
    if (percentage >= 60) return 'bg-secondary-500';
    return 'bg-gray-400';
  };

  const NutritionCard = ({ title, current, goal, unit, color }) => {
    const percentage = goal > 0 ? (current / goal) * 100 : 0;
    
    return (
      <div className="card p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <span className={`text-xs px-2 py-1 rounded-full ${
            percentage >= 100 ? 'bg-red-100 text-red-800' :
            percentage >= 80 ? 'bg-primary-100 text-primary-800' :
            percentage >= 60 ? 'bg-secondary-100 text-secondary-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {percentage.toFixed(0)}%
          </span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-bold text-gray-900">
              {current.toFixed(0)}
            </span>
            <span className="text-sm text-gray-500">
              / {goal.toFixed(0)} {unit}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${color}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>0</span>
            <span>{goal.toFixed(0)}</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.username}! 👋
          </h1>
          <p className="text-gray-600">
            Here's your nutrition overview for today
          </p>
        </div>

        {/* Date Selector */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Calendar className="h-5 w-5 text-primary-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field max-w-xs"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <NutritionCard
            title="Calories"
            current={dashboardData?.total_nutrition?.calories || 0}
            goal={dashboardData?.user_goals?.daily_calorie_goal || 2000}
            unit="kcal"
            color="bg-gradient-to-r from-primary-500 to-primary-600"
          />
          <NutritionCard
            title="Protein"
            current={dashboardData?.total_nutrition?.protein || 0}
            goal={dashboardData?.user_goals?.daily_protein_goal || 150}
            unit="g"
            color="bg-gradient-to-r from-secondary-500 to-secondary-600"
          />
          <NutritionCard
            title="Carbs"
            current={dashboardData?.total_nutrition?.carbs || 0}
            goal={dashboardData?.user_goals?.daily_carb_goal || 250}
            unit="g"
            color="bg-gradient-to-r from-blue-500 to-blue-600"
          />
          <NutritionCard
            title="Fat"
            current={dashboardData?.total_nutrition?.fat || 0}
            goal={dashboardData?.user_goals?.daily_fat_goal || 67}
            unit="g"
            color="bg-gradient-to-r from-purple-500 to-purple-600"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link to="/food-search" className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary-100 rounded-full">
                <Search className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Log Food</h3>
                <p className="text-sm text-gray-600">Search and add food to your diary</p>
              </div>
            </div>
          </Link>

          <Link to="/weight-tracking" className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-secondary-100 rounded-full">
                <Scale className="h-6 w-6 text-secondary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Log Weight</h3>
                <p className="text-sm text-gray-600">Track your weight progress</p>
              </div>
            </div>
          </Link>

          <Link to="/profile" className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Update Goals</h3>
                <p className="text-sm text-gray-600">Adjust your nutrition targets</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Today's Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Meal Summary */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Today's Meals</h2>
                <Link to="/food-search" className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Food
                </Link>
              </div>

              {dashboardData?.entries_count > 0 ? (
                <div className="space-y-4">
                  {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => {
                    const MealIcon = getMealIcon(mealType);
                    return (
                      <div key={mealType} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <MealIcon className="h-5 w-5 text-gray-600" />
                            <h3 className="font-medium text-gray-900 capitalize">
                              {mealType}
                            </h3>
                          </div>
                          <Link 
                            to={`/food-search?meal=${mealType}`}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            Add Food
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No meals logged yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Start logging your meals to track your nutrition
                  </p>
                  <Link to="/food-search" className="btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Log Your First Meal
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Stats Panel */}
          <div className="space-y-6">
            {/* Weight Card */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Weight</h3>
              {dashboardData?.latest_weight ? (
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">
                    {dashboardData.latest_weight.weight} kg
                  </div>
                  <div className="text-sm text-gray-600">
                    Last updated: {format(new Date(dashboardData.latest_weight.date), 'MMM d, yyyy')}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Scale className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm mb-3">No weight logged yet</p>
                  <Link to="/weight-tracking" className="btn-secondary text-sm">
                    Log Weight
                  </Link>
                </div>
              )}
            </div>

            {/* Today's Progress */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Progress</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Meals logged</span>
                  <span className="font-medium">{dashboardData?.entries_count || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Calories remaining</span>
                  <span className="font-medium">
                    {Math.max(0, (dashboardData?.user_goals?.daily_calorie_goal || 2000) - (dashboardData?.total_nutrition?.calories || 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;