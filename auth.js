// pages/api/auth.js (Next.js API Route)

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { firebaseApp } from "../firebase";
import { checkAuth } from "./authMiddleware";

const auth = getAuth(firebaseApp);

export default async function handler(req, res) {
  const { email, password, type } = req.body;

  if (req.method === "POST") {
    if (type === "login") {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return res.status(200).json(userCredential.user);
      } catch (error) {
        return res.status(400).json({ error: error.message });
      }
    } else if (type === "register") {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return res.status(201).json(userCredential.user);
      } catch (error) {
        return res.status(400).json({ error: error.message });
      }
    }
  }

  // 🔁 Password Reset
  else if (req.method === "PATCH" && type === "reset") {
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);

      if (methods.length === 0) {
        return res.status(404).json({
          error: "We did not find this email. If you do not have an account, please sign up or double-check you've inserted the right email.",
        });
      }

      await sendPasswordResetEmail(auth, email);
      return res.status(200).json({ message: "Reset email sent" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // 🔒 Logout (protected)
  else if (req.method === "DELETE") {
    return checkAuth(req, res, async () => {
      try {
        await signOut(auth);
        return res.status(200).json({ message: "Logged out" });
      } catch (error) {
        return res.status(400).json({ error: error.message });
      }
    });
  }

  // ❌ Invalid method
  else {
    res.setHeader("Allow", ["POST", "DELETE", "PATCH"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
