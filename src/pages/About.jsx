import { Brain, TrendingUp, Shield, MessageSquare, Users, Award, Zap, Target } from 'lucide-react';
import { motion } from 'framer-motion';

const About = () => {
  const features = [
    {
      icon: Brain,
      title: 'Advanced AI Models',
      description: 'Our proprietary machine learning algorithms analyze thousands of market indicators to provide accurate predictions.'
    },
    {
      icon: TrendingUp,
      title: 'Real-Time Data',
      description: 'Direct integration with Binance API ensures you get the most up-to-date market information.'
    },
    {
      icon: MessageSquare,
      title: 'Sentiment Analysis',
      description: 'Track social media sentiment across Twitter and other platforms to gauge market mood.'
    },
    {
      icon: Shield,
      title: 'Risk Management',
      description: 'Comprehensive risk assessment tools help you make informed decisions and protect your investments.'
    }
  ];

  const team = [
    {
      name: 'Alex Chen',
      role: 'CEO & AI Researcher',
      description: 'Former Google AI researcher with 10+ years in machine learning and financial markets.'
    },
    {
      name: 'Sarah Johnson',
      role: 'CTO & Blockchain Expert',
      description: 'Ex-Coinbase engineer specializing in cryptocurrency infrastructure and trading systems.'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Head of Data Science',
      description: 'PhD in Statistics with expertise in financial modeling and predictive analytics.'
    },
    {
      name: 'Emily Zhang',
      role: 'Lead Product Designer',
      description: 'Award-winning UX designer focused on creating intuitive financial technology interfaces.'
    }
  ];

  const stats = [
    { icon: Users, label: 'Active Users', value: '10,000+' },
    { icon: Award, label: 'Accuracy Rate', value: '87%' },
    { icon: Zap, label: 'Predictions Made', value: '1M+' },
    { icon: Target, label: 'Markets Covered', value: '500+' }
  ];

  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            About <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">NeuroFi</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-gray-300 max-w-3xl mx-auto">
            We're revolutionizing cryptocurrency trading by combining artificial intelligence, 
            real-time market data, and social sentiment analysis to give traders the edge they need.
          </p>
        </motion.div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-20"
        >
          <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 text-center">Our Mission</h2>
            <p className="text-lg text-slate-600 dark:text-gray-300 text-center max-w-4xl mx-auto leading-relaxed">
              To democratize access to sophisticated trading insights by making AI-powered market analysis 
              accessible to everyone. We believe that with the right tools and information, anyone can make 
              informed investment decisions in the cryptocurrency market.
            </p>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-20"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <Icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{stat.value}</div>
                <div className="text-slate-600 dark:text-gray-400">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-12">What Makes Us Different</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl p-8 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                >
                  <Icon className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="text-center"
              >
                <div className="w-24 h-24 bg-gradient-to-r from-primary to-accent rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{member.name}</h3>
                <p className="text-primary font-medium mb-3">{member.role}</p>
                <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed">{member.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Technology Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-20"
        >
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 border border-primary/20 dark:border-primary/30 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-6">Our Technology Stack</h2>
            <p className="text-lg text-slate-600 dark:text-gray-300 text-center mb-8 max-w-3xl mx-auto">
              Built with cutting-edge technologies to ensure reliability, scalability, and performance.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {['React.js', 'Python/Flask', 'TensorFlow', 'Binance API', 'Twitter API', 'PostgreSQL', 'Redis', 'AWS'].map((tech) => (
                <div key={tech} className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-4">
                  <span className="text-slate-900 dark:text-white font-medium">{tech}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Get In Touch</h2>
          <p className="text-lg text-slate-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Have questions about our platform or want to learn more about our AI technology? 
            We'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:contact@neurofi.com"
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300"
            >
              Contact Us
            </a>
            <a
              href="#"
              className="border border-slate-300 dark:border-gray-600 hover:border-slate-400 dark:hover:border-gray-500 text-slate-900 dark:text-white px-8 py-3 rounded-lg font-medium transition-all duration-300"
            >
              Schedule Demo
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;