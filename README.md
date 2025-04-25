# Trivia Master 🧠

A modern, AI-powered trivia quiz platform built with Next.js 13, TypeScript, and Tailwind CSS. Create, play, and share engaging quizzes across various categories.

## 🌟 Features

- **AI-Powered Quiz Generation**: Create custom quizzes using advanced AI technology
- **Multiple Categories**: Explore quizzes across various domains including:
  - Movies & TV Shows 🎬
  - Music 🎵
  - Sports ⚽
  - Science 🔬
  - History 📚
  - Geography 🌍
  - Technology 💻
  - Gaming 🎮

- **Adaptive Difficulty Levels**:
  - Easy
  - Medium
  - Hard
  - Expert

- **Interactive Quiz Experience**:
  - Real-time scoring
  - Progress tracking
  - Detailed explanations for answers
  - Customizable reveal limits based on quiz length
  - Timer functionality

- **Modern UI/UX**:
  - Responsive design
  - Beautiful animations using Framer Motion
  - Dark/Light mode support
  - Loading states and transitions
  - Mobile-friendly interface

- **Social Features**:
  - Leaderboard system
  - Share quiz results
  - Study mode for learning
  - User progress tracking

## 🛠️ Tech Stack

- **Framework**: Next.js 13 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: 
  - Radix UI primitives
  - Shadcn UI components
  - Lucide icons
- **Animation**: Framer Motion
- **State Management**: React Hooks
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **AI Integration**: OpenAI API
- **Charts**: Recharts
- **PDF Generation**: @react-pdf/renderer

## 📦 Project Structure

```
tr/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── create/            # Quiz creation
│   ├── quiz/              # Quiz taking experience
│   ├── categories/        # Category browsing
│   └── study/            # Study mode
├── components/            # Reusable components
├── lib/                   # Utility functions
├── data/                  # Static data
├── hooks/                 # Custom React hooks
├── public/               # Static assets
└── types/                # TypeScript types
```

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   ```

2. **Install dependencies**
   ```bash
   cd tr
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your API keys and configuration

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🔑 Environment Variables

Required environment variables:
- `OPENAI_API_KEY`: Your OpenAI API key
- `NEXT_PUBLIC_APP_URL`: Your application URL
- Additional configuration variables as specified in `.env.example`

## 📱 Key Features Explained

### Quiz Generation
- AI-powered quiz creation using OpenAI's API
- Customizable question count (5-20 questions)
- Multiple difficulty levels
- Topic-specific question generation
- Detailed explanations for answers

### Quiz Taking Experience
- Interactive question navigation
- Real-time scoring
- Progress tracking
- Timed quizzes
- Answer reveal system with limits
- Mobile-friendly interface

### Study Mode
- Focused learning experience
- Detailed explanations
- Progress tracking
- Category-specific study paths

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- AI capabilities powered by [OpenAI](https://openai.com/) 