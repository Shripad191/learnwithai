# Shadcn/UI Quick Reference - Component Replacements

## 🎯 Quick Command Reference

### Initial Setup
```bash
# 1. Initialize Shadcn/UI
npx shadcn@latest init

# 2. Install all components you'll need at once
npx shadcn@latest add button card avatar dropdown-menu input label textarea select radio-group badge alert toast tabs accordion separator dialog alert-dialog skeleton progress

# 3. Install icons (recommended)
npm install lucide-react
```

---

## 📦 Component Replacement Cheat Sheet

### Buttons
```tsx
// BEFORE (Custom)
<button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg">
  Sign Out
</button>

// AFTER (Shadcn)
import { Button } from "@/components/ui/button"
<Button variant="destructive">Sign Out</Button>

// Available variants: default, destructive, outline, secondary, ghost, link
// Available sizes: default, sm, lg, icon
```

### Cards
```tsx
// BEFORE (Custom div)
<div className="bg-white rounded-xl shadow-lg p-6">
  <h3>Title</h3>
  <p>Description</p>
</div>

// AFTER (Shadcn)
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content here */}
  </CardContent>
</Card>
```

### Input Fields
```tsx
// BEFORE (Custom input)
<input 
  type="text"
  className="w-full px-4 py-2 border rounded-lg"
  placeholder="Enter text"
/>

// AFTER (Shadcn)
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="Enter email" />
</div>
```

### Select Dropdowns
```tsx
// BEFORE (Custom select)
<select className="w-full px-4 py-2 border rounded-lg">
  <option value="1">Class 1</option>
  <option value="2">Class 2</option>
</select>

// AFTER (Shadcn)
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
<Select value={value} onValueChange={onChange}>
  <SelectTrigger>
    <SelectValue placeholder="Select class" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Class 1</SelectItem>
    <SelectItem value="2">Class 2</SelectItem>
  </SelectContent>
</Select>
```

### Alerts/Errors
```tsx
// BEFORE (Custom error div)
<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
  Error message
</div>

// AFTER (Shadcn)
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Error message</AlertDescription>
</Alert>

// Variants: default, destructive
```

### Loading States
```tsx
// BEFORE (Custom loading)
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
</div>

// AFTER (Shadcn)
import { Skeleton } from "@/components/ui/skeleton"
<Skeleton className="h-4 w-3/4" />
```

### Avatars
```tsx
// BEFORE (Custom avatar)
<div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
  {user?.email?.charAt(0).toUpperCase()}
</div>

// AFTER (Shadcn)
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
<Avatar>
  <AvatarImage src={user?.avatar} />
  <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
</Avatar>
```

### Dropdown Menus
```tsx
// AFTER (Shadcn - for user profile menu)
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

<DropdownMenu>
  <DropdownMenuTrigger>
    <Avatar>
      <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
    </Avatar>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Tabs
```tsx
// AFTER (Shadcn)
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
<Tabs defaultValue="summary">
  <TabsList>
    <TabsTrigger value="summary">Summary</TabsTrigger>
    <TabsTrigger value="quiz">Quiz</TabsTrigger>
  </TabsList>
  <TabsContent value="summary">Summary content</TabsContent>
  <TabsContent value="quiz">Quiz content</TabsContent>
</Tabs>
```

### Dialogs/Modals
```tsx
// AFTER (Shadcn)
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    {/* Dialog content */}
  </DialogContent>
</Dialog>
```

### Badges
```tsx
// AFTER (Shadcn)
import { Badge } from "@/components/ui/badge"
<Badge>New</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="secondary">Secondary</Badge>

// Variants: default, secondary, destructive, outline
```

### Radio Groups
```tsx
// AFTER (Shadcn)
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
<RadioGroup value={value} onValueChange={setValue}>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option1" id="option1" />
    <Label htmlFor="option1">Option 1</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option2" id="option2" />
    <Label htmlFor="option2">Option 2</Label>
  </div>
</RadioGroup>
```

### Textarea
```tsx
// BEFORE (Custom textarea)
<textarea className="w-full px-4 py-2 border rounded-lg" />

// AFTER (Shadcn)
import { Textarea } from "@/components/ui/textarea"
<Textarea placeholder="Enter text" />
```

### Toast Notifications
```tsx
// AFTER (Shadcn)
// 1. Add Toaster to your root layout (app/layout.tsx)
import { Toaster } from "@/components/ui/toaster"
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}

