
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

  if (!sesion) {
  mensaje.textContent =
    "Debes iniciar sesión para registrar una emergencia.";
  return;
}

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
  "Content-Type": "application/json",
  "Authorization": `Bearer ${sesion.token}`
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

    if (sesion.usuario.rol === "operador") {
  await cargarPanelOperador();
}

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


// ========================================
// 6. PANEL DEL OPERADOR
// ========================================

const listaOperador = document.getElementById("listaOperador");
const filtroEstado = document.getElementById("filtroEstado");
const mensajeOperador = document.getElementById("mensajeOperador");


async function cargarPanelOperador() {
  if (!sesion || sesion.usuario.rol !== "operador") {
    listaOperador.replaceChildren();
    return;
  }

  try {

    const respuesta = await fetch(API);

    if (!respuesta.ok) {
      throw new Error("No se pudieron consultar los incidentes");
    }

    const datos = await respuesta.json();
    const filtro = filtroEstado.value;

    listaOperador.replaceChildren();

    const emergenciasFiltradas = datos.emergencias.filter(
      (emergencia) =>
        filtro === "Todos" || emergencia.estado === filtro
    );

    if (emergenciasFiltradas.length === 0) {
      listaOperador.textContent =
        "No hay emergencias para este estado.";
      return;
    }

    emergenciasFiltradas.forEach((emergencia) => {
      const tarjeta = document.createElement("article");
      tarjeta.className = "incidente";

      const titulo = document.createElement("h3");
      titulo.textContent = emergencia.tipo;

      const descripcion = document.createElement("p");
      descripcion.textContent = emergencia.descripcion;

      const estado = document.createElement("p");
      estado.textContent = `Estado actual: ${emergencia.estado}`;

      const selector = document.createElement("select");

      ["Pendiente", "En atención", "Resuelta"].forEach(
        (opcionEstado) => {
          const opcion = document.createElement("option");
          opcion.value = opcionEstado;
          opcion.textContent = opcionEstado;
          selector.append(opcion);
        }
      );

      selector.value = emergencia.estado;

      const boton = document.createElement("button");
      boton.type = "button";
      boton.textContent = "Actualizar estado";

      boton.addEventListener("click", async () => {
        boton.disabled = true;
        mensajeOperador.textContent = "Actualizando estado...";

        try {
          const cuerpo = JSON.stringify({
            estado: selector.value
          });

          
const respuesta = await fetch(
  `${API}/${emergencia.id}/estado`,
  {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${sesion.token}`
    },
    body: cuerpo
  }
);


          const resultado = await respuesta.json();

          if (!respuesta.ok) {
            throw new Error(
              resultado.error || "No se pudo actualizar"
            );
          }

          mensajeOperador.textContent =
            "Estado actualizado correctamente.";

          await cargarEmergencias();
          await cargarPanelOperador();

        } catch (error) {
          mensajeOperador.textContent =
            `Error: ${error.message}`;
        } finally {
          boton.disabled = false;
        }
      });

      tarjeta.append(
        titulo,
        descripcion,
        estado,
        selector,
        boton
      );

      listaOperador.append(tarjeta);
    });

  } catch (error) {
    console.error("Error del panel:", error);
    listaOperador.textContent =
      "No se pudo cargar el panel del operador.";
  }
}

// Actualizar panel al cambiar el filtro
filtroEstado.addEventListener(
  "change",
  cargarPanelOperador
);

// Actualizar panel al presionar el botón de listado
document.getElementById("actualizar").addEventListener(
  "click",
  cargarPanelOperador
);

// Actualizar panel después de registrar una emergencia
formulario.addEventListener(
  "submit",
  () => {
    // Esperar a que el registro termine y recargar
    // mediante la siguiente actualización manual.
  }
);





// ========================================
// 7. AUTENTICACIÓN DEL FRONTEND
// ========================================

let sesion = null;

const formLogin = document.getElementById("formLogin");
const mensajeLogin = document.getElementById("mensajeLogin");
const seccionLogin = document.getElementById("seccionLogin");
const seccionUsuario = document.getElementById("seccionUsuario");
const datosUsuario = document.getElementById("datosUsuario");

function actualizarInterfazSesion() {
  const autenticado = Boolean(sesion);
  const operador = sesion?.usuario?.rol === "operador";

  seccionLogin.hidden = autenticado;
  seccionUsuario.hidden = !autenticado;

  // Solo mostrar el panel a operadores
  document.getElementById("panelOperador").hidden = !operador;

  if (autenticado) {
    datosUsuario.textContent =
      `${sesion.usuario.nombre} - Rol: ${sesion.usuario.rol}`;
  } else {
    datosUsuario.textContent = "";
  }
}

formLogin.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const correo = document.getElementById("correoLogin").value;
  const password = document.getElementById("passwordLogin").value;

  mensajeLogin.textContent = "Iniciando sesión...";

  try {
    const respuesta = await fetch(
      "http://localhost:3000/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ correo, password })
      }
    );

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.error || "Error de acceso");
    }

    sesion = resultado;
    formLogin.reset();
    mensajeLogin.textContent = "";

    actualizarInterfazSesion();

    if (sesion.usuario.rol === "operador") {
      await cargarPanelOperador();
    }

  } catch (error) {
    mensajeLogin.textContent = `Error: ${error.message}`;
  }
});

document.getElementById("cerrarSesion")
  .addEventListener("click", () => {
    sesion = null;
    actualizarInterfazSesion();
    mensajeLogin.textContent = "Sesión cerrada.";
  });

// Ocultar inicialmente el panel de operador
actualizarInterfazSesion();


