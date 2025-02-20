import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { IProduct } from "../types";
import { db, storage } from "shared/firebase";
import { ValidationError } from "shared/Error";
import { Logger } from "utils/logger";
import { lowerAndTrim } from "utils";

export const saveProduct = async (product: IProduct) => {
  // Lowercase and trim the values

  const [name, internalCode, extCode] = lowerAndTrim([
    product.name,
    product.internalCode,
    product.extCode,
  ]);

  // Check if a product with the same name, internalCode, or extCode already exists
  const productsRef = collection(db, "products");
  const nameQuery = query(productsRef, where("name", "==", name));
  const internalCodeQuery = query(
    productsRef,
    where("internalCode", "==", internalCode)
  );
  const extCodeQuery = query(productsRef, where("extCode", "==", extCode));

  const [nameSnapshot, internalCodeSnapshot, extCodeSnapshot] =
    await Promise.all([
      getDocs(nameQuery),
      getDocs(internalCodeQuery),
      getDocs(extCodeQuery),
    ]);

  if (
    !nameSnapshot.empty ||
    !internalCodeSnapshot.empty ||
    !extCodeSnapshot.empty
  ) {
    throw new ValidationError(
      "A product with the same name, internalCode, or extCode already exists."
    );
  }

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
    name,
    internalCode,
    extCode,
    safetyDocumentUrl: safetyDocumentUrl ? safetyDocumentUrl : null,
    safetyDocument: null, // Remove the FileList from the product data
  };
  const docRef = await addDoc(collection(db, "products"), productData);
  productData.id = docRef.id;
  return productData;
};
