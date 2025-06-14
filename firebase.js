// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  onSnapshot,
  query,
  where,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA40CvBmy-kLiOwqQaXKhKeMuTXJJvJ1vk",
  authDomain: "comz-d46bf.firebaseapp.com",
  projectId: "comz-d46bf",
  storageBucket: "comz-d46bf.appspot.com",
  messagingSenderId: "241012409719",
  appId: "1:241012409719:web:8461309ccca50734dd0d72",
  measurementId: "G-P6YVXNYH0F"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

signInAnonymously(auth).catch(console.error);

export {
  auth,
  db,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  onSnapshot,
  query,
  where,
  getDoc,
  serverTimestamp
};
