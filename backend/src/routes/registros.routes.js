const express = require("express");
const mongoose = require("mongoose");
const Registro = require("../models/Registro");

const router = express.Router();

const TIPOS = ["carro", "moto", "bicicleta"];
const TOTAL_CUPOS = 100;

// Validar los datos de un vehículo
const validar = (datos) => {
    return (
        typeof datos.placa === "string" &&
        datos.placa.trim().length > 0 &&
        TIPOS.includes(datos.tipo) &&
        Number.isInteger(datos.espacio) &&
        datos.espacio >= 1 &&
        datos.espacio <= TOTAL_CUPOS &&
        typeof datos.propietario === "string" &&
        (
            datos.horaEntrada === undefined ||
            (
                datos.horaEntrada instanceof Date &&
                !Number.isNaN(datos.horaEntrada.getTime())
            )
        )
    );
};

// Preparar datos recibidos desde React
const prepararDatos = (body = {}) => {
    const datos = {
        placa: typeof body.placa === "string" ?
            body.placa.trim().toUpperCase() :
            "",

        tipo: body.tipo,

        espacio: Number(body.espacio),

        propietario: typeof body.propietario === "string" ?
            body.propietario.trim() :
            ""
    };

    // Usar la hora enviada o la hora actual
    if (
        body.horaEntrada !== undefined &&
        body.horaEntrada !== null &&
        body.horaEntrada !== ""
    ) {
        datos.horaEntrada = new Date(body.horaEntrada);
    }

    return datos;
};

// Manejar errores
const error = (res, e) => {
    if (e.code === 11000) {
        return res.status(409).json({
            ok: false,
            mensaje: "La placa o el espacio ya están ocupados."
        });
    }

    if (e.name === "ValidationError") {
        return res.status(400).json({
            ok: false,
            mensaje: e.message
        });
    }

    console.error("Error en registros:", e);

    return res.status(500).json({
        ok: false,
        mensaje: "Error del servidor."
    });
};

// Comprobar si existe un vehículo o espacio ocupado
const comprobarDisponibilidad = async(
    placa,
    espacio,
    excluirId = null
) => {
    const filtro = {
        estado: "activo",
        $or: [
            { placa },
            { espacio }
        ]
    };

    if (excluirId) {
        filtro._id = { $ne: excluirId };
    }

    return await Registro.findOne(filtro);
};

// =====================================
// CONSULTAR OCUPACIÓN
// =====================================

router.get("/ocupacion", async(req, res) => {
    try {
        const ocupados = await Registro.countDocuments({
            estado: "activo"
        });

        res.json({
            ok: true,
            capacidad: TOTAL_CUPOS,
            ocupados,
            disponibles: TOTAL_CUPOS - ocupados
        });

    } catch (e) {
        error(res, e);
    }
});

// =====================================
// CONSULTAR VEHÍCULOS ESTACIONADOS
// =====================================

router.get("/", async(req, res) => {
    try {
        const registros = await Registro.find({
            estado: "activo"
        }).sort({
            horaEntrada: -1
        });

        res.json({
            ok: true,
            total: registros.length,
            registros
        });

    } catch (e) {
        error(res, e);
    }
});

// =====================================
// REGISTRAR INGRESO DE VEHÍCULO
// =====================================

router.post("/", async(req, res) => {
    try {
        const datos = prepararDatos(req.body);

        if (!validar(datos)) {
            return res.status(400).json({
                ok: false,
                mensaje: "Datos inválidos. Verifica placa, tipo, propietario, espacio y hora de ingreso."
            });
        }

        const existente = await comprobarDisponibilidad(
            datos.placa,
            datos.espacio
        );

        if (existente) {
            return res.status(409).json({
                ok: false,
                mensaje: existente.placa === datos.placa ?
                    "Este vehículo ya está registrado." :
                    "El espacio seleccionado ya está ocupado."
            });
        }

        const registro = await Registro.create(datos);

        return res.status(201).json({
            ok: true,
            mensaje: "Vehículo registrado correctamente.",
            registro
        });

    } catch (e) {
        return error(res, e);
    }
});

// =====================================
// EDITAR REGISTRO DE VEHÍCULO
// =====================================

router.put("/:id", async(req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                ok: false,
                mensaje: "ID inválido."
            });
        }

        const actual = await Registro.findOne({
            _id: id,
            estado: "activo"
        });

        if (!actual) {
            return res.status(404).json({
                ok: false,
                mensaje: "Registro activo no encontrado."
            });
        }

        const datos = prepararDatos(req.body);

        // Conservar la hora original si no se envía otra
        if (datos.horaEntrada === undefined) {
            datos.horaEntrada = actual.horaEntrada;
        }

        if (!validar(datos)) {
            return res.status(400).json({
                ok: false,
                mensaje: "Los datos del vehículo son inválidos."
            });
        }

        const existente = await comprobarDisponibilidad(
            datos.placa,
            datos.espacio,
            id
        );

        if (existente) {
            return res.status(409).json({
                ok: false,
                mensaje: existente.placa === datos.placa ?
                    "Ya existe otro vehículo activo con esa placa." :
                    "El espacio está ocupado por otro vehículo."
            });
        }

        const registro = await Registro.findOneAndUpdate({
            _id: id,
            estado: "activo"
        }, {
            $set: datos
        }, {
            new: true,
            runValidators: true
        });

        if (!registro) {
            return res.status(404).json({
                ok: false,
                mensaje: "Registro activo no encontrado."
            });
        }

        return res.json({
            ok: true,
            mensaje: "Vehículo actualizado correctamente.",
            registro
        });

    } catch (e) {
        return error(res, e);
    }
});

// =====================================
// ELIMINAR REGISTRO ACTIVO
// =====================================

router.delete("/:id", async(req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                ok: false,
                mensaje: "ID inválido."
            });
        }

        const registro = await Registro.findOneAndDelete({
            _id: id,
            estado: "activo"
        });

        if (!registro) {
            return res.status(404).json({
                ok: false,
                mensaje: "Registro activo no encontrado."
            });
        }

        return res.json({
            ok: true,
            mensaje: "Registro eliminado correctamente.",
            registro
        });

    } catch (e) {
        return error(res, e);
    }
});

module.exports = router;