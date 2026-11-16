require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const conectarDB = require("./src/config/database");
const verificarToken = require("./src/middleware/verificarToken");

const app = express();
const PORT = process.env.PORT || 3000;

// CONFIGURACION DEL SERVIDOR

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "http://127.0.0.1:5173"
        ]
    })
);

app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// RUTA PRINCIPAL

app.get("/", (req, res) => {
    res.json({
        proyecto: "Parqueadero-Pro",
        estado: "Activo"
    });
});

// ESTADO DEL SERVIDOR

app.get("/api/salud", (req, res) => {
    res.json({
        ok: true,
        mensaje: "API REST funcionando",
        baseDatos: "MongoDB"
    });
});

// AUTENTICACION: LOGIN Y REGISTRO PUBLICOS

app.use(
    "/api/auth",
    require("./src/routes/auth.routes")
);

// REGISTROS DE VEHICULOS PROTEGIDOS

app.use(
    "/api/registros",
    verificarToken,
    require("./src/routes/registros.routes")
);

// SALIDAS Y PAGOS PROTEGIDOS

app.use(
    "/api/salidas",
    verificarToken,
    require("./src/routes/salidas.routes")
);

// REPORTES PROTEGIDOS

app.get("/api/reportes", verificarToken, async (req, res) => {
    try {
        const Registro = require("./src/models/Registro");

        const inicio = new Date();
        inicio.setHours(0, 0, 0, 0);

        const registros = await Registro.find({
            estado: "finalizado",
            horaSalida: {
                $gte: inicio
            }
        }).sort({
            horaSalida: -1
        });

        const total = registros.reduce(
            (sum, registro) => sum + registro.total,
            0
        );

        res.json({
            ok: true,
            registros,
            total
        });

    } catch (error) {
        console.error("Error al consultar reportes:", error);

        res.status(500).json({
            ok: false,
            mensaje: "Error al consultar reportes."
        });
    }
});

// RUTA NO ENCONTRADA

app.use((req, res) => {
    res.status(404).json({
        ok: false,
        mensaje: "Ruta no encontrada."
    });
});

// INICIAR SERVIDOR

conectarDB()
    .then(() => {
        const server = app.listen(PORT, () => {
            console.log(
                `Parqueadero-Pro: http://localhost:${PORT}`
            );
        });

        server.on("error", (error) => {
            console.error(error.message);
            process.exit(1);
        });
    })
    .catch((error) => {
        console.error(
            "No se pudo conectar a MongoDB:",
            error.message
        );

        process.exit(1);
    });
