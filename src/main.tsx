import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { WebSocketProvider } from "./context/WebSocketContext";
import "./index.css"; // TailwindCSS

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WebSocketProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </WebSocketProvider>
  </React.StrictMode>
);
