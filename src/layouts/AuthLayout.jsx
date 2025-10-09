import { Outlet } from 'react-router-dom';
import { Brain } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Brain className="h-12 w-12 text-primary mr-2" />
            <span className="text-3xl font-bold text-white">NeuroFi</span>
          </div>
          <p className="text-gray-400">AI-Powered Crypto Trading Platform</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;