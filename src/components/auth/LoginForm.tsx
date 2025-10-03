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
      <div className="min-h-screen bg-gradient-to-br from-cream via-soft-beige to-warm-white flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <div className="glass-effect rounded-3xl shadow-elegant p-8 animate-elegant-fade-in">
            <div className="text-center mb-8">
              <div className="relative">
                <Heart className="h-20 w-20 text-dusty-rose mx-auto mb-4 animate-soft-pulse" />
                <Sparkles className="h-6 w-6 text-warm-gold absolute top-0 right-1/3 animate-gentle-float" />
                <Sparkles className="h-4 w-4 text-dusty-rose absolute bottom-2 left-1/3 animate-gentle-float" style={{ animationDelay: '2s' }} />
              </div>
              <h1 className="text-4xl font-serif text-elegant mb-3 gradient-text">Your Private Sanctuary</h1>
              <p className="text-elegant-light text-lg leading-relaxed">
                A secure, intimate space designed just for the two of you
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-elegant mb-4 flex items-center">
                <Lock className="h-5 w-5 text-dusty-rose mr-2" />
                Setup Required
              </h2>
              <p className="text-elegant mb-4">
                To protect your privacy and create your secure intimate space, please configure your database connection:
              </p>
              <div className="bg-white/60 rounded-xl p-4 font-mono text-sm">
                <p className="text-elegant-light mb-2">Update your .env file with:</p>
                <div className="text-elegant space-y-1">
                  <div>VITE_SUPABASE_URL=your_actual_supabase_url</div>
                  <div>VITE_SUPABASE_ANON_KEY=your_actual_anon_key</div>
                </div>
              </div>
              <p className="text-sm text-elegant-light mt-4 italic">
                Your data will be completely private and secure, accessible only to you and your partner.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-soft-beige to-warm-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating hearts animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Heart className="absolute top-1/4 left-1/4 h-4 w-4 text-dusty-rose/20 animate-gentle-float" />
        <Heart className="absolute top-1/3 right-1/4 h-6 w-6 text-warm-gold/30 animate-gentle-float" style={{ animationDelay: '2s' }} />
        <Heart className="absolute bottom-1/4 left-1/3 h-3 w-3 text-dusty-rose/15 animate-gentle-float" style={{ animationDelay: '4s' }} />
        <Sparkles className="absolute top-1/2 right-1/3 h-5 w-5 text-warm-gold/20 animate-soft-pulse" />
      </div>
      
      <div className="max-w-md w-full">
        <div className="glass-effect rounded-3xl shadow-elegant p-8 relative animate-elegant-fade-in">
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-dusty-rose/5 to-warm-gold/5 rounded-3xl blur-xl"></div>
          
          <div className="text-center mb-8 relative z-10">
            <div className="relative">
              <Heart className="h-20 w-20 text-dusty-rose mx-auto mb-4 animate-soft-pulse" />
              <Sparkles className="h-6 w-6 text-warm-gold absolute top-0 right-1/3 animate-gentle-float" />
            </div>
            <h1 className="text-4xl font-serif text-elegant mb-3 gradient-text">
              Our Private Sanctuary
            </h1>
            <p className="text-elegant-light flex items-center justify-center space-x-2 text-lg">
              <Lock className="h-4 w-4" />
              <span>Secure • Intimate • Forever Yours</span>
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6 relative z-10">
            <div>
              <label className="block text-sm font-medium text-elegant mb-2 font-serif">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-elegant w-full"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-elegant mb-2 font-serif">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-elegant w-full pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-elegant-light hover:text-dusty-rose transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-elegant mb-2 font-serif">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-elegant w-full"
                    placeholder="Confirm your password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-elegant mb-2 font-serif">
                    Your Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full"
                  >
                    <option value="partner1">Partner 1</option>
                    <option value="partner2">Partner 2</option>
                  </select>
                </div>
              </>
            )}

            {error && (
              <div className="bg-red-50/80 backdrop-blur-sm border border-red-300 text-red-800 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-elegant w-full py-4 disabled:opacity-50"
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
                className="text-dusty-rose hover:text-deep-rose font-medium transition-colors text-lg font-serif"
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