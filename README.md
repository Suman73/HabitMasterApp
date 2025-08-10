## HabitMaster - Minimal Firebase Habit Tracker

A single-page habit tracker that syncs in real time to Firebase Firestore and supports Google sign-in and Anonymous sign-in.

### Features
- Google sign-in/out
- Add, rename, delete habits
- Weekly grid with 7-day checkboxes
- Real-time sync to a `habits` collection in Firestore

### Quick start
1. Create a Firebase project at the Firebase console.
2. In Project settings → Your apps → Web app, copy the config object.
3. Open `firebase-config.js` and paste your config into `firebaseConfig`.
4. In Firebase Console:
   - Enable Authentication → Sign-in method → Google (optional) and Anonymous (for fastest testing)
   - Enable Firestore Database (in test mode for quick tryout)
5. Serve the folder with any static server (modules must be served over http):

```bash
# Using Python
python3 -m http.server 5173
# Or using Node
npx http-server -p 5173
```

6. Visit `http://localhost:5173/` in a modern browser.

### Firestore data model
- Collection: `habits`
- Document fields:
  - `uid` (string): user id
  - `name` (string): habit name
  - `createdAt` (server timestamp)
  - `updatedAt` (server timestamp, optional)
  - `days` (map): keys are `YYYY-MM-DD` → server timestamp (present means checked)

### Security rules (basic, per-user isolation)
Set Firestore rules to restrict each user to their own documents (and allow updates/deletes without requiring you to resend `uid`):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /habits/{habitId} {
      // Read your own docs
      allow read: if request.auth != null && resource.data.uid == request.auth.uid;

      // Create must set uid to the caller
      allow create: if request.auth != null && request.resource.data.uid == request.auth.uid;

      // Update/Delete only on your own docs; no need to include uid in request
      allow update, delete: if request.auth != null && resource.data.uid == request.auth.uid;
    }
  }
}
```

For production, make rules stricter and validate fields.

### Notes
- No bundler needed; uses Firebase v9 ESM from gstatic.
- Works in modern browsers over http(s). Local `file://` will not work due to module imports.
