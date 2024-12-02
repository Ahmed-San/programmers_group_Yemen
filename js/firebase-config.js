// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBiEAvevwDesyOPPac-Cls58rZqSM2yL7I",
  authDomain: "work-book-34981.firebaseapp.com",
  projectId: "work-book-34981",
  storageBucket: "work-book-34981.firebasestorage.app",
  messagingSenderId: "701073225391",
  appId: "1:701073225391:web:36988bc2aa0310c9e8065a",
  measurementId: "G-GBTG676N21"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);