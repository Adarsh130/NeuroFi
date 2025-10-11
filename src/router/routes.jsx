import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';

// Import pages from index
import {
  Home,
  About,
  Dashboard,
  MarketAnalysis,
  SentimentAnalysis,
  AiRecommendations,
  RiskManagement,
  Profile,
  Settings,
  Login,
  Signup
} from '../pages';

// Import Wallet separately
import Wallet from '../pages/Wallet';

// Import NotFound separately since it's not in index.js
import NotFound from '../pages/NotFound';



export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'about',
        element: <About />
      }
    ]
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <Login />
      },
      {
        path: 'signup',
        element: <Signup />
      }
    ]
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />
      },
      {
        path: 'dashboard',
        element: <Dashboard />
      },
      {
        path: 'market',
        element: <MarketAnalysis />
      },
      {
        path: 'sentiment',
        element: <SentimentAnalysis />
      },
      {
        path: 'ai',
        element: <AiRecommendations />
      },
      {
        path: 'wallet',
        element: <Wallet />
      },
      {
        path: 'risk',
        element: <RiskManagement />
      },
      {
        path: 'profile',
        element: <Profile />
      },
      {
        path: 'settings',
        element: <Settings />
      }
    ]
  },
  {
    path: '*',
    element: <NotFound />
  }
]);