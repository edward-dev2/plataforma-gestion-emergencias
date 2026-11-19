
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { randomUUID } = require("node:crypto");
const db = require("./database");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


function verificarToken(req, res, next) {
  const autorizacion = req.headers.authorization;

  if (
    !autorizacion ||
    !autorizacion.startsWith("Bearer ")
  ) {
    return res.status(401).json({
      error: "Debes iniciar sesión"
    });
  }

  const token = autorizacion.slice(7);

  try {
    const usuario = jwt.verify(
      token,
      process.env.JWT_SECRET,
      { algorithms: ["HS256"] }
    );

    req.usuario = usuario;
    next();

  } catch (error) {
    return res.status(401).json({
      error: "Sesión inválida o expirada"
    });
  }
}

function soloOperador(req, res, next) {
  if (req.usuario.rol !== "operador") {
    return res.status(403).json({
      error: "No tienes permisos de operador"
    });
  }

  next();
}


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "100kb" }));

const categorias = [
  "Incendio",
  "Accidente",
  "Inundación",
  "Emergencia médica",
  "Otra"
];

const estadosPermitidos = [
  "Pendiente",
  "En atención",
  "Resuelta"
];

// Convertir una fila SQLite al formato esperado por el frontend
function convertirEmergencia(fila) {
  return {
    id: fila.id,
    tipo: fila.tipo,
    descripcion: fila.descripcion,
    ubicacion: {
      latitud: fila.latitud,
      longitud: fila.longitud
    },
    fecha: fila.fecha,
    estado: fila.estado,
    fechaActualizacion: fila.fecha_actualizacion
  };
}

// ========================================
// INFORMACIÓN DEL SERVIDOR
// ========================================

app.get("/", (req, res) => {
  res.json({
    proyecto: "Plataforma de Gestión de Emergencias",
    universidad: "UNAD",
    estado: "Servidor funcionando",
    version: "0.3.0",
    baseDatos: "SQLite"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    mensaje: "API de emergencias activa"
  });
});

// ========================================
// CONSULTAR TODAS LAS EMERGENCIAS
// ========================================

app.get("/api/emergencias", (req, res) => {
  try {
    const filas = db.prepare(`
      SELECT * FROM emergencias
      ORDER BY fecha DESC
    `).all();

    const emergencias = filas.map(convertirEmergencia);

    res.json({
      total: emergencias.length,
      emergencias
    });

  } catch (error) {
    console.error("Error al consultar emergencias:", error);

    res.status(500).json({
      error: "Error al consultar las emergencias"
    });
  }
});

// ========================================
// REGISTRAR UNA EMERGENCIA
// ========================================

app.post("/api/emergencias", verificarToken, (req, res) => {

  const { tipo, descripcion, latitud, longitud } = req.body || {};

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
      mensaje: "Verifica el tipo, la descripción y las coordenadas."
    });
  }

  try {
    const emergencia = {
      id: randomUUID(),
      tipo,
      descripcion: descripcion.trim(),
      latitud,
      longitud,
      fecha: new Date().toISOString(),
      estado: "Pendiente"
    };

    db.prepare(`
      INSERT INTO emergencias (
        id, tipo, descripcion, latitud,
        longitud, fecha, estado
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      emergencia.id,
      emergencia.tipo,
      emergencia.descripcion,
      emergencia.latitud,
      emergencia.longitud,
      emergencia.fecha,
      emergencia.estado
    );

    const fila = db.prepare(
      "SELECT * FROM emergencias WHERE id = ?"
    ).get(emergencia.id);

    res.status(201).json({
      mensaje: "Emergencia registrada correctamente",
      emergencia: convertirEmergencia(fila)
    });

  } catch (error) {
    console.error("Error al registrar emergencia:", error);

    res.status(500).json({
      error: "No se pudo registrar la emergencia"
    });
  }
});

// ========================================
// CONSULTAR UNA EMERGENCIA POR ID
// ========================================

app.get("/api/emergencias/:id", (req, res) => {
  try {
    const fila = db.prepare(
      "SELECT * FROM emergencias WHERE id = ?"
    ).get(req.params.id);

    if (!fila) {
      return res.status(404).json({
        error: "Emergencia no encontrada"
      });
    }

    res.json(convertirEmergencia(fila));

  } catch (error) {
    console.error("Error al consultar emergencia:", error);

    res.status(500).json({
      error: "Error al consultar la emergencia"
    });
  }
});

// ========================================
// ACTUALIZAR ESTADO DE UNA EMERGENCIA
// ========================================

app.patch(
  "/api/emergencias/:id/estado",
  verificarToken,
  soloOperador,
  (req, res) => {

  const { estado } = req.body || {};

  if (!estadosPermitidos.includes(estado)) {
    return res.status(400).json({
      error: "Estado no válido",
      estadosPermitidos
    });
  }

  try {
    const emergencia = db.prepare(
      "SELECT * FROM emergencias WHERE id = ?"
    ).get(req.params.id);

    if (!emergencia) {
      return res.status(404).json({
        error: "Emergencia no encontrada"
      });
    }

    const fechaActualizacion = new Date().toISOString();

    db.prepare(`
      UPDATE emergencias
      SET estado = ?, fecha_actualizacion = ?
      WHERE id = ?
    `).run(
      estado,
      fechaActualizacion,
      req.params.id
    );

    const actualizada = db.prepare(
      "SELECT * FROM emergencias WHERE id = ?"
    ).get(req.params.id);

    res.json({
      mensaje: "Estado actualizado correctamente",
      emergencia: convertirEmergencia(actualizada)
    });

  } catch (error) {
    console.error("Error al actualizar estado:", error);

    res.status(500).json({
      error: "No se pudo actualizar el estado"
    });
  }
});

// ========================================
// INICIAR SERVIDOR
// ========================================


 // ========================================
 // AUTENTICACIÓN - INICIO DE SESIÓN
 // ========================================

app.post("/api/auth/login", (req, res) => {
  const { correo, password } = req.body || {};

  if (
    typeof correo !== "string" ||
    typeof password !== "string" ||
    !correo.trim() ||
    !password
  ) {
    return res.status(400).json({
      error: "Debes ingresar correo y contraseña"
    });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      error: "Autenticación no configurada"
    });
  }

  try {
    const usuario = db.prepare(`
      SELECT * FROM usuarios WHERE correo = ?
    `).get(correo.trim().toLowerCase());

    if (
      !usuario ||
      !bcrypt.compareSync(password, usuario.password_hash)
    ) {
      return res.status(401).json({
        error: "Credenciales incorrectas"
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        rol: usuario.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({
      mensaje: "Inicio de sesión exitoso",
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error("Error de autenticación:", error);

    return res.status(500).json({
      error: "No se pudo iniciar sesión"
    });
  }
});


app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  console.log("Base de datos SQLite conectada correctamente");
});
