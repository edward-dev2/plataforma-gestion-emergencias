
const API = "http://localhost:3000/api/emergencias";

const formulario = document.getElementById("formEmergencia");
const mensaje = document.getElementById("mensaje");
const lista = document.getElementById("listaEmergencias");

async function cargarEmergencias() {
  try {
    const respuesta = await fetch(API);
    if (!respuesta.ok) throw new Error("Error del servidor");

    const datos = await respuesta.json();
    lista.replaceChildren();

    if (datos.emergencias.length === 0) {
      lista.textContent = "Todavía no hay emergencias registradas.";
      return;
    }

    datos.emergencias.forEach((emergencia) => {
      const tarjeta = document.createElement("article");
      tarjeta.className = "incidente";

      const titulo = document.createElement("h3");
      titulo.textContent = emergencia.tipo;

      const descripcion = document.createElement("p");
      descripcion.textContent = emergencia.descripcion;

      const estado = document.createElement("p");
      estado.textContent = `Estado: ${emergencia.estado}`;

      const ubicacion = document.createElement("p");
      ubicacion.textContent =
        `Ubicación: ${emergencia.ubicacion.latitud}, ` +
        emergencia.ubicacion.longitud;

      tarjeta.append(titulo, descripcion, estado, ubicacion);
      lista.append(tarjeta);
    });
  } catch (error) {
    lista.textContent = "No se pudo conectar con el servidor.";
  }
}

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const datos = {
    tipo: document.getElementById("tipo").value,
    descripcion: document.getElementById("descripcion").value,
    latitud: Number(document.getElementById("latitud").value),
    longitud: Number(document.getElementById("longitud").value)
  };

  mensaje.textContent = "Enviando reporte...";

  try {
    const respuesta = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(datos)
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || "No se pudo registrar");
    }

    mensaje.textContent =
      `Reporte registrado. ID: ${resultado.emergencia.id}`;

    formulario.reset();
    await cargarEmergencias();
  } catch (error) {
    mensaje.textContent = `Error: ${error.message}`;
  }
});

document.getElementById("actualizar")
  .addEventListener("click", cargarEmergencias);

cargarEmergencias();
