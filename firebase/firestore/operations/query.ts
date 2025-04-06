import {
  collection,
  documentId,
  FieldPath,
  getDocs,
  query,
  QueryConstraint,
  where,
  WhereFilterOp,
} from "firebase/firestore";
import { firestoreDB } from "../../firebaseConfig";

export const findById = async <T>(path: string, id: string) => {
  console.log("path, id", path, id);
  const records = await queryWhere<T>(path, documentId(), "==", id);

  if (!records) {
    return null;
  }

  if (records?.length === 0) {
    return null;
  }

  return records[0];
};

export const queryWhere = async <T>(
  path: string,
  fieldPath: string | FieldPath,
  opStr: WhereFilterOp,
  value: unknown
) => {
  const queryResult = await queryFrom(path, where(fieldPath, opStr, value));
  if (queryResult.empty) {
    return [];
  }
  return queryResult.docs.map((d) => ({ id: d.id, ...d.data() } as T));
};

export const queryFrom = async (
  path: string,
  ...queryConstraints: QueryConstraint[]
) => {
  const q = query(collection(firestoreDB, path), ...queryConstraints);
  return await getDocs(q);
};
