import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.tsx";
import { Provider } from "./provider.tsx";
import "@/styles/globals.css";

async function bootstrap() {
  try {
    const res = await fetch("/config.json", { cache: "no-store" });
    const config = await res.json();

    (window as any).RUNTIME_CONFIG = config;
  } catch (err) {
    console.warn("Failed to load config.json, using defaults");
  }

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <BrowserRouter>
        <Provider>
          <App />
        </Provider>
      </BrowserRouter>
    </React.StrictMode>,
  );
}

bootstrap();
