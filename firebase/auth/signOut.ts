import { signOut } from "firebase/auth"; 
import { firebaseAuth } from "../firebaseConfig"; 

const signOutUser = async () => {
  try {
    await signOut(firebaseAuth);
    console.log("User signed out successfully");
  } catch (error) {
    console.error("Error signing out:", error);
  }
};

export default signOutUser; 
