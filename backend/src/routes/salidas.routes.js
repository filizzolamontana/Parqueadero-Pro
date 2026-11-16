const express = require("express");
const mongoose = require("mongoose");
const Registro = require("../models/Registro");
const router = express.Router();
const tarifas = { carro: 3000, moto: 1500, bicicleta: 500 };
router.get("/cotizar/:placa", async (req, res) => {
  try {
    const registro = await Registro.findOne({ placa: req.params.placa.trim().toUpperCase(), estado: "activo" });
    if (!registro) return res.status(404).json({ ok: false, mensaje: "No hay vehículo activo con esa placa." });
    const minutos = Math.max(0, Math.ceil((Date.now() - registro.horaEntrada.getTime()) / 60000));
    const horasCobradas = Math.max(1, Math.ceil(minutos / 60));
    res.json({ ok: true, registro, minutos, horasCobradas, tarifaHora: tarifas[registro.tipo], total: horasCobradas * tarifas[registro.tipo] });
  } catch (e) { res.status(500).json({ ok: false, mensaje: "Error al cotizar." }); }
});
router.post("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ ok: false, mensaje: "ID inválido." });
    const registro = await Registro.findOne({ _id: req.params.id, estado: "activo" });
    if (!registro) return res.status(409).json({ ok: false, mensaje: "Registro inexistente o ya finalizado." });
    const metodoPago = req.body.metodoPago;
    if (!["Efectivo", "Tarjeta", "Digital"].includes(metodoPago)) return res.status(400).json({ ok: false, mensaje: "Selecciona un método de pago válido." });
    const horaSalida = new Date();
    const horasCobradas = Math.max(1, Math.ceil((horaSalida - registro.horaEntrada) / 3600000));
    const tarifaHora = tarifas[registro.tipo];
    const actualizado = await Registro.findOneAndUpdate({ _id: registro._id, estado: "activo" }, { $set: { estado: "finalizado", horaSalida, total: horasCobradas * tarifaHora, metodoPago } }, { new: true });
    if (!actualizado) return res.status(409).json({ ok: false, mensaje: "La salida ya fue procesada." });
    res.json({ ok: true, mensaje: "Salida registrada correctamente.", factura: { ...actualizado.toObject(), horasCobradas, tarifaHora } });
  } catch (e) { res.status(500).json({ ok: false, mensaje: "Error al registrar salida." }); }
});
module.exports = router;
