import React, { useState, useEffect } from 'react';
import { Heart, Search, Filter, Star, BookOpen, Play } from 'lucide-react';

interface Position {
  id: string;
  name: string;
  category: string;
  difficulty: number;
  description: string;
  benefits: string[];
  tips: string[];
  image_url?: string;
  is_favorite: boolean;
}

export default function PositionExplorer({ user }: { user: any }) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const categories = [
    { value: 'all', label: 'All Categories', icon: '🌟' },
    { value: 'intimate', label: 'Intimate', icon: '💕' },
    { value: 'playful', label: 'Playful', icon: '😊' },
    { value: 'adventurous', label: 'Adventurous', icon: '🔥' },
    { value: 'romantic', label: 'Romantic', icon: '🌹' },
    { value: 'sensual', label: 'Sensual', icon: '✨' },
  ];

  const difficultyLevels = [
    { value: 'all', label: 'All Levels' },
    { value: '1', label: 'Beginner' },
    { value: '2', label: 'Easy' },
    { value: '3', label: 'Moderate' },
    { value: '4', label: 'Advanced' },
    { value: '5', label: 'Expert' },
  ];

  useEffect(() => {
    // Simulate fetching educational content about intimacy positions
    const samplePositions: Position[] = [
      {
        id: '1',
        name: 'Loving Embrace',
        category: 'intimate',
        difficulty: 1,
        description: 'A gentle, face-to-face position that emphasizes emotional connection and intimacy.',
        benefits: ['Deep emotional connection', 'Eye contact', 'Gentle pace', 'Perfect for beginners'],
        tips: ['Take your time', 'Focus on breathing together', 'Maintain eye contact', 'Communicate throughout'],
        image_url: 'https://images.pexels.com/photos/3771115/pexels-photo-3771115.jpeg',
        is_favorite: false,
      },
      {
        id: '2',
        name: 'Romantic Connection',
        category: 'romantic',
        difficulty: 2,
        description: 'A classic position that allows for tender kisses and whispered sweet words.',
        benefits: ['Romantic atmosphere', 'Close physical contact', 'Intimate conversation', 'Emotional bonding'],
        tips: ['Create romantic ambiance', 'Focus on sensation', 'Communicate desires', 'Take breaks for kissing'],
        image_url: 'https://images.pexels.com/photos/1034473/pexels-photo-1034473.jpeg',
        is_favorite: true,
      },
      {
        id: '3',
        name: 'Playful Adventure',
        category: 'playful',
        difficulty: 3,
        description: 'An exciting position that brings fun and spontaneity to your intimate moments.',
        benefits: ['Increases excitement', 'Adds variety', 'Builds anticipation', 'Enhances pleasure'],
        tips: ['Start slowly', 'Use pillows for comfort', 'Stay hydrated', 'Focus on enjoyment'],
        image_url: 'https://images.pexels.com/photos/3771135/pexels-photo-3771135.jpeg',
        is_favorite: false,
      },
    ];
    setPositions(samplePositions);
  }, []);

  const filteredPositions = positions.filter(position => {
    const matchesSearch = position.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         position.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || position.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || position.difficulty.toString() === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const toggleFavorite = (positionId: string) => {
    setPositions(prev => prev.map(p => 
      p.id === positionId ? { ...p, is_favorite: !p.is_favorite } : p
    ));
  };

  const getDifficultyColor = (difficulty: number) => {
    const colors = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-blue-100 text-blue-800',
      3: 'bg-yellow-100 text-yellow-800',
      4: 'bg-orange-100 text-orange-800',
      5: 'bg-red-100 text-red-800',
    };
    return colors[difficulty as keyof typeof colors] || colors[1];
  };

  const getDifficultyLabel = (difficulty: number) => {
    const labels = {
      1: 'Beginner',
      2: 'Easy',
      3: 'Moderate',
      4: 'Advanced',
      5: 'Expert',
    };
    return labels[difficulty as keyof typeof labels] || 'Beginner';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-gray-800 mb-2">Intimacy Guide</h1>
        <p className="text-gray-600">Educational content to enhance your intimate connection</p>
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
            placeholder="Search positions or techniques..."
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-rose-200 focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all duration-200"
            >
              {difficultyLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Position Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPositions.map((position) => {
          const category = categories.find(c => c.value === position.category);
          
          return (
            <div
              key={position.id}
              className="bg-white/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-rose-200 hover:shadow-lg transition-all duration-200"
            >
              {position.image_url && (
                <div className="h-48 bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-rose-400" />
                  <span className="ml-2 text-rose-600 font-medium">Educational Content</span>
                </div>
              )}
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{category?.icon || '💕'}</span>
                    <h3 className="font-semibold text-gray-800">{position.name}</h3>
                  </div>
                  <button
                    onClick={() => toggleFavorite(position.id)}
                    className={`p-1 rounded-full transition-colors ${
                      position.is_favorite 
                        ? 'text-red-500 hover:text-red-600' 
                        : 'text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${position.is_favorite ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <div className="flex items-center space-x-2 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(position.difficulty)}`}>
                    {getDifficultyLabel(position.difficulty)}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">{position.category}</span>
                </div>

                <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                  {position.description}
                </p>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-800 text-sm mb-1">Benefits:</h4>
                    <div className="flex flex-wrap gap-1">
                      {position.benefits.slice(0, 2).map((benefit, index) => (
                        <span
                          key={index}
                          className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-full"
                        >
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setShowDetails(showDetails === position.id ? null : position.id)}
                    className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-2 rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all duration-200 text-sm font-medium"
                  >
                    {showDetails === position.id ? 'Hide Details' : 'View Details'}
                  </button>
                </div>
              </div>

              {showDetails === position.id && (
                <div className="px-6 pb-6 border-t border-rose-200 pt-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">All Benefits:</h4>
                      <ul className="space-y-1">
                        {position.benefits.map((benefit, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-center space-x-2">
                            <span className="w-1.5 h-1.5 bg-rose-400 rounded-full" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Tips & Techniques:</h4>
                      <ul className="space-y-1">
                        {position.tips.map((tip, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-center space-x-2">
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredPositions.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-rose-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No positions found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Educational Disclaimer */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <strong>Educational Purpose:</strong> This content is provided for educational purposes to enhance intimate relationships. 
          Always communicate with your partner, proceed at your own comfort level, and prioritize consent and safety.
        </p>
      </div>
    </div>
  );
}