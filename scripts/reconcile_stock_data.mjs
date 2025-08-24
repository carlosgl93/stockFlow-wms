#!/usr/bin/env node

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK
const app = initializeApp({
  credential: cert({
    projectId: "stockflow-wms",
    // Add your service account key here for production
    // privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    // clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
  projectId: "stockflow-wms",
});

const db = getFirestore(app);

async function reconcileStockData() {
  console.log("Starting stock data reconciliation...");

  try {
    // Get all stock entries
    const stockSnapshot = await db.collection("stock").get();
    const stockEntries = stockSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get all lotProducts entries
    const lotProductsSnapshot = await db.collection("lotProducts").get();
    const lotProductsEntries = lotProductsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(
      `Found ${stockEntries.length} stock entries and ${lotProductsEntries.length} lotProducts entries`
    );

    // Group by productId and lotId for comparison
    const stockMap = new Map();
    stockEntries.forEach((entry) => {
      const key = `${entry.productId}::${entry.lotId}`;
      stockMap.set(key, entry);
    });

    const lotProductsMap = new Map();
    lotProductsEntries.forEach((entry) => {
      const key = `${entry.productId}::${entry.lotId}`;
      if (!lotProductsMap.has(key)) {
        lotProductsMap.set(key, []);
      }
      lotProductsMap.get(key).push(entry);
    });

    console.log("\n=== RECONCILIATION REPORT ===");

    let discrepancies = [];
    let totalStockEntries = 0;
    let totalLotProductEntries = 0;

    // Check for discrepancies
    for (const [key, stockEntry] of stockMap) {
      totalStockEntries++;

      if (lotProductsMap.has(key)) {
        const lotProducts = lotProductsMap.get(key);
        totalLotProductEntries += lotProducts.length;

        // Sum up all lotProducts for this productId::lotId combination
        const totalLotProductUnits = lotProducts.reduce(
          (sum, lp) => sum + (Number(lp.unitsNumber) || 0),
          0
        );
        const totalLotProductLooseUnits = lotProducts.reduce(
          (sum, lp) => sum + (Number(lp.looseUnitsNumber) || 0),
          0
        );

        const stockUnits = Number(stockEntry.unitsNumber) || 0;
        const stockLooseUnits = Number(stockEntry.looseUnitsNumber) || 0;

        if (
          stockUnits !== totalLotProductUnits ||
          stockLooseUnits !== totalLotProductLooseUnits
        ) {
          const [productId, lotId] = key.split("::");
          discrepancies.push({
            productId,
            lotId,
            stockUnits,
            stockLooseUnits,
            lotProductUnits: totalLotProductUnits,
            lotProductLooseUnits: totalLotProductLooseUnits,
            unitsDifference: totalLotProductUnits - stockUnits,
            looseUnitsDifference: totalLotProductLooseUnits - stockLooseUnits,
            stockId: stockEntry.id,
            lotProductIds: lotProducts.map((lp) => lp.id),
          });
        }
      }
    }

    console.log(`Total stock entries: ${totalStockEntries}`);
    console.log(`Total lotProduct entries: ${totalLotProductEntries}`);
    console.log(`Discrepancies found: ${discrepancies.length}`);

    if (discrepancies.length > 0) {
      console.log("\n=== DISCREPANCIES DETAIL ===");
      discrepancies.forEach((discrepancy, index) => {
        console.log(
          `\n${index + 1}. Product: ${discrepancy.productId}, Lot: ${
            discrepancy.lotId
          }`
        );
        console.log(
          `   Stock collection: ${discrepancy.stockUnits} units, ${discrepancy.stockLooseUnits} loose units`
        );
        console.log(
          `   LotProducts collection: ${discrepancy.lotProductUnits} units, ${discrepancy.lotProductLooseUnits} loose units`
        );
        console.log(
          `   Difference: ${discrepancy.unitsDifference} units, ${discrepancy.looseUnitsDifference} loose units`
        );
        console.log(`   Stock ID: ${discrepancy.stockId}`);
        console.log(
          `   LotProduct IDs: ${discrepancy.lotProductIds.join(", ")}`
        );

        // Special highlight for the ENDOSMART issue
        if (
          discrepancy.lotProductUnits === 745 &&
          discrepancy.stockUnits === 77
        ) {
          console.log(`   ⚠️  THIS IS THE REPORTED ENDOSMART BUG! ⚠️`);
        }
      });

      console.log("\n=== RECOMMENDED ACTIONS ===");
      console.log(
        "1. Use the stock collection as the source of truth (it appears to have correct values)"
      );
      console.log(
        "2. Update lotProducts to match stock values OR delete lotProducts entries entirely"
      );
      console.log(
        "3. Consider removing the dual collection system to prevent future inconsistencies"
      );

      // Find the specific ENDOSMART case
      const endosmartCase = discrepancies.find(
        (d) => d.lotProductUnits === 745 && d.stockUnits === 77
      );
      if (endosmartCase) {
        console.log(`\n=== ENDOSMART SPECIFIC FIX ===`);
        console.log(`Product ID: ${endosmartCase.productId}`);
        console.log(`Lot ID: ${endosmartCase.lotId}`);
        console.log(`Correct stock value: ${endosmartCase.stockUnits} units`);
        console.log(
          `Incorrect lotProducts value: ${endosmartCase.lotProductUnits} units`
        );
        console.log(
          `Action: Update lotProducts to match stock OR delete lotProducts entry`
        );
      }
    } else {
      console.log(
        "✅ No discrepancies found - stock and lotProducts are consistent!"
      );
    }
  } catch (error) {
    console.error("Error during reconciliation:", error);
  }
}

// Uncomment and run with caution in production
// reconcileStockData();

console.log("Stock reconciliation script ready.");
console.log(
  "Uncomment the reconcileStockData() call at the bottom to run the analysis."
);
console.log(
  "⚠️  IMPORTANT: This is a READ-ONLY analysis script. No data will be modified."
);
