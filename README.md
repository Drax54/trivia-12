# Trivia Master 🧠

A modern trivia quiz platform built with Next.js, TypeScript, and Tailwind CSS. Play and share engaging quizzes across various categories.

## 🌟 Features

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
  - Share quiz results
  - Study mode for learning

## 🛠️ Tech Stack

- **Framework**: Next.js with App Router and Static Export
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
- **Charts**: Recharts

## 📦 Project Structure

```
tr/
├── app/                    # Next.js app directory
│   ├── quiz/              # Quiz taking experience
│   ├── categories/        # Category browsing
│   └── study/             # Study mode
├── components/            # Reusable components
├── lib/                   # Utility functions
├── data/                  # Static data
├── hooks/                 # Custom React hooks
├── public/                # Static assets
├── out/                   # Static export output
└── types/                 # TypeScript types
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

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Build static export**
   ```bash
   npm run build
   ```
   
5. **Serve the static site**
   ```bash
   npx serve -s out
   ```

## 🔧 Deployment

This is a static site that can be deployed to any hosting service that supports static websites:

### Nginx Configuration

For Nginx deployments, use the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/your/out;

    # Enable gzip compression
    gzip on;
    gzip_comp_level 5;
    gzip_min_length 256;
    gzip_proxied any;
    gzip_vary on;
    gzip_types
        application/javascript
        application/json
        application/x-javascript
        text/css
        text/javascript
        text/plain
        text/xml;

    # Handle Next.js static files with proper cache headers
    location /_next/static {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Handle other static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
    }

    # Critical routing rule for client-side routing
    location / {
        try_files $uri $uri.html $uri/ /index.html;
    }
}
```

## 📱 Key Features Explained

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
- Category-specific study paths

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
