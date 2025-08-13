import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCs09vvp6dn_pwRHyrtLtq2HO2qP_q8Sqw",

    authDomain: "geng-bd6b4.firebaseapp.com",
  
    projectId: "geng-bd6b4",
  
    storageBucket: "geng-bd6b4.firebasestorage.app",
  
    messagingSenderId: "950465799173",
  
    appId: "1:950465799173:web:d99025afba2ff6ecb1686c"
  
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app; 