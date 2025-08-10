// Firebase web config copied; ensure it matches your project settings
// You may update values below before building/signing

// eslint-disable-next-line no-unused-vars
const firebaseConfig = {
apiKey: "AIzaSyAevljuzz_aAgUOoxrbAYZgmO-K--dm1s4",
authDomain: "habittracker-sync.firebaseapp.com",
projectId: "habittracker-sync",
storageBucket: "habittracker-sync.firebasestorage.app",
messagingSenderId: "672918070976",
appId: "1:672918070976:web:83f6a0b1bb45d77f50ef25",
measurementId: "G-1Y3QHEGV4Q"
};

let _appInstance = null;

export function getApp() {
  if (_appInstance) return _appInstance;
  if (!firebaseConfig || !firebaseConfig.apiKey) {
    throw new Error('Missing firebaseConfig');
  }
  window.firebaseApp = { _initialized: true };
  _appInstance = {};
  return _appInstance;
}

export const db = {
  app: null,
  store: null,
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
  db.firestore = firestore;
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
