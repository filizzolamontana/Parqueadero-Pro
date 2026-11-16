const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ==========================================
// ESQUEMA DE USUARIOS
// ==========================================

const usuarioSchema = new mongoose.Schema({
    usuario: {
        type: String,
        required: [
            true,
            "El nombre de usuario es obligatorio."
        ],
        unique: true,
        trim: true,
        lowercase: true,
        minlength: 3,
        maxlength: 50
    },

    nombre: {
        type: String,
        required: [
            true,
            "El nombre completo es obligatorio."
        ],
        trim: true,
        maxlength: 100
    },

    correo: {
        type: String,
        required: [
            true,
            "El correo electrónico es obligatorio."
        ],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            "Ingresa un correo electrónico válido."
        ]
    },

    password: {
        type: String,
        required: [
            true,
            "La contraseña es obligatoria."
        ],
        minlength: 8,
        select: false
    },

    rol: {
        type: String,
        enum: ["admin", "empleado"],
        default: "empleado"
    },

    estado: {
        type: Boolean,
        default: true
    },

    ultimoAcceso: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    versionKey: false
});

// ==========================================
// CIFRAR CONTRASEÑA ANTES DE GUARDAR
// ==========================================

usuarioSchema.pre("save", async function() {
    if (!this.isModified("password")) {
        return;
    }

    const salt = await bcrypt.genSalt(12);

    this.password = await bcrypt.hash(
        this.password,
        salt
    );
});

// ==========================================
// COMPARAR CONTRASEÑAS
// ==========================================

usuarioSchema.methods.compararPassword = async function(
    passwordIngresada
) {
    return await bcrypt.compare(
        passwordIngresada,
        this.password
    );
};

// ==========================================
// DEVOLVER USUARIO SIN CONTRASEÑA
// ==========================================

usuarioSchema.methods.datosPublicos = function() {
    return {
        id: this._id,
        usuario: this.usuario,
        nombre: this.nombre,
        correo: this.correo,
        rol: this.rol,
        estado: this.estado
    };
};

// ==========================================
// CREAR MODELO
// ==========================================

const Usuario = mongoose.model(
    "Usuario",
    usuarioSchema
);

module.exports = Usuario;