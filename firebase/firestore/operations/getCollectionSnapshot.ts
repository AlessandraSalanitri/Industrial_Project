import { firestoreDB } from "../../firebaseConfig";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

// Function to get documents from a Firestore collection
const getCollection = async <T>(path: string) => {
  let result = null;
  let error = null;
  try {
    result = (await getDocs(collection(firestoreDB, path))).docs.map(
      (d) => ({ id: d.id, ...d.data() } as T)
    );
  } catch (e) {
    error = e;
  }
  return { result, error };
};

// Function to create data in a Firestore collection
export const createDocument = async (path: string, data: Partial<unknown>) => {
  console.log("createDocument", path, data);
  let result = null;
  let error = null;

  try {
    // Add document to collection
    result = await addDoc(collection(firestoreDB, path), data);
  } catch (e) {
    error = e;
  }

  return { result, error };
};

// Function to update a document in Firestore
export const updateDocument = async (path: string, docId: string, data: Partial<unknown>) => {
  console.log("updateDocument", path, docId, data);
  let result = null;
  let error = null;

  try {
    const docRef = doc(firestoreDB, path, docId);  // Reference to the document
    result = await updateDoc(docRef, data);      // Update the document with new data
  } catch (e) {
    error = e;
  }

  return { result, error };
};

// Function to delete a document from Firestore
export const deleteDocument = async (path: string, docId: string) => {
  console.log("deleteDocument", path, docId);
  let result = null;
  let error = null;

  try {
    const docRef = doc(firestoreDB, path, docId);  // Reference to the document
    result = await deleteDoc(docRef);             // Delete the document
  } catch (e) {
    error = e;
  }

  return { result, error };
};

export default getCollection;
