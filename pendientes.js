const urlAppsScript = "https://script.google.com/macros/s/AKfycbxC4Q2rPVwBMbdBdEhQVCIjPm_YxPucKJ6eS0fcKL1we734KNuCusPWzWnydWcyyP4Nyw/exec";  

function obtenerSemaforo(fechaCruda) {
    if (!fechaCruda) return "";
    try {
        const dias = Math.floor((new Date() - new Date(fechaCruda)) / (1000 * 3600 * 24));
        if (isNaN(dias)) return "";
        let bg = "#28a745", color = "white"; 
        if (dias >= 10) { bg = "#dc3545"; color = "white"; } 
        else if (dias >= 7) { bg = "#ffc107"; color = "#333"; } 
        return `<span style="background:${bg}; color:${color}; padding:4px 8px; border-radius:4px; font-size:10px; font-weight:bold;">⏳ ${dias} DÍAS</span>`;
    } catch(e) { return ""; }
}

document.addEventListener("DOMContentLoaded", () => {
    cargarDatos();
    setInterval(cargarDatos, 30000);
});

function cargarDatos() {
    const urlFresca = urlAppsScript + "?t=" + new Date().getTime();
    fetch(urlFresca).then(res => res.json()).then(pedidos => renderizarTarjetas(pedidos));
}

function renderizarTarjetas(pedidos) {
    const contenedor = document.getElementById("contenedor-tarjetas");
    if (!contenedor) return;
    
    // Filtramos los que dicen "Esperando Diseño" Y tienen PDF
    const pendientes = pedidos.filter(p => p.estado === "Esperando Diseño" && p.linkPdf && p.linkPdf.includes("http"));

    if (document.getElementById("cargando")) document.getElementById("cargando").style.display = "none";
    contenedor.innerHTML = "";

    if (pendientes.length === 0) {
        contenedor.innerHTML = "<h3 style='color:#666; text-align:center; width:100%;'>No hay pedidos confirmados con PDF aún.</h3>";
        return;
    }

    pendientes.forEach(p => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "tarjeta-aurea";
        tarjeta.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="id-pedido">${p.id}</span>
                ${obtenerSemaforo(p.fecha)}
            </div>
            <h3>📏 ${p.medida} <small>(${p.posicion})</small></h3>
            <p>👤 <strong>${p.nombre}</strong></p>
            <div class="caja-resaltada"><strong>TEXTO:</strong> ${p.textos}</div>
            <a href="${p.linkPdf}" target="_blank" class="btn-aurea">📥 VER PDF</a>
            <div style="margin-top:10px; display:grid; grid-template-columns: repeat(3, 1fr); gap:5px;">
                ${[1,2,3,4,5,6].map(n => `<button class="btn-mod" onclick="confirmarModelo(${p.fila}, ${n})">${n}</button>`).join('')}
            </div>
        `;
        contenedor.appendChild(tarjeta);
    });
}

function confirmarModelo(fila, num) {
    if (!confirm(`¿Confirmar Opción ${num}?`)) return;
    fetch(urlAppsScript, {
        method: 'POST',
        body: JSON.stringify({ accion: "actualizar_modelo", fila: fila, modelo: num })
    }).then(() => {
        alert("✅ Enviado a fábrica.");
        cargarDatos();
    });
}