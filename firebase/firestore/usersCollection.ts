import { TUserRole } from "../../lib/types"; 
import { queryWhere } from "./operations/query"; 
import { doc, setDoc, getDoc } from "firebase/firestore";
import { firestoreDB } from "../firebaseConfig";


const USERS = "users";

export const setUserRole = async (userRole: Omit<TUserRole, "id">) => {
  const docRef = doc(firestoreDB, USERS, userRole.userId);
  await setDoc(docRef, {
    role: userRole.role,
    avatar: userRole.avatar || null,
  });
};

export const getUserRole = async (userId: string): Promise<TUserRole | null> => {
  const docRef = doc(firestoreDB, USERS, userId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;

  const data = snapshot.data();
  return {
    id: snapshot.id,
    userId,
    role: data.role,
    avatar: data.avatar || null,
  };
};
