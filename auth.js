import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { firebaseApp } from "../firebase";

const auth = getAuth(firebaseApp);

export default function handler(req, res) {
  if (req.method === "POST") {
    const { email, password, type } = req.body;
    if (type === "login") {
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => res.status(200).json(userCredential.user))
        .catch((error) => res.status(400).json({ error: error.message }));
    } else if (type === "register") {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => res.status(201).json(userCredential.user))
        .catch((error) => res.status(400).json({ error: error.message }));
    }
  } else if (req.method === "DELETE") {
    signOut(auth)
      .then(() => res.status(200).json({ message: "Logged out" }))
      .catch((error) => res.status(400).json({ error: error.message }));
  }
}