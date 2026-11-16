
import React, { useState } from "react";
import api from "../services/api";

function Login({ cambiarPagina }) {

    const [usuario, setUsuario] = useState("");
    const [password, setPassword] = useState("");
    const [mostrarPassword, setMostrarPassword] = useState(false);

    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");

    // ==========================================
    // INICIAR SESIÓN
    // ==========================================

    const manejarEnvio = async (event) => {
        event.preventDefault();

        if (cargando) return;

        setError("");

        if (!usuario.trim() || !password.trim()) {
            setError("Debes ingresar tu usuario y contraseña.");
            return;
        }

        setCargando(true);

        try {

            const respuesta = await api.post("/auth/login", {
                usuario: usuario.trim(),
                password: password
            });

            const datos = respuesta.data;

            // Solo aceptar una respuesta autenticada
            if (
                datos.ok !== true ||
                typeof datos.token !== "string" ||
                !datos.token
            ) {
                setError("No se pudo verificar tu identidad.");
                return;
            }

            // Guardar token para las próximas solicitudes
            localStorage.setItem(
                "parqueadero_token",
                datos.token
            );

            if (datos.usuario) {
                localStorage.setItem(
                    "parqueadero_usuario",
                    JSON.stringify(datos.usuario)
                );
            }

            // Entrar únicamente después de validar
            cambiarPagina("panel");

        } catch (err) {

            console.error("Error de autenticación:", err);

            localStorage.removeItem("parqueadero_token");
            localStorage.removeItem("parqueadero_usuario");

            if (err.response?.status === 401) {
                setError("Usuario o contraseña incorrectos.");

            } else if (err.response?.status === 403) {
                setError("Tu cuenta no tiene acceso autorizado.");

            } else if (err.response?.data?.mensaje) {
                setError(err.response.data.mensaje);

            } else {
                setError(
                    "No se pudo conectar con el servidor. Inténtalo nuevamente."
                );
            }

        } finally {
            setCargando(false);
        }
    };

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
                            Inicia sesión para continuar
                        </p>

                    </div>

                    <form
                        className="login-form"
                        onSubmit={manejarEnvio}
                    >

                        <div className="input-group">

                            <label htmlFor="usuario">
                                Usuario
                            </label>

                            <div className="input-wrapper">

                                <span className="material-icons-outlined input-icon">
                                    person
                                </span>

                                <input
                                    type="text"
                                    id="usuario"
                                    placeholder="Ingresa tu usuario"
                                    value={usuario}
                                    onChange={(event) =>
                                        setUsuario(event.target.value)
                                    }
                                    autoComplete="username"
                                    disabled={cargando}
                                    required
                                />

                            </div>
                        </div>

                        <div className="input-group">

                            <label htmlFor="password">
                                Contraseña
                            </label>

                            <div className="input-wrapper">

                                <span className="material-icons-outlined input-icon">
                                    lock
                                </span>

                                <input
                                    type={
                                        mostrarPassword
                                            ? "text"
                                            : "password"
                                    }
                                    id="password"
                                    placeholder="Ingresa tu contraseña"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    autoComplete="current-password"
                                    disabled={cargando}
                                    required
                                />

                                <span
                                    className="material-icons-outlined toggle-password"
                                    onClick={() =>
                                        setMostrarPassword(!mostrarPassword)
                                    }
                                    style={{ cursor: "pointer" }}
                                >
                                    {mostrarPassword
                                        ? "visibility_off"
                                        : "visibility"}
                                </span>

                            </div>
                        </div>

                        {error && (
                            <div
                                role="alert"
                                style={{
                                    padding: "12px",
                                    marginBottom: "15px",
                                    backgroundColor: "#fee2e2",
                                    color: "#b91c1c",
                                    borderRadius: "8px",
                                    fontSize: "14px"
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
                                    : "arrow_forward"}
                            </span>

                            {cargando
                                ? "VERIFICANDO..."
                                : "INGRESAR"}
                        </button>

                        <a
                            href="#"
                            className="forgot-password"
                            onClick={(event) =>
                                event.preventDefault()
                            }
                        >
                            <span className="material-icons-outlined lock-small">
                                lock
                            </span>

                            ¿Olvidaste tu contraseña?
                        </a>

                        <button
                            type="button"
                            onClick={() => cambiarPagina("registro")}
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
                            ¿No tienes cuenta? Regístrate
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
                                Acceso restringido solo para personal autorizado.
                            </p>

                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}

export default Login;



