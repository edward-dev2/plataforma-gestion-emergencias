
require("dotenv").config();

const db = require("./database");
const bcrypt = require("bcryptjs");
const { randomUUID, randomBytes } = require("node:crypto");

const usuarios = [
  {
    nombre: "Ciudadano de prueba",
    correo: "ciudadano@demo.local",
    rol: "ciudadano"
  },
  {
    nombre: "Operador de prueba",
    correo: "operador@demo.local",
    rol: "operador"
  }
];

for (const usuario of usuarios) {
  const existente = db.prepare(
    "SELECT id FROM usuarios WHERE correo = ?"
  ).get(usuario.correo);

  if (existente) {
    console.log(`Ya existe: ${usuario.correo}`);
    continue;
  }

  // Contraseña aleatoria distinta para cada usuario
  const password = randomBytes(12).toString("hex");
  const passwordHash = bcrypt.hashSync(password, 12);

  db.prepare(`
    INSERT INTO usuarios (
      id, nombre, correo, password_hash,
      rol, fecha_creacion
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    randomUUID(),
    usuario.nombre,
    usuario.correo,
    passwordHash,
    usuario.rol,
    new Date().toISOString()
  );

  console.log("------------------------------");
  console.log(`Usuario: ${usuario.correo}`);
  console.log(`Rol: ${usuario.rol}`);
  console.log(`Contraseña: ${password}`);
}

console.log("------------------------------");
console.log("Configuración de usuarios finalizada.");
