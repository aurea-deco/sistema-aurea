// ⚠️ PEGA TU LINK DE APPS SCRIPT ACÁ:
const urlAppsScript = "https://script.google.com/macros/s/AKfycbxC4Q2rPVwBMbdBdEhQVCIjPm_YxPucKJ6eS0fcKL1we734KNuCusPWzWnydWcyyP4Nyw/exec"; 
// ==========================================
// CALCULADORA DE URGENCIA (SEMÁFORO)
// ==========================================
function obtenerSemaforo(fechaCruda) {
    if (!fechaCruda) return "";
    try {
        const dias = Math.floor((new Date() - new Date(fechaCruda)) / (1000 * 3600 * 24));
        if (isNaN(dias)) return "";
        let bg = "#28a745", color = "white"; // Verde por defecto (0 a 6 días)
        if (dias >= 10) { bg = "#dc3545"; color = "white"; } // Rojo (10+ días)
        else if (dias >= 7) { bg = "#ffc107"; color = "#333"; } // Amarillo (7 a 9 días)
        
        return `<span style="background:${bg}; color:${color}; padding:4px 8px; border-radius:4px; font-size:10px; font-weight:bold; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">⏳ ${dias} DÍAS</span>`;
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
        let pasos = p.progreso ? p.progreso.split(',') : [];
        const isC = (paso) => pasos.includes(paso) ? 'checked' : '';
        const isT = (paso) => pasos.includes(paso) ? 'tachado' : '';

        const tarjeta = document.createElement("div");
        tarjeta.className = "tarjeta-aurea"; 
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

            <div class="lista-pasos" id="lista-pasos-pdf-${p.fila}">
                <strong style="font-size:11px; color:var(--oxido); margin-bottom:5px; display:block;">CONTROL DE DISEÑO:</strong>
                <label class="paso-item ${isT('ortografia')}"><input type="checkbox" value="ortografia" onchange="registrarPasoDiseno(${p.fila}, this, 'pdf')" ${isC('ortografia')}> 1. Ortografía Revisada</label>
                <label class="paso-item ${isT('opciones')}"><input type="checkbox" value="opciones" onchange="registrarPasoDiseno(${p.fila}, this, 'pdf')" ${isC('opciones')}> 2. Opciones Armadas</label>
            </div>
            
            <input type="file" id="archivo-pdf-${p.fila}" accept=".pdf,.jpg">
            <button class="btn-aurea" style="width:100%;" onclick="procesarYSubirArchivo(${p.fila}, 'pdf')">📤 SUBIR BOCETO (PDF)</button>
        `;
        contNuevos.appendChild(tarjeta);
    });

    contDxf.innerHTML = "";
    pedidosDxf.forEach(p => {
        let pasos = p.progreso ? p.progreso.split(',') : [];
        const isC = (paso) => pasos.includes(paso) ? 'checked' : '';
        const isT = (paso) => pasos.includes(paso) ? 'tachado' : '';

        const tarjeta = document.createElement("div");
        tarjeta.className = "tarjeta-aurea";
        tarjeta.style.borderTopColor = "#007bff";
        tarjeta.innerHTML = `
            <div style="display:flex; justify-content:space-between;"><span class="id-pedido">${p.id}</span></div>
            <h3 style="margin:10px 0; color:#007bff;">📐 MOD: ${p.modelo}</h3>
            
            <div class="caja-resaltada" style="background:#f0f8ff; border-color:#007bff;">
                <strong style="font-size:11px; color:#007bff; display:block; margin-bottom:5px;">PUENTEAR TEXTOS:</strong>
                ${p.textos}
            </div>
            <p style="font-size:13px;"><strong>Medida chapa:</strong> ${p.medida}</p>

            <div class="lista-pasos" id="lista-pasos-dxf-${p.fila}">
                <strong style="font-size:11px; color:#007bff; margin-bottom:5px; display:block;">CONTROL TÉCNICO (CNC):</strong>
                <label class="paso-item ${isT('escala')}"><input type="checkbox" value="escala" onchange="registrarPasoDiseno(${p.fila}, this, 'dxf')" ${isC('escala')}> 1. Escala Exacta (1:1)</label>
                <label class="paso-item ${isT('puentes')}"><input type="checkbox" value="puentes" onchange="registrarPasoDiseno(${p.fila}, this, 'dxf')" ${isC('puentes')}> 2. Puentes de Letras OK</label>
                <label class="paso-item ${isT('nodos')}"><input type="checkbox" value="nodos" onchange="registrarPasoDiseno(${p.fila}, this, 'dxf')" ${isC('nodos')}> 3. Nodos Cerrados</label>
            </div>
            
            <input type="file" id="archivo-dxf-${p.fila}" accept=".dxf">
            <button class="btn-aurea" style="width:100%; background:#007bff; color:white;" onclick="procesarYSubirArchivo(${p.fila}, 'dxf')">✅ ENVIAR A TALLER (DXF)</button>
        `;
        contDxf.appendChild(tarjeta);
    });
}

function registrarPasoDiseno(fila, cb, tipo) {
    if (cb.checked) cb.parentElement.classList.add("tachado"); else cb.parentElement.classList.remove("tachado");
    let pasos = Array.from(document.getElementById(`lista-pasos-${tipo}-${fila}`).querySelectorAll('input:checked')).map(c => c.value).join(',');
    fetch(urlAppsScript, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ accion: "guardar_progreso", fila: fila, progreso: pasos }) });
}

function procesarYSubirArchivo(fila, tipo) {
    // Control de seguridad: Aviso si faltan tildes
    if (document.getElementById(`lista-pasos-${tipo}-${fila}`).querySelectorAll('input:not(:checked)').length > 0) {
        if (!confirm("⚠️ Faltan pasos de control por marcar. ¿Querés subir el archivo igual?")) return;
    }

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
        }).then(() => { alert("✅ Archivo subido."); document.getElementById(`tarjeta-${fila}`).remove(); });
    };
    lector.readAsDataURL(archivo);
}