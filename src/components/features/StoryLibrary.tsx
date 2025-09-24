import React, { useState, useEffect } from 'react';
import { Book, Search, Filter, Star, Clock, Heart, Eye, EyeOff, Play, Pause } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface Story {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  reading_time: number;
  intensity: number;
  source: string;
  is_favorite: boolean;
  read_count: number;
  created_at: string;
}

export default function StoryLibrary({ user }: { user: any }) {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedIntensity, setSelectedIntensity] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  const categories = [
    { value: 'all', label: 'All Stories', icon: '📖' },
    { value: 'romantic', label: 'Romantic', icon: '💕' },
    { value: 'passionate', label: 'Passionate', icon: '🔥' },
    { value: 'playful', label: 'Playful', icon: '😊' },
    { value: 'sensual', label: 'Sensual', icon: '🌹' },
    { value: 'adventure', label: 'Adventure', icon: '⚡' },
    { value: 'fantasy', label: 'Fantasy', icon: '✨' },
  ];

  const intensityLevels = [
    { value: 'all', label: 'All Levels' },
    { value: '1', label: 'Gentle' },
    { value: '2', label: 'Mild' },
    { value: '3', label: 'Moderate' },
    { value: '4', label: 'Intense' },
    { value: '5', label: 'Very Intense' },
  ];

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStories(data || []);
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
  };

  const toggleFavorite = async (storyId: string) => {
    try {
      const story = stories.find(s => s.id === storyId);
      if (!story) return;

      const { error } = await supabase
        .from('stories')
        .update({ is_favorite: !story.is_favorite })
        .eq('id', storyId);

      if (error) throw error;

      setStories(prev => prev.map(s => 
        s.id === storyId ? { ...s, is_favorite: !s.is_favorite } : s
      ));
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  };

  const incrementReadCount = async (storyId: string) => {
    try {
      const { error } = await supabase.rpc('increment_read_count', {
        story_id: storyId
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error incrementing read count:', error);
    }
  };

  const openStory = async (story: Story) => {
    setSelectedStory(story);
    setIsReading(true);
    setReadingProgress(0);
    await incrementReadCount(story.id);
  };

  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || story.category === selectedCategory;
    const matchesIntensity = selectedIntensity === 'all' || story.intensity.toString() === selectedIntensity;
    const matchesFavorites = !showFavoritesOnly || story.is_favorite;
    
    return matchesSearch && matchesCategory && matchesIntensity && matchesFavorites;
  });

  const getIntensityColor = (intensity: number) => {
    const colors = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-blue-100 text-blue-800',
      3: 'bg-yellow-100 text-yellow-800',
      4: 'bg-orange-100 text-orange-800',
      5: 'bg-red-100 text-red-800',
    };
    return colors[intensity as keyof typeof colors] || colors[1];
  };

  const getIntensityLabel = (intensity: number) => {
    const labels = {
      1: 'Gentle',
      2: 'Mild',
      3: 'Moderate',
      4: 'Intense',
      5: 'Very Intense',
    };
    return labels[intensity as keyof typeof labels] || 'Gentle';
  };

  if (selectedStory && isReading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-rose-200 shadow-xl">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-serif text-gray-800 mb-2">{selectedStory.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{selectedStory.reading_time} min read</span>
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIntensityColor(selectedStory.intensity)}`}>
                  {getIntensityLabel(selectedStory.intensity)}
                </span>
                <span className="capitalize">{selectedStory.category}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => toggleFavorite(selectedStory.id)}
                className={`p-2 rounded-full transition-colors ${
                  selectedStory.is_favorite 
                    ? 'text-red-500 hover:text-red-600 bg-red-50' 
                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                }`}
              >
                <Heart className={`h-5 w-5 ${selectedStory.is_favorite ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={() => {
                  setSelectedStory(null);
                  setIsReading(false);
                }}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Back to Library
              </button>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="text-gray-800 leading-relaxed whitespace-pre-line">
              {selectedStory.content}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {selectedStory.tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-gray-800 mb-2">Story Library</h1>
          <p className="text-gray-600">Curated intimate stories for inspiration and exploration</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-rose-200 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-rose-200 focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all duration-200"
            placeholder="Search stories or tags..."
          />
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-rose-200 focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all duration-200"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.icon} {category.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <select
              value={selectedIntensity}
              onChange={(e) => setSelectedIntensity(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-rose-200 focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all duration-200"
            >
              {intensityLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showFavoritesOnly}
              onChange={(e) => setShowFavoritesOnly(e.target.checked)}
              className="rounded border-rose-300 text-rose-600 focus:ring-rose-500"
            />
            <span className="text-sm text-gray-700">Favorites only</span>
          </label>
        </div>
      </div>

      {/* Story Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStories.map((story) => {
          const category = categories.find(c => c.value === story.category);
          
          return (
            <div
              key={story.id}
              className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-rose-200 hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={() => openStory(story)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{category?.icon || '📖'}</span>
                  <div>
                    <h3 className="font-semibold text-gray-800 group-hover:text-rose-700 transition-colors line-clamp-1">
                      {story.title}
                    </h3>
                    <p className="text-sm text-gray-600 capitalize">{story.category}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(story.id);
                  }}
                  className={`p-1 rounded-full transition-colors ${
                    story.is_favorite 
                      ? 'text-red-500 hover:text-red-600' 
                      : 'text-gray-400 hover:text-red-500'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${story.is_favorite ? 'fill-current' : ''}`} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{story.reading_time}min</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIntensityColor(story.intensity)}`}>
                    {getIntensityLabel(story.intensity)}
                  </span>
                </div>

                <p className="text-gray-700 text-sm line-clamp-3">
                  {story.content.substring(0, 120)}...
                </p>

                {story.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {story.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                    {story.tags.length > 3 && (
                      <span className="text-xs text-gray-500">+{story.tags.length - 3} more</span>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Eye className="h-3 w-3" />
                    <span>{story.read_count} reads</span>
                  </div>
                  <div className="flex items-center space-x-1 text-rose-600 group-hover:text-rose-700">
                    <Play className="h-4 w-4" />
                    <span className="text-sm font-medium">Read</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStories.length === 0 && (
        <div className="text-center py-12">
          <Book className="h-16 w-16 text-rose-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No stories found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Educational Disclaimer */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <strong>Intimate Content:</strong> These stories are curated for mature audiences to explore and enhance intimate relationships. 
          All content is consensual and educational in nature, designed to inspire communication and connection between partners.
        </p>
      </div>
    </div>
  );
}