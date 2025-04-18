// utils/auth/signUp.ts

import { createUserWithEmailAndPassword } from "firebase/auth";
import { firebaseAuth } from "../firebaseConfig";
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
    await setUserRole({ userId: user.uid, role });
    console.log("User role saved to Firestore:", user.uid, role);

    result = { uid: user.uid, email: user.email };
  } catch (e) {
    error = e;
  }

  return { result, error };
}
