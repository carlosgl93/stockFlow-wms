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

| Product                   | Stock               | Lot                   |
| ------------------------- | ------------------- | --------------------- |
| - id: string              | - id: string        | - id: string          |
| - extCode: string         | - productId: string | - name: string        |
| - intCode: string         | - quantity: number  | - entryDate: date     |
| - name: string            | - lotId: string     | - departureDate: date |
| - price: number           | - updatedAt: date   | - movementHistory     |
| - riskCategory: enum      |                     |                       |
| - category: enum          |                     |                       |
| - safetyDoc: string       |                     |                       |
| - boxOrUnit: enum         |                     |                       |
| - boxDetails:             |                     |                       |
| - units: number           |                     |                       |
| - quantity: number        |                     |                       |
| - unitOfMeasure: enum     |                     |                       |
| - container: enum         |                     |                       |
| - type: enum              |                     |                       |
| - kilos: number           |                     |                       |
| - height: number          |                     |                       |
| - width: number           |                     |                       |
| - depth: number           |                     |                       |
| - unitsPerSurface: number |                     |                       |
| - palletType: enum        |                     |                       |

| LotProduct          | Movement            | Tag/Label              |
| ------------------- | ------------------- | ---------------------- |
| - id: string        | - id: string        | - id: string           |
| - lotId: string     | - productId: string | - productId: string    |
| - productId: string | - fromLotId: string | - lotId: string        |
| - quantity: number  | - toLotId: string   | - expirationDate: date |
|                     | - date: date        | - location: string     |

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

Entity Descriptions:

- **Product:** Represents a product in the warehouse.
  - Attributes: id, extCode, intCode, name, price, riskCategory, category, safetyDoc, boxOrUnit, boxDetails, palletType.
- **Stock:** Represents the stock levels of a product.
  - Attributes: id, productId, quantity, lotId, updatedAt.
- **Lot:** Represents a lot of products, tracking entry, departure, and movement history.
  - Attributes: id, entryDate, departureDate, movementHistory.
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

Relationships:

- **Product to Stock:** One-to-Many (A product can have multiple stock entries).
- **Product to LotProduct:** One-to-Many (A product can be part of multiple lot products).
- **Lot to LotProduct:** One-to-Many (A lot can have multiple lot products).
- **Product to Movement:** One-to-Many (A product can have multiple movements).
- **Product to Tag/Label:** One-to-Many (A product can have multiple tags/labels).
- **Product to ProductHistory:** One-to-Many (A product can have multiple history entries).
- **Lot to Tag/Label:** One-to-Many (A lot can have multiple tags/labels).

This document serves as a guide to ensure AI-assisted code generation aligns with project standards and goals.
