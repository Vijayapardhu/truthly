import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCi8BSGPrRN3WdZydwa3gKYW1iNU5EyueQ',
  authDomain: 'tordly.firebaseapp.com',
  projectId: 'tordly',
  storageBucket: 'tordly.firebasestorage.app',
  messagingSenderId: '116327873786',
  appId: '1:116327873786:web:2f4d8a0444391a4de99d43',
  measurementId: 'G-N5FVR8E0T2',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export default app
