# StockFlow WMS - Copilot Prompt

## **Project Overview**

StockFlow is a multitenant **Warehouse Management System (WMS)** designed to efficiently handle product tracking, stock management, and warehouse operations.

## **Tech Stack**

- **Frontend:** Vite, React, TypeScript, Chakra UI, Material UI (Data Grid)
- **Backend:** Firebase (Firestore, Authentication, Functions)
- **State Management:** @tanstack/react-query
- **Deployment:** Firebase Hosting

## **Core Features**

1. **Products Module**

   - CRUD operations for products
   - Pagination with React Query & Firestore
   - Product attributes
     1. Ext Code
     2. Internal Code
     3. Name
     4. Price
     5. Risk Category: Enum (Toxic, Auto Flammable, Not Flammable, Flammable, Pace Int, Corrosive, etc.)
     6. Category: Enum (Acaricida, Acondicionador de suelo, Bloqueador solar manzana, Coadyuvante antritranspirante, detergente, envases, fertilizante, filtro, fungicida, herbicida, hervisida, inoculante, insecticida Acaricida, neumaticida, pace international, recubrimiento organico, regulador de crecimiento)
     7. Safety Doc: PDF upload
     8. Box or unit (Radio button): If it is being added as a box or per unit.
        8.a: Box / unit fields:
        8.a.1: N of units: input type number
        8.a.2: Quantity: input type number
        8.a.3: Unit of measure: Select with options: litre, c.c, kilo, meter, unit, centimetre
        8.a.4: Container: Select with options: bidon, bolsa, sobre, botella, caja, tambor, lata, paquetes
        8.a.5: Type: Select with options: glass, wood, plastic, cardboard, paper, lata
        8.a.6: Kilos: input type number
        8.a.7: Height: input type number
        8.a.8: Width: input type number
        8.a.9: Depth: input type number
        8.a.10: Units per surface: Calculator that given the width and depth of the product it calculates how many can be stored within one pallet.
     9. Pallet type: Standard (Height: 13cm, Width: 120cm, Depth: 100cm) or Chinese (Height: 10cm, Width: 114cm, Depth: 142cm)

2. **Stock Management**

   - View product stock levels
   - Update stock when needed

3. **Tracking by Lot**

   - Monitor entry, departure, and movement history for a product
   - **CRUD operations for Lots**
     - Create new lots
     - Read lot details
     - Update existing lots
     - Delete lots

4. **Tag/Label Management**

   - Assign lot locations and expiration dates to products

5. **Movements Module**

   - Move products between warehouse locations

6. **Product History**
   - View all entries and departures of a product within a date range

## **Development Guidelines**

- **Code Style:** Follow TypeScript best practices and modular architecture.
- **Data Handling:** Use Firestore for real-time updates and React Query for caching.
- **UI/UX:** Keep it clean and intuitive using Material UI.
- **Performance:** Optimize Firestore queries and use pagination where applicable.

## **Copilot Prompting**

When writing code, Copilot should:

1. Suggest **modular and reusable components**.
2. Follow the **React Query pattern** for data fetching and caching.
3. Use **Firebase best practices** for Firestore interactions.
4. Ensure **Material UI Data Grid** is correctly implemented for tables.
5. Provide **TypeScript-typed functions** for better maintainability.

---

ERD:

| Product                   | Stock                      | Place                 |
| ------------------------- | -------------------------- | --------------------- |
| - id: string              | - id: string               | - id: string          |
| - extCode: string         | - productId: string        | - name: string        |
| - intCode: string         | - unitsNumber: number      |                       |
|                           | - looseUnitsNumber: number | - entryDate: date     |
| - name: string            | - lotId: string            | - departureDate: date |
| - price: number           | - updatedAt: date          | - movementHistory     |
| - riskCategory: enum      | - places: IPlace[]         |                       |
| - category: enum          | - productName: string      |                       |
| - safetyDoc: string       | - lotName: string          |                       |
| - boxOrUnit: enum         |                            |                       |
| - boxDetails:             |                            |                       |
| - units: number           |                            |                       |
| - quantity: number        |                            |                       |
| - unitOfMeasure: enum     |                            |                       |
| - container: enum         |                            |                       |
| - type: enum              |                            |                       |
| - kilos: number           |                            |                       |
| - height: number          |                            |                       |
| - width: number           |                            |                       |
| - depth: number           |                            |                       |
| - unitsPerSurface: number |                            |                       |
| - palletType: enum        |                            |                       |

| LotProduct                 | Movement            | Tag/Label              |
| -------------------------- | ------------------- | ---------------------- |
| - id: string               | - id: string        | - id: string           |
| - lotId: string            | - productId: string | - productId: string    |
| - productId: string        | - fromLotId: string | - lotId: string        |
| - unitsNumber: number      | - toLotId: string   | - expirationDate: date |
| - looseUnitsNumber: number | - date: date        | - location: string     |
| - totalUnitsNumber: number |                     |                        |

| ProductHistory        | Suppliers                  | Contact         |
| --------------------- | -------------------------- | --------------- |
| - id: string          | - company: string          | - name: string  |
| - productId: string   | - idNumber: string         | - email: string |
| - entryDate: date     | - businessCategory: string | - phone: string |
| - departureDate: date | - county: string           |                 |
| - details: string     | - region: string           |                 |
|                       | - fax: string              |                 |
|                       | - phone: string            |                 |
|                       | - website: string          |                 |
|                       | - email: string            |                 |
|                       | - address: string          |                 |
|                       | - contact: IContact        |                 |

