import { initializeApp, getApps, getApp } from "firebase/app";

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

export { app, firebaseConfig };
