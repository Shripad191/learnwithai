# Shadcn/UI Migration Guide for SeekhoWithAI

This guide provides detailed instructions for migrating your SeekhoWithAI application to use Shadcn/UI components.

## 📋 Table of Contents

1. [What is Shadcn/UI?](#what-is-shadcnui)
2. [Prerequisites](#prerequisites)
3. [Installation Steps](#installation-steps)
4. [Configuration](#configuration)
5. [Component Migration Strategy](#component-migration-strategy)
6. [Implementation Plan](#implementation-plan)
7. [Testing & Validation](#testing--validation)

---

## What is Shadcn/UI?

Shadcn/UI is a collection of **re-usable components** built using:
- **Radix UI** - Unstyled, accessible component primitives
- **Tailwind CSS** - For styling
- **Class Variance Authority (CVA)** - For component variants

**Key Benefits:**
- ✅ **Not a component library** - You own the code (components are copied to your project)
- ✅ **Fully customizable** - Modify components as needed
- ✅ **Accessible by default** - Built on Radix UI primitives
- ✅ **Beautiful design** - Modern, clean aesthetics
- ✅ **TypeScript support** - Full type safety
- ✅ **Dark mode ready** - Built-in theme support

---

## Prerequisites

Before starting, ensure you have:
- ✅ Node.js 18+ installed
- ✅ Your Next.js project running (already done ✓)
- ✅ Tailwind CSS configured (already done ✓)
- ✅ TypeScript configured (already done ✓)

---

## Installation Steps

### Step 1: Install Shadcn/UI CLI

Open your terminal in the project directory and run:

```bash
npx shadcn@latest init
```

**You'll be prompted with several questions:**

1. **Would you like to use TypeScript?** → `Yes` (you're already using it)
2. **Which style would you like to use?** → Choose `New York` or `Default`
   - `Default` - More rounded, playful (recommended for educational app)
   - `New York` - More sharp, professional
3. **Which color would you like to use as base color?** → Choose `Slate`, `Gray`, `Zinc`, `Neutral`, `Stone`, `Blue`, `Green`, `Orange`, etc.
   - Recommendation: `Blue` or `Purple` (matches your current theme)
4. **Where is your global CSS file?** → `app/globals.css`
5. **Would you like to use CSS variables for colors?** → `Yes` (recommended)
6. **Are you using a custom tailwind prefix?** → `No`
7. **Where is your tailwind.config.js located?** → `tailwind.config.ts`
8. **Configure the import alias for components:** → `@/components`
9. **Configure the import alias for utils:** → `@/lib/utils`
10. **Are you using React Server Components?** → `Yes`

### Step 2: What This Does

The init command will:
- ✅ Create `components/ui` directory for Shadcn components
- ✅ Create `lib/utils.ts` with the `cn()` utility function
- ✅ Update your `tailwind.config.ts` with Shadcn theme configuration
- ✅ Update your `app/globals.css` with CSS variables for theming
- ✅ Install required dependencies (`class-variance-authority`, `clsx`, `tailwind-merge`, etc.)

---

## Configuration

### Step 3: Verify Configuration Files

After initialization, verify these files were updated:

#### `tailwind.config.ts`
Should now include Shadcn's theme configuration with CSS variables.

#### `app/globals.css`
Should now include CSS variable definitions for colors, radius, etc.

#### `components.json` (new file)
This file stores your Shadcn configuration preferences.

---

## Component Migration Strategy

### Step 4: Install Required Components

Based on your current UI, you'll need these Shadcn components:

```bash
# Core components for your landing page
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add avatar
npx shadcn@latest add dropdown-menu

# Form components for your inputs
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add textarea
npx shadcn@latest add select
npx shadcn@latest add radio-group

# Display components
npx shadcn@latest add badge
npx shadcn@latest add alert
npx shadcn@latest add toast
npx shadcn@latest add tabs
npx shadcn@latest add accordion
npx shadcn@latest add separator

# Dialog/Modal components
npx shadcn@latest add dialog
npx shadcn@latest add alert-dialog

# Loading states
npx shadcn@latest add skeleton
npx shadcn@latest add progress
```

**Pro Tip:** You can install multiple components at once:
```bash
npx shadcn@latest add button card avatar dropdown-menu input label textarea select
```

### Step 5: Component Mapping

Here's how your current components map to Shadcn components:

| Current Component | Shadcn Component | Notes |
|------------------|------------------|-------|
| Custom buttons | `Button` | Multiple variants available |
| Feature cards | `Card` | Use `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` |
| User profile section | `Avatar` + `DropdownMenu` | Better UX for sign out |
| Input fields | `Input` + `Label` | Consistent styling |
| Select dropdowns | `Select` | Accessible, keyboard-friendly |
| Toast notifications | `Toast` + `Toaster` | Built-in toast system |
| Loading states | `Skeleton` | Smooth loading placeholders |
| Error displays | `Alert` | Different variants (destructive, warning, info) |
| Tabs/sections | `Tabs` | Clean tab interface |

---

## Implementation Plan

### Phase 1: Setup & Core Components (Day 1)

1. **Run Shadcn init** (Step 1)
2. **Install core components** (Step 4)
3. **Create a test page** to verify Shadcn is working:
   ```tsx
   // app/test-shadcn/page.tsx
   import { Button } from "@/components/ui/button"
   import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

   export default function TestPage() {
     return (
       <div className="p-8">
         <Card>
           <CardHeader>
             <CardTitle>Test Shadcn</CardTitle>
             <CardDescription>This is a test card</CardDescription>
           </CardHeader>
           <CardContent>
             <Button>Click me</Button>
           </CardContent>
         </Card>
       </div>
     )
   }
   ```

### Phase 2: Migrate Landing Page (Day 2-3)

**Components to update:**
1. `LandingPage.tsx`
   - Replace custom user profile section with `Avatar` + `DropdownMenu`
   - Replace sign out button with Shadcn `Button`
   
2. `FeatureCard.tsx`
   - Rebuild using Shadcn `Card` components
   - Keep your gradient backgrounds and animations
   - Use `Button` variant="ghost" for the card click interaction

**Example migration for FeatureCard:**
```tsx
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function FeatureCard({ icon, title, description, onClick }) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-500 to-cyan-500"
      onClick={onClick}
    >
      <CardHeader>
        <div className="text-4xl mb-4">{icon}</div>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="text-white/90">{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}
```

### Phase 3: Migrate Form Components (Day 4-5)

**Components to update:**
1. `ClassSelector.tsx` → Use `Select` component
2. `SubjectSelector.tsx` → Use `Select` component
3. `BoardSelector.tsx` → Use `Select` component
4. `ChapterInput.tsx` → Use `Input` + `Textarea` components
5. `ActivityTypeSelector.tsx` → Use `RadioGroup` component

**Example migration for ClassSelector:**
```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export default function ClassSelector({ value, onChange }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="class">Select Class</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="class">
          <SelectValue placeholder="Choose a class" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">Class 1</SelectItem>
          <SelectItem value="2">Class 2</SelectItem>
          {/* ... more items */}
        </SelectContent>
      </Select>
    </div>
  )
}
```

### Phase 4: Migrate Display Components (Day 6-7)

**Components to update:**
1. `SummaryDisplay.tsx` → Use `Card`, `Tabs`, `Separator`
2. `QuizDisplay.tsx` → Use `Card`, `RadioGroup`, `Button`
3. `LessonPlanDisplay.tsx` → Use `Card`, `Accordion`, `Badge`
4. `SELSTEMActivityDisplay.tsx` → Use `Card`, `Tabs`
5. `MindMapRenderer.tsx` → Keep mostly as-is, wrap in `Card`

### Phase 5: Migrate Utility Components (Day 8)

**Components to update:**
1. `LoadingState.tsx` → Use `Skeleton` component
2. `ErrorDisplay.tsx` → Use `Alert` component (variant="destructive")
3. `Toast.tsx` → Replace with Shadcn `Toast` + `Toaster`
4. `SaveLoadPanel.tsx` → Use `Dialog`, `Button`, `Input`
5. `ExportMenu.tsx` → Use `DropdownMenu`

**Example migration for ErrorDisplay:**
```tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function ErrorDisplay({ error }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  )
}
```

### Phase 6: Add Icons (Optional but Recommended)

Shadcn works great with **Lucide React** icons:

```bash
npm install lucide-react
```

Replace emoji icons with proper icon components:
```tsx
import { BookOpen, Brain, FileQuestion, Calendar, Target } from "lucide-react"

// Instead of icon: '📝', use:
icon: <BookOpen className="w-8 h-8" />
```

### Phase 7: Theme Customization

**Customize your theme colors** in `app/globals.css`:

```css
@layer base {
  :root {
    --primary: 210 100% 50%; /* Your blue color */
    --secondary: 270 95% 75%; /* Your purple color */
    /* ... other colors */
  }
}
```

**Add dark mode support** (optional):
```bash
npx shadcn@latest add theme-provider
```

---

## Testing & Validation

### Step 6: Testing Checklist

After each phase, test:

- [ ] All components render correctly
- [ ] Buttons are clickable and functional
- [ ] Forms submit properly
- [ ] Dropdowns open and close
- [ ] Modals/dialogs work
- [ ] Responsive design works on mobile
- [ ] Accessibility (keyboard navigation, screen readers)
- [ ] Dark mode (if implemented)

### Step 7: Validation Commands

```bash
# Run development server
npm run dev

# Check for TypeScript errors
npx tsc --noEmit

# Run linting
npm run lint

# Build for production (final test)
npm run build
```

---

## 🎯 Quick Start Checklist

When you're ready to implement, follow this order:

1. [ ] Run `npx shadcn@latest init`
2. [ ] Install core components: `button`, `card`, `input`, `select`
3. [ ] Create test page to verify setup
4. [ ] Migrate `FeatureCard.tsx` first (easiest)
5. [ ] Migrate `LandingPage.tsx` user profile section
6. [ ] Migrate form selectors (`ClassSelector`, `SubjectSelector`, etc.)
7. [ ] Migrate display components one by one
8. [ ] Replace `Toast` with Shadcn toast system
9. [ ] Add icons with `lucide-react`
10. [ ] Test thoroughly
11. [ ] Customize theme colors
12. [ ] Build and deploy

---

## 📚 Additional Resources

- **Shadcn/UI Documentation:** https://ui.shadcn.com
- **Component Examples:** https://ui.shadcn.com/docs/components
- **Radix UI Docs:** https://www.radix-ui.com
- **Tailwind CSS Docs:** https://tailwindcss.com

---

## 💡 Pro Tips

1. **Don't migrate everything at once** - Do it component by component
2. **Keep your custom animations** - Shadcn components are customizable
3. **Use the `cn()` utility** - For merging Tailwind classes cleanly
4. **Test on mobile** - Shadcn components are responsive by default
5. **Leverage TypeScript** - All Shadcn components have full type definitions
6. **Keep backups** - Git commit before major changes
7. **Read component docs** - Each Shadcn component has detailed documentation

---

## 🚨 Common Pitfalls to Avoid

1. ❌ Don't modify files in `components/ui` directly - extend them instead
2. ❌ Don't forget to import CSS variables in `globals.css`
3. ❌ Don't skip the `cn()` utility - it prevents class conflicts
4. ❌ Don't install components you won't use - keep it lean
5. ❌ Don't ignore accessibility features - Shadcn makes it easy

---

## Next Steps

Once you're ready to implement:
1. Review this guide thoroughly
2. Commit your current code to Git
3. Start with Phase 1 (Setup)
4. Test after each component migration
5. Ask for help if you get stuck!

Good luck with your migration! 🚀
