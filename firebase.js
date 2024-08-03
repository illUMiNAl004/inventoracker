// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBf6g5jvi2fcSaPVZYoyP_E6e5ekoftk1I",
  authDomain: "inventorackerz.firebaseapp.com",
  projectId: "inventorackerz",
  storageBucket: "inventorackerz.appspot.com",
  messagingSenderId: "789744414823",
  appId: "1:789744414823:web:2d08018ebe8dea4bbb64c2",
  measurementId: "G-C4766NYRMT"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const firestore = getFirestore(app)
const auth = getAuth(app);


export { firestore, auth }