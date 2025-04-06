import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAzk2K_KsrONUQYVdBbI6UQZJDVqvyhoeQ",
  authDomain: "bedtimeai-31c73.firebaseapp.com",
  projectId: "bedtimeai-31c73",
  storageBucket: "bedtimeai-31c73.firebasestorage.app",
  messagingSenderId: "243527839502",
  appId: "1:243527839502:web:e7e706151ee62b4927b15f",
  measurementId: "G-QHPXQDM4SH"
};

//  Firebase initialization 
const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Export Auth and Firestore
export const firebaseAuth = getAuth(firebaseApp);
export const firestoreDB = getFirestore(firebaseApp);
