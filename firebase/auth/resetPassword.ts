import { sendPasswordResetEmail } from "firebase/auth";
import { firebaseAuth } from "../firebaseConfig";

export async function resetPassword(email: string) {
  if (!email) {
    return { success: false, error: { message: "Email is required." } };
  }

  const sanitizedEmail = email.trim().toLowerCase();

  // Optional: Regex for basic format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitizedEmail)) {
    return {
      success: false,
      error: { message: "Please enter a valid email address." },
    };
  }

  try {
    await sendPasswordResetEmail(firebaseAuth, sanitizedEmail);
    return { success: true };
  } catch (error: any) {
    console.error("Reset error:", error.code, error.message);

    let message = "Something went wrong. Please try again.";
    if (error.code === "auth/user-not-found") {
      message = "We did not find this email. Please double-check it or sign up.";
    } else if (error.code === "auth/invalid-email") {
      message = "This email is not valid.";
    }

    return { success: false, error: { message } };
  }
}
