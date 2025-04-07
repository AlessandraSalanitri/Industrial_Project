import { sendPasswordResetEmail } from "firebase/auth";
import { firebaseAuth } from "../firebaseConfig";

export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(firebaseAuth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}
