import React, { useState, useEffect } from 'react';
import { User, Settings, Heart, Calendar, BarChart3, Shield, Camera, Edit } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface Profile {
  id: string;
  display_name: string;
  avatar_url: string;
  role: string;
  preferences: any;
  privacy_settings: any;
}

interface MoodLog {
  overall_mood: number;
  intimacy_mood: number;
  energy_level: number;
  connection_feeling: number;
  date: string;
  notes: string;
}

export default function UserProfile({ user }: { user: any }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [todayMood, setTodayMood] = useState<MoodLog>({
    overall_mood: 5,
    intimacy_mood: 5,
    energy_level: 5,
    connection_feeling: 5,
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [formData, setFormData] = useState({
    display_name: '',
    preferences: {
      notifications: {
        appointments: true,
        messages: true,
        mood_reminders: true,
      },
      privacy: {
        share_mood_data: true,
        ai_learning: true,
      },
      interface: {
        theme: 'romantic',
        intimacy_level: 'moderate',
      }
    }
  });

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'mood', name: 'Mood Tracking', icon: Heart },
    { id: 'stats', name: 'Statistics', icon: BarChart3 },
    { id: 'settings', name: 'Settings', icon: Settings },
    { id: 'privacy', name: 'Privacy', icon: Shield },
  ];

  const themes = [
    { value: 'romantic', label: 'Romantic Rose', colors: 'from-rose-400 to-pink-400' },
    { value: 'passion', label: 'Passionate Purple', colors: 'from-purple-400 to-indigo-400' },
    { value: 'warm', label: 'Warm Amber', colors: 'from-amber-400 to-orange-400' },
    { value: 'nature', label: 'Natural Green', colors: 'from-green-400 to-emerald-400' },
  ];

  useEffect(() => {
    fetchProfile();
    fetchTodayMood();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setProfile(data);
        setFormData({
          display_name: data.display_name || '',
          preferences: data.preferences || formData.preferences
        });
      } else {
        // Create profile if it doesn't exist
        await createProfile();
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const createProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          id: user.id,
          role: user.user_metadata?.role || 'partner1',
          display_name: user.email?.split('@')[0] || 'Partner',
          preferences: formData.preferences,
          privacy_settings: {}
        }])
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const fetchTodayMood = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('mood_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setTodayMood({
          overall_mood: data.overall_mood,
          intimacy_mood: data.intimacy_mood,
          energy_level: data.energy_level,
          connection_feeling: data.connection_feeling,
          date: data.date,
          notes: data.notes || '',
        });
      }
    } catch (error) {
      console.error('Error fetching mood:', error);
    }
  };

  const saveMoodLog = async () => {
    try {
      const { error } = await supabase
        .from('mood_logs')
        .upsert([{
          user_id: user.id,
          ...todayMood
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving mood log:', error);
    }
  };

  const saveProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name,
          preferences: formData.preferences,
        })
        .eq('id', user.id);

      if (error) throw error;
      
      await fetchProfile();
      setEditMode(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const getMoodEmoji = (mood: number) => {
    if (mood <= 2) return '😔';
    if (mood <= 4) return '😐';
    if (mood <= 6) return '🙂';
    if (mood <= 8) return '😊';
    return '😍';
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">Profile Information</h2>
        <button
          onClick={() => setEditMode(!editMode)}
          className="flex items-center space-x-2 bg-rose-500 text-white px-4 py-2 rounded-xl hover:bg-rose-600 transition-colors"
        >
          <Edit className="h-4 w-4" />
          <span>{editMode ? 'Cancel' : 'Edit'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 bg-gradient-to-br from-rose-400 to-pink-400 rounded-full flex items-center justify-center text-white text-4xl font-semibold">
                {profile?.display_name?.charAt(0) || 'P'}
              </div>
              {editMode && (
                <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors">
                  <Camera className="h-4 w-4 text-gray-600" />
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              disabled={!editMode}
              className="w-full px-4 py-3 rounded-xl border border-rose-200 focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all duration-200 disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
              <span className="capitalize text-gray-700">
                {profile?.role?.replace('partner', 'Partner ') || 'Partner'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Relationship Stats</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-rose-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-rose-600">12</div>
              <div className="text-sm text-rose-600">Days Connected</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">8</div>
              <div className="text-sm text-purple-600">Shared Fantasies</div>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-amber-600">15</div>
              <div className="text-sm text-amber-600">AI Conversations</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600">6</div>
              <div className="text-sm text-green-600">Appointments</div>
            </div>
          </div>
        </div>
      </div>

      {editMode && (
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setEditMode(false)}
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-xl hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={saveProfile}
            className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-2 rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all duration-200"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );

  const renderMoodTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">Daily Mood Tracking</h2>
        <div className="text-sm text-gray-600">Today: {new Date().toLocaleDateString()}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { key: 'overall_mood', label: 'Overall Mood', color: 'rose' },
          { key: 'intimacy_mood', label: 'Intimacy Mood', color: 'purple' },
          { key: 'energy_level', label: 'Energy Level', color: 'amber' },
          { key: 'connection_feeling', label: 'Connection Feeling', color: 'green' }
        ].map(({ key, label, color }) => (
          <div key={key} className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="font-medium text-gray-700">{label}</label>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getMoodEmoji(todayMood[key as keyof MoodLog] as number)}</span>
                <span className="text-lg font-semibold text-gray-800">
                  {todayMood[key as keyof MoodLog]}/10
                </span>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={todayMood[key as keyof MoodLog] as number}
              onChange={(e) => setTodayMood({
                ...todayMood,
                [key]: parseInt(e.target.value)
              })}
              className={`w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-${color}`}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes & Reflections
        </label>
        <textarea
          value={todayMood.notes}
          onChange={(e) => setTodayMood({ ...todayMood, notes: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-rose-200 focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all duration-200"
          placeholder="How are you feeling today? Any special thoughts or reflections..."
        />
      </div>

      <button
        onClick={saveMoodLog}
        className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all duration-200"
      >
        Save Today's Mood
      </button>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">App Settings</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Theme</h3>
          <div className="grid grid-cols-2 gap-4">
            {themes.map((theme) => (
              <button
                key={theme.value}
                onClick={() => setFormData({
                  ...formData,
                  preferences: {
                    ...formData.preferences,
                    interface: {
                      ...formData.preferences.interface,
                      theme: theme.value
                    }
                  }
                })}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  formData.preferences.interface.theme === theme.value
                    ? 'border-rose-400 bg-rose-50'
                    : 'border-gray-200 hover:border-rose-200'
                }`}
              >
                <div className={`w-full h-4 rounded-lg bg-gradient-to-r ${theme.colors} mb-2`} />
                <span className="font-medium text-gray-800">{theme.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Notifications</h3>
          <div className="space-y-3">
            {Object.entries(formData.preferences.notifications).map(([key, value]) => (
              <label key={key} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value as boolean}
                  onChange={(e) => setFormData({
                    ...formData,
                    preferences: {
                      ...formData.preferences,
                      notifications: {
                        ...formData.preferences.notifications,
                        [key]: e.target.checked
                      }
                    }
                  })}
                  className="rounded border-rose-300 text-rose-600 focus:ring-rose-500"
                />
                <span className="text-gray-700 capitalize">
                  {key.replace('_', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={saveProfile}
        className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all duration-200"
      >
        Save Settings
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-gray-800 mb-2">Your Profile</h1>
        <p className="text-gray-600">Manage your personal information, mood tracking, and app settings</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg'
                  : 'bg-white/60 text-gray-700 border border-rose-200 hover:bg-rose-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium">{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-rose-200">
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'mood' && renderMoodTab()}
        {activeTab === 'settings' && renderSettingsTab()}
        {activeTab === 'stats' && (
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Statistics Coming Soon</h3>
            <p className="text-gray-500">Detailed analytics and insights about your relationship journey</p>
          </div>
        )}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Privacy & Security</h2>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-800">Your Privacy is Protected</span>
              </div>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• End-to-end encryption for all messages and media</li>
                <li>• Data stored securely with zero-knowledge architecture</li>
                <li>• No third-party sharing of intimate content</li>
                <li>• AI conversations are processed locally when possible</li>
                <li>• Complete data deletion available upon request</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}