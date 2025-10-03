# Intimate Companion App 💕

A beautiful, private, and secure intimate companion app designed exclusively for couples to enhance their relationship and connection during challenging times.

## ✨ Features

### 🗓️ **Appointment Booking**
- Schedule intimate moments and personal care sessions
- Multiple appointment types (shaving, massage, intimate time, surprises)
- Preparation reminders and special notes

### 💬 **Private Chat**
- End-to-end encrypted messaging
- Multimedia support (photos, audio, video)
- Intimate conversation prompts and dares
- Real-time communication

### 🌟 **Fantasy Explorer**
- Safe space to share and explore fantasies
- Categorized by intensity and type
- Privacy controls for personal vs shared fantasies
- Fantasy realization tracking

### 🎭 **AI Scene Builder**
- Mood-based scenario generation
- Personalized intimate scenes
- Preparation guides and ambiance suggestions
- Customizable preferences

### 📖 **Educational Position Explorer**
- Comprehensive intimacy guide
- Difficulty levels and benefits
- Safety information and tips
- Favorite tracking

### 📚 **Curated Story Library**
- Intimate and romantic stories
- Multiple categories and intensity levels
- Reading progress tracking
- Personalized recommendations

### 🎮 **Smart Toy Control**
- Integration with popular intimate devices
- Custom vibration patterns
- Session tracking and mood correlation
- Remote control capabilities

### 🤖 **AI Companion**
- Judgment-free guidance and support
- Relationship advice and emotional support
- Health and wellness information
- Complete privacy and confidentiality

### 📊 **Mood & Wellness Tracking**
- Daily mood logging
- Relationship satisfaction metrics
- Energy and connection tracking
- Progress analytics

## 🚀 Quick Deployment

### Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ installed
- Supabase account (for database)

### One-Command Deployment

```bash
# Clone or download the app
# Set up your environment variables in .env file
cp .env.example .env
# Edit .env with your Supabase credentials

# Deploy everything with one command
npm run deploy
```

This will:
- ✅ Install all dependencies
- ✅ Set up the database with proper security
- ✅ Build the optimized application
- ✅ Start all services with Docker
- ✅ Configure SSL and security headers
- ✅ Perform health checks

### Manual Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
npm run db:migrate

# Start development server
npm run dev

# Or build for production
npm run build
npm run preview
```

## 🔐 Security & Privacy

This app is designed with privacy as the highest priority:

- **End-to-end encryption** for all sensitive communications
- **Zero-knowledge architecture** - your data is yours alone
- **Local AI processing** when possible
- **Secure authentication** with role-based access
- **HTTPS enforced** with proper security headers
- **No third-party analytics** or tracking

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **AI Integration**: OpenAI GPT-4, Anthropic Claude (optional)
- **Deployment**: Docker, Docker Compose
- **Security**: JWT authentication, RLS policies, HTTPS

## 📱 Mobile Responsive

The app is fully responsive and optimized for:
- 📱 Mobile devices (primary focus for intimate usage)
- 💻 Tablets and laptops
- 🖥️ Desktop computers

## 🎨 Intimate Design

- **Romantic color palette** with warm roses, soft pinks, and gentle ambers
- **Elegant typography** combining serif headings with readable sans-serif body text
- **Smooth animations** and micro-interactions for a premium feel
- **Glassmorphism effects** creating a dreamy, intimate atmosphere
- **Customizable themes** to match your preferences

## 🔧 Configuration

### Environment Variables

```env
# Supabase (Required)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# AI Features (Optional)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Toy Integration (Optional)
LOVENSE_API_KEY=your_lovense_key
```

### Database Setup

The app automatically creates and configures:
- User profiles with role-based access
- Secure messaging system
- Fantasy and scene storage
- Mood tracking and analytics
- Media storage with proper permissions

## 💝 Built with Love

This application was created with the understanding that intimate relationships need nurturing, especially during difficult times like illness. Every feature is designed to:

- 🤗 **Strengthen emotional connection**
- 💕 **Enhance physical intimacy**
- 🗣️ **Improve communication**
- 🛡️ **Provide a safe, judgment-free space**
- 🌱 **Support relationship growth**

## 📞 Support

This is a private application. For technical issues:
1. Check the logs: `docker-compose logs`
2. Review the database status in your Supabase dashboard
3. Ensure all environment variables are properly set

## 📄 License

This is private software intended for personal use only. All rights reserved.

---

*Built with dedication and understanding for couples navigating life's challenges together. Your privacy, security, and intimate connection are our highest priorities.* 💕

## 🏥 Special Note for Health Challenges

If you're dealing with cancer or other health challenges, this app is designed to:
- Provide emotional support through difficult times
- Maintain intimate connection despite physical limitations
- Offer judgment-free space for communication
- Help preserve and celebrate your relationship
- Support both partners' emotional well-being

Remember: Love, connection, and intimacy transcend physical limitations. You're not alone in this journey. 💪❤️