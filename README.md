# LearnWithAI

A modern, AI-powered lesson planning and educational content platform built with Next.js, TypeScript, and Tailwind CSS. This project enables educators to generate, manage, and present lesson plans, quizzes, mind maps, and presentations with seamless integration of AI and cloud storage.

## Features

- AI-driven lesson plan generation
- Quiz and mind map creation
- Presentation viewer and export tools
- User authentication and protected routes
- Supabase and Firebase integration for storage and database
- Modular component architecture
- Responsive UI with Tailwind CSS and shadcn/ui

## Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Supabase, Firebase
- **AI Integration:** Gemini, OpenRouter
- **Storage:** Supabase Storage, Firebase

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- Supabase and Firebase accounts

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Shripad191/learnwithai.git
   cd learnwithai
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env` and fill in your keys for Supabase, Firebase, and AI providers.
4. Configure Supabase:
   - Run SQL scripts in the `supabase/` folder to set up tables, triggers, and RLS.
5. (Optional) Configure Firebase as per `FIREBASE_SETUP.md`.

### Running the App

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## Project Structure

- `app/` - Next.js app directory (pages, layouts, API routes)
- `components/` - UI and functional React components
- `contexts/` - React context providers (e.g., Auth)
- `hooks/` - Custom React hooks
- `lib/` - Utility libraries and AI integration
- `supabase/` - SQL setup scripts
- `types/` - TypeScript type definitions

## Usage

- Generate lesson plans, quizzes, and mind maps using AI
- Export content as presentations or PDFs
- Manage and view lesson plans securely

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements or bug fixes.

## License

This project is licensed under the MIT License.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Firebase](https://firebase.google.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Gemini](https://ai.google.dev/gemini)
- [OpenRouter](https://openrouter.ai/)

---

For setup guides, see:
- `DATABASE_SETUP.md`
- `FIREBASE_SETUP.md`
- `SUPABASE_SETUP.md`
- `SHADCN_MIGRATION_GUIDE.md`
- `QUICK_START.md`
   cd learn_with_ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   - Copy `.env.template` to `.env.local`:
     ```bash
     copy .env.template .env.local
     ```
   - Add your API keys to `.env.local`:
     ```env
     # Gemini API Key (Required)
     NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
     
     # Supabase Configuration (Required for authentication & cloud storage)
     NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
     ```

4. **Set up Supabase** (Required for full functionality):
   - See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for authentication setup
   - See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for database setup
   - Or follow the [QUICK_START.md](./QUICK_START.md) for a streamlined setup

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 How to Use

### 🔐 Authentication

1. **First-time users**: Sign up with email/password or Google OAuth
2. **Returning users**: Sign in to access your saved content across devices
3. **Cloud Storage**: All your generated content is automatically saved to the cloud

### Landing Page
Start by selecting one of the six available tools from the beautiful landing page:
- Summary Generator
- Mind Map Generator
- Quiz Generator
- Lesson Planner
- SEL/STEM Activities
- Presentation Generator

### Summary & Mind Map Generator

1. Select your **class level** (1-8) and **subject**
2. Enter the **chapter name** and **chapter content** (min 100 characters)
3. Click **Generate** to create structured summaries and interactive mind maps
4. **Save** your work to the cloud (accessible from any device)
5. **Export** as needed (images, PDFs, etc.)

### Quiz Generator

1. Select **class level** and **subject**
2. Enter **chapter name** and optional **chapter content**
3. Click **Generate Quiz** to create:
   - Multiple Choice Questions (MCQs)
   - True/False Questions
   - Fill in the Blanks
   - Short Answer Questions
4. **Export** as:
   - Student Worksheet (questions only)
   - Answer Key (with solutions)
   - Complete (both combined)
5. **Save** to cloud for later use

### Lesson Planner

1. Select **board** (CBSE/ICSE/State/IB/IGCSE), **class**, and **subject**
2. Enter **topic/chapter name**
3. Configure:
   - Number of lectures
   - Minutes per lecture (30/45/custom)
   - Teaching style (Traditional/Activity-Based/NEP 2020)
4. Generate comprehensive lesson plans with:
   - Learning objectives
   - Time-optimized activities
   - TeachPack cards (Start, Explain, Practice, Assess)
   - Assessment strategies
   - Homework assignments
5. **Save** to cloud and access from anywhere

### SEL/STEM Activities

1. Select **class level** and **subject**
2. Choose **activity type** (Solo/Pair/Group)
3. Optionally enter a **topic** for topic-specific activities
4. Generate creative, hands-on activities with:
   - Clear objectives
   - Materials list
   - Step-by-step instructions
   - Assessment rubrics
5. **Save** to cloud for future classes

### Presentation Generator

1. First, create a **Lesson Plan**
2. For each lecture, click **Generate Presentation**
3. View interactive slides with:
   - Title slide
   - Learning objectives
   - Content slides with visuals
   - Summary and assessment
4. Navigate with arrow keys or buttons
5. Enter **fullscreen mode** for teaching
6. **Save** presentations to cloud

## 🎯 Content Structure

### Summary Hierarchy
```
Chapter Name
├── Main Topic 1
│   ├── Sub Topic 1.1
│   │   ├── Key Point 1
│   │   │   └── Description
│   │   └── Key Point 2
│   │       └── Description
│   └── Sub Topic 1.2
└── Main Topic 2
```

### Mind Map Levels
```
Root (Chapter)
├── Level 1: Main Topics
│   ├── Level 2: Sub Topics
│   │   └── Level 3: Key Points
```

## 🎨 Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5
- **Styling**: TailwindCSS 3.4 with custom animations
- **UI Components**: Custom components with glassmorphism effects
- **Fonts**: Inter (Google Fonts)

### Backend & Services
- **AI**: Google Gemini AI (gemini-2.0-flash-exp)
- **Authentication**: Supabase Auth (Email/Password + Google OAuth)
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Storage**: Cloud storage via Supabase with automatic sync

### Libraries & Tools
- **Mind Map**: jsMind library for interactive visualizations
- **Export**: html2canvas for image exports
- **Markdown**: react-markdown for rich text display
- **Utilities**: clsx, tailwind-merge for className management
- **Auth Helpers**: @supabase/auth-helpers-nextjs for Next.js integration

## 📁 Project Structure

```
SeekhoWithAI/
├── app/
│   ├── api/                    # API routes
│   ├── auth/                   # Authentication pages
│   │   ├── callback/           # OAuth callback handler
│   │   └── page.tsx            # Login/signup page
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Main application logic
│   └── globals.css             # Global styles & animations
├── components/
│   ├── LandingPage.tsx         # Landing page with tool selection
│   ├── FeatureCard.tsx         # Feature cards for landing page
│   ├── ClassSelector.tsx       # Class level selector
│   ├── BoardSelector.tsx       # Education board selector
│   ├── SubjectSelector.tsx     # Subject selector
│   ├── ActivityTypeSelector.tsx # Activity type selector
│   ├── ChapterInput.tsx        # Chapter input form
│   ├── SummaryDisplay.tsx      # Summary viewer
│   ├── MindMapRenderer.tsx     # Mind map visualization
│   ├── QuizDisplay.tsx         # Quiz viewer
│   ├── LessonPlanDisplay.tsx   # Lesson plan viewer
│   ├── SELSTEMActivityDisplay.tsx # Activity viewer
│   ├── PresentationViewer.tsx  # Presentation slideshow
│   ├── ExportMenu.tsx          # Export functionality
│   ├── SaveLoadPanel.tsx       # Save/Load with cloud sync
│   ├── MigrationPrompt.tsx     # localStorage to cloud migration
│   ├── ProtectedRoute.tsx      # Route protection wrapper
│   ├── LoadingState.tsx        # Loading indicators
│   ├── ErrorDisplay.tsx        # Error handling
│   └── Toast.tsx               # Toast notifications
├── contexts/
│   └── AuthContext.tsx         # Authentication context provider
├── lib/
│   ├── gemini.ts               # Gemini AI integration
│   ├── quiz-generator.ts       # Quiz generation logic
│   ├── lesson-planner.ts       # Lesson plan generation
│   ├── sel-stem-generator.ts   # Activity generation
│   ├── ppt-generator.ts        # Presentation generation
│   ├── export.ts               # Export utilities
│   ├── storage.ts              # LocalStorage management
│   ├── supabase.ts             # Supabase client setup
│   ├── supabase-storage.ts     # Cloud storage operations
│   ├── migrate-to-supabase.ts  # Migration utilities
│   ├── storage-errors.ts       # Error handling for storage
│   └── utils.ts                # Utility functions
├── supabase/
│   ├── step1-create-table.sql  # Database table creation
│   ├── step2-create-trigger.sql # Trigger functions
│   ├── step3-enable-rls.sql    # Row Level Security policies
│   └── step4-verify.sql        # Verification queries
├── types/
│   └── index.ts                # TypeScript type definitions
├── .env.template               # Environment variable template
├── .env.local                  # Your local environment variables (not in git)
├── package.json                # Dependencies
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
├── SUPABASE_SETUP.md           # Supabase authentication setup guide
├── DATABASE_SETUP.md           # Database setup instructions
├── API_KEYS_SETUP.md           # API keys configuration guide
└── QUICK_START.md              # Quick start guide
```

## 🔧 Configuration

### Class Level Complexity

Content automatically adapts based on class level:

- **Class 1-2**: Very simple vocabulary, basic concepts
- **Class 3-4**: Simple explanations, fundamental concepts
- **Class 5-6**: Moderate complexity, detailed explanations
- **Class 7-8**: Advanced terminology, complex concepts

### Teaching Styles

- **Traditional**: Lecture-based, teacher-centered approach
- **Activity-Based**: Hands-on, student-centered learning
- **NEP 2020**: Aligned with National Education Policy 2020

### Customization

Customize the appearance by editing:
- `app/globals.css` - Global styles, animations, and themes
- `tailwind.config.ts` - Color schemes and design tokens
- Component files - Individual component styling

## ⌨️ Keyboard Shortcuts

- **Ctrl/Cmd + S**: Save current work
- **Ctrl/Cmd + L**: Load saved work
- **Ctrl/Cmd + N**: Start new session
- **ESC**: Exit fullscreen presentation

## 🐛 Troubleshooting

### Authentication Issues

**Cannot sign in / Sign up not working**
- Verify Supabase credentials in `.env.local` are correct
- Check that authentication is properly configured in Supabase dashboard
- See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed setup

**Google OAuth not working**
- Ensure Google OAuth is enabled in Supabase dashboard
- Verify redirect URLs are configured correctly
- Check that Client ID and Secret are correct

### Database & Storage Issues

**Save button not working**
- Ensure you've run the database setup SQL scripts
- Check that you're signed in
- Verify Supabase credentials in `.env.local`
- See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for setup instructions

**Data not syncing across devices**
- Ensure you're signed in with the same account
- Check internet connection
- Verify Row Level Security policies are correctly set up

**Migration from localStorage failing**
- Check browser console for detailed errors
- Ensure you're authenticated
- Verify database table exists and RLS policies are enabled

### API Key Issues
- Ensure `.env.local` exists in the root directory
- Verify the Gemini API key is correct with no extra spaces
- Check that the key hasn't exceeded its quota
- Restart the dev server after adding the key

### Generation Fails
- Check your internet connection
- Verify chapter content meets minimum requirements
- Try with a shorter chapter if content is very long
- Check browser console for detailed error messages

### Mind Map Not Rendering
- Clear browser cache and reload
- Ensure jsMind library loaded correctly
- Check for JavaScript errors in console

## 🌟 Features in Detail

### Authentication & Cloud Storage
- **Secure Authentication**: Email/Password and Google OAuth via Supabase
- **Cross-Device Sync**: Access your content from any device
- **Automatic Migration**: Seamlessly migrate from localStorage to cloud
- **Row Level Security**: Your data is protected and private
- **Real-time Sync**: Changes are instantly saved to the cloud

### Quiz Generator
- Supports multiple question types
- Automatic difficulty adjustment
- Language detection (English/Hindi)
- Export in multiple formats
- Detailed answer explanations
- Cloud storage for all quizzes

### Lesson Planner
- NEP 2020 aligned
- Time-optimized activities
- TeachPack methodology
- Assessment strategies
- Homework assignments
- Presentation generation for each lecture
- Cloud sync across devices

### SEL/STEM Activities
- Social-Emotional Learning integration
- STEM-focused hands-on activities
- Solo, pair, and group work options
- Clear learning objectives
- Assessment rubrics
- Materials and safety guidelines
- Save and reuse activities

## 📄 License

This project is open source and available for educational purposes.

## 🙏 Acknowledgments

- **Google Gemini AI** for powerful content generation
- **Supabase** for authentication and cloud database infrastructure
- **jsMind** for interactive mind map visualization
- **Next.js** for the robust React framework
- **TailwindCSS** for beautiful, responsive styling
- **Vercel** for seamless deployment

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues, questions, or feature requests:
1. Check the troubleshooting section above
2. Review the setup guides:
   - [QUICK_START.md](./QUICK_START.md) - Quick setup guide
   - [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Authentication setup
   - [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database setup
   - [API_KEYS_SETUP.md](./API_KEYS_SETUP.md) - API keys configuration
3. Check browser console for detailed logs
4. Open an issue on GitHub

## 🔗 Links

- **Repository**: [https://github.com/Shripad191/learn_with_ai](https://github.com/Shripad191/learn_with_ai)
- **Google AI Studio**: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
- **Supabase**: [https://supabase.com](https://supabase.com)
- **Supabase Documentation**: [https://supabase.com/docs](https://supabase.com/docs)

---

**Made with ❤️ for educators and students | Empowering teachers with AI**
#
