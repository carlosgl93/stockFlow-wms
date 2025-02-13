// eslint-disable-next-line no-restricted-imports
import { createBrowserRouter, ScrollRestoration } from "react-router-dom";

import { Layout } from "shared/Layout";

import { homePageLoader } from "./Home/loader";
import { productPageLoader } from "./Product/loader";
import { productsPageLoader } from "./Products/loader";
import { entriesPageLoader } from "./Entries/loader";
import { stockPageLoader } from "./Stock/loader";
import { dispatchesPageLoader } from "./Dispatches/loader";
import { lotPageLoader } from "./Lot/loader";

export const router = createBrowserRouter([
  {
    element: (
      <>
        <ScrollRestoration getKey={(location) => location.pathname} />
        <Layout />
      </>
    ),
    children: [
      {
        path: "/",
        loader: homePageLoader,
        lazy: () => import("./Home"),
      },
      {
        path: "/sign-in",
        lazy: () => import("./SignIn"),
      },
      {
        path: "/sign-up",
        lazy: () => import("./SignUp"),
      },
      {
        path: "/products",
        loader: productsPageLoader,
        lazy: () => import("./Products"),
      },
      {
        path: "/products/create",
        // loader: productsPageLoader,
        lazy: () => import("./Products/Create"),
      },
      {
        path: "/products/:productId",
        loader: productPageLoader,
        lazy: () => import("./Product"),
      },
      {
        path: "/entries",
        loader: dispatchesPageLoader,
        lazy: () => import("./Entries"),
      },
      {
        path: "/dispatches",
        loader: entriesPageLoader,

        lazy: () => import("./Dispatches"),
      },
      {
        path: "/stock",
        loader: stockPageLoader,

        lazy: () => import("./Stock"),
      },
      {
        path: "/lot",
        loader: lotPageLoader,
        lazy: () => import("./Lot"),
      },
      {
        path: "/move",
        lazy: () => import("./Move"),
      },
      {
        path: "/labeling",
        lazy: () => import("./Labeling"),
      },
    ],
  },
]);
