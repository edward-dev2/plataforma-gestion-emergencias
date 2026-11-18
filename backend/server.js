
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Ruta principal
app.get("/", (req, res) => {
  res.json({
    mensaje: "Plataforma de Gestión de Emergencias",
    proyecto: "UNAD - Ingeniería de Sistemas",
    estado: "Servidor funcionando correctamente"
  });
});

// Ruta para comprobar el estado del servidor
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    mensaje: "API de emergencias activa"
  });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
