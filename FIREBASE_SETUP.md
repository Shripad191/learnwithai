# Firebase Authentication Setup Guide

## 🚀 Quick Start

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: **SeekhoWithAI**
4. Disable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Authentication Methods

1. In your Firebase project, click "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable **Email/Password**:
   - Click on "Email/Password"
   - Toggle "Enable"
   - Click "Save"
5. Enable **Google**:
   - Click on "Google"
   - Toggle "Enable"
   - Enter project support email
   - Click "Save"

### Step 3: Create Firestore Database

1. Click "Firestore Database" in the left sidebar
2. Click "Create database"
3. Select "Start in production mode"
4. Choose a location (closest to your users)
5. Click "Enable"

### Step 4: Set Up Security Rules

1. In Firestore Database, go to "Rules" tab
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Saved content - users can only access their own
    match /savedContent/{contentId} {
      allow read, update, delete: if request.auth != null && 
                                    resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
  }
}
```

3. Click "Publish"

### Step 5: Get Firebase Configuration

1. Click the gear icon ⚙️ next to "Project Overview"
2. Click "Project settings"
3. Scroll down to "Your apps"
4. Click the web icon `</>`
5. Register app:
   - App nickname: **SeekhoWithAI Web**
   - Don't check "Firebase Hosting"
   - Click "Register app"
6. Copy the configuration values

### Step 6: Configure Environment Variables

1. Copy `.env.template` to `.env.local`:
   ```bash
   copy .env.template .env.local
   ```

2. Open `.env.local` and fill in your Firebase credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seekhowithai.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=seekhowithai
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seekhowithai.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
   ```

3. Keep your existing Gemini API keys in the same file

### Step 7: Install Dependencies

The Firebase package should already be installed. If not, run:
```bash
npm install firebase
```

### Step 8: Test Authentication

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/signup`

3. Try creating an account with:
   - Email/Password
   - Google Sign-In

4. Check Firebase Console > Authentication > Users to see your account

---

## 📁 File Structure

```
e:\MindMap\
├── lib/
│   ├── firebase.ts              # Firebase configuration
│   └── auth-service.ts          # Authentication functions
├── contexts/
│   └── AuthContext.tsx          # Auth state management
├── app/
│   ├── login/
│   │   └── page.tsx            # Login page
│   ├── signup/
│   │   └── page.tsx            # Sign up page
│   ├── forgot-password/
│   │   └── page.tsx            # Password reset page
│   └── layout.tsx              # Root layout with AuthProvider
└── .env.local                   # Environment variables (create this)
```

---

## 🔐 Features Implemented

✅ Email/Password authentication
✅ Google OAuth sign-in
✅ User registration with validation
✅ Password strength indicator
✅ Password reset functionality
✅ User profile storage in Firestore
✅ Session persistence
✅ Protected routes (coming next)
✅ Error handling with user-friendly messages

---

## 🎨 UI Features

- Beautiful, teacher-friendly design
- Responsive layouts
- Loading states
- Error messages
- Success notifications
- Password visibility toggle
- Password strength meter
- Form validation

---

## 🔒 Security Features

- Password requirements:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 number
  - At least 1 special character
- Firestore security rules
- User data isolation
- Secure session management

---

## 📊 Database Schema

### users Collection
```typescript
{
  uid: string,
  email: string,
  displayName: string,
  photoURL: string | null,
  role: 'teacher',
  createdAt: Timestamp,
  lastLogin: Timestamp,
  preferences: {
    defaultBoard: string,
    defaultClass: number,
    defaultSubject: string
  }
}
```

### savedContent Collection (for future use)
```typescript
{
  id: string,
  userId: string,
  type: 'summary' | 'mindmap' | 'quiz' | 'lesson' | 'activity',
  title: string,
  content: object,
  metadata: {
    board: string,
    class: number,
    subject: string,
    chapter: string
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 🚧 Next Steps

1. **Add route protection** - Redirect to login if not authenticated
2. **Create profile page** - Allow users to update their info
3. **Integrate with save/load** - Link saved content to user accounts
4. **Add user preferences** - Remember board, class, subject choices
5. **Email verification** - Verify email addresses
6. **Admin panel** - Manage users and content

---

## 🐛 Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Make sure you've created `.env.local` with Firebase credentials
- Restart the development server after adding environment variables

### "Firebase: Error (auth/unauthorized-domain)"
- Go to Firebase Console > Authentication > Settings > Authorized domains
- Add `localhost` and your production domain

### Google Sign-In popup closes immediately
- Check that Google authentication is enabled in Firebase Console
- Verify your Firebase configuration is correct

### "Permission denied" in Firestore
- Check your Firestore security rules
- Make sure you're signed in when accessing data

---

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify Firebase configuration in `.env.local`
3. Check Firebase Console for authentication/database status
4. Review security rules in Firestore

---

## ✅ Checklist

Before going live:
- [ ] Firebase project created
- [ ] Authentication methods enabled
- [ ] Firestore database created
- [ ] Security rules configured
- [ ] Environment variables set
- [ ] Dependencies installed
- [ ] Test sign up with email
- [ ] Test sign in with email
- [ ] Test Google sign-in
- [ ] Test password reset
- [ ] Verify user data in Firestore

---

Happy teaching! 🎓✨
