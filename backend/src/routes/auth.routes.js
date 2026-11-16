const express = require("express");
const jwt = require("jsonwebtoken");

const Usuario = require("../models/Usuario");

const router = express.Router();

// ==========================================
// CONFIGURACIÓN DE SEGURIDAD
// ==========================================

const generarToken = (usuario) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET no configurado.");
    }

    return jwt.sign({
            id: usuario._id.toString()
        },
        process.env.JWT_SECRET, {
            expiresIn: "8h",
            algorithm: "HS256"
        }
    );
};

const normalizarTexto = (valor) => {
    return typeof valor === "string" ?
        valor.trim() :
        "";
};

// ==========================================
// REGISTRAR USUARIO
// POST /api/auth/registro
// ==========================================

router.post("/registro", async(req, res) => {
    try {
        const nombre = normalizarTexto(req.body.nombre);

        const usuario = normalizarTexto(
            req.body.usuario
        ).toLowerCase();

        const correo = normalizarTexto(
            req.body.correo
        ).toLowerCase();

        const password = req.body.password;

        // Validar campos obligatorios
        if (!nombre ||
            !usuario ||
            !correo ||
            typeof password !== "string" ||
            !password
        ) {
            return res.status(400).json({
                ok: false,
                mensaje: "Todos los campos son obligatorios."
            });
        }

        if (usuario.length < 3 || usuario.length > 50) {
            return res.status(400).json({
                ok: false,
                mensaje: "El usuario debe tener entre 3 y 50 caracteres."
            });
        }

        if (nombre.length > 100) {
            return res.status(400).json({
                ok: false,
                mensaje: "El nombre es demasiado largo."
            });
        }

        const correoValido =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

        if (!correoValido) {
            return res.status(400).json({
                ok: false,
                mensaje: "El correo electrónico no es válido."
            });
        }

        if (password.length < 8 || password.length > 128) {
            return res.status(400).json({
                ok: false,
                mensaje: "La contraseña debe tener entre 8 y 128 caracteres."
            });
        }

        // Verificar usuario o correo existente
        const existente = await Usuario.findOne({
            $or: [
                { usuario },
                { correo }
            ]
        });

        if (existente) {
            return res.status(409).json({
                ok: false,
                mensaje: "El usuario o correo electrónico ya está registrado."
            });
        }

        // Crear cuenta con rol empleado.
        // Nunca aceptar un rol enviado desde el navegador.
        const nuevoUsuario = await Usuario.create({
            nombre,
            usuario,
            correo,
            password,
            rol: "empleado",
            estado: true
        });

        return res.status(201).json({
            ok: true,
            mensaje: "Usuario registrado correctamente.",
            usuario: nuevoUsuario.datosPublicos()
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                ok: false,
                mensaje: "El usuario o correo electrónico ya está registrado."
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                ok: false,
                mensaje: error.message
            });
        }

        console.error("Error al registrar usuario:", error);

        return res.status(500).json({
            ok: false,
            mensaje: "Error al registrar el usuario."
        });
    }
});

// ==========================================
// INICIAR SESIÓN
// POST /api/auth/login
// ==========================================

router.post("/login", async(req, res) => {
    try {
        const usuario = normalizarTexto(
            req.body.usuario
        ).toLowerCase();

        const password = req.body.password;

        if (!usuario ||
            typeof password !== "string" ||
            !password
        ) {
            return res.status(400).json({
                ok: false,
                mensaje: "Ingresa usuario y contraseña."
            });
        }

        // Buscar cuenta y recuperar hash
        const cuenta = await Usuario.findOne({
            usuario
        }).select("+password");

        if (!cuenta) {
            return res.status(401).json({
                ok: false,
                mensaje: "Usuario o contraseña incorrectos."
            });
        }

        // Comparar contraseña ingresada con hash
        const passwordCorrecta =
            await cuenta.compararPassword(password);

        if (!passwordCorrecta) {
            return res.status(401).json({
                ok: false,
                mensaje: "Usuario o contraseña incorrectos."
            });
        }

        // Comprobar que la cuenta esté activa
        if (!cuenta.estado) {
            return res.status(403).json({
                ok: false,
                mensaje: "Esta cuenta está desactivada."
            });
        }

        // Generar token
        const token = generarToken(cuenta);

        // Actualizar último acceso
        await Usuario.updateOne({ _id: cuenta._id }, {
            $set: {
                ultimoAcceso: new Date()
            }
        });

        return res.json({
            ok: true,
            mensaje: "Inicio de sesión exitoso.",
            token,
            usuario: cuenta.datosPublicos()
        });

    } catch (error) {
        console.error("Error al iniciar sesión:", error);

        return res.status(500).json({
            ok: false,
            mensaje: "Error al iniciar sesión."
        });
    }
});

// ==========================================
// VERIFICAR TOKEN
// GET /api/auth/verificar
// ==========================================

router.get("/verificar", async(req, res) => {
    try {
        const autorizacion = req.headers.authorization || "";

        if (!autorizacion.startsWith("Bearer ")) {
            return res.status(401).json({
                ok: false,
                mensaje: "No se proporcionó un token."
            });
        }

        const token = autorizacion.slice(7).trim();

        if (!token || !process.env.JWT_SECRET) {
            return res.status(401).json({
                ok: false,
                mensaje: "Sesión no válida."
            });
        }

        const datos = jwt.verify(
            token,
            process.env.JWT_SECRET, {
                algorithms: ["HS256"]
            }
        );

        const usuario = await Usuario.findById(datos.id);

        if (!usuario || !usuario.estado) {
            return res.status(401).json({
                ok: false,
                mensaje: "Usuario no autorizado."
            });
        }

        return res.json({
            ok: true,
            usuario: usuario.datosPublicos()
        });

    } catch (error) {
        return res.status(401).json({
            ok: false,
            mensaje: "Sesión inválida o expirada."
        });
    }
});

module.exports = router;