| Transporter    | Entry                              |
| -------------- | ---------------------------------- |
| - id: string   | - id: string                       |
| - name: string | - supplierId: string               |
|                | - docNumber: string                |
|                | - transporterId: string            |
|                | - productsToEnter: IProductEntry[] |
|                | - description: string              |
|                | - createdAt?: string               |
|                | - updatedAt?: string               |

| IProductEntry              |
| -------------------------- |
| - id: string               |
| - unitsNumber: number      |
| - looseUnitsNumber: number |
| - totalUnitsNumber: number |
| - lotId: string            |
| - stockId?: string         |
| - expiryDate: string       |
| - palletNumber: string     |
| - heightCMs: number        |
| - widthCMs: number         |
| - description: string      |

Entity Descriptions:

- **Product:** Represents a product in the warehouse.
  - Attributes: id, extCode, intCode, name, price, riskCategory, category, safetyDoc, boxOrUnit, boxDetails, palletType.
- **Stock:** Represents the stock levels of a product.
  - Attributes: id, productId, quantity, lotId, updatedAt.
- **Place:** Represents a warehouse location.
  - Attributes: id, name, entryDate, departureDate, movementHistory.
- **LotProduct:** Represents the many-to-many relationship between Lot and Product.
  - Attributes: id, lotId, productId, quantity.
- **Movement:** Represents the movement of products between warehouse locations.
  - Attributes: id, productId, fromLotId, toLotId, date.
- **Tag/Label:** Represents tags or labels assigned to products, including lot locations and expiration dates.
  - Attributes: id, productId, lotId, expirationDate, location.
- **ProductHistory:** Represents the history of product entries and departures within a date range.
  - Attributes: id, productId, entryDate, departureDate, details.
- **Suppliers:** Represents a supplier in the system.
  - Attributes: company, idNumber, businessCategory, county, region, fax, phone, website, email, address, contact.
- **IContact:** Represents the contact information for a supplier.
  - Attributes: name, email, phone.
- **Entry:** Represents an entry of products into the warehouse.
  - Attributes: id, supplierId, docNumber, transporterId, productsToEnter, description, createdAt, updatedAt.
- **IProductEntry:** Represents the details of products to be entered into the warehouse.
  - Attributes: id, unitsNumber, looseUnitsNumber, totalUnitsNumber, lotId, stockId, expiryDate, palletNumber, heightCMs, widthCMs, description.

Relationships:

- **Product to Stock:** One-to-Many (A product can have multiple stock entries).
- **Product to LotProduct:** One-to-Many (A product can be part of multiple lot products).
- **Lot to LotProduct:** One-to-Many (A lot can have multiple lot products).
- **Product to Movement:** One-to-Many (A product can have multiple movements).
- **Product to Tag/Label:** One-to-Many (A product can have multiple tags/labels).
- **Product to ProductHistory:** One-to-Many (A product can have multiple history entries).
- **Lot to Tag/Label:** One-to-Many (A lot can have multiple tags/labels).
- **Supplier to Contact:** One-to-One (A supplier has one contact information).
- **Product to Place:** One-to-Many (A product can be stored in multiple places).
- **Entry to Supplier:** Many-to-One (An entry is associated with one supplier).
- **Entry to Transporter:** Many-to-One (An entry is associated with one transporter).
- **Entry to Product:** Many-to-Many (An entry is associated with multiple products).
- **Entry to Lot:** Many-to-One (An entry is associated with one lot).
- **Entry to Place:** Many-to-One (An entry is associated with one place).
- **Entry to Stock:** Many-to-One (An entry is associated with one stock).

This document serves as a guide to ensure AI-assisted code generation aligns with project standards and goals.

## StockFlow WMS - Business Rules

### 1. Product Management Rules

- A product **must** have a unique `extCode` or `intCode`.
- Products **must** be categorized into predefined `riskCategory` and `category` enums.
- The `safetyDoc` **must** be uploaded for hazardous products (`riskCategory` = Toxic, Corrosive, Auto Flammable).
- Products added **must** specify if they are stored as `boxOrUnit`.
- If stored as a **box**, `units` per box and `quantity` of boxes **must** be provided.
- **Product dimensions (`height`, `width`, `depth`, `kilos`) must be provided** if stored in a pallet.

### 2. Stock Management Rules

- Stock **must always be associated** with a product and a `lotId`.
- A product's **stock quantity cannot go negative** (ensure inventory integrity).
- Updating stock **must trigger** an `updatedAt` timestamp.
- Stock movements **must be recorded** in `ProductHistory`.

### 3. Lot Management Rules

- A **lot cannot be deleted if there is stock assigned to it**.
- Each product entry **must be assigned to a lot**.
- Lots **must track** `entryDate`, `departureDate`, and `movementHistory`.
- If a lot is **expired**, stock **must be flagged** for review.

### 4. Tracking & Labeling Rules

- Each product **must have at least one assigned tag/label**.
- Products with expiration dates **must have a tag/label** for tracking.
- A label **must include the `expirationDate` and `location`**.

### 5. Movements & Product History Rules

- Any product movement **must be logged** in `Movement` and `ProductHistory`.
- A product **must have an assigned `fromLotId` and `toLotId`** when moved.
- **No duplicate movements** (same product, same source and destination, within a short timeframe).

### 6. Supplier & Transporter Rules

- A supplier **must have a valid `idNumber`** (RUT, tax ID, etc.).
- A supplier **must be linked to at least one product**.
- A transporter **must have a registered `name`** before being assigned to deliveries.

---

These rules help maintain **data integrity, prevent inconsistencies, and ensure smooth warehouse operations**.
