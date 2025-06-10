## Recommended Firestore Indexes for StockFlow WMS

Based on the ERD and typical query patterns for a WMS, here are suggested composite and single-field indexes:

### **Composite Indexes (for queries with multiple where/orderBy clauses):**

- **Stock**

  - Composite: `productId` + `lotId`  
    _For querying all stock for a product in a specific lot._
  - Composite: `lotId` + `updatedAt` (if you query by lot and order by update time)

- **LotProduct**

  - Composite: `lotId` + `productId`  
    _For fetching all products in a lot or all lots for a product._
  - Composite: `productId` + `lotId`  
    _For reverse lookups._

- **Movement**

  - Composite: `productId` + `fromLotId` + `toLotId`  
    _For tracking movements of a product between lots._
  - Composite: `date` + `productId`  
    _For querying movements by date range for a product._

- **Tag/Label**

  - Composite: `productId` + `lotId`  
    _For finding tags for a product in a specific lot._
  - Composite: `expirationDate` + `productId`  
    _For finding expiring products._

- **ProductHistory**

  - Composite: `productId` + `entryDate`  
    _For querying product history within a date range._

- **Entry**
  - Composite: `supplierId` + `createdAt`  
    _For supplier-based entry queries._
  - Composite: `transporterId` + `createdAt`  
    _For transporter-based entry queries._

### **Single-Field Indexes (if not excluded by default):**

- `updatedAt` on Stock (for ordering by last update)
- `expirationDate` on Tag/Label (for expiring stock queries)
- `entryDate` and `departureDate` on Lot (for lot lifecycle queries)
- `name` on Product and Place (for search/autocomplete)

### **General Tips:**

- **Disable indexing** for large fields not used in queries (e.g., `description`, `movementHistory`, or large arrays).
- **Monitor Firestore index suggestions** in the Firebase console after running your queries—Firestore will prompt you for missing indexes.

## How to Implement Firestore Indexes

To implement the recommended indexes in Firestore:

### 1. **Automatic Index Creation**

- When you run a query that requires a composite index, Firestore will return an error with a direct link to create the required index in the Firebase Console. Click the link to auto-create the index.

### 2. **Manual Index Creation**

- Go to the [Firebase Console > Firestore Database > Indexes](https://console.firebase.google.com/project/_/firestore/indexes).
- Click **"Add Index"** for composite indexes.
- Select the collection (e.g., `Stock`, `LotProduct`, `Movement`, etc.).
- Add the fields and their sort order (Ascending/Descending) as recommended.
- Save and wait for the index to build.

### 3. **Index Definition via `firestore.indexes.json`**

- For CI/CD or version control, define indexes in `firestore.indexes.json` at your project root.
- Example for `Stock` collection:

  ```json
  {
    "indexes": [
      {
        "collectionGroup": "Stock",
        "queryScope": "COLLECTION",
        "fields": [
          { "fieldPath": "productId", "order": "ASCENDING" },
          { "fieldPath": "lotId", "order": "ASCENDING" }
        ]
      },
      {
        "collectionGroup": "Stock",
        "queryScope": "COLLECTION",
        "fields": [
          { "fieldPath": "lotId", "order": "ASCENDING" },
          { "fieldPath": "updatedAt", "order": "DESCENDING" }
        ]
      }
      // ...add more as needed
    ],
    "fieldOverrides": []
  }
  ```

- Deploy with:

  ```sh
  firebase deploy --only firestore:indexes
  ```

### 4. **Single-Field Indexes**

- By default, Firestore creates single-field indexes.
- To **disable indexing** for large or unused fields, use the Firebase Console or add a `fieldOverrides` entry in `firestore.indexes.json`.

---

**Tip:**  
After deploying or running queries, always check the Firestore Indexes tab in the Firebase Console for missing or building indexes.
