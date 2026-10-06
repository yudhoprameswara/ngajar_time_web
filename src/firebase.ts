import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCMVpVR3faK-AeXhGPQ_VjYM4_eQkUVlnc",
  authDomain: "ngajar-time.firebaseapp.com",
  projectId: "ngajar-time",
  storageBucket: "ngajar-time.firebasestorage.app",
  messagingSenderId: "1027055140324",
  appId: "1:1027055140324:web:aad15e6bd5f77ecf621bf1",
  measurementId: "G-GWGG58VBRZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
export default app;
