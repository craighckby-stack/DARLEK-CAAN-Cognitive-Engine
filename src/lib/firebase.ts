import { initializeApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';

interface ExtendedFirebaseOptions extends FirebaseOptions {
  firestoreDatabaseId?: string;
}

const firebaseConfig: ExtendedFirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? 'dummy-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'dummy-domain',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'dummy-project-id',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'dummy-bucket',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? 'dummy-sender-id',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? 'dummy-app-id',
  firestoreDatabaseId: process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID ?? 'dummy-db-id'
};

const existingApps = getApps();
const app = existingApps.length === 0 ? initializeApp(firebaseConfig) : existingApps[0];

export const db = initializeFirestore(
  app,
  {
    experimentalForceLongPolling: true,
  },
  firebaseConfig.firestoreDatabaseId ?? '(default)'
);

export const auth = getAuth(app);

async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'world_test', 'connection'));
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.warn(`Firestore service is in local/offline sandbox fallback mode: ${errorMsg}`);
  }
}

if (!auth.currentUser) {
  signInAnonymously(auth).catch((err: unknown) => {
    const errObj = err as { code?: string; message?: string };
    if (errObj?.code === 'auth/admin-restricted-operation') {
      console.warn('Anonymous Auth is disabled in Firebase Console. Cloud features may be limited.');
    } else {
      console.warn(`Anonymous authentication is in sandbox/offline fallback mode: ${errObj?.message ?? String(err)}`);
    }
  });
}

void testConnection();