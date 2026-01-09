// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, push } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCij8cLlK-AWYt2eRITSK_niXFtcv9YrwU",
  authDomain: "neurons-at-war2-6ba4b.firebaseapp.com",
  databaseURL:
    "https://neurons-at-war2-6ba4b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "neurons-at-war2-6ba4b",
  storageBucket: "neurons-at-war2-6ba4b.firebasestorage.app",
  messagingSenderId: "375499065227",
  appId: "1:375499065227:web:f703a4247280ae01b2d18e",
  measurementId: "G-6EHCZKBFVG",
};

// initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const analytics = getAnalytics(app);
export { database, ref, push };
