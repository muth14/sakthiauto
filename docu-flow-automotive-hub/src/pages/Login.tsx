import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, Shield, Users, Building, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../hooks/use-toast';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { user, login } = useAuth();

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      toast({
        title: "Success",
        description: "Welcome back!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid credentials",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const demoAccounts = [
    { email: 'admin@sakthiauto.com', role: 'Admin', department: 'IT' },
    { email: 'supervisor@sakthiauto.com', role: 'Supervisor', department: 'Production' },
    { email: 'lineincharge@sakthiauto.com', role: 'Line Incharge', department: 'Assembly' },
    { email: 'operator@sakthiauto.com', role: 'Operator', department: 'Quality Control' },
    { email: 'auditor@sakthiauto.com', role: 'Auditor', department: 'Compliance' }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-8 transition-all duration-1000 translate-y-0 opacity-100">
          {/* Header */}
          <div className="text-center space-y-4">
            {/* Logo */}
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
              <div className="text-white">
                <Building size={32} className="animate-pulse" />
              </div>
            </div>
            
            {/* Title with gradient */}
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                SAKTHI AUTO
              </h1>
              <h2 className="text-2xl font-semibold text-gray-800">Welcome Back</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Sign in to access your digital documentation system
              </p>
            </div>

            {/* Features badges */}
            <div className="flex justify-center space-x-4 mt-6">
              <div className="flex items-center space-x-1 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                <Shield size={16} className="text-green-600" />
                <span className="text-xs font-medium text-gray-700">Secure</span>
              </div>
              <div className="flex items-center space-x-1 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                <Users size={16} className="text-blue-600" />
                <span className="text-xs font-medium text-gray-700">Multi-Role</span>
              </div>
              <div className="flex items-center space-x-1 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                <Sparkles size={16} className="text-purple-600" />
                <span className="text-xs font-medium text-gray-700">Modern</span>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter your email address"
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 bg-white/50 backdrop-blur-sm
                      ${focusedField === 'email' 
                        ? 'border-blue-500 shadow-lg shadow-blue-500/25 bg-white' 
                        : 'border-gray-200 hover:border-gray-300'
                      }
                      focus:outline-none focus:ring-0 placeholder-gray-400`}
                    required
                  />
                  {focusedField === 'email' && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 pointer-events-none"></div>
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter your password"
                    className={`w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all duration-300 bg-white/50 backdrop-blur-sm
                      ${focusedField === 'password' 
                        ? 'border-blue-500 shadow-lg shadow-blue-500/25 bg-white' 
                        : 'border-gray-200 hover:border-gray-300'
                      }
                      focus:outline-none focus:ring-0 placeholder-gray-400`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  {focusedField === 'password' && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 pointer-events-none"></div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={20} />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            {/* Demo Accounts */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Quick Demo Access</h3>
                <p className="text-xs text-gray-500">Click any role to auto-fill credentials</p>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {demoAccounts.map((account, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setEmail(account.email);
                      setPassword('password');
                    }}
                    className="group relative overflow-hidden bg-gradient-to-r from-gray-50 to-white hover:from-blue-50 hover:to-purple-50 border border-gray-200 hover:border-blue-300 rounded-xl p-4 text-left transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold text-gray-800 group-hover:text-blue-800 transition-colors">
                          {account.role}
                        </div>
                        <div className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors">
                          {account.email}
                        </div>
                        <div className="text-xs text-gray-500 group-hover:text-blue-500 transition-colors">
                          {account.department}
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <LogIn size={16} className="text-blue-600" />
                      </div>
                    </div>
                    
                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                  </button>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs text-amber-800 text-center">
                  <span className="font-medium">Demo Password:</span> 
                  <code className="bg-amber-100 px-2 py-1 rounded ml-1 font-mono">password</code>
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center space-y-2">
            <div className="flex justify-center items-center space-x-2 text-sm text-gray-600">
              <Shield size={16} className="text-green-600" />
              <span>Secure digital documentation system</span>
            </div>
            <p className="text-xs text-gray-500">
              © 2024 Sakthi Auto. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
