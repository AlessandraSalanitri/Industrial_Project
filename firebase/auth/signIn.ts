import { signInWithEmailAndPassword } from "firebase/auth";
import { getUserRole } from "../firestore/usersCollection";
import { firebaseAuth } from "../firebaseConfig";
import { FirebaseError } from "firebase/app"; // Import FirebaseError from Firebase

// Function to sign in with email and password
export default async function signIn(email: string, password: string) {
  let result = null; // Variable to store the sign-in result
  let error = null; // Variable to store any error that occurs

  try {
    // Sign in with email and password using Firebase Authentication
    const { user } = await signInWithEmailAndPassword(firebaseAuth, email, password);
    
    // Fetch the user's role and avatar from Firestore
    const userRole = await getUserRole(user.uid);

    // Construct the result object
    result = {
      userId: user.uid,
      email: user.email,
      role: userRole?.role || "", // Default to empty string if no role is found
      avatar: userRole?.avatar || null, // Default to null if no avatar is found
    };
  } catch (e: unknown) {
    // Check if the error is an instance of FirebaseError (Firebase specific error class)
    if (e instanceof FirebaseError) {
      // Handle specific errors and assign them to the error object
      if (e.code === 'auth/user-not-found') {
        error = { message: "User not found. Please check your email." };
      } else if (e.code === 'auth/wrong-password') {
        error = { message: "Incorrect password. Please try again." };
      } else {
        error = { message: e.message || "An unexpected error occurred." };
      }
    } else {
      // In case the error is not an instance of FirebaseError
      error = { message: "An unknown error occurred." };
    }
  }

  // Return the result and error (if any)
  return { result, error };
}
