// ⚠️ PEGA TU LINK DE APPS SCRIPT ACÁ:
const urlAppsScript = "https://script.google.com/macros/s/AKfycbxC4Q2rPVwBMbdBdEhQVCIjPm_YxPucKJ6eS0fcKL1we734KNuCusPWzWnydWcyyP4Nyw/exec"; 

// 1. AUTOCOMPLETAR LA FICHA (VERSIÓN INTELIGENTE)
function procesarTexto() {
    const texto = document.getElementById('texto-whatsapp').value;
    const buscarDato = (palabrasClave) => {
        const regex = new RegExp("(" + palabrasClave + ")\\s*[:\\-]?\\s*(.*)", "i");
        const coincidencia = texto.match(regex);
        return coincidencia ? coincidencia[2].trim() : ""; 
    };

    // Ahora busca sin importar si le ponen tilde o no
    document.getElementById('nombre-cliente').innerText = buscarDato("Nombre|Cliente|Nombre y Apellido").toUpperCase();
    document.getElementById('dni').innerText = buscarDato("DNI|CUIT|Documento");
    document.getElementById('telefono').innerText = buscarDato("Celular|Teléfono|Telefono|Tel");
   document.getElementById('provincia').innerText = buscarDato("Provincia").toUpperCase() || "BUENOS AIRES";
    document.getElementById('localidad').innerText = buscarDato("Localidad|Ciudad").toUpperCase();
    document.getElementById('cp').innerText = buscarDato("CP|Código Postal|Codigo Postal|Codigo");
    document.getElementById('calle').innerText = buscarDato("Calle|Dirección|Direccion").toUpperCase();
    document.getElementById('altura').innerText = buscarDato("Altura|Número|Numero").toUpperCase();
    
    // Arreglo del problema del Envío
    const textoEnvio = buscarDato("Envío|Envio|Datos envío|Datos envio");
    document.getElementById('datos-envio').innerText = textoEnvio.toUpperCase();

    const tipoEnvio = textoEnvio.toLowerCase();
    document.getElementById('check-domicilio').checked = tipoEnvio.includes("domicilio");
    // Si dice "sucursal" o "correo", marca la casilla de sucursal
    document.getElementById('check-sucursal').checked = tipoEnvio.includes("sucursal") || tipoEnvio.includes("correo");

    document.getElementById('nick').innerText = buscarDato("Nick|Usuario|Usuario IG").toUpperCase();
    document.getElementById('posicion').innerText = buscarDato("Posición|Posicion|Orientación|Orientacion").toUpperCase();
    document.getElementById('medidas').innerText = buscarDato("Medida|Medidas|Tamaño").toUpperCase();
    document.getElementById('fondo').innerText = buscarDato("Fondo|Color Fondo").toUpperCase();
    document.getElementById('frente').innerText = buscarDato("Frente|Color Frente").toUpperCase();
    
    let datosCartel = buscarDato("Datos cartel|Texto cartel|Texto|Datos");
    if (!datosCartel) {
        datosCartel = document.getElementById('calle').innerText + " " + document.getElementById('altura').innerText;
    }
    document.getElementById('datos-cartel').innerText = datosCartel.toUpperCase();
    document.getElementById('monto').innerText = buscarDato("Monto|Precio|Total");

    const hoy = new Date();
    document.getElementById('fecha-ingreso').innerText = hoy.toLocaleDateString('es-AR');
    const fechaEnvio = new Date(hoy);
    fechaEnvio.setDate(fechaEnvio.getDate() + 10);
    document.getElementById('fecha-envio').innerText = fechaEnvio.toLocaleDateString('es-AR');
}

// 2. GUARDAR EN GOOGLE SHEETS
function guardarPedido() {
    const checkDomicilio = document.getElementById('check-domicilio').checked;
    const checkSucursal = document.getElementById('check-sucursal').checked;
    let tipoEnvio = "No especificado";
    if (checkDomicilio) tipoEnvio = "Envío a Domicilio";
    if (checkSucursal) tipoEnvio = "Envío a Sucursal";

    const datosParaGuardar = {
        accion: "ingreso_nuevo",
        fecha: document.getElementById('fecha-ingreso').innerText,
        nombre: document.getElementById('nombre-cliente').innerText,
        celular: document.getElementById('telefono').innerText,
        provincia: document.getElementById('provincia').innerText,
        localidad: document.getElementById('localidad').innerText,
        direccion: document.getElementById('calle').innerText + " " + document.getElementById('altura').innerText,
        medidas: document.getElementById('medidas').innerText,
        posicion: document.getElementById('posicion').innerText, 
        textos: document.getElementById('datos-cartel').innerText,
        frente: document.getElementById('frente').innerText,
        fondo: document.getElementById('fondo').innerText,
        modelo: "Pendiente", 
        monto: document.getElementById('monto').innerText,
        dni: document.getElementById('dni').innerText,
        cp: document.getElementById('cp').innerText,
        tipoEnvio: tipoEnvio
    };

    if (!datosParaGuardar.nombre) {
        alert("⚠️ Primero pegá el texto y tocá 'Autocompletar'.");
        return;
    }

    const btn = document.querySelector('.btn-guardar');
    btn.innerText = "⏳ Guardando...";
    btn.disabled = true;

    fetch(urlAppsScript, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(datosParaGuardar)
    })
    .then(() => {
        alert("✅ Pedido ingresado a la planta.");
        btn.innerText = "✔️ ¡Guardado!";
        btn.style.backgroundColor = "#28a745";
        
        setTimeout(() => {
            document.getElementById('texto-whatsapp').value = "";
            btn.innerText = "💾 Ingresar a Producción";
            btn.style.backgroundColor = "#007bff";
            btn.disabled = false;
        }, 3000);
    })
    .catch(error => {
        alert("❌ Error de conexión.");
        btn.innerText = "💾 Reintentar";
        btn.disabled = false;
    });
}