import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

export interface IMeta {
  total: number;
  limit: number;
  sort?: string;
  lastVisible?: QueryDocumentSnapshot<DocumentData, DocumentData>;
}
