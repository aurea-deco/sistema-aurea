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

function cargarDatosSeguros() {
    const inputs = document.querySelectorAll('input[type="file"]');
    const usandoArchivo = Array.from(inputs).some(input => input.files.length > 0);
    if (!usandoArchivo) fetch(urlAppsScript).then(res => res.json()).then(datos => renderizarTarjetas(datos));
}

document.addEventListener("DOMContentLoaded", () => {
    cargarDatosSeguros();
    setInterval(cargarDatosSeguros, 30000);
});

function renderizarTarjetas(pedidos) {
    const contNuevos = document.getElementById("contenedor-nuevos");
    const contDxf = document.getElementById("contenedor-dxf");
    document.getElementById("cargando").style.display = "none";

    const pedidosNuevos = pedidos.filter(p => p.estado === "Esperando Diseño" && (!p.linkPdf || p.linkPdf.trim() === ""));
    const pedidosDxf = pedidos.filter(p => p.estado === "Preparar DXF");

    contNuevos.innerHTML = "";
    pedidosNuevos.forEach(p => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "tarjeta-aurea"; 
        tarjeta.id = `tarjeta-${p.fila}`;
        tarjeta.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="id-pedido">${p.id}</span> 
                ${obtenerSemaforo(p.fecha)}
            </div>
            <h3 style="margin:10px 0 5px 0; color:var(--antracita);">📏 ${p.medida} <small style="font-size:12px; color:#888;">(${p.posicion})</small></h3>
            <p style="margin:0 0 10px 0; font-size:14px;">👤 <strong>${p.nombre}</strong></p>
            
            <div class="caja-resaltada" style="margin-top:0;">
                <strong style="font-size:11px; color:var(--oxido); display:block; margin-bottom:5px;">TEXTO A CALAR:</strong>
                ${p.textos}
            </div>
            
            <div style="background:var(--gris-suave); padding:10px; border-radius:6px; font-size:12px; margin-bottom:15px; border-left:3px solid var(--antracita);">
                <strong>PINTURA:</strong> Frente: ${p.frente} / Fondo: ${p.fondo}<br>
                <strong>DESTINO:</strong> ${p.localidad}, ${p.provincia}
            </div>
            
            <input type="file" id="archivo-pdf-${p.fila}" accept=".pdf,.jpg">
            <button class="btn-aurea" style="width:100%;" onclick="procesarYSubirArchivo(${p.fila}, 'pdf')">📤 SUBIR DISEÑOS (PDF)</button>
        `;
        contNuevos.appendChild(tarjeta);
    });

    contDxf.innerHTML = "";
    pedidosDxf.forEach(p => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "tarjeta-aurea";
        tarjeta.style.borderTopColor = "#007bff";
        tarjeta.id = `tarjeta-${p.fila}`;
        tarjeta.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="id-pedido">${p.id}</span>
                ${obtenerSemaforo(p.fecha)}
            </div>
            <h3 style="margin:10px 0; color:#007bff;">📐 Modelo: ${p.modelo}</h3>
            
            <div class="caja-resaltada" style="background:#f0f8ff; border-color:#007bff;">
                <strong style="font-size:11px; color:#007bff; display:block; margin-bottom:5px;">DATOS:</strong>
                ${p.textos}
            </div>
            <p style="font-size:13px;"><strong>Medida chapa:</strong> ${p.medida}</p>
            <div style="margin-top: 15px; border-top: 1px dashed #ccc; padding-top: 10px;">
                <strong style="font-size: 11px; color: var(--oxido); display: block; margin-bottom: 5px;">📝 NOTAS / ERRORES:</strong>
                <textarea id="nota-${p.fila}" style="width: 100%; box-sizing: border-box; padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 12px; resize: vertical; font-family: inherit;" placeholder="Si hay algún error, anotalo acá...">${p.observaciones || ''}</textarea>
                <button style="width: 100%; background: #eee; color: #333; border: 1px solid #ccc; padding: 5px; border-radius: 4px; cursor: pointer; font-size: 11px; margin-top: 5px; font-weight: bold;" onclick="guardarNota(${p.fila})">💾 GUARDAR NOTA</button>
            </div>
            <input type="file" id="archivo-dxf-${p.fila}" accept=".dxf">
            <button class="btn-aurea" style="width:100%; background:#007bff; color:white;" onclick="procesarYSubirArchivo(${p.fila}, 'dxf')">✅ ENVIAR A PRODUCCIÓN (DXF)</button>
        `;
        contDxf.appendChild(tarjeta);
    });
}

function procesarYSubirArchivo(fila, tipo) {
    const inputArchivo = document.getElementById(`archivo-${tipo}-${fila}`);
    const archivo = inputArchivo.files[0];
    if (!archivo) return alert("⚠️ Seleccioná un archivo.");
    
    const btn = event.target;
    btn.innerText = "⏳ Subiendo..."; btn.disabled = true;

    const lector = new FileReader();
    lector.onloadend = function() {
        fetch(urlAppsScript, {
            method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ accion: "subir_archivo", fila: fila, tipo: tipo, nombreArchivo: archivo.name, mimeType: archivo.type, base64: lector.result })
        }).then(() => { 
            alert("✅ Archivo subido."); 
            location.reload(); 
        });
    };
    lector.readAsDataURL(archivo);
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