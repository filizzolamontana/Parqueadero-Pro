
import React, { useEffect, useState } from "react";
import api from "../services/api";

function IngresoVehiculo({ cambiarPagina }) {
    const [placa, setPlaca] = useState("");
    const [tipo, setTipo] = useState("");
    const [propietario, setPropietario] = useState("");
    const [horaIngreso, setHoraIngreso] = useState("");
    const [parqueadero, setParqueadero] = useState("");
    const [guardando, setGuardando] = useState(false);

    const [registros, setRegistros] = useState([]);
    const [cargandoRegistros, setCargandoRegistros] = useState(true);
    const [editandoId, setEditandoId] = useState(null);

    // ==========================================
    // CONVERTIR HORA PARA EL BACKEND
    // ==========================================

    const obtenerFechaIngreso = (hora, fechaOriginal = null) => {
        if (!hora) {
            return fechaOriginal || undefined;
        }

        const fecha = fechaOriginal
            ? new Date(fechaOriginal)
            : new Date();

        if (Number.isNaN(fecha.getTime())) {
            throw new Error("La fecha de ingreso no es válida.");
        }

        const [horas, minutos] = hora.split(":").map(Number);

        fecha.setHours(horas, minutos, 0, 0);

        if (Number.isNaN(fecha.getTime())) {
            throw new Error("La hora de ingreso no es válida.");
        }

        if (!fechaOriginal && fecha.getTime() > Date.now()) {
            throw new Error(
                "La hora de ingreso no puede ser futura."
            );
        }

        return fecha.toISOString();
    };

    // ==========================================
    // MOSTRAR HORA EN EL FORMULARIO
    // ==========================================

    const formatearHora = (fechaISO) => {
        if (!fechaISO) return "";

        const fecha = new Date(fechaISO);

        if (Number.isNaN(fecha.getTime())) return "";

        const horas = String(fecha.getHours()).padStart(2, "0");
        const minutos = String(fecha.getMinutes()).padStart(2, "0");

        return `${horas}:${minutos}`;
    };

    // ==========================================
    // CONSULTAR REGISTROS
    // ==========================================

    const cargarRegistros = async () => {
        try {
            setCargandoRegistros(true);

            const respuesta = await api.get("/registros");

            setRegistros(respuesta.data.registros ?? []);

        } catch (error) {
            console.error(
                "Error al consultar registros:",
                error
            );

        } finally {
            setCargandoRegistros(false);
        }
    };

    useEffect(() => {
        cargarRegistros();
    }, []);

    // ==========================================
    // LIMPIAR FORMULARIO
    // ==========================================

    const limpiarFormulario = () => {
        setPlaca("");
        setTipo("");
        setPropietario("");
        setHoraIngreso("");
        setParqueadero("");
        setEditandoId(null);
    };

    // ==========================================
    // GUARDAR O ACTUALIZAR REGISTRO
    // ==========================================

    const manejarEnvio = async (e) => {
        e.preventDefault();

        if (guardando) return;

        const placaLimpia = placa.trim().toUpperCase();
        const espacioNumero = Number(parqueadero);

        if (!placaLimpia) {
            alert("Debes ingresar una placa.");
            return;
        }

        if (!["carro", "moto", "bicicleta"].includes(tipo)) {
            alert("Selecciona un tipo de vehículo válido.");
            return;
        }

        if (
            !Number.isInteger(espacioNumero) ||
            espacioNumero < 1 ||
            espacioNumero > 100
        ) {
            alert("El parqueadero debe estar entre 1 y 100.");
            return;
        }

        setGuardando(true);

        try {
            const registroActual = editandoId
                ? registros.find(
                    (registro) => registro._id === editandoId
                )
                : null;

            const datos = {
                placa: placaLimpia,
                tipo,
                propietario: propietario.trim(),
                espacio: espacioNumero
            };

            const fechaIngreso = obtenerFechaIngreso(
                horaIngreso,
                registroActual?.horaEntrada || null
            );

            if (fechaIngreso) {
                datos.horaEntrada = fechaIngreso;
            }

            if (editandoId !== null) {
                // ACTUALIZAR
                const respuesta = await api.put(
                    `/registros/${editandoId}`,
                    datos
                );

                console.log(
                    "Vehículo actualizado:",
                    respuesta.data
                );

                alert("Registro actualizado correctamente.");

            } else {
                // CREAR
                const respuesta = await api.post(
                    "/registros",
                    datos
                );

                console.log(
                    "Vehículo registrado:",
                    respuesta.data
                );

                alert("Registro guardado exitosamente.");
            }

            limpiarFormulario();

            await cargarRegistros();

        } catch (error) {
            console.error(
                "Error al guardar registro:",
                error
            );

            alert(
                error.response?.data?.mensaje ||
                error.message ||
                "No se pudo guardar el registro."
            );

        } finally {
            setGuardando(false);
        }
    };

    // ==========================================
    // EDITAR REGISTRO
    // ==========================================

    const editarRegistro = (registro) => {
        setEditandoId(registro._id);
        setPlaca(registro.placa || "");
        setTipo(registro.tipo || "");
        setParqueadero(String(registro.espacio ?? ""));
        setPropietario(registro.propietario || "");
        setHoraIngreso(
            formatearHora(registro.horaEntrada)
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // ==========================================
    // CANCELAR EDICIÓN
    // ==========================================

    const cancelarEdicion = () => {
        limpiarFormulario();
    };

    // ==========================================
    // ELIMINAR REGISTRO
    // ==========================================

    const eliminarRegistro = async (id) => {
        const confirmar = window.confirm(
            "¿Está seguro de eliminar este registro?"
        );

        if (!confirmar) return;

        try {
            await api.delete(`/registros/${id}`);

            alert("Registro eliminado correctamente.");

            if (editandoId === id) {
                limpiarFormulario();
            }

            await cargarRegistros();

        } catch (error) {
            console.error(
                "Error al eliminar registro:",
                error
            );

            alert(
                error.response?.data?.mensaje ||
                "No fue posible eliminar el registro."
            );
        }
    };

    // ==========================================
    // INTERFAZ
    // ==========================================

    return (
        <div className="ingreso-page">

            <nav className="ingreso-navbar">
                <div className="ingreso-nav-container">

                    <div className="ingreso-logo">
                        <img
                            src="/img/logo.png"
                            alt="Logo Parqueadero"
                        />

                        <div className="ingreso-logo-text">
                            <span>SISTEMA DE</span>
                            <strong>PARQUEADERO</strong>
                        </div>
                    </div>

                    <div className="ingreso-nav-menu">

                        <button
                            type="button"
                            className="ingreso-nav-link"
                            onClick={() => cambiarPagina("panel")}
                        >
                            <span className="material-icons-outlined">
                                dashboard
                            </span>
                            Panel de Control
                        </button>

                        <button
                            type="button"
                            className="ingreso-nav-link active"
                            onClick={() => cambiarPagina("ingreso")}
                        >
                            <span className="material-icons-outlined">
                                minor_crash
                            </span>
                            Ingresar Vehículo
                        </button>

                        <button
                            type="button"
                            className="ingreso-nav-link"
                            onClick={() => cambiarPagina("pagos")}
                        >
                            <span className="material-icons-outlined">
                                logout
                            </span>
                            Registrar salida
                        </button>

                        <button
                            type="button"
                            className="ingreso-nav-link"
                            onClick={() =>
                                alert("Módulo pendiente de convertir.")
                            }
                        >
                            <span className="material-icons-outlined">
                                search
                            </span>
                            Consultar vehículos
                        </button>

                        <button
                            type="button"
                            className="ingreso-nav-link"
                            onClick={() => cambiarPagina("pagos")}
                        >
                            <span className="material-icons-outlined">
                                receipt_long
                            </span>
                            Generar factura
                        </button>

                        <button
                            type="button"
                            className="ingreso-nav-link"
                            onClick={() => cambiarPagina("reportes")}
                        >
                            <span className="material-icons-outlined">
                                bar_chart
                            </span>
                            Reportes
                        </button>

                    </div>

                    <div className="ingreso-nav-right">

                        <button
                            type="button"
                            className="ingreso-notification"
                        >
                            <span className="material-icons-outlined">
                                notifications
                            </span>
                            <span className="ingreso-notification-dot"></span>
                        </button>

                        <div className="ingreso-user">
                            <span className="material-icons-outlined">
                                account_circle
                            </span>
                            <span>Administrador</span>
                        </div>

                        <button
                            type="button"
                            className="ingreso-logout"
                            onClick={() => cambiarPagina("login")}
                        >
                            <span className="material-icons-outlined">
                                logout
                            </span>
                            Salir
                        </button>

                    </div>
                </div>
            </nav>

            <main className="ingreso-main">

                <section className="ingreso-header">
                    <div className="ingreso-header-left">

                        <div className="ingreso-header-icon">
                            <span className="material-icons-outlined">
                                minor_crash
                            </span>
                        </div>

                        <div>
                            <h1>
                                {editandoId !== null
                                    ? "Editar Registro"
                                    : "Registro de Vehículo"}
                            </h1>

                            <p>
                                {editandoId !== null
                                    ? "Modifica la información del vehículo y guarda los cambios."
                                    : "Completa la información para registrar el ingreso de un vehículo al parqueadero."}
                            </p>
                        </div>

                    </div>

                    <img
                        src="/img/carro.png"
                        alt="Vehículo"
                        className="ingreso-carro"
                    />
                </section>

                <section className="ingreso-form-card">

                    <form onSubmit={manejarEnvio}>
                        <div className="ingreso-form-grid">

                            <div className="ingreso-form-group">
                                <label htmlFor="placa">
                                    Placa <span>*</span>
                                </label>

                                <div className="ingreso-input">
                                    <span className="material-icons-outlined">
                                        badge
                                    </span>

                                    <input
                                        id="placa"
                                        type="text"
                                        placeholder="Ej. ABC123"
                                        maxLength={6}
                                        value={placa}
                                        onChange={(e) =>
                                            setPlaca(
                                                e.target.value.toUpperCase()
                                            )
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            <div className="ingreso-form-group">
                                <label htmlFor="tipo">
                                    Tipo de vehículo <span>*</span>
                                </label>

                                <div className="ingreso-input">
                                    <span className="material-icons-outlined">
                                        directions_car
                                    </span>

                                    <select
                                        id="tipo"
                                        value={tipo}
                                        onChange={(e) =>
                                            setTipo(e.target.value)
                                        }
                                        required
                                    >
                                        <option value="" disabled>
                                            Selecciona el tipo de vehículo
                                        </option>

                                        <option value="carro">
                                            Carro
                                        </option>

                                        <option value="moto">
                                            Moto
                                        </option>

                                        <option value="bicicleta">
                                            Bicicleta
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div className="ingreso-form-group">
                                <label htmlFor="propietario">
                                    Propietario (opcional)
                                </label>

                                <div className="ingreso-input">
                                    <span className="material-icons-outlined">
                                        person
                                    </span>

                                    <input
                                        id="propietario"
                                        type="text"
                                        placeholder="Nombre del propietario"
                                        value={propietario}
                                        onChange={(e) =>
                                            setPropietario(e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <div className="ingreso-form-group">
                                <label htmlFor="horaIngreso">
                                    Hora de ingreso (referencia)
                                </label>

                                <div className="ingreso-input">
                                    <span className="material-icons-outlined">
                                        schedule
                                    </span>

                                    <input
                                        id="horaIngreso"
                                        type="time"
                                        value={horaIngreso}
                                        onChange={(e) =>
                                            setHoraIngreso(e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <div className="ingreso-form-group ingreso-full">
                                <label htmlFor="parqueadero">
                                    Número de parqueadero <span>*</span>
                                </label>

                                <div className="ingreso-input">
                                    <span className="material-icons-outlined">
                                        local_parking
                                    </span>

                                    <input
                                        id="parqueadero"
                                        type="number"
                                        min="1"
                                        max="100"
                                        placeholder="Ej. 15"
                                        value={parqueadero}
                                        onChange={(e) =>
                                            setParqueadero(e.target.value)
                                        }
                                        required
                                    />
                                </div>
                            </div>

                        </div>

                        <div className="ingreso-actions">

                            <button
                                type="submit"
                                className="ingreso-btn-save"
                                disabled={guardando}
                            >
                                <span className="material-icons-outlined">
                                    {editandoId !== null
                                        ? "edit"
                                        : "save"}
                                </span>

                                {guardando
                                    ? "Guardando..."
                                    : editandoId !== null
                                        ? "Actualizar Registro"
                                        : "Guardar Registro"}
                            </button>

                            {editandoId !== null && (
                                <button
                                    type="button"
                                    className="ingreso-btn-back"
                                    onClick={cancelarEdicion}
                                >
                                    <span className="material-icons-outlined">
                                        close
                                    </span>
                                    Cancelar edición
                                </button>
                            )}

                            <button
                                type="button"
                                className="ingreso-btn-back"
                                onClick={() => cambiarPagina("panel")}
                            >
                                <span className="material-icons-outlined">
                                    arrow_back
                                </span>
                                Volver al Menú
                            </button>

                        </div>
                    </form>
                </section>

                {/* TABLA DE VEHÍCULOS REGISTRADOS */}

                <section className="ingreso-form-card">

                    <div className="form-header">
                        <h2>Vehículos registrados</h2>

                        <p className="sub-text">
                            Vehículos activos consultados desde Node.js y MongoDB.
                        </p>
                    </div>

                    {cargandoRegistros ? (
                        <p>Cargando registros...</p>
                    ) : registros.length === 0 ? (
                        <p>No hay vehículos registrados.</p>
                    ) : (
                        <div style={{ overflowX: "auto" }}>

                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    marginTop: "15px"
                                }}
                            >
                                <thead>
                                    <tr>
                                        {[
                                            "ID",
                                            "Placa",
                                            "Tipo",
                                            "Propietario",
                                            "Espacio",
                                            "Hora entrada",
                                            "Estado",
                                            "Acciones"
                                        ].map((titulo) => (
                                            <th
                                                key={titulo}
                                                style={{
                                                    padding: "12px",
                                                    textAlign: "left"
                                                }}
                                            >
                                                {titulo}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {registros.map((registro) => (
                                        <tr key={registro._id}>

                                            <td style={{ padding: "12px" }}>
                                                {registro._id}
                                            </td>

                                            <td style={{ padding: "12px" }}>
                                                {registro.placa}
                                            </td>

                                            <td style={{ padding: "12px" }}>
                                                {registro.tipo}
                                            </td>

                                            <td style={{ padding: "12px" }}>
                                                {registro.propietario || "-"}
                                            </td>

                                            <td style={{ padding: "12px" }}>
                                                {registro.espacio}
                                            </td>

                                            <td style={{ padding: "12px" }}>
                                                {registro.horaEntrada
                                                    ? new Date(
                                                        registro.horaEntrada
                                                    ).toLocaleString("es-CO")
                                                    : "-"}
                                            </td>

                                            <td style={{ padding: "12px" }}>
                                                {registro.estado}
                                            </td>

                                            <td style={{ padding: "12px" }}>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        editarRegistro(registro)
                                                    }
                                                    style={{
                                                        padding: "8px 12px",
                                                        border: "none",
                                                        borderRadius: "6px",
                                                        cursor: "pointer",
                                                        marginRight: "8px"
                                                    }}
                                                >
                                                    Editar
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        eliminarRegistro(
                                                            registro._id
                                                        )
                                                    }
                                                    style={{
                                                        padding: "8px 12px",
                                                        border: "none",
                                                        borderRadius: "6px",
                                                        cursor: "pointer"
                                                    }}
                                                >
                                                    Eliminar
                                                </button>

                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <section className="ingreso-info">
                    <span className="material-icons-outlined">
                        info
                    </span>

                    <div>
                        <h3>Información importante</h3>

                        <p>
                            Verifica que todos los datos ingresados sean
                            correctos antes de guardar el registro.
                        </p>
                    </div>
                </section>

            </main>
        </div>
    );
}

export default IngresoVehiculo;



