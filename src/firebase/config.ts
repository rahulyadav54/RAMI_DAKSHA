
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCpo_ymhV4LgYiTQCa2v2y4hiFI0bxoW8A",
  authDomain: "daksh-c96bd.firebaseapp.com",
  projectId: "daksh-c96bd",
  storageBucket: "daksh-c96bd.firebasestorage.app",
  messagingSenderId: "606989516505",
  appId: "1:606989516505:web:96a12b1bb0e0d4f985c8c8",
  measurementId: "G-ST33GJ5HY1"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const firestore = getFirestore(app);

// Enable offline persistence for better user experience in unreliable network conditions
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(firestore).catch((err) => {
    if (err.code == 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code == 'unimplemented') {
      console.warn('The current browser does not support all of the features required to enable persistence.');
    }
  });
}

export { app, firestore, firebaseConfig };
