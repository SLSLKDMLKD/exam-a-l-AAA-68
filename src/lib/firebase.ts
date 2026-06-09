import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  projectId: "gen-lang-client-0083145352",
  appId: "1:1067504561961:web:0a8505801ab533489a5138",
  apiKey: "AIzaSyAg5wxqcqQcxucp8NG60-HMr6RBHVKzIaM",
  authDomain: "gen-lang-client-0083145352.firebaseapp.com",
  storageBucket: "gen-lang-client-0083145352.firebasestorage.app",
  messagingSenderId: "1067504561961",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-e99deceb-6aa0-429d-b716-63565adc4a9e");
export const auth = getAuth(app);
