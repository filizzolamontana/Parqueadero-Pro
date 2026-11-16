import React, { useEffect, useState } from "react";
import api from "./services/api";

import Login from "./components/Login";
import Registro from "./components/Registro";
import PanelControl from "./components/PanelControl";
import IngresoVehiculo from "./components/IngresoVehiculo";
import Pagos from "./components/Pagos";
import Reportes from "./components/Reportes";

const PAGINAS_PRIVADAS = ["panel", "ingreso", "pagos", "reportes"];

function App() {
  const [pagina, setPagina] = useState("login");
  const [autenticado, setAutenticado] = useState(false);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    let activo = true;
    const token = localStorage.getItem("parqueadero_token");

    if (!token) {
      setVerificando(false);
      return;
    }

    api.get("/auth/verificar", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((respuesta) => {
        if (!activo) return;

        if (respuesta.data?.ok === true) {
          setAutenticado(true);
          setPagina("panel");
        } else {
          localStorage.removeItem("parqueadero_token");
          localStorage.removeItem("parqueadero_usuario");
          setAutenticado(false);
          setPagina("login");
        }
      })
      .catch(() => {
        if (!activo) return;
        localStorage.removeItem("parqueadero_token");
        localStorage.removeItem("parqueadero_usuario");
        setAutenticado(false);
        setPagina("login");
      })
      .finally(() => {
        if (activo) setVerificando(false);
      });

    return () => { activo = false; };
  }, []);

  const cambiarPagina = (destino) => {
    console.log("Navegando a:", destino);

    if (destino === "salir" || destino === "logout") {
      localStorage.removeItem("parqueadero_token");
      localStorage.removeItem("parqueadero_usuario");
      setAutenticado(false);
      setPagina("login");
      return;
    }

    if (destino === "registro" || destino === "login") {
      setPagina(destino);
      return;
    }

    if (PAGINAS_PRIVADAS.includes(destino)) {
      const token = localStorage.getItem("parqueadero_token");

      if (!token) {
        setAutenticado(false);
        setPagina("login");
        return;
      }

      setAutenticado(true);
    }

    setPagina(destino);
  };

  if (verificando) {
    return (
      <div style={{ padding: "30px", textAlign: "center" }}>
        Verificando sesión...
      </div>
    );
  }

  if (PAGINAS_PRIVADAS.includes(pagina) && !autenticado) {
    return <Login cambiarPagina={cambiarPagina} />;
  }

  switch (pagina) {
    case "registro":
      return <Registro cambiarPagina={cambiarPagina} />;

    case "panel":
      return <PanelControl cambiarPagina={cambiarPagina} />;

    case "ingreso":
      return <IngresoVehiculo cambiarPagina={cambiarPagina} />;

    case "pagos":
      return <Pagos cambiarPagina={cambiarPagina} />;

    case "reportes":
      return <Reportes cambiarPagina={cambiarPagina} />;

    default:
      return <Login cambiarPagina={cambiarPagina} />;
  }
}

export default App;
