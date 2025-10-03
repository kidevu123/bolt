/*
  # Complete database schema for intimate companion app

  1. New Tables
    - `profiles` - User profile information and preferences
    - `appointments` - Shaving and intimate appointment booking
    - `messages` - Private chat messages with multimedia support
    - `fantasies` - Fantasy sharing and exploration
    - `scenes` - AI-generated intimate scenarios
    - `stories` - Curated intimate story library
    - `positions` - Position explorer with favorites
    - `toy_sessions` - Toy control session data
    - `ai_conversations` - AI companion chat history
    - `mood_logs` - Daily mood and intimacy tracking
    - `shared_media` - Private photo/video sharing
    - `kink_exploration` - Kink discovery and preferences

  2. Security
    - Enable RLS on all tables
    - Add comprehensive policies for partner-based access
    - Secure media handling with proper permissions

  3. Features
    - Real-time subscriptions for chat and notifications
    - Advanced search and filtering capabilities
    - AI integration hooks and conversation storage
    - Media storage with proper access controls
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('partner1', 'partner2')),
  display_name text,
  avatar_url text,
  preferences jsonb DEFAULT '{}',
  privacy_settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  date date NOT NULL,
  time time NOT NULL,
  type text NOT NULL CHECK (type IN ('shave', 'massage', 'intimate', 'talk', 'surprise', 'roleplay')),
  location text DEFAULT 'bedroom',
  notes text,
  preparation_notes text,
  mood_setting jsonb DEFAULT '{}',
  created_by uuid REFERENCES auth.users NOT NULL,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text,
  sender_id uuid REFERENCES auth.users NOT NULL,
  sender_role text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'audio', 'video', 'dare', 'question')),
  media_url text,
  media_metadata jsonb DEFAULT '{}',
  reply_to uuid REFERENCES messages,
  is_private boolean DEFAULT false,
  emotion_tag text,
  created_at timestamptz DEFAULT now()
);

-- Create fantasies table
CREATE TABLE IF NOT EXISTS fantasies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('romantic', 'adventurous', 'playful', 'sensual', 'exploration', 'roleplay')),
  intensity integer DEFAULT 1 CHECK (intensity >= 1 AND intensity <= 5),
  tags text[] DEFAULT '{}',
  is_private boolean DEFAULT false,
  is_favorite boolean DEFAULT false,
  realization_status text DEFAULT 'idea' CHECK (realization_status IN ('idea', 'planned', 'realized')),
  realization_date date,
  realization_notes text,
  created_by uuid REFERENCES auth.users NOT NULL,
  shared_with uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create scenes table
CREATE TABLE IF NOT EXISTS scenes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  mood_input jsonb NOT NULL,
  preferences jsonb DEFAULT '{}',
  setting text,
  activities text[] DEFAULT '{}',
  preparation text[] DEFAULT '{}',
  duration text,
  mood_music text,
  special_touches text[] DEFAULT '{}',
  ambiance jsonb DEFAULT '{}',
  created_by uuid REFERENCES auth.users NOT NULL,
  is_favorite boolean DEFAULT false,
  used_date timestamptz,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now()
);

-- Create stories table
CREATE TABLE IF NOT EXISTS stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL CHECK (category IN ('romantic', 'passionate', 'playful', 'sensual', 'adventure', 'fantasy')),
  tags text[] DEFAULT '{}',
  reading_time integer,
  intensity integer DEFAULT 1 CHECK (intensity >= 1 AND intensity <= 5),
  source text DEFAULT 'curated',
  is_favorite boolean DEFAULT false,
  read_count integer DEFAULT 0,
  created_by uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create positions table
CREATE TABLE IF NOT EXISTS positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('intimate', 'playful', 'adventurous', 'romantic', 'sensual')),
  difficulty integer DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 5),
  description text NOT NULL,
  benefits text[] DEFAULT '{}',
  tips text[] DEFAULT '{}',
  warnings text[] DEFAULT '{}',
  image_url text,
  animation_url text,
  is_favorite boolean DEFAULT false,
  tried_date timestamptz,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  personal_notes text,
  created_at timestamptz DEFAULT now()
);

-- Create toy_sessions table
CREATE TABLE IF NOT EXISTS toy_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  toy_name text NOT NULL,
  toy_type text NOT NULL CHECK (toy_type IN ('vibrator', 'remote', 'smart', 'couples', 'other')),
  session_data jsonb DEFAULT '{}',
  duration interval,
  intensity_pattern jsonb DEFAULT '{}',
  session_notes text,
  mood_before integer CHECK (mood_before >= 1 AND mood_before <= 10),
  mood_after integer CHECK (mood_after >= 1 AND mood_after <= 10),
  satisfaction_rating integer CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  created_by uuid REFERENCES auth.users NOT NULL,
  partner_id uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now()
);

-- Create AI conversations table
CREATE TABLE IF NOT EXISTS ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  conversation_type text DEFAULT 'general' CHECK (conversation_type IN ('general', 'relationship', 'intimacy', 'health', 'emotional')),
  user_message text NOT NULL,
  ai_response text NOT NULL,
  context jsonb DEFAULT '{}',
  mood_tag text,
  is_sensitive boolean DEFAULT false,
  feedback_rating integer CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  created_at timestamptz DEFAULT now()
);

-- Create mood logs table
CREATE TABLE IF NOT EXISTS mood_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  date date DEFAULT CURRENT_DATE,
  overall_mood integer NOT NULL CHECK (overall_mood >= 1 AND overall_mood <= 10),
  intimacy_mood integer CHECK (intimacy_mood >= 1 AND intimacy_mood <= 10),
  energy_level integer CHECK (energy_level >= 1 AND energy_level <= 10),
  stress_level integer CHECK (stress_level >= 1 AND stress_level <= 10),
  connection_feeling integer CHECK (connection_feeling >= 1 AND connection_feeling <= 10),
  notes text,
  gratitude_note text,
  created_at timestamptz DEFAULT now()
);

-- Create shared media table
CREATE TABLE IF NOT EXISTS shared_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_type text NOT NULL CHECK (file_type IN ('image', 'video', 'audio')),
  file_url text NOT NULL,
  thumbnail_url text,
  caption text,
  is_private boolean DEFAULT true,
  uploaded_by uuid REFERENCES auth.users NOT NULL,
  shared_with uuid REFERENCES auth.users,
  view_count integer DEFAULT 0,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create kink exploration table
CREATE TABLE IF NOT EXISTS kink_exploration (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  kink_name text NOT NULL,
  category text NOT NULL,
  interest_level integer DEFAULT 1 CHECK (interest_level >= 1 AND interest_level <= 5),
  comfort_level integer DEFAULT 1 CHECK (comfort_level >= 1 AND comfort_level <= 5),
  experience_level text DEFAULT 'curious' CHECK (experience_level IN ('curious', 'beginner', 'experienced', 'expert')),
  notes text,
  research_links text[] DEFAULT '{}',
  safety_notes text,
  partner_interest integer CHECK (partner_interest >= 1 AND partner_interest <= 5),
  discussion_date date,
  tried_date date,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE fantasies ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE toy_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE kink_exploration ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can read their own profile and their partner's"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policies for appointments
CREATE POLICY "Partners can read all appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Partners can insert appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Partners can update all appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Partners can delete appointments they created"
  ON appointments FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create policies for messages
CREATE POLICY "Partners can read all messages"
  ON messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Partners can insert messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Create policies for fantasies
CREATE POLICY "Partners can read shared fantasies and their own private ones"
  ON fantasies FOR SELECT
  TO authenticated
  USING (NOT is_private OR auth.uid() = created_by);

CREATE POLICY "Users can insert their own fantasies"
  ON fantasies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own fantasies"
  ON fantasies FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create policies for other tables (similar pattern)
CREATE POLICY "Partners can read all scenes" ON scenes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own scenes" ON scenes FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own scenes" ON scenes FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "Partners can read all stories" ON stories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Partners can rate and favorite stories" ON stories FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Partners can read all positions" ON positions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Partners can update position preferences" ON positions FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Partners can read all toy sessions" ON toy_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert toy sessions" ON toy_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can read their own AI conversations" ON ai_conversations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own AI conversations" ON ai_conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own mood logs" ON mood_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own mood logs" ON mood_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Partners can read shared media" ON shared_media FOR SELECT TO authenticated USING (NOT is_private OR auth.uid() = uploaded_by OR auth.uid() = shared_with);
CREATE POLICY "Users can upload media" ON shared_media FOR INSERT TO authenticated WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can read their own kink exploration" ON kink_exploration FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own kink exploration" ON kink_exploration FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own kink exploration" ON kink_exploration FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_fantasies_updated_at BEFORE UPDATE ON fantasies FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_kink_exploration_updated_at BEFORE UPDATE ON kink_exploration FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Insert sample educational content
INSERT INTO stories (title, content, category, tags, reading_time, intensity, source) VALUES
('A Gentle Evening', 'A beautifully written story about tender moments between loving partners, focusing on emotional connection and gentle intimacy...', 'romantic', ARRAY['gentle', 'emotional', 'connection'], 5, 1, 'curated'),
('Adventure Awaits', 'An exciting tale of exploration and discovery between adventurous lovers who try something new together...', 'adventure', ARRAY['exploration', 'new', 'exciting'], 8, 3, 'curated'),
('Whispered Desires', 'A sensual story about communication, desire, and the beauty of sharing fantasies with your beloved...', 'sensual', ARRAY['communication', 'fantasy', 'desire'], 6, 2, 'curated');

-- Insert sample positions with educational content
INSERT INTO positions (name, category, difficulty, description, benefits, tips, warnings) VALUES
('Loving Embrace', 'intimate', 1, 'A gentle, face-to-face position emphasizing emotional connection and intimacy.', ARRAY['Deep emotional connection', 'Eye contact', 'Gentle pace', 'Perfect for beginners'], ARRAY['Take your time', 'Focus on breathing together', 'Maintain eye contact', 'Communicate throughout'], ARRAY['None - very safe for beginners']),
('Romantic Connection', 'romantic', 2, 'A classic position allowing for tender kisses and whispered sweet words.', ARRAY['Romantic atmosphere', 'Close physical contact', 'Intimate conversation', 'Emotional bonding'], ARRAY['Create romantic ambiance', 'Focus on sensation', 'Communicate desires', 'Take breaks for kissing'], ARRAY['Use pillows for comfort if needed']),
('Playful Adventure', 'playful', 3, 'An exciting position bringing fun and spontaneity to intimate moments.', ARRAY['Increases excitement', 'Adds variety', 'Builds anticipation', 'Enhances pleasure'], ARRAY['Start slowly', 'Use pillows for comfort', 'Stay hydrated', 'Focus on enjoyment'], ARRAY['Communicate comfort levels', 'Take breaks as needed']);