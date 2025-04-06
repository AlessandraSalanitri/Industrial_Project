import { doc, getDoc } from "firebase/firestore";
import { firestoreDB } from "../../firebaseConfig"; 

// Function to retrieve a document from a Firestore collection
export async function getDocumentSnapshot(
  path: string,
  ...pathSegments: string[]
) {
  // Variable to store the result of the operation
  let result = null;
  // Variable to store any error that occurs during the operation
  let error = null;

  try {
    const docRef = doc(firestoreDB, path, ...pathSegments);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      result = { id: snapshot.id, ...snapshot.data() };
    } else {
      error = "Document does not exist.";
    }
  } catch (e) {
    // Catch and store any error that occurs during the operation
    error = e;
  }

  // Return the result and error as an object
  return { result, error };
}
