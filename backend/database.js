
const { DatabaseSync } = require("node:sqlite");
const path = require("node:path");
const fs = require("node:fs");

// Ruta de almacenamiento de la base de datos
const carpetaDatos = path.join(__dirname, "data");

// Crear la carpeta si no existe
fs.mkdirSync(carpetaDatos, { recursive: true });

// Abrir o crear la base de datos SQLite
const db = new DatabaseSync(
  path.join(carpetaDatos, "emergencias.db")
);

// Crear la tabla de emergencias
db.exec(`
  CREATE TABLE IF NOT EXISTS emergencias (
    id TEXT PRIMARY KEY,
    tipo TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    latitud REAL NOT NULL,
    longitud REAL NOT NULL,
    fecha TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'Pendiente',
    fecha_actualizacion TEXT
  )
`);


// ========================================
// TABLA DE USUARIOS
// ========================================

db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    correo TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    rol TEXT NOT NULL CHECK (
      rol IN ('ciudadano', 'operador')
    ),
    fecha_creacion TEXT NOT NULL
  )
`);

module.exports = db;
