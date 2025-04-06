import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { firebaseApp } from "../firebase";

const db = getFirestore(firebaseApp);

export default async function handler(req, res) {
  const { collectionName, data, docId, updateData } = req.body;
  
  if (req.method === "POST") {
    try {
      const docRef = await addDoc(collection(db, collectionName), data);
      res.status(201).json({ id: docRef.id });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } else if (req.method === "GET") {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.status(200).json(docs);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } else if (req.method === "PUT") {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, updateData);
      res.status(200).json({ message: "Document updated" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } else if (req.method === "DELETE") {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      res.status(200).json({ message: "Document deleted" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}