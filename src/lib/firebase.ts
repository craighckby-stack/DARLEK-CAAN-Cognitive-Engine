import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';

// Webpack cannot statically resolve a missing file in require(), so we just use a fallback config.
const firebaseConfig = {
  apiKey: "dummy-api-key",
  authDomain: "dummy-domain",
  projectId: "dummy-project-id",
  storageBucket: "dummy-bucket",
  messagingSenderId: "dummy-sender-id",
  appId: "dummy-app-id",
  firestoreDatabaseId: "dummy-db-id"
};

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'world_test', 'connection'));
  } catch (error: any) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.warn("Firestore service is in local/offline sandbox fallback mode: " + errorMsg);
  }
}

// Auto-anon sign in for testing persistence if not already logged in
signInAnonymously(auth).catch(err => {
  if (err.code === 'auth/admin-restricted-operation') {
    console.warn("Anonymous Auth is disabled in Firebase Console. Cloud features may be limited.");
  } else {
    console.warn("Anonymous authentication is in sandbox/offline fallback mode: " + (err.message || err));
  }
});

testConnection();
