const urlAppsScript = "https://script.google.com/macros/s/AKfycbxC4Q2rPVwBMbdBdEhQVCIjPm_YxPucKJ6eS0fcKL1we734KNuCusPWzWnydWcyyP4Nyw/exec"; 

function cargarDatosSeguros() {
    fetch(urlAppsScript).then(res => res.json()).then(datos => renderizarTarjetas(datos)).catch(e => console.log(e));
}

document.addEventListener("DOMContentLoaded", () => {
    cargarDatosSeguros();
    setInterval(cargarDatosSeguros, 30000);
});

function renderizarTarjetas(pedidos) {
    const contenedor = document.getElementById("contenedor-tarjetas");
    document.getElementById("cargando").style.display = "none";
    const pendientes = pedidos.filter(p => p.estado === "Esperando Diseño" && p.linkPdf && p.linkPdf.trim() !== "");

    contenedor.innerHTML = pendientes.length === 0 ? "<h3>Todo al día</h3>" : "";
    
    pendientes.forEach(pedido => {
        let tel = String(pedido.celular).replace(/\D/g, "");
        if (tel.length === 10) tel = "549" + tel;
        let linkWs = `https://wa.me/${tel}?text=¡Hola! 👋 Te adjunto el PDF con los diseños para tu cartel.`;

        const tarjeta = document.createElement("div");
        tarjeta.className = "tarjeta-aurea";
        tarjeta.innerHTML = `
            <span class="etiqueta-id">${pedido.id}</span>
            <h4 style="margin:10px 0;">${pedido.nombre}</h4>
            <p>📍 ${pedido.localidad}</p>
            <button class="btn-aurea" style="background:#eee; color:#333; margin-bottom:10px;" onclick="window.open('${pedido.linkPdf}', '_blank')">📥 Bajar PDF</button>
            <button class="btn-aurea" onclick="window.open('${linkWs}', '_blank')">💬 Enviar WhatsApp</button>
            <div class="caja-resaltada" style="text-align:center;">
                <p>¿Qué opción eligió?</p>
                <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:5px;">
                    ${[1,2,3,4,5,6].map(n => `<button class="btn-aurea" style="padding:5px;" onclick="confirmarModelo(${pedido.fila}, ${n})">${n}</button>`).join('')}
                </div>
            </div>
        `;
        contenedor.appendChild(tarjeta);
    });
}

function confirmarModelo(fila, numeroModelo) {
    if (!confirm(`¿Confirmás la opción ${numeroModelo}?`)) return;
    fetch(urlAppsScript, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ accion: "actualizar_modelo", fila: fila, modelo: numeroModelo }) })
    .then(() => location.reload());
}