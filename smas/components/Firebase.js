import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA9JjZkP0TF--bpoDU0K3dLMoOtFIfqFTE",
  authDomain: "smas-b916d.firebaseapp.com",
  projectId: "smas-b916d",
  storageBucket: "smas-b916d.appspot.com",
  messagingSenderId: "9165957441",
  appId: "1:9165957441:web:4edf31ad4e9860f4aad9c0",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
