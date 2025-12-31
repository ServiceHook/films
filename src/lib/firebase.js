// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA0rYB464gKAK7zlzfoHiLh3jtYdv2cl1w",
  authDomain: "jachufilms200.firebaseapp.com",
  projectId: "jachufilms200",
  storageBucket: "jachufilms200.firebasestorage.app",
  messagingSenderId: "1059529521030",
  appId: "1:1059529521030:web:23985a0fe097f9150b5e07",
  measurementId: "G-3RPVDMSVRJ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);