import { doc, updateDoc, getDoc } from "firebase/firestore";
import { firestoreDB } from "../firebaseConfig";
import { TUserDetails } from "../../lib/types";

export async function fetchUserDetails(userId: string) {
  const docRef = doc(firestoreDB, "users", userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data(); // contains all user info, including optional fields
  } else {
    return null;
  }
}

export async function updateUserDetails(userId: string, updates: Partial<TUserDetails>) {
    const docRef = doc(firestoreDB, "users", userId);
    await updateDoc(docRef, updates);
}
