import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Save,
  X,
  Camera,
  Shield,
  Bell,
  Key,
  Activity,
  TrendingUp,
  Award,
  Target,
  Database,
  Wallet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import { useTradingStore } from '../store/tradingStore';
import { useWalletStore } from '../store/walletStore';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState(null);
  const [savedData, setSavedData] = useState(null);
  
  const { activeTrades, tradeHistory, getTradeStats } = useTradingStore();
  const { getActiveWallet, getWalletValue } = useWalletStore();
  
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Demo User',
    email: user?.email || 'demo@neurofi.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    joinDate: '2024-01-15',
    bio: 'Cryptocurrency enthusiast and AI trading advocate. Passionate about leveraging technology for smarter investment decisions.',
    tradingExperience: 'Intermediate',
    riskTolerance: 'Medium',
    preferredAssets: ['Bitcoin', 'Ethereum', 'Cardano']
  });

  // Load user data from MongoDB
  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (authService.isAuthenticated()) {
          const user = await authService.getProfile();
          setUserData(user);
          setSavedData(user.preferences || {});
          
          // Update profile data with saved information
          if (user) {
            setProfileData(prev => ({
              ...prev,
              name: user.firstName + ' ' + user.lastName,
              email: user.email,
              joinDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : prev.joinDate
            }));
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  const [tradingStats] = useState({
    totalTrades: 156,
    successRate: 73.2,
    totalProfit: 12450.75,
    bestTrade: 2340.50,
    avgHoldTime: '3.2 days',
    favoriteStrategy: 'AI Recommendations'
  });

  const [achievements] = useState([
    {
      id: 1,
      title: 'First Trade',
      description: 'Completed your first trade',
      icon: Target,
      earned: true,
      date: '2024-01-20'
    },
    {
      id: 2,
      title: 'Profit Maker',
      description: 'Achieved 10% portfolio growth',
      icon: TrendingUp,
      earned: true,
      date: '2024-02-15'
    },
    {
      id: 3,
      title: 'AI Adopter',
      description: 'Used AI recommendations 50 times',
      icon: Award,
      earned: true,
      date: '2024-03-01'
    },
    {
      id: 4,
      title: 'Risk Manager',
      description: 'Maintained low risk score for 30 days',
      icon: Shield,
      earned: false,
      date: null
    }
  ]);

  const handleSave = () => {
    // Save profile data
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset changes
    setIsEditing(false);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'trading', label: 'Trading Stats', icon: Activity },
    { id: 'saved-data', label: 'Saved Data', icon: Database },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Profile</h1>
          <p className="text-gray-400 mt-1">
            Manage your account settings and preferences
          </p>
        </div>
      </motion.div>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8"
      >
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
              <User className="h-12 w-12 text-white" />
            </div>
            <button className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 text-white p-2 rounded-full transition-colors">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">
              {profileData.name}
            </h2>
            <p className="text-gray-400 mb-4">{profileData.bio}</p>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Joined {new Date(profileData.joinDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{profileData.location}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Edit3 className="h-4 w-4" />
            <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-2"
      >
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'text-gray-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
      >
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-6">
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                disabled={!isEditing}
                rows={4}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
              />
            </div>
            
            {isEditing && (
              <div className="flex space-x-4">
                <button
                  onClick={handleSave}
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'trading' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-6">
              Trading Statistics
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-2">Total Trades</div>
                <div className="text-2xl font-bold text-white">
                  {tradingStats.totalTrades}
                </div>
              </div>
              
              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-2">Success Rate</div>
                <div className="text-2xl font-bold text-green-400">
                  {tradingStats.successRate}%
                </div>
              </div>
              
              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-2">Total Profit</div>
                <div className="text-2xl font-bold text-green-400">
                  ${tradingStats.totalProfit.toLocaleString()}
                </div>
              </div>
              
              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-2">Best Trade</div>
                <div className="text-2xl font-bold text-white">
                  ${tradingStats.bestTrade.toLocaleString()}
                </div>
              </div>
              
              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-2">Avg Hold Time</div>
                <div className="text-2xl font-bold text-white">
                  {tradingStats.avgHoldTime}
                </div>
              </div>
              
              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-2">Favorite Strategy</div>
                <div className="text-lg font-bold text-primary">
                  {tradingStats.favoriteStrategy}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'saved-data' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-6">
              MongoDB Saved Data
            </h3>
            
            {userData ? (
              <div className="space-y-6">
                {/* User Information */}
                <div className="bg-slate-700/30 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-primary" />
                    User Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">User ID:</span>
                      <span className="text-white ml-2 font-mono">{userData._id}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Username:</span>
                      <span className="text-white ml-2">{userData.username}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Email:</span>
                      <span className="text-white ml-2">{userData.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Name:</span>
                      <span className="text-white ml-2">{userData.firstName} {userData.lastName}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Created:</span>
                      <span className="text-white ml-2">{new Date(userData.createdAt).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Last Updated:</span>
                      <span className="text-white ml-2">{new Date(userData.updatedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Trading Data */}
                {savedData?.tradingData && (
                  <div className="bg-slate-700/30 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
                      Trading Data
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Active Trades:</span>
                        <span className="text-white ml-2">{savedData.tradingData.activeTrades?.length || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Demo Balance:</span>
                        <span className="text-white ml-2">${savedData.tradingData.demoBalance?.USDT?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Last Trade:</span>
                        <span className="text-white ml-2">
                          {savedData.tradingData.lastTradeTime 
                            ? new Date(savedData.tradingData.lastTradeTime).toLocaleString()
                            : 'Never'
                          }
                        </span>
                      </div>
                    </div>
                    
                    {savedData.tradingData.activeTrades?.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-white font-medium mb-2">Recent Active Trades:</h5>
                        <div className="space-y-2">
                          {savedData.tradingData.activeTrades.slice(0, 3).map((trade, index) => (
                            <div key={index} className="bg-slate-600/30 rounded p-3 text-xs">
                              <div className="flex justify-between items-center">
                                <span className="text-white">
                                  {trade.action} {trade.symbol} - ${trade.amount}
                                </span>
                                <span className={`${
                                  (trade.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  {(trade.pnl || 0) >= 0 ? '+' : ''}${(trade.pnl || 0).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Wallet Data */}
                {savedData?.walletData && (
                  <div className="bg-slate-700/30 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Wallet className="h-5 w-5 mr-2 text-yellow-400" />
                      Wallet Data
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Total Value:</span>
                        <span className="text-white ml-2">${savedData.walletData.totalValue?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Active Trades:</span>
                        <span className="text-white ml-2">{savedData.walletData.activeTrades || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Last Updated:</span>
                        <span className="text-white ml-2">
                          {savedData.walletData.lastUpdated 
                            ? new Date(savedData.walletData.lastUpdated).toLocaleString()
                            : 'Never'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Demo Funds History */}
                {savedData?.lastDemoFundsAdded && (
                  <div className="bg-slate-700/30 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Database className="h-5 w-5 mr-2 text-blue-400" />
                      Last Demo Funds Added
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Amount:</span>
                        <span className="text-white ml-2">${savedData.lastDemoFundsAdded.amount}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Timestamp:</span>
                        <span className="text-white ml-2">
                          {new Date(savedData.lastDemoFundsAdded.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Watchlist */}
                {savedData?.watchlist && savedData.watchlist.length > 0 && (
                  <div className="bg-slate-700/30 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Watchlist</h4>
                    <div className="flex flex-wrap gap-2">
                      {savedData.watchlist.map((symbol, index) => (
                        <span key={index} className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm">
                          {symbol}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw Data (for debugging) */}
                <div className="bg-slate-700/30 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Raw Preferences Data</h4>
                  <pre className="bg-slate-800 p-4 rounded text-xs text-gray-300 overflow-auto max-h-64">
                    {JSON.stringify(savedData, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Database className="h-12 w-12 mx-auto mb-3 text-gray-400 opacity-50" />
                <p className="text-gray-400">No user data found</p>
                <p className="text-sm text-gray-500 mt-1">Please log in to view saved data</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-6">
              Achievements
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => {
                const Icon = achievement.icon;
                return (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border ${
                      achievement.earned
                        ? 'bg-green-400/10 border-green-400/20'
                        : 'bg-slate-700/30 border-slate-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-8 w-8 ${
                        achievement.earned ? 'text-green-400' : 'text-gray-400'
                      }`} />
                      <div className="flex-1">
                        <h4 className={`font-semibold ${
                          achievement.earned ? 'text-white' : 'text-gray-400'
                        }`}>
                          {achievement.title}
                        </h4>
                        <p className="text-sm text-gray-400">
                          {achievement.description}
                        </p>
                        {achievement.earned && achievement.date && (
                          <p className="text-xs text-green-400 mt-1">
                            Earned on {new Date(achievement.date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-6">
              Security Settings
            </h3>
            
            <div className="space-y-4">
              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Key className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="text-white font-medium">Change Password</h4>
                      <p className="text-sm text-gray-400">
                        Update your account password
                      </p>
                    </div>
                  </div>
                  <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Change
                  </button>
                </div>
              </div>
              
              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="text-white font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-400">
                        Add an extra layer of security
                      </p>
                    </div>
                  </div>
                  <button className="bg-green-400 hover:bg-green-400/90 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Enabled
                  </button>
                </div>
              </div>
              
              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="text-white font-medium">Email Notifications</h4>
                      <p className="text-sm text-gray-400">
                        Manage your notification preferences
                      </p>
                    </div>
                  </div>
                  <button className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Configure
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Profile;