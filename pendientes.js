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
    setInterval(cargarDatos, 30000); // Se actualiza solo cada 30 segundos
});

function cargarDatos() {
    fetch(urlAppsScript)
        .then(res => res.json())
        .then(pedidos => renderizarTarjetas(pedidos))
        .catch(e => console.error("Error al cargar pedidos:", e));
}

function renderizarTarjetas(pedidos) {
    // Busca el contenedor (ajustá el ID si en tu HTML se llama distinto)
    const contenedor = document.getElementById("contenedor-tarjetas") || document.getElementById("contenedor-pendientes");
    if (!contenedor) return;

    // Filtramos los que ya tienen PDF pero todavía están en "Esperando Diseño" (Falta confirmar)
    const pendientes = pedidos.filter(p => p.estado === "Esperando Diseño" && p.linkPdf && p.linkPdf.trim() !== "");

    if (document.getElementById("cargando")) document.getElementById("cargando").style.display = "none";
    contenedor.innerHTML = "";

    if (pendientes.length === 0) {
        contenedor.innerHTML = "<h3 style='color:#666; text-align:center; width:100%;'>No hay pedidos pendientes de confirmación.</h3>";
        return;
    }

    pendientes.forEach(p => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "tarjeta-aurea";
        tarjeta.style.borderTopColor = "var(--dorado)";
        
        tarjeta.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="id-pedido" style="font-size: 16px; font-weight: 800; color: var(--antracita);">${p.id}</span>
                ${obtenerSemaforo(p.fecha)}
            </div>

            <h3 style="margin:10px 0 5px 0; color:var(--antracita); font-size: 18px;">📏 ${p.medida} <small style="font-size:12px; color:#888;">(${p.posicion})</small></h3>
            <p style="margin:0 0 10px 0; font-size:15px;">👤 <strong>${p.nombre}</strong></p>
            
            <div class="caja-resaltada" style="margin-top:0; background:#fdfcf8; border: 1px solid var(--dorado); padding: 10px; border-radius: 6px;">
                <strong style="font-size:11px; color:var(--oxido); display:block; margin-bottom:5px;">TEXTO A CALAR:</strong>
                <span style="font-family: monospace; font-size: 16px; font-weight: 800; text-transform: uppercase;">${p.textos}</span>
            </div>
            
            <div style="background:var(--gris-suave); padding:10px; border-radius:6px; font-size:12px; margin-top:10px; margin-bottom:15px; border-left:3px solid var(--antracita);">
                <strong>PINTURA:</strong> Frente: ${p.frente} / Fondo: ${p.fondo}<br>
                <strong>DESTINO:</strong> ${p.localidad}, ${p.provincia}
            </div>
            <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:15px;">
                <a href="${p.linkPdf}" target="_blank" class="btn-aurea" style="background:#f8f9fa; color:#333; border:1px solid #ddd; text-align:center; text-decoration:none; padding: 10px;">📥 DESCARGAR PDF</a>
                <button class="btn-aurea" style="background:#25d366; color:white; padding: 10px; border:none; border-radius:6px; font-weight:bold; cursor:pointer;" onclick="enviarWhatsApp('${p.celular}', '${p.nombre}', '${p.linkPdf}')">💬 ENVIAR (Whatsapp)</button>
            </div>
            <div style="margin-top: 15px; border-top: 1px dashed #ccc; padding-top: 10px;">
                <strong style="font-size: 11px; color: var(--oxido); display: block; margin-bottom: 5px;">📝 NOTAS / ERRORES:</strong>
                <textarea id="nota-${p.fila}" style="width: 100%; box-sizing: border-box; padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 12px; resize: vertical; font-family: inherit;" placeholder="Si hay algún error, anotalo acá...">${p.observaciones || ''}</textarea>
                <button style="width: 100%; background: #eee; color: #333; border: 1px solid #ccc; padding: 5px; border-radius: 4px; cursor: pointer; font-size: 11px; margin-top: 5px; font-weight: bold;" onclick="guardarNota(${p.fila})">💾 GUARDAR NOTA</button>
            </div>

            <div style="background:#fff9e6; border:1px solid #ffeeba; padding:15px; border-radius:8px; text-align:center;">
                <strong style="font-size:12px; color:#8c5642; display:block; margin-bottom:10px;">¿Qué opción eligió?</strong>
                <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px;">
                    <button class="btn-aurea" style="padding:10px; font-size:14px; background:var(--dorado); color:var(--antracita); border:none; border-radius:4px; font-weight:bold; cursor:pointer;" onclick="confirmarModelo(${p.fila}, 1)">1</button>
                    <button class="btn-aurea" style="padding:10px; font-size:14px; background:var(--dorado); color:var(--antracita); border:none; border-radius:4px; font-weight:bold; cursor:pointer;" onclick="confirmarModelo(${p.fila}, 2)">2</button>
                    <button class="btn-aurea" style="padding:10px; font-size:14px; background:var(--dorado); color:var(--antracita); border:none; border-radius:4px; font-weight:bold; cursor:pointer;" onclick="confirmarModelo(${p.fila}, 3)">3</button>
                    <button class="btn-aurea" style="padding:10px; font-size:14px; background:var(--dorado); color:var(--antracita); border:none; border-radius:4px; font-weight:bold; cursor:pointer;" onclick="confirmarModelo(${p.fila}, 4)">4</button>
                    <button class="btn-aurea" style="padding:10px; font-size:14px; background:var(--dorado); color:var(--antracita); border:none; border-radius:4px; font-weight:bold; cursor:pointer;" onclick="confirmarModelo(${p.fila}, 5)">5</button>
                    <button class="btn-aurea" style="padding:10px; font-size:14px; background:var(--dorado); color:var(--antracita); border:none; border-radius:4px; font-weight:bold; cursor:pointer;" onclick="confirmarModelo(${p.fila}, 6)">6</button>
                </div>
            </div>
        `;
        contenedor.appendChild(tarjeta);
    });
}

function enviarWhatsApp(celular, nombre, linkPdf) {
    let tel = String(celular).replace(/\D/g, "");
    if (tel.length === 10) tel = "549" + tel;
    let nom = nombre.split(" ")[0];

    let msj = `¡Hola ${nom}! 👋%0A%0ATe escribimos de Áurea Deco. Ya tenemos listos los bocetos de tu cartel para que elijas el que más te guste ✨%0A%0APodés verlos haciendo clic en este link:%0A${linkPdf}%0A%0A¿Qué número de opción te gusta más?`;

    window.open(`https://wa.me/${tel}?text=${msj}`, '_blank');
}

function confirmarModelo(fila, num) {
    if (!confirm(`¿Confirmar que el cliente eligió la Opción ${num}? El pedido pasará al Taller para prepararlo en DXF.`)) return;

    document.body.style.cursor = "wait";

    fetch(urlAppsScript, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ accion: "actualizar_modelo", fila: fila, modelo: num })
    }).then(() => {
        document.body.style.cursor = "default";
        alert("✅ Modelo confirmado. Enviado a DXF.");
        cargarDatos();
    }).catch(() => {
        document.body.style.cursor = "default";
        alert("❌ Error de conexión al guardar.");
    });
}
function guardarNota(fila) {
    const nota = document.getElementById(`nota-${fila}`).value;
    const btn = event.target;
    const textoOriginal = btn.innerText;
    btn.innerText = "⏳ Guardando...";
    btn.disabled = true;

    fetch(urlAppsScript, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ accion: "guardar_observacion", fila: fila, obs: nota })
    }).then(() => {
        btn.innerText = "✅ ¡Guardado!";
        setTimeout(() => { btn.innerText = textoOriginal; btn.disabled = false; }, 2000);
    });
}