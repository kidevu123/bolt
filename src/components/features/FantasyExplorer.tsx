import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, Heart, Lock, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface Fantasy {
  id: string;
  title: string;
  description: string;
  category: string;
  intensity: number;
  is_private: boolean;
  created_by: string;
  created_at: string;
  tags: string[];
}

export default function FantasyExplorer({ user }: { user: any }) {
  const [fantasies, setFantasies] = useState<Fantasy[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'romantic',
    intensity: 1,
    is_private: false,
    tags: '',
  });

  const categories = [
    { value: 'all', label: 'All Categories', icon: '🌟' },
    { value: 'romantic', label: 'Romantic', icon: '💕' },
    { value: 'adventurous', label: 'Adventurous', icon: '🔥' },
    { value: 'playful', label: 'Playful', icon: '😈' },
    { value: 'sensual', label: 'Sensual', icon: '🌹' },
    { value: 'exploration', label: 'New Exploration', icon: '✨' },
  ];

  useEffect(() => {
    fetchFantasies();
  }, []);

  const fetchFantasies = async () => {
    try {
      const { data, error } = await supabase
        .from('fantasies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFantasies(data || []);
    } catch (error) {
      console.error('Error fetching fantasies:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('fantasies')
        .insert([{
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          created_by: user.id,
        }]);
      
      if (error) throw error;

      setFormData({
        title: '',
        description: '',
        category: 'romantic',
        intensity: 1,
        is_private: false,
        tags: '',
      });
      setShowForm(false);
      fetchFantasies();
    } catch (error) {
      console.error('Error saving fantasy:', error);
    }
  };

  const filteredFantasies = selectedCategory === 'all' 
    ? fantasies 
    : fantasies.filter(f => f.category === selectedCategory);

  const intensityLabels = {
    1: 'Gentle',
    2: 'Moderate', 
    3: 'Intense',
    4: 'Wild',
    5: 'Extreme'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-gray-800 mb-2">Fantasy Space</h1>
          <p className="text-gray-600">Explore and share your intimate desires safely</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center space-x-2 shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>Share Fantasy</span>
        </button>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => setSelectedCategory(category.value)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
              selectedCategory === category.value
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white/60 text-gray-700 border border-rose-200 hover:bg-rose-50'
            }`}
          >
            <span>{category.icon}</span>
            <span className="font-medium">{category.label}</span>
          </button>
        ))}
      </div>

      {showForm && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-rose-200 shadow-xl">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Share a New Fantasy</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-rose-200 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
                  placeholder="Give your fantasy a name..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-rose-200 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
                >
                  {categories.slice(1).map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.icon} {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-rose-200 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
                placeholder="Describe your fantasy in detail..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intensity Level: {intensityLabels[formData.intensity as keyof typeof intensityLabels]}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.intensity}
                  onChange={(e) => setFormData({ ...formData, intensity: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Gentle</span>
                  <span>Extreme</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-rose-200 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
                  placeholder="passion, intimate, roleplay..."
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_private}
                  onChange={(e) => setFormData({ ...formData, is_private: e.target.checked })}
                  className="rounded border-rose-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700 flex items-center space-x-1">
                  <Lock className="h-4 w-4" />
                  <span>Keep this fantasy private to me</span>
                </span>
              </label>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
              >
                Share Fantasy
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFantasies.map((fantasy) => {
          const category = categories.find(c => c.value === fantasy.category);
          const isOwn = fantasy.created_by === user.id;
          
          return (
            <div
              key={fantasy.id}
              className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-rose-200 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{category?.icon || '✨'}</span>
                  <div>
                    <h3 className="font-semibold text-gray-800">{fantasy.title}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{category?.label}</span>
                      {fantasy.is_private && (
                        <div className="flex items-center space-x-1">
                          <Lock className="h-3 w-3" />
                          <span>Private</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < fantasy.intensity ? 'bg-purple-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                {fantasy.description}
              </p>

              {fantasy.tags && fantasy.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {fantasy.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>
                  {isOwn ? 'Your fantasy' : 'Shared fantasy'}
                </span>
                <span>
                  {new Date(fantasy.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredFantasies.length === 0 && (
        <div className="text-center py-12">
          <Sparkles className="h-16 w-16 text-purple-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No fantasies yet</h3>
          <p className="text-gray-500">Start exploring by sharing your first fantasy</p>
        </div>
      )}
    </div>
  );
}