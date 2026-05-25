import { getApp, getApps, initializeApp } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const requiredFirebaseFields = ['apiKey', 'authDomain', 'projectId', 'appId']

export const firebaseReady = requiredFirebaseFields.every((field) => Boolean(firebaseConfig[field]))

const app = firebaseReady ? (getApps().length ? getApp() : initializeApp(firebaseConfig)) : null

export const auth = app ? getAuth(app) : null
export const db = app ? getFirestore(app) : null
export const googleProvider = auth ? new GoogleAuthProvider() : null

function getUserDocumentId(email = '') {
  return encodeURIComponent(email.trim().toLowerCase())
}

export async function loadRemoteAccount(email) {
  if (!db || !email) return null

  const snapshot = await getDoc(doc(db, 'users', getUserDocumentId(email)))
  return snapshot.exists() ? snapshot.data() : null
}

export async function saveRemoteAccount(email, payload) {
  if (!db || !email) return null

  await setDoc(
    doc(db, 'users', getUserDocumentId(email)),
    {
      ...payload,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )

  return true
}

export async function signInWithGooglePopup() {
  if (!auth || !googleProvider) {
    throw new Error('Firebase is not configured')
  }

  const result = await signInWithPopup(auth, googleProvider)
  return result.user
}

export async function signUpWithEmailPassword({ email, password, displayName }) {
  if (!auth) {
    throw new Error('Firebase is not configured')
  }

  const result = await createUserWithEmailAndPassword(auth, email, password)

  if (displayName) {
    await updateProfile(result.user, { displayName })
  }

  return result.user
}

export async function signInWithEmailPassword({ email, password }) {
  if (!auth) {
    throw new Error('Firebase is not configured')
  }

  const result = await signInWithEmailAndPassword(auth, email, password)
  return result.user
}

export async function updateFirebaseUserProfile({ displayName, photoURL }) {
  if (!auth?.currentUser) return null

  await updateProfile(auth.currentUser, {
    displayName: displayName ?? auth.currentUser.displayName ?? null,
    photoURL: photoURL ?? auth.currentUser.photoURL ?? null,
  })

  return auth.currentUser
}

export function observeFirebaseAuthState(callback) {
  if (!auth) return () => {}
  return onAuthStateChanged(auth, callback)
}

export async function signOutFirebaseSession() {
  if (!auth) return
  await firebaseSignOut(auth)
}
