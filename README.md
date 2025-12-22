# Educational Mind Map Generator 🧠

An AI-powered Next.js application that helps teachers (Class 1-8) generate structured summaries and interactive mind maps from chapter content using Gemini AI and jsMind library.

## ✨ Features

- **Class-Based Filtering**: Select class level (1-8) to automatically adjust content complexity and vocabulary
- **Intelligent Summarization**: AI extracts main topics, sub-topics, key points, and descriptions while filtering out unwanted content
- **Interactive Mind Maps**: Beautiful, interactive mind maps with expand/collapse functionality
- **Export Capabilities**: Export mind maps as PNG images
- **Premium UI**: Modern, responsive design with smooth animations and glassmorphism effects
- **Real-time Validation**: Input validation with helpful error messages

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd e:\MindMap
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   - Copy `.env.local.example` to `.env.local`:
     ```bash
     copy .env.local.example .env.local
     ```
   - Open `.env.local` and add your Gemini API key:
     ```
     NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
     ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 How to Use

1. **Select Class Level**: Choose the appropriate class (1-8) for your students
2. **Enter Chapter Name**: Provide a name for the chapter
3. **Paste Chapter Content**: Copy and paste the full chapter text (minimum 100 characters)
4. **Generate**: Click the "Generate Summary & Mind Map" button
5. **View Results**: 
   - Review the structured summary with expandable sections
   - Interact with the mind map (click nodes to expand/collapse)
   - Use zoom controls to adjust the view
   - Export the mind map as PNG if needed

## 🎯 Summary Structure

The AI generates summaries in this hierarchical format:

```
Chapter Name
├── Main Topic 1
│   ├── Sub Topic 1.1
│   │   ├── Key Point 1
│   │   │   └── 2-3 line description
│   │   └── Key Point 2
│   │       └── 2-3 line description
│   └── Sub Topic 1.2
│       └── ...
└── Main Topic 2
    └── ...
```

## 🗺️ Mind Map Structure

```
Root Node (Chapter Name)
├── Level 1: Main Topics
│   ├── Level 2: Sub Topics
│   │   └── Level 3: Key Points
```

## 🎨 Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **AI**: Google Gemini AI (gemini-2.5-flash-lite)
- **Mind Map**: jsMind library
- **Fonts**: Inter (Google Fonts)

## 🔧 Configuration

### Class Level Complexity

The application automatically adjusts content based on class level:

- **Class 1-2**: Very simple words, basic concepts only
- **Class 3-4**: Simple explanations, fundamental concepts
- **Class 5-6**: Moderate complexity, detailed explanations
- **Class 7-8**: Advanced terminology, complex concepts

### Customization

You can customize the mind map appearance by editing:
- `app/globals.css` - jsMind node styles
- `tailwind.config.ts` - Color themes and animations
- `components/MindMapRenderer.tsx` - Mind map options

## 📝 Project Structure

```
e:\MindMap\
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main application page
│   └── globals.css         # Global styles
├── components/
│   ├── ClassSelector.tsx   # Class level selection
│   ├── ChapterInput.tsx    # Chapter input form
│   ├── SummaryDisplay.tsx  # Summary viewer
│   ├── MindMapRenderer.tsx # Mind map visualization
│   ├── LoadingState.tsx    # Loading indicators
│   └── ErrorDisplay.tsx    # Error handling
├── lib/
│   ├── gemini.ts          # Gemini AI integration
│   └── utils.ts           # Utility functions
├── types/
│   └── index.ts           # TypeScript definitions
└── package.json
```

## 🐛 Troubleshooting

### API Key Issues
- Ensure your `.env.local` file exists in the root directory
- Verify the API key is correct and has no extra spaces
- Check that the key hasn't exceeded its quota

### Mind Map Not Rendering
- Clear your browser cache
- Check the browser console for errors
- Ensure jsMind library loaded correctly

### Summary Generation Fails
- Verify chapter content is at least 100 characters
- Check your internet connection
- Try with a shorter chapter if content is very long

## 📄 License

This project is open source and available for educational purposes.

## 🙏 Acknowledgments

- **Google Gemini AI** for intelligent content generation
- **jsMind** for mind map visualization
- **Next.js** for the robust framework
- **TailwindCSS** for beautiful styling

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review error messages in the application
3. Check browser console for detailed error logs

---

**Made with ❤️ for educators and students**
