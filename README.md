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
