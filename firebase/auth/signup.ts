// firebase/auth/signUp.ts

import { createUserWithEmailAndPassword } from "firebase/auth";
import { firebaseAuth, firestoreDB } from "../firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { setUserRole } from "../firestore/usersCollection";
import { TUserRole } from "../../lib/types";

export default async function signUp(
  email: string,
  password: string,
  role: TUserRole["role"]
) {
  let result = null, error = null;

  try {
    const { user } = await createUserWithEmailAndPassword(firebaseAuth, email, password);

    // Save role info (you already do this)
    await setUserRole({ userId: user.uid, role });

    // Save subscription info to Firestore
    const userRef = doc(firestoreDB, "users", user.uid);
    await setDoc(userRef, {
      userId: user.uid,
      email: user.email,
      role,
      avatar: null,
      subscriptionPlan: "free",
      credits: 5,
      lastCreditUpdate: serverTimestamp()
    });

    console.log("User role + subscription info saved:", user.uid);

    result = { uid: user.uid, email: user.email };
  } catch (e) {
    error = e;
  }

  return { result, error };
}
