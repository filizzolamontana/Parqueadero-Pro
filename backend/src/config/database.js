const mongoose = require("mongoose");
module.exports = async function conectarDB() {
  const conexion = await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/parqueadero_pro", { serverSelectionTimeoutMS: 5000 });
  console.log(`MongoDB conectado correctamente: ${conexion.connection.name}`);
};
