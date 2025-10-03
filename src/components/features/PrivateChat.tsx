import React, { useState, useEffect, useRef } from 'react';
import { Send, Image, Heart, Smile, Camera, Mic, Paperclip } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_role: string;
  message_type: 'text' | 'image' | 'audio';
  media_url?: string;
  created_at: string;
}

export default function PrivateChat({ user }: { user: any }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMessages();
    subscribeToMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const subscribeToMessages = () => {
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'messages' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages(prev => [...prev, payload.new as Message]);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          content: newMessage,
          sender_id: user.id,
          sender_role: user.user_metadata?.role || 'partner1',
          message_type: 'text',
        }]);

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
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

  const currentUserRole = user?.user_metadata?.role || 'partner1';

  const quickMessages = [
    "Thinking of you ❤️",
    "Can't wait to see you",
    "You're amazing",
    "Miss you already",
    "Love you so much",
  ];

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-serif text-gray-800 mb-2">Private Chat</h1>
          <p className="text-gray-600">Your secure, intimate conversation space</p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 bg-white/60 backdrop-blur-sm rounded-2xl border border-rose-200 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => {
            const isCurrentUser = message.sender_role === currentUserRole;
            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    isCurrentUser
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white'
                      : 'bg-white border border-rose-200 text-gray-800'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <span
                    className={`text-xs mt-1 block ${
                      isCurrentUser ? 'text-rose-100' : 'text-gray-500'
                    }`}
                  >
                    {formatTime(message.created_at)}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Messages */}
        <div className="px-6 py-3 border-t border-rose-200 bg-rose-50/50">
          <div className="flex flex-wrap gap-2">
            {quickMessages.map((msg, index) => (
              <button
                key={index}
                onClick={() => setNewMessage(msg)}
                className="text-xs bg-white/80 text-gray-700 px-3 py-1 rounded-full hover:bg-rose-100 transition-colors"
              >
                {msg}
              </button>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-rose-200 bg-white/80">
          <div className="flex items-end space-x-3">
            <div className="flex space-x-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-100 rounded-full transition-all duration-200"
              >
                <Image className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-100 rounded-full transition-all duration-200">
                <Camera className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-100 rounded-full transition-all duration-200">
                <Mic className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={1}
                className="w-full px-4 py-3 rounded-xl border border-rose-200 focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Type your intimate message..."
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={loading || !newMessage.trim()}
              className="bg-gradient-to-r from-rose-500 to-pink-500 text-white p-3 rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 shadow-lg"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          // Handle file upload logic here
          console.log('File selected:', e.target.files?.[0]);
        }}
      />
    </div>
  );
}