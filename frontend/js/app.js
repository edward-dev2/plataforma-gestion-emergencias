
const API = "http://localhost:3000/api/emergencias";

const formulario = document.getElementById("formEmergencia");
const mensaje = document.getElementById("mensaje");
const lista = document.getElementById("listaEmergencias");

// ========================================
// 1. INICIALIZAR EL MAPA
// ========================================

const mapa = L.map("mapa").setView([4.6097, -74.0817], 12);

L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
  {
    attribution: "Tiles &copy; Esri",
    maxZoom: 19
  }
).addTo(mapa);

// Marcador utilizado para seleccionar la ubicación
let marcadorSeleccion = null;

// Capa que contiene las emergencias registradas
const marcadoresEmergencias = L.featureGroup().addTo(mapa);

// Al hacer clic en el mapa, seleccionar coordenadas
mapa.on("click", (evento) => {
  const { lat, lng } = evento.latlng;

  document.getElementById("latitud").value = lat.toFixed(6);
  document.getElementById("longitud").value = lng.toFixed(6);

  if (marcadorSeleccion) {
    marcadorSeleccion.setLatLng([lat, lng]);
  } else {
    marcadorSeleccion = L.marker([lat, lng]).addTo(mapa);
  }
});

// ========================================
// 2. CONSULTAR Y MOSTRAR EMERGENCIAS
// ========================================

async function cargarEmergencias() {
  try {
    const respuesta = await fetch(API);

    if (!respuesta.ok) {
      throw new Error("Error al consultar las emergencias");
    }

    const datos = await respuesta.json();

    // Limpiar el listado y los marcadores anteriores
    lista.replaceChildren();
    marcadoresEmergencias.clearLayers();

    if (datos.emergencias.length === 0) {
      lista.textContent = "Todavía no hay emergencias registradas.";
      return;
    }

    datos.emergencias.forEach((emergencia) => {

      // Crear tarjeta del listado
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

      // Crear marcador de la emergencia
      const latitud = Number(emergencia.ubicacion.latitud);
      const longitud = Number(emergencia.ubicacion.longitud);

      if (
        Number.isFinite(latitud) &&
        Number.isFinite(longitud) &&
        latitud >= -90 &&
        latitud <= 90 &&
        longitud >= -180 &&
        longitud <= 180
      ) {
        const marcadorEmergencia = L.marker([
          latitud,
          longitud
        ]);

        // Crear contenido seguro del popup
        const contenido = document.createElement("div");

        const tituloPopup = document.createElement("strong");
        tituloPopup.textContent = emergencia.tipo;

        const descripcionPopup = document.createElement("p");
        descripcionPopup.textContent = emergencia.descripcion;

        const estadoPopup = document.createElement("p");
        estadoPopup.textContent =
          `Estado: ${emergencia.estado}`;

        contenido.append(
          tituloPopup,
          descripcionPopup,
          estadoPopup
        );

        marcadorEmergencia.bindPopup(contenido);

        // Agregar marcador al mapa
        marcadoresEmergencias.addLayer(marcadorEmergencia);
      }
    });

    // Ajustar el mapa para mostrar los incidentes
    if (marcadoresEmergencias.getLayers().length > 0) {
      mapa.fitBounds(marcadoresEmergencias.getBounds(), {
        padding: [30, 30],
        maxZoom: 15
      });
    }

  } catch (error) {
    console.error("Error al cargar emergencias:", error);
    lista.textContent =
      "No se pudieron cargar las emergencias.";
  }
}

// ========================================
// 3. REGISTRAR UNA EMERGENCIA
// ========================================

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
      throw new Error(
        resultado.mensaje || "No se pudo registrar la emergencia"
      );
    }

    mensaje.textContent =
      `Reporte registrado correctamente. ID: ${resultado.emergencia.id}`;

    formulario.reset();

    // Eliminar marcador de selección después del registro
    if (marcadorSeleccion) {
      mapa.removeLayer(marcadorSeleccion);
      marcadorSeleccion = null;
    }

    // Actualizar listado y marcadores
    await cargarEmergencias();

  } catch (error) {
    console.error("Error al registrar emergencia:", error);
    mensaje.textContent = `Error: ${error.message}`;
  }
});

// ========================================
// 4. BOTÓN ACTUALIZAR
// ========================================

document.getElementById("actualizar")
  .addEventListener("click", cargarEmergencias);

// ========================================
// 5. CARGA INICIAL
// ========================================

// Ejecutar después de inicializar el mapa
cargarEmergencias();
