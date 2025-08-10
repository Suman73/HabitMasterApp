// Fill in your Firebase web config below. Get it from the Firebase Console:
// Project settings -> Your apps -> SDK setup and configuration -> Config
// Then enable Authentication (Google) and Firestore in the console.

// We use the v9 modular SDK via ESM URLs to avoid bundlers.

// eslint-disable-next-line no-unused-vars
const firebaseConfig = {
apiKey: "AIzaSyAevljuzz_aAgUOoxrbAYZgmO-K--dm1s4",
authDomain: "habittracker-sync.firebaseapp.com",
projectId: "habittracker-sync",
storageBucket: "habittracker-sync.firebasestorage.app",
messagingSenderId: "672918070976",
appId: "1:672918070976:web:83f6a0b1bb45d77f50ef25",
measurementId: "G-1Y3QHEGV4Q" // optional, for Analytics
};

// Lightweight wrapper so app.js can import a simple API

let _appInstance = null;

export function getApp() {
  if (_appInstance) return _appInstance;
  if (!firebaseConfig || !firebaseConfig.apiKey) {
    throw new Error('Missing firebaseConfig');
  }

  // Import modular SDKs from gstatic ESM endpoints
  // Note: These URLs are versioned; you can pin versions if you like.
  const app = window.firebaseApp || {};
  if (!app._initialized) {
    // Dynamically create import maps (supported by modern browsers). Fallback is to use static script tags.
  }
  // We will import via explicit URL imports below using dynamic import()
  window.firebaseApp = { _initialized: true };
  _appInstance = {};
  return _appInstance;
}

// We structure a simple db/auth wrapper that lazily imports Firebase when first needed
export const db = {
  // Firebase App instance (for reference)
  app: null,
  // Firestore instance to pass into collection()/doc()
  store: null,
  // Firestore module (functions like collection, doc, etc.)
  firestore: null,
};

let _auth = null;

async function ensureFirebase() {
  if (db.app && _auth && db.firestore && db.store) return;

  const [{ initializeApp }, { getAuth, GoogleAuthProvider, signInWithPopup, signInAnonymously, onAuthStateChanged, signOut }, firestore] = await Promise.all([
    import('https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js'),
  ]);

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  const store = firestore.getFirestore(app);

  db.app = app;
  db.store = store;
  db.firestore = firestore; // expose module with helpers
  _auth = { auth, provider, GoogleAuthProvider, signInWithPopup, signInAnonymously, onAuthStateChanged, signOut };
}

export function getAuthState(callback) {
  ensureFirebase().then(() => {
    _auth.onAuthStateChanged(_auth.auth, (user) => {
      callback({ user });
    });
  }).catch((e) => {
    console.warn('Firebase not initialized:', e.message);
    callback({ user: null });
  });
}

export async function signInWithGoogle() {
  await ensureFirebase();
  await _auth.signInWithPopup(_auth.auth, new _auth.GoogleAuthProvider());
}

export async function signOutUser() {
  await ensureFirebase();
  await _auth.signOut(_auth.auth);
}

export async function signInAnonymouslyEasy() {
  await ensureFirebase();
  await _auth.signInAnonymously(_auth.auth);
}
