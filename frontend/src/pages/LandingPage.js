import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  Target, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  Smartphone,
  BarChart3,
  Heart
} from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: Target,
      title: 'Set & Track Goals',
      description: 'Set personalized calorie and nutrition goals based on your lifestyle and track your progress daily.',
      color: 'text-primary-500'
    },
    {
      icon: BarChart3,
      title: 'Visual Progress',
      description: 'Beautiful charts and progress bars help you visualize your nutrition journey at a glance.',
      color: 'text-secondary-500'
    },
    {
      icon: Heart,
      title: 'Comprehensive Database',
      description: 'Access thousands of foods with accurate nutrition data from the USDA FoodData Central.',
      color: 'text-red-500'
    },
    {
      icon: TrendingUp,
      title: 'Weight Tracking',
      description: 'Monitor your weight progress over time with intuitive graphs and trend analysis.',
      color: 'text-blue-500'
    },
    {
      icon: Smartphone,
      title: 'Mobile-First Design',
      description: 'Optimized for mobile devices with a clean, intuitive interface that works everywhere.',
      color: 'text-purple-500'
    },
    {
      icon: Users,
      title: 'Meal Planning',
      description: 'Organize your meals by breakfast, lunch, dinner, and snacks for better nutrition planning.',
      color: 'text-teal-500'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Active Users' },
    { number: '1M+', label: 'Meals Logged' },
    { number: '100K+', label: 'Foods Database' },
    { number: '4.8★', label: 'User Rating' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-primary-500 rounded-full animate-bounce-in">
                <Activity className="h-16 w-16 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
              Your Personal{' '}
              <span className="gradient-text">Nutrition Tracker</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto animate-slide-up">
              Take control of your health with FitTracker - the most intuitive calorie and nutrition tracking app. 
              Set goals, log meals, and visualize your progress with beautiful charts.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Link to="/register" className="btn-primary text-lg px-8 py-4">
                Start Your Journey
              </Link>
              <Link to="/login" className="btn-secondary text-lg px-8 py-4">
                Already have an account?
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to{' '}
              <span className="gradient-text">Stay Healthy</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              FitTracker provides all the tools you need to monitor your nutrition, 
              track your progress, and achieve your health goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="card p-8 text-center hover:shadow-xl transition-all duration-300">
                  <div className={`inline-block p-4 rounded-full bg-gray-50 mb-6 ${feature.color}`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Health?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of users who are already achieving their health goals with FitTracker.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Get Started Free
            </Link>
            <Link to="/login" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-2 mb-6">
              <Activity className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold">FitTracker</span>
            </div>
            <p className="text-gray-400 text-center mb-6">
              Your personal nutrition companion for a healthier lifestyle.
            </p>
            <div className="text-gray-400 text-sm">
              © 2024 FitTracker. Built with ❤️ for a healthier world.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;