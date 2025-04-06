import { doc, setDoc } from "firebase/firestore";
import { firestoreDB } from "../firebaseConfig";

export async function updateUserAvatar(userId: string, avatarId: string) {
  const userRef = doc(firestoreDB, "users", userId);
  await setDoc(userRef, { avatar: avatarId }, { merge: true }); // Create if missing
}
