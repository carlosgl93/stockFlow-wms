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
   - Product attributes: Name, Price, Risk Category (Toxic, Flammable, Corrosive, etc.)

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

## **Copilot Prompting**

When writing code, Copilot should:

1. Suggest **modular and reusable components**.
2. Follow the **React Query pattern** for data fetching and caching.
3. Use **Firebase best practices** for Firestore interactions.
4. Ensure **Material UI Data Grid** is correctly implemented for tables.
5. Provide **TypeScript-typed functions** for better maintainability.

---

This document serves as a guide to ensure AI-assisted code generation aligns with project standards and goals.
