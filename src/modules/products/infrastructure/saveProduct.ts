import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { IProduct } from "../types";
import { db, storage } from "modules/auth/infrastructure/firebaseConfig";

export const saveProduct = async (product: IProduct) => {
  // Upload safety document to Firebase Storage
  let safetyDocumentUrl = "";
  if (product.safetyDocument && product.safetyDocument.length > 0) {
    const file = product.safetyDocument[0];
    const storageRef = ref(storage, `safetyDocuments/${file.name}`);
    await uploadBytes(storageRef, file);
    safetyDocumentUrl = await getDownloadURL(storageRef);
  }

  // Add product to Firestore
  const productData = {
    ...product,
    safetyDocumentUrl,
    safetyDocument: undefined, // Remove the FileList from the product data
  };
  const docRef = await addDoc(collection(db, "products"), productData);
  return { id: docRef.id, ...productData };
};
