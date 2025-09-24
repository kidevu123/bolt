import React, { useState, useEffect } from 'react';
import { Gamepad2, Play, Pause, Square, Settings, Bluetooth, Battery, Wifi } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface Toy {
  id: string;
  name: string;
  type: string;
  connectionStatus: 'connected' | 'disconnected' | 'pairing';
  batteryLevel: number;
  currentIntensity: number;
  patterns: Pattern[];
}

interface Pattern {
  id: string;
  name: string;
  description: string;
  duration: number;
  intensityMap: number[];
  isCustom: boolean;
}

export default function ToyControl({ user }: { user: any }) {
  const [toys, setToys] = useState<Toy[]>([]);
  const [activeToy, setActiveToy] = useState<Toy | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPattern, setCurrentPattern] = useState<Pattern | null>(null);
  const [customIntensity, setCustomIntensity] = useState(50);
  const [sessionData, setSessionData] = useState({
    duration: 0,
    startTime: null as Date | null,
    moodBefore: 5,
    notes: ''
  });

  const toyTypes = [
    { value: 'vibrator', label: 'Vibrator', icon: '💫' },
    { value: 'remote', label: 'Remote Control', icon: '🎮' },
    { value: 'smart', label: 'Smart Device', icon: '📱' },
    { value: 'couples', label: 'Couples Toy', icon: '💕' },
    { value: 'other', label: 'Other', icon: '⭐' },
  ];

  const presetPatterns: Pattern[] = [
    {
      id: '1',
      name: 'Gentle Wave',
      description: 'Soft, rolling waves of intensity',
      duration: 60,
      intensityMap: [30, 40, 50, 60, 70, 60, 50, 40, 30],
      isCustom: false
    },
    {
      id: '2',
      name: 'Pulse Play',
      description: 'Quick pulses with increasing intensity',
      duration: 45,
      intensityMap: [20, 80, 20, 80, 30, 90, 30, 90],
      isCustom: false
    },
    {
      id: '3',
      name: 'Building Excitement',
      description: 'Gradually building to climax',
      duration: 90,
      intensityMap: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
      isCustom: false
    },
    {
      id: '4',
      name: 'Teasing Touch',
      description: 'Playful teasing with unexpected pauses',
      duration: 75,
      intensityMap: [40, 0, 60, 0, 80, 0, 100, 50],
      isCustom: false
    }
  ];

  useEffect(() => {
    // Initialize with sample toys - in production, this would connect to actual devices
    const sampleToys: Toy[] = [
      {
        id: '1',
        name: 'Lovense Edge',
        type: 'couples',
        connectionStatus: 'connected',
        batteryLevel: 85,
        currentIntensity: 0,
        patterns: presetPatterns
      },
      {
        id: '2',
        name: 'We-Vibe Sync',
        type: 'couples',
        connectionStatus: 'disconnected',
        batteryLevel: 92,
        currentIntensity: 0,
        patterns: presetPatterns
      }
    ];
    setToys(sampleToys);
  }, []);

  const connectToy = async (toyId: string) => {
    setToys(prev => prev.map(toy => 
      toy.id === toyId 
        ? { ...toy, connectionStatus: 'pairing' as const }
        : toy
    ));

    // Simulate connection process
    setTimeout(() => {
      setToys(prev => prev.map(toy => 
        toy.id === toyId 
          ? { ...toy, connectionStatus: 'connected' as const }
          : toy
      ));
    }, 2000);
  };

  const startSession = () => {
    if (!activeToy) return;
    
    setIsPlaying(true);
    setSessionData({
      ...sessionData,
      startTime: new Date()
    });
  };

  const stopSession = async () => {
    if (!activeToy || !sessionData.startTime) return;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - sessionData.startTime.getTime()) / 1000);

    try {
      const { error } = await supabase
        .from('toy_sessions')
        .insert([{
          toy_name: activeToy.name,
          toy_type: activeToy.type,
          session_data: {
            pattern: currentPattern?.name,
            max_intensity: Math.max(...(currentPattern?.intensityMap || [customIntensity])),
            avg_intensity: customIntensity
          },
          duration: `${duration} seconds`,
          session_notes: sessionData.notes,
          mood_before: sessionData.moodBefore,
          created_by: user.id
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving session:', error);
    }

    setIsPlaying(false);
    setSessionData({
      duration: 0,
      startTime: null,
      moodBefore: 5,
      notes: ''
    });
  };

  const updateIntensity = (intensity: number) => {
    if (!activeToy) return;
    
    setCustomIntensity(intensity);
    setToys(prev => prev.map(toy => 
      toy.id === activeToy.id 
        ? { ...toy, currentIntensity: intensity }
        : toy
    ));
  };

  const selectPattern = (pattern: Pattern) => {
    setCurrentPattern(pattern);
    // In a real implementation, this would send the pattern to the device
    console.log('Pattern selected:', pattern);
  };

  const getConnectionIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <Bluetooth className="h-4 w-4 text-green-500" />;
      case 'pairing':
        return <Wifi className="h-4 w-4 text-yellow-500 animate-pulse" />;
      default:
        return <Bluetooth className="h-4 w-4 text-gray-400" />;
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 60) return 'text-green-500';
    if (level > 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-gray-800 mb-2">Toy Control</h1>
        <p className="text-gray-600">Smart toy integration for enhanced intimate experiences</p>
      </div>

      {/* Device Selection */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-rose-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Connected Devices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {toys.map((toy) => {
            const toyType = toyTypes.find(t => t.value === toy.type);
            
            return (
              <div
                key={toy.id}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  activeToy?.id === toy.id
                    ? 'border-rose-400 bg-rose-50'
                    : 'border-gray-200 hover:border-rose-200'
                }`}
                onClick={() => setActiveToy(toy)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{toyType?.icon || '⭐'}</span>
                    <div>
                      <h3 className="font-medium text-gray-800">{toy.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{toy.type} device</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getConnectionIcon(toy.connectionStatus)}
                    <div className="flex items-center space-x-1">
                      <Battery className={`h-4 w-4 ${getBatteryColor(toy.batteryLevel)}`} />
                      <span className={`text-xs ${getBatteryColor(toy.batteryLevel)}`}>
                        {toy.batteryLevel}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    toy.connectionStatus === 'connected'
                      ? 'bg-green-100 text-green-800'
                      : toy.connectionStatus === 'pairing'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {toy.connectionStatus === 'pairing' ? 'Pairing...' : toy.connectionStatus}
                  </span>
                  
                  {toy.connectionStatus === 'disconnected' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        connectToy(toy.id);
                      }}
                      className="bg-rose-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-rose-600 transition-colors"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {activeToy && (
        <>
          {/* Control Panel */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-rose-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Control Panel - {activeToy.name}</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Intensity Control */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-medium text-gray-700">Intensity</label>
                    <span className="text-lg font-semibold text-rose-600">{customIntensity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={customIntensity}
                    onChange={(e) => updateIntensity(parseInt(e.target.value))}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    disabled={isPlaying && currentPattern}
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={startSession}
                    disabled={isPlaying || activeToy.connectionStatus !== 'connected'}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    <Play className="h-5 w-5" />
                    <span>Start</span>
                  </button>
                  <button
                    onClick={stopSession}
                    disabled={!isPlaying}
                    className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 text-white py-3 rounded-xl hover:from-red-600 hover:to-rose-600 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    <Square className="h-5 w-5" />
                    <span>Stop</span>
                  </button>
                </div>
              </div>

              {/* Session Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mood Before (1-10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={sessionData.moodBefore}
                    onChange={(e) => setSessionData({
                      ...sessionData,
                      moodBefore: parseInt(e.target.value)
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low</span>
                    <span className="font-medium">{sessionData.moodBefore}</span>
                    <span>High</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Notes
                  </label>
                  <textarea
                    value={sessionData.notes}
                    onChange={(e) => setSessionData({
                      ...sessionData,
                      notes: e.target.value
                    })}
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl border border-rose-200 focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all duration-200"
                    placeholder="How are you feeling? Any special requests?"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pattern Selection */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-rose-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Vibration Patterns</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {presetPatterns.map((pattern) => (
                <button
                  key={pattern.id}
                  onClick={() => selectPattern(pattern)}
                  disabled={isPlaying}
                  className={`p-4 text-left rounded-xl border-2 transition-all duration-200 disabled:opacity-50 ${
                    currentPattern?.id === pattern.id
                      ? 'border-purple-400 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-800">{pattern.name}</h3>
                    <span className="text-xs text-gray-500">{pattern.duration}s</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{pattern.description}</p>
                  
                  {/* Intensity visualization */}
                  <div className="flex items-end space-x-1 h-8">
                    {pattern.intensityMap.map((intensity, index) => (
                      <div
                        key={index}
                        className="bg-purple-300 rounded-t"
                        style={{
                          height: `${(intensity / 100) * 100}%`,
                          width: `${100 / pattern.intensityMap.length}%`
                        }}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {!activeToy && (
        <div className="text-center py-12">
          <Gamepad2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No device selected</h3>
          <p className="text-gray-500">Connect and select a device to start controlling</p>
        </div>
      )}

      {/* Safety Information */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-800">
          <strong>Safety First:</strong> Always start with low intensity and gradually increase. 
          Stay hydrated, communicate with your partner, and stop immediately if you feel any discomfort. 
          Clean devices before and after use according to manufacturer instructions.
        </p>
      </div>
    </div>
  );
}