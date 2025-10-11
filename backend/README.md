# NeuroFi Backend

AI-powered cryptocurrency trading platform backend with authentication, market data, and machine learning services.

## Architecture

```
backend/
├── api/                 # Node.js/Express API server
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Authentication, validation
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── utils/           # Utilities
│   ├── config/          # Configuration
│   └── server.js        # Main server file
├── ml-service/          # Python ML service
│   ├── models/          # ML models
│   ├── services/        # ML services
│   ├── api/             # FastAPI application
│   └── requirements.txt # Python dependencies
└── docker-compose.yml   # Docker orchestration
```

## Features

### API Server (Node.js)
- **Authentication**: JWT-based user authentication with MongoDB
- **User Management**: Registration, login, profile management
- **Market Data**: Real-time cryptocurrency data from Binance API
- **Security**: Password encryption, rate limiting, input validation
- **Database**: MongoDB with Mongoose ODM

### ML Service (Python)
- **Sentiment Analysis**: News and social media sentiment analysis
- **Price Prediction**: LSTM-based price prediction models
- **Technical Analysis**: Technical indicators and signals
- **AI Recommendations**: Multi-factor trading recommendations
- **Data Processing**: Real-time data fetching and processing

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Using Docker (Recommended)

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Copy environment files**
   ```bash
   cp api/.env.example api/.env
   cp ml-service/.env.example ml-service/.env
   ```

3. **Update environment variables**
   Edit the `.env` files with your configuration:
   - MongoDB credentials
   - JWT secret
   - API keys (News API, etc.)
   - Binance API keys (optional)

4. **Start all services**
   ```bash
   docker-compose up -d
   ```

5. **Check service health**
   ```bash
   # API health check
   curl http://localhost:5000/health
   
   # ML service health check
   curl http://localhost:8000/health
   ```

### Local Development

#### API Server Setup

1. **Navigate to API directory**
   ```bash
   cd api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB (using Docker)**
   ```bash
   docker run -d -p 27017:27017 --name mongodb \
     -e MONGO_INITDB_ROOT_USERNAME=admin \
     -e MONGO_INITDB_ROOT_PASSWORD=password123 \
     mongo:7.0
   ```

5. **Start the API server**
   ```bash
   npm run dev
   ```

#### ML Service Setup

1. **Navigate to ML service directory**
   ```bash
   cd ml-service
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Start the ML service**
   ```bash
   python -m uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Market Data
- `GET /api/market/price/:symbol` - Get current price
- `GET /api/market/ticker/:symbol` - Get 24hr ticker
- `GET /api/market/klines/:symbol` - Get candlestick data
- `GET /api/market/top-pairs` - Get top trading pairs

### ML Services
- `GET /api/ml/sentiment` - Get sentiment analysis
- `GET /api/ml/predictions` - Get price predictions
- `GET /api/ml/recommendations` - Get AI recommendations
- `GET /api/ml/technical-analysis/:symbol` - Get technical analysis

## Configuration

### Environment Variables

#### API Server (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/neurofi
JWT_SECRET=your-super-secret-jwt-key
ML_SERVICE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```

#### ML Service (.env)
```env
ENVIRONMENT=development
HOST=0.0.0.0
PORT=8000
NEWS_API_KEY=your-news-api-key
CRYPTO_NEWS_API_KEY=your-crypto-news-api-key
```

### Database Schema

#### User Model
```javascript
{
  username: String,
  email: String,
  password: String (encrypted),
  firstName: String,
  lastName: String,
  role: String,
  preferences: {
    theme: String,
    currency: String,
    notifications: Object,
    watchlist: Array
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

- **Password Encryption**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configurable CORS policies
- **Helmet Security**: Security headers middleware

## Machine Learning Models

### Sentiment Analysis
- **VADER Sentiment**: Rule-based sentiment analysis
- **TextBlob**: Statistical sentiment analysis
- **Data Sources**: News APIs, Reddit, social media

### Price Prediction
- **LSTM Networks**: Long Short-Term Memory neural networks
- **Features**: Price data, technical indicators, volume, sentiment
- **Timeframes**: 1h, 4h, 1d, 7d predictions

### Technical Analysis
- **Indicators**: RSI, MACD, Bollinger Bands, SMA, EMA, ADX
- **Signals**: Buy/sell/hold signals based on technical patterns
- **Support/Resistance**: Automatic level detection

### AI Recommendations
- **Multi-factor Analysis**: Combines sentiment, technical, and prediction data
- **Risk Levels**: Low, medium, high risk configurations
- **Position Sizing**: Automatic position size recommendations

## Monitoring and Logging

### Health Checks
- API: `GET /health`
- ML Service: `GET /health`

### Logging
- Structured logging with timestamps
- Error tracking and reporting
- Performance monitoring

### Metrics
- Request/response times
- Error rates
- Model performance metrics
- User activity tracking

## Deployment

### Production Deployment

1. **Update environment variables for production**
2. **Use production MongoDB cluster**
3. **Configure SSL certificates**
4. **Set up monitoring and alerting**
5. **Configure backup strategies**

### Scaling

- **Horizontal Scaling**: Multiple API server instances
- **Load Balancing**: Nginx or cloud load balancer
- **Database Scaling**: MongoDB replica sets
- **Caching**: Redis for session and data caching

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check MongoDB is running
   - Verify connection string
   - Check network connectivity

2. **ML Service Not Responding**
   - Check Python dependencies
   - Verify model files exist
   - Check memory usage

3. **Authentication Errors**
   - Verify JWT secret configuration
   - Check token expiration
   - Validate user permissions

### Logs Location
- API logs: `docker logs neurofi-api`
- ML service logs: `docker logs neurofi-ml-service`
- MongoDB logs: `docker logs neurofi-mongodb`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details