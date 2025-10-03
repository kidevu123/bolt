import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Heart, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://your-project-id.supabase.co'
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export default function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('partner1'); // partner1 or partner2
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supabase) {
      setError('Please configure your Supabase credentials in the .env file to connect to your private database.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: role,
            },
          },
        });
        if (error) throw error;
      }
    } catch (error: any) {
      if (error.message.includes('Failed to fetch')) {
        setError('Unable to connect to your private database. Please check your Supabase credentials in the .env file.');
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!supabase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-200 via-pink-200 to-purple-200 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-rose-300/50">
            <div className="text-center mb-8">
              <div className="relative">
                <Heart className="h-20 w-20 text-rose-500 mx-auto mb-4 animate-pulse" />
                <Sparkles className="h-6 w-6 text-pink-400 absolute top-0 right-1/3 animate-bounce" />
                <Sparkles className="h-4 w-4 text-purple-400 absolute bottom-2 left-1/3 animate-bounce delay-300" />
              </div>
              <h1 className="text-4xl font-serif text-gray-800 mb-3">Your Private Sanctuary</h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                A secure, intimate space designed just for the two of you
              </p>
            </div>

            <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Lock className="h-5 w-5 text-rose-500 mr-2" />
                Setup Required
              </h2>
              <p className="text-gray-700 mb-4">
                To protect your privacy and create your secure intimate space, please configure your database connection:
              </p>
              <div className="bg-white/80 rounded-xl p-4 font-mono text-sm">
                <p className="text-gray-600 mb-2">Update your .env file with:</p>
                <div className="text-gray-800 space-y-1">
                  <div>VITE_SUPABASE_URL=your_actual_supabase_url</div>
                  <div>VITE_SUPABASE_ANON_KEY=your_actual_anon_key</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4 italic">
                Your data will be completely private and secure, accessible only to you and your partner.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-200 via-pink-200 to-purple-200 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating hearts animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Heart className="absolute top-1/4 left-1/4 h-4 w-4 text-rose-300/30 animate-float" />
        <Heart className="absolute top-1/3 right-1/4 h-6 w-6 text-pink-300/40 animate-float-delayed" />
        <Heart className="absolute bottom-1/4 left-1/3 h-3 w-3 text-purple-300/30 animate-float-slow" />
        <Sparkles className="absolute top-1/2 right-1/3 h-5 w-5 text-rose-400/20 animate-pulse" />
      </div>
      
      <div className="max-w-md w-full">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-rose-300/50 relative">
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-rose-400/10 to-pink-400/10 rounded-3xl blur-xl"></div>
          
          <div className="text-center mb-8">
            <div className="relative">
              <Heart className="h-20 w-20 text-rose-500 mx-auto mb-4 animate-pulse" />
              <Sparkles className="h-6 w-6 text-pink-400 absolute top-0 right-1/3 animate-bounce" />
            </div>
            <h1 className="text-4xl font-serif text-gray-800 mb-3 bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              Our Private Sanctuary
            </h1>
            <p className="text-gray-600 flex items-center justify-center space-x-2 text-lg">
              <Lock className="h-4 w-4" />
              <span>Secure • Intimate • Forever Yours</span>
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2 font-serif">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-rose-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-inner"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2 font-serif">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-rose-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-inner"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-rose-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2 font-serif">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-rose-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-inner"
                    placeholder="Confirm your password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2 font-serif">
                    Your Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-rose-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-inner"
                  >
                    <option value="partner1">Partner 1</option>
                    <option value="partner2">Partner 2</option>
                  </select>
                </div>
              </>
            )}

            {error && (
              <div className="bg-red-50/80 backdrop-blur-sm border border-red-300 text-red-800 px-4 py-3 rounded-xl shadow-inner">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-white py-4 rounded-xl hover:from-rose-600 hover:via-pink-600 hover:to-purple-600 transition-all duration-300 font-medium shadow-xl disabled:opacity-50 transform hover:scale-105 active:scale-95"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <Heart className="h-5 w-5 animate-pulse" />
                  <span>Creating your sanctuary...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <Heart className="h-5 w-5" />
                  <span>{isLogin ? 'Enter Our Space' : 'Create Our Sanctuary'}</span>
                </span>
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-rose-600 hover:text-rose-700 font-medium transition-colors text-lg font-serif"
              >
                {isLogin ? 'Create our private sanctuary?' : 'Return to our sanctuary?'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}