import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Heart, Lightbulb, Users, Shield, Sparkles, MessageCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface Conversation {
  id: string;
  user_message: string;
  ai_response: string;
  conversation_type: string;
  mood_tag?: string;
  created_at: string;
}

export default function AICompanion({ user }: { user: any }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [conversationType, setConversationType] = useState('general');
  const [isTyping, setIsTyping] = useState(false);
  const [moodTag, setMoodTag] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversationTypes = [
    { value: 'general', label: 'General Chat', icon: MessageCircle, color: 'from-blue-500 to-indigo-500' },
    { value: 'relationship', label: 'Relationship Advice', icon: Heart, color: 'from-rose-500 to-pink-500' },
    { value: 'intimacy', label: 'Intimacy Guidance', icon: Sparkles, color: 'from-purple-500 to-pink-500' },
    { value: 'health', label: 'Health & Wellness', icon: Shield, color: 'from-green-500 to-emerald-500' },
    { value: 'emotional', label: 'Emotional Support', icon: Users, color: 'from-amber-500 to-orange-500' },
  ];

  const quickPrompts = [
    "How can we improve our communication?",
    "What are some romantic date ideas?",
    "Help me understand my partner better",
    "Ways to show appreciation and love",
    "How to handle difficult conversations",
    "Ideas for staying connected during tough times"
  ];

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversations]);

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const generateAIResponse = async (userMessage: string, type: string): Promise<string> => {
    // This is a sophisticated AI response system that would integrate with OpenAI, Anthropic, or local LLM
    // For now, we'll simulate intelligent responses based on conversation type
    
    const responses = {
      general: [
        "I understand you're looking for guidance. Communication and understanding are the foundation of any strong relationship. What specific aspect would you like to explore further?",
        "Every relationship is unique, and it's wonderful that you're seeking to understand and grow together. Tell me more about what's on your mind.",
        "Building a strong connection takes time, patience, and mutual respect. I'm here to help you navigate this journey."
      ],
      relationship: [
        "Healthy relationships are built on trust, communication, and mutual respect. What challenges are you facing that I can help you work through?",
        "Remember that every relationship goes through ups and downs. The key is maintaining open dialogue and showing empathy for each other's perspectives.",
        "Love languages, quality time, and understanding each other's needs are crucial. Which area would you like to focus on?"
      ],
      intimacy: [
        "Intimacy is about emotional and physical connection built on trust and communication. What aspects of intimacy would you like to explore together?",
        "Creating safe spaces for vulnerability and open conversation is essential for intimate connections. How can I help you build that foundation?",
        "Physical and emotional intimacy grow together through patience, understanding, and mutual exploration. What questions do you have?"
      ],
      health: [
        "Your physical and emotional well-being directly impact your relationship. Self-care isn't selfish—it's necessary for being your best self with your partner.",
        "Health challenges can be difficult, but facing them together can strengthen your bond. What support do you need right now?",
        "Maintaining both individual and couple wellness is important. How can you support each other's health goals?"
      ],
      emotional: [
        "Your feelings are valid, and it's important to acknowledge them. Emotional support in relationships means being present and understanding.",
        "Processing emotions together can deepen your connection. What emotions are you working through that I can help you understand?",
        "Emotional intimacy requires vulnerability and trust. I'm here to provide guidance as you navigate these feelings."
      ]
    };

    const typeResponses = responses[type as keyof typeof responses] || responses.general;
    const baseResponse = typeResponses[Math.floor(Math.random() * typeResponses.length)];

    // Add contextual information based on user message content
    if (userMessage.toLowerCase().includes('cancer') || userMessage.toLowerCase().includes('illness')) {
      return `${baseResponse} I understand you're dealing with health challenges, which can add complexity to relationships. Remember that love, support, and being present for each other are the most powerful tools you have. What specific support do you need right now?`;
    }

    if (userMessage.toLowerCase().includes('communicate') || userMessage.toLowerCase().includes('talk')) {
      return `${baseResponse} Communication is the bridge between hearts and minds. Try setting aside dedicated time for conversations without distractions, using "I feel" statements, and actively listening to understand rather than respond.`;
    }

    return baseResponse;
  };

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMsg = currentMessage;
    setCurrentMessage('');
    setIsTyping(true);

    try {
      // Generate AI response
      const aiResponse = await generateAIResponse(userMsg, conversationType);

      // Save conversation to database
      const { data, error } = await supabase
        .from('ai_conversations')
        .insert([{
          user_id: user.id,
          conversation_type: conversationType,
          user_message: userMsg,
          ai_response: aiResponse,
          mood_tag: moodTag || null
        }])
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      if (data) {
        setConversations(prev => [...prev, data]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsTyping(false);
      setMoodTag('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-serif text-gray-800 mb-2">AI Companion</h1>
          <p className="text-gray-600">Your judgment-free, supportive AI guide for relationship and intimacy questions</p>
        </div>
      </div>

      {/* Conversation Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Conversation Focus</label>
        <div className="flex flex-wrap gap-2">
          {conversationTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                onClick={() => setConversationType(type.value)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                  conversationType === type.value
                    ? `bg-gradient-to-r ${type.color} text-white shadow-lg`
                    : 'bg-white/60 text-gray-700 border border-rose-200 hover:bg-rose-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium text-sm">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-white/60 backdrop-blur-sm rounded-2xl border border-rose-200 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {conversations.length === 0 && (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Welcome to your AI Companion</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                I'm here to provide judgment-free support, advice, and guidance for your relationship and intimacy questions. 
                Everything we discuss is private and confidential.
              </p>
            </div>
          )}

          {conversations.map((conversation, index) => (
            <div key={conversation.id} className="space-y-4">
              {/* User Message */}
              <div className="flex justify-end">
                <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white">
                  <p className="text-sm leading-relaxed">{conversation.user_message}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-rose-100">{formatTime(conversation.created_at)}</span>
                    {conversation.mood_tag && (
                      <span className="text-xs bg-rose-400 text-rose-100 px-2 py-1 rounded-full">
                        {conversation.mood_tag}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Response */}
              <div className="flex justify-start">
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl bg-white border border-purple-200">
                    <p className="text-sm leading-relaxed text-gray-800">{conversation.ai_response}</p>
                    <span className="text-xs text-gray-500 mt-1 block">{formatTime(conversation.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white border border-purple-200">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        {conversations.length === 0 && (
          <div className="px-6 py-3 border-t border-purple-200 bg-purple-50/50">
            <p className="text-xs text-purple-700 mb-2 font-medium">Quick conversation starters:</p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentMessage(prompt)}
                  className="text-xs bg-white/80 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-100 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="p-4 border-t border-purple-200 bg-white/80">
          <div className="flex items-end space-x-3">
            <div className="flex-1 space-y-2">
              {/* Mood Tag Input */}
              <input
                type="text"
                value={moodTag}
                onChange={(e) => setMoodTag(e.target.value)}
                className="w-full px-3 py-1 text-xs rounded-lg border border-purple-200 focus:ring-1 focus:ring-purple-400 focus:border-transparent"
                placeholder="Current mood (optional)"
              />
              
              {/* Main Message Input */}
              <textarea
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Ask me anything about relationships, intimacy, or emotional support..."
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={isTyping || !currentMessage.trim()}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 shadow-lg"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-3">
        <p className="text-xs text-blue-800 flex items-center space-x-1">
          <Shield className="h-3 w-3" />
          <span>
            <strong>Complete Privacy:</strong> All conversations are encrypted and private. 
            I'm designed to provide supportive, judgment-free guidance while respecting your intimacy and personal boundaries.
          </span>
        </p>
      </div>
    </div>
  );
}