// 2. Use toast in your components
import { useToast } from "@/hooks/use-toast"
function MyComponent() {
  const { toast } = useToast()
  
  const showToast = () => {
    toast({
      title: "Success!",
      description: "Your action was completed.",
    })
  }
  
  return <Button onClick={showToast}>Show Toast</Button>
}
```

---

## 🎨 Styling Tips

### Using the `cn()` Utility
```tsx
import { cn } from "@/lib/utils"

// Merge classes cleanly
<Button className={cn("custom-class", isActive && "bg-blue-500")}>
  Click me
</Button>
```

### Custom Styling with Shadcn Components
```tsx
// You can still add your custom classes
<Card className="bg-gradient-to-br from-blue-500 to-cyan-500 hover:shadow-2xl transition-all">
  {/* Your content */}
</Card>
```

### Keeping Your Animations
```tsx
// Your existing animations work perfectly with Shadcn
<Card className="animate-fade-in hover:scale-105 transition-transform">
  {/* Your content */}
</Card>
```

---

## 🚀 Icons with Lucide React

```tsx
import { 
  BookOpen, 
  Brain, 
  FileQuestion, 
  Calendar, 
  Target,
  User,
  LogOut,
  Settings,
  ChevronDown
} from "lucide-react"

// Use in your components
<Button>
  <BookOpen className="mr-2 h-4 w-4" />
  Summary
</Button>
```

**Popular icons for your app:**
- `BookOpen` - Summary
- `Brain` - Mind Map
- `FileQuestion` - Quiz
- `Calendar` - Lesson Plan
- `Target` - SEL/STEM Activities
- `User` - Profile
- `LogOut` - Sign Out
- `Download` - Export
- `Upload` - Import
- `Save` - Save
- `Loader2` - Loading (with `animate-spin`)

---

## 📱 Responsive Design

Shadcn components are responsive by default, but you can customize:

```tsx
<Card className="w-full md:w-1/2 lg:w-1/3">
  {/* Responsive width */}
</Card>

<Button size="sm" className="md:size-default lg:size-lg">
  {/* Responsive button size */}
</Button>
```

---

## 🎯 Your Specific Components

### LandingPage.tsx User Profile
```tsx
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogOut, User } from "lucide-react"

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
      <Avatar>
        <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuLabel>
      <div className="flex flex-col space-y-1">
        <p className="text-sm font-medium">{user?.email}</p>
        <p className="text-xs text-muted-foreground">Logged in</p>
      </div>
    </DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={handleSignOut}>
      <LogOut className="mr-2 h-4 w-4" />
      Sign Out
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### FeatureCard.tsx
```tsx
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function FeatureCard({ icon, title, description, onClick, gradientFrom, gradientTo }) {
  return (
    <Card 
      className={cn(
        "cursor-pointer hover:shadow-2xl transition-all duration-300 border-0",
        `bg-gradient-to-br ${gradientFrom} ${gradientTo}`
      )}
      onClick={onClick}
    >
      <CardHeader className="text-white">
        <div className="text-5xl mb-4">{icon}</div>
        <CardTitle className="text-white text-2xl">{title}</CardTitle>
        <CardDescription className="text-white/90 text-base">
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  )
}
```

---

## ✅ Testing Checklist

After migration, verify:
- [ ] All buttons work and have proper hover states
- [ ] Forms submit correctly
- [ ] Dropdowns open/close properly
- [ ] Modals/dialogs function
- [ ] Toast notifications appear
- [ ] Loading states display
- [ ] Error messages show correctly
- [ ] Responsive on mobile (test with DevTools)
- [ ] Keyboard navigation works
- [ ] Colors match your theme

---

## 🆘 Troubleshooting

### Issue: Components not found
```bash
# Make sure you installed the component
npx shadcn@latest add button
```

### Issue: Styles not applying
```bash
# Check that globals.css is imported in layout.tsx
# Verify tailwind.config.ts includes components/ui
```

### Issue: TypeScript errors
```bash
# Check import paths match your configuration
# Default: @/components/ui/button
```

### Issue: cn() function not found
```bash
# Make sure lib/utils.ts was created during init
# If not, run: npx shadcn@latest init
```

---

## 📚 Resources

- **Browse all components:** https://ui.shadcn.com/docs/components
- **Lucide icons:** https://lucide.dev/icons
- **Tailwind classes:** https://tailwindcss.com/docs

---

**Ready to start? Begin with the main guide: `SHADCN_MIGRATION_GUIDE.md`**
