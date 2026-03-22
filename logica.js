const urlAppsScript = "https://script.google.com/macros/s/AKfycbxC4Q2rPVwBMbdBdEhQVCIjPm_YxPucKJ6eS0fcKL1we734KNuCusPWzWnydWcyyP4Nyw/exec"; 

function procesarTexto() {
    const texto = document.getElementById('texto-whatsapp').value;
    const buscarDato = (palabrasClave) => {
        const regex = new RegExp("(" + palabrasClave + ")\\s*[:\\-]?\\s*(.*)", "i");
        const coincidencia = texto.match(regex);
        return coincidencia ? coincidencia[2].trim() : ""; 
    };

    document.getElementById('nombre-cliente').innerText = buscarDato("Nombre|Cliente").toUpperCase();
    document.getElementById('dni').innerText = buscarDato("DNI|CUIT");
    document.getElementById('telefono').innerText = buscarDato("Celular|Teléfono|Tel");
    document.getElementById('localidad').innerText = buscarDato("Localidad|Ciudad").toUpperCase();
    document.getElementById('cp').innerText = buscarDato("CP|Código Postal");
    document.getElementById('calle').innerText = buscarDato("Calle|Dirección").toUpperCase();
    document.getElementById('altura').innerText = buscarDato("Altura|Número");
    document.getElementById('medidas').innerText = buscarDato("Medida|Tamaño");
    document.getElementById('posicion').innerText = buscarDato("Posición|Orientación");
    document.getElementById('datos-cartel').innerText = buscarDato("Datos|Texto|Calado").toUpperCase();
    document.getElementById('frente').innerText = buscarDato("Frente|Color Frente");
    document.getElementById('fondo').innerText = buscarDato("Fondo|Color Fondo");
    document.getElementById('monto').innerText = buscarDato("Monto|Total|Precio");
    document.getElementById('fecha-ingreso').innerText = new Date().toLocaleDateString();
}

function guardarPedido() {
    const datosParaGuardar = {
        accion: "ingreso_nuevo",
        fecha: document.getElementById('fecha-ingreso').innerText,
        nombre: document.getElementById('nombre-cliente').innerText,
        celular: document.getElementById('telefono').innerText,
        localidad: document.getElementById('localidad').innerText,
        direccion: document.getElementById('calle').innerText + " " + document.getElementById('altura').innerText,
        medidas: document.getElementById('medidas').innerText,
        posicion: document.getElementById('posicion').innerText, 
        textos: document.getElementById('datos-cartel').innerText,
        frente: document.getElementById('frente').innerText,
        fondo: document.getElementById('fondo').innerText,
        monto: document.getElementById('monto').innerText,
        dni: document.getElementById('dni').innerText,
        cp: document.getElementById('cp').innerText,
        estado: "Esperando Diseño"
    };

    if (!datosParaGuardar.nombre) return alert("⚠️ Completá los datos primero.");

    fetch(urlAppsScript, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(datosParaGuardar)
    }).then(() => {
        alert("✅ Pedido enviado a producción.");
        location.reload();
    });
}