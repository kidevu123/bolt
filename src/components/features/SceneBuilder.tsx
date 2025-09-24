import React, { useState } from 'react';
import { Wand2, Sparkles, Heart, Clock, MapPin, Lightbulb } from 'lucide-react';

export default function SceneBuilder({ user }: { user: any }) {
  const [currentMood, setCurrentMood] = useState('');
  const [preferences, setPreferences] = useState({
    energy: 3,
    intimacy: 3,
    adventure: 3,
    romance: 3,
  });
  const [generatedScene, setGeneratedScene] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const moods = [
    { value: 'playful', label: 'Playful', icon: '😈', color: 'from-pink-400 to-purple-400' },
    { value: 'romantic', label: 'Romantic', icon: '💕', color: 'from-rose-400 to-pink-400' },
    { value: 'passionate', label: 'Passionate', icon: '🔥', color: 'from-red-400 to-pink-400' },
    { value: 'adventurous', label: 'Adventurous', icon: '⚡', color: 'from-amber-400 to-red-400' },
    { value: 'intimate', label: 'Intimate', icon: '🌹', color: 'from-purple-400 to-indigo-400' },
    { value: 'sensual', label: 'Sensual', icon: '✨', color: 'from-indigo-400 to-purple-400' },
  ];

  const generateScene = async () => {
    if (!currentMood) return;
    
    setLoading(true);
    
    // Simulate AI scene generation (replace with actual AI API call)
    setTimeout(() => {
      const scenes = {
        playful: {
          title: "Playful Evening Adventure",
          setting: "Cozy living room with soft lighting",
          activities: ["Massage with flavored oils", "Playful teasing game", "Intimate conversation"],
          duration: "1-2 hours",
          preparation: ["Dim the lights", "Light scented candles", "Prepare massage oils"],
          mood_music: "Soft jazz or ambient music",
          special_touches: ["Blindfold surprise", "Feather touches", "Ice cube play"]
        },
        romantic: {
          title: "Romantic Candlelit Connection",
          setting: "Bedroom transformed into romantic haven",
          activities: ["Slow dance", "Wine tasting", "Poetry reading"],
          duration: "2-3 hours",
          preparation: ["Rose petals on bed", "Champagne chilled", "Soft music playlist"],
          mood_music: "Classical or soft acoustic",
          special_touches: ["Love letters", "Surprise gifts", "Stargazing"]
        },
        passionate: {
          title: "Intense Passion Session",
          setting: "Private space with mood lighting",
          activities: ["Passionate massage", "Deep connection", "Exploration time"],
          duration: "1-2 hours",
          preparation: ["Privacy ensured", "Comfortable temperature", "Hydration ready"],
          mood_music: "Sensual R&B or electronic",
          special_touches: ["Temperature play", "Texture exploration", "Breathwork"]
        }
      };

      const selectedScene = scenes[currentMood as keyof typeof scenes] || scenes.romantic;
      setGeneratedScene({
        ...selectedScene,
        preferences: preferences,
        customized_for: user?.user_metadata?.role || 'partner1'
      });
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-gray-800 mb-2">Scene Builder</h1>
        <p className="text-gray-600">Let AI create the perfect intimate scenario based on your mood and preferences</p>
      </div>

      {/* Mood Selection */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-rose-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
          <Heart className="h-5 w-5 text-rose-500" />
          <span>What's your current mood?</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {moods.map((mood) => (
            <button
              key={mood.value}
              onClick={() => setCurrentMood(mood.value)}
              className={`p-4 rounded-xl transition-all duration-200 ${
                currentMood === mood.value
                  ? `bg-gradient-to-r ${mood.color} text-white shadow-lg scale-105`
                  : 'bg-white border border-rose-200 text-gray-700 hover:shadow-md'
              }`}
            >
              <span className="text-2xl block mb-2">{mood.icon}</span>
              <span className="font-medium">{mood.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preference Sliders */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-rose-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          <span>Fine-tune your preferences</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(preferences).map(([key, value]) => (
            <div key={key}>
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium text-gray-700 capitalize">{key}</label>
                <span className="text-sm text-gray-600">{value}/5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={value}
                onChange={(e) => setPreferences({
                  ...preferences,
                  [key]: parseInt(e.target.value)
                })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <div className="text-center">
        <button
          onClick={generateScene}
          disabled={!currentMood || loading}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 shadow-lg flex items-center space-x-3 mx-auto"
        >
          <Wand2 className={`h-6 w-6 ${loading ? 'animate-spin' : ''}`} />
          <span className="text-lg font-medium">
            {loading ? 'Creating your perfect scene...' : 'Generate Scene'}
          </span>
        </button>
      </div>

      {/* Generated Scene */}
      {generatedScene && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-200 shadow-lg">
          <div className="text-center mb-6">
            <Sparkles className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <h2 className="text-2xl font-serif text-gray-800">{generatedScene.title}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-white/80 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-purple-500" />
                  <span>Setting</span>
                </h3>
                <p className="text-gray-700">{generatedScene.setting}</p>
              </div>

              <div className="bg-white/80 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <span>Duration</span>
                </h3>
                <p className="text-gray-700">{generatedScene.duration}</p>
              </div>

              <div className="bg-white/80 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Mood Music</h3>
                <p className="text-gray-700">{generatedScene.mood_music}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white/80 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Activities</h3>
                <ul className="space-y-1">
                  {generatedScene.activities.map((activity: string, index: number) => (
                    <li key={index} className="text-gray-700 flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                      <span>{activity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/80 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Preparation</h3>
                <ul className="space-y-1">
                  {generatedScene.preparation.map((item: string, index: number) => (
                    <li key={index} className="text-gray-700 flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-pink-400 rounded-full" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/80 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Special Touches</h3>
                <ul className="space-y-1">
                  {generatedScene.special_touches.map((touch: string, index: number) => (
                    <li key={index} className="text-gray-700 flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                      <span>{touch}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={generateScene}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
            >
              Generate New Scene
            </button>
          </div>
        </div>
      )}
    </div>
  );
}