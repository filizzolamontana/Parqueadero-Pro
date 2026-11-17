const mongoose = require("mongoose");

module.exports = async function conectarDB() {
    try {
        const mongoURI =
            process.env.MONGO_URI ||
            "mongodb://127.0.0.1:27017/parqueadero_pro";

        const conexion = await mongoose.connect(mongoURI, {
            dbName: "parqueadero_pro",
            serverSelectionTimeoutMS: 10000
        });

        console.log(
            "MongoDB conectado correctamente:",
            conexion.connection.name
        );

        return conexion;
    } catch (error) {
        console.error(
            "Error al conectar con MongoDB:",
            error.message
        );

        throw error;
    }
};