
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { randomUUID } = require("node:crypto");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "100kb" }));

// Almacenamiento temporal para las pruebas
const emergencias = [];

const categorias = [
  "Incendio",
  "Accidente",
  "Inundación",
  "Emergencia médica",
  "Otra"
];

// Ruta principal
app.get("/", (req, res) => {
  res.json({
    proyecto: "Plataforma de Gestión de Emergencias",
    universidad: "UNAD",
    estado: "Servidor funcionando",
    version: "0.2.0"
  });
});

// Comprobar el estado de la API
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    mensaje: "API de emergencias activa"
  });
});

// Consultar las emergencias registradas
app.get("/api/emergencias", (req, res) => {
  res.json({
    total: emergencias.length,
    emergencias
  });
});

// Registrar una nueva emergencia
app.post("/api/emergencias", (req, res) => {
  const {
    tipo,
    descripcion,
    latitud,
    longitud
  } = req.body || {};

  if (
    typeof tipo !== "string" ||
    !categorias.includes(tipo) ||
    typeof descripcion !== "string" ||
    descripcion.trim().length < 10 ||
    descripcion.trim().length > 1000 ||
    typeof latitud !== "number" ||
    !Number.isFinite(latitud) ||
    latitud < -90 ||
    latitud > 90 ||
    typeof longitud !== "number" ||
    !Number.isFinite(longitud) ||
    longitud < -180 ||
    longitud > 180
  ) {
    return res.status(400).json({
      error: "Datos inválidos",
      mensaje:
        "Selecciona un tipo válido, escribe una descripción de 10 a 1000 caracteres e indica coordenadas válidas."
    });
  }

  const emergencia = {
    id: randomUUID(),
    tipo,
    descripcion: descripcion.trim(),
    ubicacion: {
      latitud,
      longitud
    },
    fecha: new Date().toISOString(),
    estado: "Pendiente"
  };

  emergencias.push(emergencia);

  res.status(201).json({
    mensaje: "Emergencia registrada correctamente",
    emergencia
  });
});

// Consultar una emergencia por su ID
app.get("/api/emergencias/:id", (req, res) => {
  const emergencia = emergencias.find(
    (item) => item.id === req.params.id
  );

  if (!emergencia) {
    return res.status(404).json({
      error: "Emergencia no encontrada"
    });
  }

  res.json(emergencia);
});


const estadosPermitidos = [
  "Pendiente",
  "En atención",
  "Resuelta"
];

// Actualizar el estado de una emergencia
app.patch("/api/emergencias/:id/estado", (req, res) => {
  const { id } = req.params;
  const { estado } = req.body || {};

  // Validar el nuevo estado
  if (!estadosPermitidos.includes(estado)) {
    return res.status(400).json({
      error: "Estado no válido",
      estadosPermitidos
    });
  }

  // Buscar la emergencia registrada
  const emergencia = emergencias.find(
    (item) => item.id === id
  );

  if (!emergencia) {
    return res.status(404).json({
      error: "Emergencia no encontrada"
    });
  }

  // Actualizar su estado
  emergencia.estado = estado;
  emergencia.fechaActualizacion = new Date().toISOString();

  return res.json({
    mensaje: "Estado actualizado correctamente",
    emergencia
  });
});


app.listen(PORT, () => {
  console.log(
    `Servidor ejecutándose en http://localhost:${PORT}`
  );
});

