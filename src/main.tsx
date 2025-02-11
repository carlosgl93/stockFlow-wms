import React from "react";
import ReactDOM from "react-dom/client";
import "./style.css";

import { App, Providers } from "./app";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Providers>
      <App />
    </Providers>
  </React.StrictMode>
);
