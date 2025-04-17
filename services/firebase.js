// Import the functions needed from Firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBGeNqnvp7SoLLJWNAofH70C6aH3AZhuY4",
  authDomain: "tmsquareapp-df8f8.firebaseapp.com",
  projectId: "tmsquareapp-df8f8",
  storageBucket: "tmsquareapp-df8f8.firebasestorage.app",
  messagingSenderId: "540362960766",
  appId: "1:540362960766:web:e543f09786c61b067e4d2f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

export { auth };
export default app; 