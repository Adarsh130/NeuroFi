import { Link } from 'react-router-dom';
import { Brain, TrendingUp, Shield, MessageSquare, ArrowRight, Star, Users, Zap } from 'lucide-react';
// Temporarily commenting out framer-motion to test
// import { motion } from 'framer-motion';

const Home = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Insights',
      description: 'Advanced machine learning algorithms analyze market patterns and provide intelligent trading recommendations.'
    },
    {
      icon: TrendingUp,
      title: 'Real-Time Market Data',
      description: 'Live cryptocurrency prices, volume, and market trends from Binance API with instant updates.'
    },
    {
      icon: MessageSquare,
      title: 'Sentiment Analysis',
      description: 'Social media sentiment tracking from Twitter to gauge market mood and predict price movements.'
    },
    {
      icon: Shield,
      title: 'Risk Management',
      description: 'Comprehensive risk assessment tools to help you make informed decisions and protect your investments.'
    }
  ];

  const stats = [
    { label: 'Active Users', value: '10,000+', icon: Users },
    { label: 'Accuracy Rate', value: '87%', icon: Star },
    { label: 'Markets Tracked', value: '500+', icon: TrendingUp },
    { label: 'AI Predictions', value: '1M+', icon: Zap }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-6">
              Trade Smarter with
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> AI</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              NeuroFi combines artificial intelligence, real-time market data, and social sentiment analysis 
              to provide you with the most accurate cryptocurrency trading insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth/signup"
                className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/about"
                className="border border-slate-300 dark:border-gray-600 hover:border-slate-400 dark:hover:border-gray-500 text-slate-900 dark:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="text-center"
                >
                  <Icon className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</div>
                  <div className="text-slate-600 dark:text-gray-400">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Powerful Features for Smart Trading
            </h2>
            <p className="text-xl text-slate-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our platform combines cutting-edge technology with intuitive design to give you 
              the edge in cryptocurrency trading.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl p-8 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300"
                >
                  <Icon className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 border border-primary/20 dark:border-primary/30 rounded-2xl p-12">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Ready to Transform Your Trading?
            </h2>
            <p className="text-xl text-slate-600 dark:text-gray-300 mb-8">
              Join thousands of traders who are already using AI to make smarter investment decisions.
            </p>
            <Link
              to="/auth/signup"
              className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 inline-flex items-center"
            >
              Start Trading with AI
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;