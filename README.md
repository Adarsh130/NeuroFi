# NeuroFi - AI-Powered Cryptocurrency Trading Platform

A modern, full-stack cryptocurrency trading platform with real-time data, AI predictions, and virtual trading capabilities.

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **MongoDB** (optional) - [Download here](https://www.mongodb.com/try/download/community)

### Installation & Running

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd NeuroFi
   ```

2. **Start the application**
   ```bash
   start.bat
   ```

That's it! The application will:
- ✅ Install all dependencies automatically
- ✅ Start MongoDB (if available)
- ✅ Launch backend API server
- ✅ Launch frontend development server
- ✅ Open your browser to http://localhost:5173

## 🎯 Features

### 💰 Virtual Trading
- **$10,000 starting balance** for new users
- **Buy/Sell cryptocurrencies** with real market prices
- **Portfolio tracking** with profit/loss calculations
- **Transaction history** and analytics

### 📊 Real Market Data
- **Live cryptocurrency prices** from Binance API
- **15+ supported cryptocurrencies** (BTC, ETH, BNB, SOL, ADA, XRP, etc.)
- **Real-time price charts** and market analysis
- **Market overview** with 24h changes and volume

### 🤖 AI Predictions
- **Machine learning price predictions** using multiple models
- **Confidence scoring** for each prediction
- **Trading recommendations** (BUY/SELL/HOLD)
- **Technical analysis** indicators

### 🔐 User Authentication
- **Secure registration and login**
- **Password encryption** with bcrypt
- **JWT token-based sessions**
- **User profiles and preferences**

### 🎨 Modern Interface
- **Dark/Light theme** support
- **Responsive design** for all devices
- **Real-time updates** without page refresh
- **Professional trading interface**

## 🌐 Application URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 🗄️ Database

The application works in two modes:

### With MongoDB (Full Features)
- **Persistent user accounts** and data
- **Transaction history** saved permanently
- **Real-time data** stored and cached
- **Install MongoDB** for full functionality

### Without MongoDB (Demo Mode)
- **Mock data** for immediate testing
- **Temporary sessions** (data not saved)
- **All features** work with sample data
- **No setup required**

## 📱 Supported Cryptocurrencies

- **Bitcoin (BTC)** - The original cryptocurrency
- **Ethereum (ETH)** - Smart contract platform
- **Binance Coin (BNB)** - Exchange token
- **Solana (SOL)** - High-performance blockchain
- **Cardano (ADA)** - Proof-of-stake blockchain
- **XRP** - Digital payment protocol
- **Polkadot (DOT)** - Multi-chain protocol
- **Chainlink (LINK)** - Oracle network
- **Litecoin (LTC)** - Digital silver
- **Bitcoin Cash (BCH)** - Bitcoin fork
- **Uniswap (UNI)** - DEX token
- **Polygon (MATIC)** - Ethereum scaling
- **Avalanche (AVAX)** - Smart contracts platform
- **Cosmos (ATOM)** - Internet of blockchains
- **Fantom (FTM)** - High-speed blockchain

## 🛠 Technology Stack

### Frontend
- **React 19** with modern hooks
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password encryption
- **Binance API** integration

### AI/ML
- **Custom algorithms** for price prediction
- **Technical analysis** indicators
- **Ensemble modeling** for accuracy
- **Real-time predictions**

## 🔧 Development

### Project Structure
```
NeuroFi/
├── src/                    # Frontend React app
├── backend/api/           # Backend Express server
├── public/               # Static assets
└── start.bat            # Application launcher
```

### Manual Development
If you want to run components separately:

**Backend:**
```bash
cd backend/api
npm install
npm run dev
```

**Frontend:**
```bash
npm install
npm run dev
```

## 🔒 Security Features

- **Password encryption** using bcrypt
- **JWT token authentication** with expiration
- **Rate limiting** to prevent abuse
- **Input validation** and sanitization
- **CORS protection** for API security

## 🎯 Getting Started

1. **Run the application**: `start.bat`
2. **Open your browser**: http://localhost:5173
3. **Register an account**: Create your trading profile
4. **Start trading**: Use your $10,000 virtual balance
5. **Explore features**: AI predictions, market analysis, portfolio tracking

## 🔧 Troubleshooting

### Application Won't Start
- **Check Node.js**: Ensure Node.js 18+ is installed
- **Port conflicts**: The app will automatically find available ports
- **Antivirus**: Some antivirus software may block the batch file

### MongoDB Issues
- **Not required**: App works without MongoDB using mock data
- **Installation**: Download from MongoDB official website
- **Service**: MongoDB should start automatically as a Windows service

### API Errors
- **Internet connection**: Required for real cryptocurrency data
- **Fallback**: App uses mock data if external APIs fail

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

**NeuroFi** - Trade smart with AI-powered insights and real-time cryptocurrency data! 🚀💰

## 🎉 One-Click Setup

**Just run `start.bat` and start trading!** No complex setup, no configuration files, no manual steps. Everything works out of the box with intelligent fallbacks and mock data support.