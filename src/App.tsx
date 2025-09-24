import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Heart, Lock, User, Calendar, MessageSquare, Sparkles, Book, Gamepad2, Bot, Settings, LogOut } from 'lucide-react';
import LoginForm from './components/auth/LoginForm';
import Dashboard from './components/Dashboard';
import AppointmentBooking from './components/features/AppointmentBooking';
import PrivateChat from './components/features/PrivateChat';
import FantasyExplorer from './components/features/FantasyExplorer';
import SceneBuilder from './components/features/SceneBuilder';
import PositionExplorer from './components/features/PositionExplorer';
import StoryLibrary from './components/features/StoryLibrary';
import ToyControl from './components/features/ToyControl';
import AICompanion from './components/features/AICompanion';
import UserProfile from './components/features/UserProfile';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

function App() {
  const [user, setUser] = useState<any>({ id: 'demo-user', email: 'demo@example.com' });
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');

  useEffect(() => {
    // Simulate already logged in for screenshot purposes
    return;
    
    if (!supabase) {
      setLoading(false);
      return;
    }
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-rose-400 animate-pulse mx-auto mb-4" />
          <p className="text-rose-600 font-medium">Loading your private space...</p>
        </div>
      </div>
    );
  }

  if (!supabase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-rose-200 text-center">
            <Heart className="h-16 w-16 text-rose-500 mx-auto mb-4" />
            <h1 className="text-3xl font-serif text-gray-800 mb-4">Setup Required</h1>
            <p className="text-gray-600 mb-6">
              Please configure your Supabase credentials in the .env file to get started.
            </p>
            <div className="bg-gray-50 rounded-xl p-4 text-left">
              <p className="text-sm text-gray-700 mb-2">Add these to your .env file:</p>
              <code className="text-xs text-gray-600 block">
                VITE_SUPABASE_URL=your_supabase_url<br/>
                VITE_SUPABASE_ANON_KEY=your_anon_key
              </code>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const navigation = [
    { id: 'dashboard', name: 'Home', icon: Heart },
    { id: 'appointments', name: 'Appointments', icon: Calendar },
    { id: 'chat', name: 'Private Chat', icon: MessageSquare },
    { id: 'fantasy', name: 'Fantasy Space', icon: Sparkles },
    { id: 'scenes', name: 'Scene Builder', icon: User },
    { id: 'positions', name: 'Intimacy Guide', icon: Heart },
    { id: 'stories', name: 'Story Library', icon: Book },
    { id: 'toys', name: 'Toy Control', icon: Gamepad2 },
    { id: 'ai', name: 'AI Companion', icon: Bot },
    { id: 'profile', name: 'Profile', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'appointments':
        return <AppointmentBooking user={user} />;
      case 'chat':
        return <PrivateChat user={user} />;
      case 'fantasy':
        return <FantasyExplorer user={user} />;
      case 'scenes':
        return <SceneBuilder user={user} />;
      case 'positions':
        return <PositionExplorer user={user} />;
      case 'stories':
        return <StoryLibrary user={user} />;
      case 'toys':
        return <ToyControl user={user} />;
      case 'ai':
        return <AICompanion user={user} />;
      case 'profile':
        return <UserProfile user={user} />;
      default:
        return <Dashboard user={user} onNavigate={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-rose-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-rose-500" />
              <span className="text-2xl font-serif text-gray-800">Our Private Space</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4 text-rose-400" />
                <span className="text-sm text-gray-600">Secure & Private</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 text-gray-600 hover:text-rose-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white/60 backdrop-blur-sm border-r border-rose-200 min-h-screen">
          <nav className="p-4">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                      activeView === item.id
                        ? 'bg-rose-100 text-rose-700 shadow-sm'
                        : 'text-gray-600 hover:bg-rose-50 hover:text-rose-600'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;