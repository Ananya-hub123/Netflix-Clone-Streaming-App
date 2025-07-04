
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDobSTnQQKPOp-U3IyMjGs1yIgab6N_jcg",
  authDomain: "react-netflix-clone-66d6a.firebaseapp.com",
  projectId: "react-netflix-clone-66d6a",
  storageBucket: "react-netflix-clone-66d6a.firebasestorage.app",
  messagingSenderId: "192882566242",
  appId: "1:192882566242:web:01264a35485d8d16a7dd3b",
  measurementId: "G-BKZCDSM0T5"
};


const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);