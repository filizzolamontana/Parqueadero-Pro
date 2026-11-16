
import React, { useState } from "react";
import api from "../services/api";

function Registro({ cambiarPagina }) {
  const [datos, setDatos] = useState({
    nombre: "",
    usuario: "",
    correo: "",
    password: "",
    confirmar: ""
  });

  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const actualizar = (evento) => {
    setDatos((anterior) => ({
      ...anterior,
      [evento.target.name]: evento.target.value
    }));
  };

  const registrar = async (evento) => {
    evento.preventDefault();

    if (cargando) return;

    setError("");

    if (datos.password !== datos.confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (datos.password.length < 8) {
      setError("La contraseña debe tener mínimo 8 caracteres.");
      return;
    }

    setCargando(true);

    try {
      const respuesta = await api.post("/auth/registro", {
        nombre: datos.nombre.trim(),
        usuario: datos.usuario.trim(),
        correo: datos.correo.trim(),
        password: datos.password
      });

      if (respuesta.data?.ok !== true) {
        throw new Error("El servidor no confirmó el registro.");
      }

      // No iniciar sesión automáticamente.
      // Volver al login solamente si el registro fue exitoso.
      cambiarPagina("login");

    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
        err.message ||
        "No se pudo registrar el usuario."
      );
    } finally {
      setCargando(false);
    }
  };

  const campos = [
    {
      name: "nombre",
      label: "Nombre completo",
      icon: "badge",
      type: "text",
      placeholder: "Ingresa tu nombre completo"
    },
    {
      name: "usuario",
      label: "Usuario",
      icon: "person",
      type: "text",
      placeholder: "Crea tu nombre de usuario"
    },
    {
      name: "correo",
      label: "Correo electrónico",
      icon: "email",
      type: "email",
      placeholder: "Ingresa tu correo electrónico"
    },
    {
      name: "password",
      label: "Contraseña",
      icon: "lock",
      type: "password",
      placeholder: "Mínimo 8 caracteres"
    },
    {
      name: "confirmar",
      label: "Confirmar contraseña",
      icon: "verified_user",
      type: "password",
      placeholder: "Repite tu contraseña"
    }
  ];

  return (
    <div className="login-container">
      <div className="login-left">
        <img
          src="/img/login-banner.png"
          alt="Ilustración Parqueadero"
          className="login-image"
        />
      </div>

      <div className="login-right">
        <div className="login-content">
          <div className="login-header">
            <div className="logo-wrapper">
              <img
                src="/img/logo.png"
                alt="Logo Parqueadero"
                className="system-logo"
              />
            </div>

            <h1>
              SISTEMA DE GESTIÓN
              <br />
              DE PARQUEADERO
            </h1>

            <div className="blue-line"></div>

            <p className="subtitle">
              Crea tu cuenta para continuar
            </p>
          </div>

          <form
            className="login-form"
            onSubmit={registrar}
          >
            {campos.map((campo) => {
              const esPassword =
                campo.name === "password" ||
                campo.name === "confirmar";

              return (
                <div className="input-group" key={campo.name}>
                  <label htmlFor={campo.name}>
                    {campo.label}
                  </label>

                  <div className="input-wrapper">
                    <span className="material-icons-outlined input-icon">
                      {campo.icon}
                    </span>

                    <input
                      id={campo.name}
                      name={campo.name}
                      type={
                        esPassword && mostrarPassword
                          ? "text"
                          : campo.type
                      }
                      placeholder={campo.placeholder}
                      value={datos[campo.name]}
                      onChange={actualizar}
                      minLength={
                        campo.name === "password" ? 8 : undefined
                      }
                      autoComplete={
                        campo.name === "usuario"
                          ? "username"
                          : esPassword
                          ? "new-password"
                          : undefined
                      }
                      required
                      disabled={cargando}
                    />

                    {esPassword && (
                      <button
                        type="button"
                        onClick={() =>
                          setMostrarPassword(!mostrarPassword)
                        }
                        aria-label={
                          mostrarPassword
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                        }
                        style={{
                          border: "none",
                          background: "transparent",
                          color: "#2563eb",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          padding: "5px"
                        }}
                      >
                        <span className="material-icons-outlined">
                          {mostrarPassword
                            ? "visibility_off"
                            : "visibility"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {error && (
              <div
                role="alert"
                style={{
                  padding: "12px",
                  marginBottom: "15px",
                  backgroundColor: "#fee2e2",
                  color: "#b91c1c",
                  borderRadius: "8px"
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-ingresar"
              disabled={cargando}
            >
              <span className="material-icons-outlined">
                {cargando
                  ? "hourglass_empty"
                  : "person_add"}
              </span>

              {cargando
                ? "REGISTRANDO..."
                : "CREAR CUENTA"}
            </button>

            <button
              type="button"
              onClick={() => cambiarPagina("login")}
              disabled={cargando}
              style={{
                width: "100%",
                marginTop: "15px",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #2563eb",
                backgroundColor: "transparent",
                color: "#2563eb",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              ¿Ya tienes cuenta? Inicia sesión
            </button>
          </form>

          <div className="security-notice">
            <span className="material-icons-outlined shield-icon">
              verified_user
            </span>

            <div className="security-text">
              <p className="security-title">
                Tu seguridad es nuestra prioridad
              </p>

              <p className="security-desc">
                Registro seguro de usuarios del parqueadero.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Registro;
