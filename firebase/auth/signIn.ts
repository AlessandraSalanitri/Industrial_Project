import {signInWithEmailAndPassword}from "firebase/auth";
import { getUserRole } from "../firestore/usersCollection";
import { firebaseAuth } from "../firebaseConfig";

// Get the authentication instance using the Firebase app
// const firebaseAuth = getAuth(firebaseApp);

// Function to sign in with email and password
export default async function signIn(email: string, password: string) {
  let result = null, // Variable to store the sign-in result
    error = null; // Variable to store any error that occurs

  try {
    const { user } = await signInWithEmailAndPassword(
      firebaseAuth,
      email,
      password
    ); // Sign in with email and password

    const userRole = await getUserRole(user.uid);
    
    result = {
      userId: user.uid,
      email: user.email,
      role: userRole?.role || "",
      avatar: userRole?.avatar || null,
    };
    

  } catch (e) {
    error = e;
  }

  return { result, error };
}
