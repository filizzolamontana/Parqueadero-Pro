const mongoose = require("mongoose");

const registroSchema = new mongoose.Schema({
    placa: {
        type: String,
        required: [true, "La placa es obligatoria"],
        uppercase: true,
        trim: true
    },

    tipo: {
        type: String,
        required: [true, "El tipo de vehículo es obligatorio"],
        enum: {
            values: ["carro", "moto", "bicicleta"],
            message: "Tipo de vehículo no válido"
        }
    },

    propietario: {
        type: String,
        trim: true,
        default: ""
    },

    espacio: {
        type: Number,
        required: [true, "El espacio es obligatorio"],
        min: [1, "El espacio mínimo es 1"],
        max: [100, "El espacio máximo es 100"]
    },

    horaEntrada: {
        type: Date,
        default: Date.now
    },

    horaSalida: {
        type: Date,
        default: null
    },

    total: {
        type: Number,
        default: 0,
        min: 0
    },

    metodoPago: {
        type: String,
        default: null
    },

    estado: {
        type: String,
        enum: ["activo", "finalizado"],
        default: "activo"
    }
}, {
    timestamps: true,
    versionKey: false
});

// Índices para optimizar las consultas
registroSchema.index({ placa: 1, estado: 1 });
registroSchema.index({ espacio: 1, estado: 1 });
registroSchema.index({ horaEntrada: -1 });

// Modelo de MongoDB
const Registro = mongoose.model(
    "Registro",
    registroSchema
);

module.exports = Registro;