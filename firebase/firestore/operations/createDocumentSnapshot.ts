import { addDoc, collection } from "firebase/firestore";
import { firestoreDB } from "../../firebaseConfig"; 


// Function to create data to a Firestore collection
export default async function createDocument(
  path: string,
  data: Partial<unknown>
) {
  console.log("createDocument", path, data);
  // Variable to store the result of the operation
  let result = null;
  // Variable to store any error that occurs during the operation
  let error = null;

  try {
    // Set the document with the provided data in the specified collection and ID
    result = await addDoc(collection(firestoreDB, path), data);
  } catch (e) {
    // Catch and store any error that occurs during the operation
    error = e;
  }

  // Return the result and error as an object
  return { result, error };
}
