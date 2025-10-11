import { createBrowserRouter } from 'react-router-dom';
import SimpleMainLayout from '../layouts/SimpleMainLayout';
import SimpleHome from '../pages/SimpleHome';
import SimpleAbout from '../pages/SimpleAbout';

// Simple 404 component
const NotFound = () => (
  <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <p className="text-xl text-gray-300 mb-8">Page not found</p>
      <a 
        href="/" 
        className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg transition-colors"
      >
        Go Home
      </a>
    </div>
  </div>
);

// Simple login page
const SimpleLogin = () => (
  <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
    <div className="max-w-md w-full bg-slate-800 rounded-xl p-8">
      <h2 className="text-2xl font-bold text-center mb-6">Login to NeuroFi</h2>
      <p className="text-gray-400 text-center mb-8">
        Login functionality will be implemented soon.
      </p>
      <a 
        href="/" 
        className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg transition-colors block text-center"
      >
        Back to Home
      </a>
    </div>
  </div>
);

export const simpleRouter = createBrowserRouter([
  {
    path: '/',
    element: <SimpleMainLayout />,
    children: [
      {
        index: true,
        element: <SimpleHome />
      },
      {
        path: 'about',
        element: <SimpleAbout />
      }
    ]
  },
  {
    path: '/auth/login',
    element: <SimpleLogin />
  },
  {
    path: '/auth/signup',
    element: <SimpleLogin />
  },
  {
    path: '*',
    element: <NotFound />
  }
]);