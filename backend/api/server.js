import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB, closeDB, isConnected } from './config/database.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import marketRoutes from './routes/market.js';
import mlRoutes from './routes/ml.js';
import walletRoutes from './routes/wallet.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

// Import services
import binanceService from './services/binanceService.js';
import mlPredictionService from './services/mlPredictionService.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Function to find available port
const findAvailablePort = async (startPort) => {
  const net = await import('net');
  
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    
    server.on('error', () => {
      resolve(findAvailablePort(startPort + 1));
    });
  });
};

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(limiter);
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  optionsSuccessStatus: 200
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// MongoDB connection status is handled by database.js

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: isConnected() ? 'connected' : 'disconnected',
    services: {
      binance: 'active',
      mlPredictions: 'active'
    },
    mode: 'PRODUCTION' // No demo mode
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/wallet', walletRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'NeuroFi Backend API - Cryptocurrency Trading Platform',
    version: '2.0.0',
    mode: 'PRODUCTION',
    features: [
      'Real-time cryptocurrency data from Binance',
      'Machine learning price predictions',
      'Virtual trading wallet',
      'Portfolio management',
      'User authentication with encrypted passwords'
    ],
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      market: '/api/market',
      ml: '/api/ml',
      wallet: '/api/wallet'
    }
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// MySQL connection is handled in config/database.js

// Start automated services
const startAutomatedServices = () => {
  console.log('🚀 Starting automated services...');
  
  try {
    // Start price updates every 2 minutes (only if MongoDB is connected)
    if (isConnected()) {
      binanceService.startPriceUpdates(2);
    } else {
      console.log('⚠️ Skipping price updates - MongoDB not connected');
    }
    
    // Start ML predictions every 30 minutes (only if MongoDB is connected)
    if (isConnected()) {
      mlPredictionService.startAutomatedPredictions(30);
    } else {
      console.log('⚠️ Skipping ML predictions - MongoDB not connected');
    }
    
    console.log('✅ Automated services started');
  } catch (error) {
    console.log('⚠️ Some automated services failed to start:', error.message);
  }
};

// Kill any existing process on the port
const killExistingProcess = async (port) => {
  try {
    const { exec } = await import('child_process');
    
    return new Promise((resolve) => {
      exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
        if (stdout) {
          const lines = stdout.split('\n');
          const pids = new Set();
          
          lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            if (parts.length >= 5 && parts[1].includes(`:${port}`)) {
              const pid = parts[4];
              if (pid && pid !== '0') {
                pids.add(pid);
              }
            }
          });
          
          if (pids.size > 0) {
            console.log(`🔄 Killing existing processes on port ${port}...`);
            pids.forEach(pid => {
              exec(`taskkill /PID ${pid} /F`, (killError) => {
                if (!killError) {
                  console.log(`✅ Killed process ${pid}`);
                }
              });
            });
            
            setTimeout(resolve, 2000); // Wait 2 seconds for processes to be killed
          } else {
            resolve();
          }
        } else {
          resolve();
        }
      });
    });
  } catch (error) {
    console.log('⚠️ Could not check for existing processes');
  }
};

// Start server
const startServer = async () => {
  try {
    console.log('🚀 Starting NeuroFi Backend API...');
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    console.log(`🎯 Mode: PRODUCTION (No Demo)`);
    
    // Kill any existing process on the port
    await killExistingProcess(PORT);
    
    // Find available port if default is in use
    const availablePort = await findAvailablePort(PORT);
    
    if (availablePort !== PORT) {
      console.log(`⚠️ Port ${PORT} is in use, using port ${availablePort} instead`);
    }
    
    // Connect to MongoDB
    const mongoConnected = await connectDB();
    
    app.listen(availablePort, () => {
      console.log('');
      console.log('========================================');
      console.log(`🚀 NeuroFi Backend API running on port ${availablePort}`);
      console.log(`🔗 Health check: http://localhost:${availablePort}/health`);
      console.log(`📊 API endpoints: http://localhost:${availablePort}/api`);
      console.log('========================================');
      console.log('');
      console.log('📈 Available Features:');
      console.log('  ✅ Real-time cryptocurrency data');
      console.log('  ✅ Machine learning predictions');
      console.log('  ✅ Virtual trading wallet');
      console.log('  ✅ User authentication');
      console.log('  ✅ Portfolio management');
      console.log('');
      console.log('🎯 PRODUCTION MODE - No Demo Features');
      console.log('');
      
      if (mongoConnected) {
        console.log('✅ Backend ready with full functionality');
        
        // Start automated services after successful startup
        setTimeout(() => {
          startAutomatedServices();
        }, 5000); // Wait 5 seconds before starting services
      } else {
        console.log('⚠️ Backend running with limited functionality');
        console.log('🔧 Fix MongoDB connection for full features');
      }
      console.log('');
      
      // Update frontend environment if port changed
      if (availablePort !== PORT) {
        console.log(`💡 Update frontend to use: http://localhost:${availablePort}/api`);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await closeDB();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  await closeDB();
  process.exit(0);
});

startServer();

export default app;