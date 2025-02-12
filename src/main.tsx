import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import { WebSocketProvider } from "./context/WebSocketContext";
import "./index.css"; // TailwindCSS

// ✅ Render App inside the root element
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WebSocketProvider>
      <Router>
        <App />
      </Router>
    </WebSocketProvider>
  </React.StrictMode>
);
