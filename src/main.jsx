
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// Cargar los estilos de la aplicación
import "./css/dashboard.css";
import "./css/dashboard_lateral.css";
import "./css/login.css";

// Iniciar la aplicación React
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
