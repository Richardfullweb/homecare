import { getAuth } from "firebase/auth";
import { getFirestore, enableMultiTabIndexedDbPersistence } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getMessaging } from "firebase/messaging";
import { db } from './firebase/config';

const auth = getAuth();
const analytics = getAnalytics();
const messaging = getMessaging();

// Enable offline persistence
enableMultiTabIndexedDbPersistence(db)
  .catch((err: { code: string }) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firebase persistence failed to enable: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Firebase persistence not supported in this browser');
    }
  });

export { auth, db, analytics, messaging };
