require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const conectarDB = require("./src/config/database");
const verificarToken = require("./src/middleware/verificarToken");

const app = express();
const PORT = process.env.PORT || 3000;

const origenesPermitidos = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: origenesPermitidos
}));

app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// Conexion a MongoDB
let conexionPendiente;

app.use(async (req, res, next) => {
    try {
        if (!conexionPendiente) {
            conexionPendiente = conectarDB().catch(error => {
                conexionPendiente = null;
                throw error;
            });
        }

        await conexionPendiente;
        next();
    } catch (error) {
        console.error("Error MongoDB:", error.message);
        res.status(503).json({
            ok: false,
            mensaje: "Base de datos no disponible."
        });
    }
});

// Ruta principal
app.get("/", (req, res) => {
    res.json({
        proyecto: "Parqueadero-Pro",
        estado: "Activo"
    });
});

// Salud
app.get("/api/salud", (req, res) => {
    res.json({
        ok: true,
        mensaje: "API REST funcionando",
        baseDatos: "MongoDB"
    });
});

// Autenticacion
app.use(
    "/api/auth",
    require("./src/routes/auth.routes")
);

// Registros
app.use(
    "/api/registros",
    verificarToken,
    require("./src/routes/registros.routes")
);

// Salidas
app.use(
    "/api/salidas",
    verificarToken,
    require("./src/routes/salidas.routes")
);

// Reportes
app.get("/api/reportes", verificarToken, async (req, res) => {
    try {
        const Registro = require("./src/models/Registro");

        const inicio = new Date();
        inicio.setHours(0, 0, 0, 0);

        const registros = await Registro.find({
            estado: "finalizado",
            horaSalida: { $gte: inicio }
        }).sort({ horaSalida: -1 });

        const total = registros.reduce(
            (sum, registro) => sum + registro.total,
            0
        );

        res.json({ ok: true, registros, total });

    } catch (error) {
        console.error("Error al consultar reportes:", error);

        res.status(500).json({
            ok: false,
            mensaje: "Error al consultar reportes."
        });
    }
});

// Ruta inexistente
app.use((req, res) => {
    res.status(404).json({
        ok: false,
        mensaje: "Ruta no encontrada."
    });
});

// Vercel utiliza la aplicacion exportada
module.exports = app;

// En desarrollo local iniciamos el servidor normalmente
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(
            `Parqueadero-Pro: http://localhost:${PORT}`
        );
    });
}
