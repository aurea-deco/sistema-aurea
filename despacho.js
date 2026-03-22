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
    if (!Array.from(inputs).some(i => i.files.length > 0)) fetch(urlAppsScript).then(res => res.json()).then(datos => renderizarTarjetas(datos));
}

document.addEventListener("DOMContentLoaded", () => { cargarDatosSeguros(); setInterval(cargarDatosSeguros, 30000); });

function renderizarTarjetas(pedidos) {
    const contenedor = document.getElementById("contenedor-tarjetas");
    document.getElementById("cargando").style.display = "none";
    const despacho = pedidos.filter(p => p.estado === "Listo para Despacho");

    contenedor.innerHTML = despacho.length === 0 ? "<h3 style='color:#666;'>No hay cajas pendientes.</h3>" : "";
    
    despacho.forEach(p => {
        // Recuperar progreso de la base de datos
        let pasos = p.progreso ? p.progreso.split(',') : [];
        const isC = (paso) => pasos.includes(paso) ? 'checked' : '';
        const isT = (paso) => pasos.includes(paso) ? 'tachado' : '';

        const tarjeta = document.createElement("div");
        tarjeta.className = "tarjeta-aurea";
        tarjeta.style.borderTopColor = "#0056b3";
        tarjeta.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
    <span class="id-pedido">${p.id}</span> 
    <div style="display:flex; gap:5px;">
        <span style="background:var(--antracita); color:var(--dorado); padding:4px 8px; border-radius:4px; font-size:10px; font-weight:bold;">${p.tipoEnvio.toUpperCase()}</span>
        ${obtenerSemaforo(p.fecha)}
    </div>
</div>
            
            <h3 style="margin:10px 0 5px 0; color:var(--antracita); font-size:18px;">📦 ${p.nombre}</h3>
            
            <div style="background:#f0f8ff; border:1px solid #cce5ff; padding:12px; border-radius:8px; margin:10px 0; font-size:13px; line-height:1.5;">
                <strong>DNI/CUIT:</strong> ${p.dni}<br>
                <strong>Tel:</strong> ${p.celular}<br>
                <strong>Dirección:</strong> ${p.direccion}<br>
                <strong>Destino:</strong> ${p.localidad}, ${p.provincia}<br>
                <strong>C.P.:</strong> <span style="font-size:16px; font-weight:900; color:#0056b3;">${p.cp}</span>
            </div>
            
            <div style="text-align:center; font-size:12px; font-weight:800; color:var(--oxido); margin-bottom:15px; background:#fff9e6; padding:10px; border-radius:6px; border: 1px solid #ffeeba;">
                CONTENIDO: 1 Cartel ${p.medida} (Mod: ${p.modelo})<br>
                <span style="font-size:15px; color:var(--antracita); display:block; margin-top:8px;">TEXTO: "${p.textos}"</span>
                <span style="font-size:13px; color:#555; display:block; margin-top:4px;">🎨 Frente: ${p.frente} / Fondo: ${p.fondo}</span>
            </div>

            <div class="lista-pasos" id="lista-pasos-despacho-${p.fila}">
                <strong style="font-size:11px; color:#0056b3; margin-bottom:5px; display:block;">CONTROL DE EMPAQUE:</strong>
                <label class="paso-item ${isT('calidad')}"><input type="checkbox" value="calidad" onchange="registrarPasoDespacho(${p.fila}, this)" ${isC('calidad')}> 1. Control de Calidad OK</label>
                <label class="paso-item ${isT('embalaje')}"><input type="checkbox" value="embalaje" onchange="registrarPasoDespacho(${p.fila}, this)" ${isC('embalaje')}> 2. Embalaje Protegido</label>
                <label class="paso-item ${isT('etiqueta')}"><input type="checkbox" value="etiqueta" onchange="registrarPasoDespacho(${p.fila}, this)" ${isC('etiqueta')}> 3. Caja Cerrada</label>
            </div>
            
            <input type="file" id="archivo-rotulo-${p.fila}" accept=".pdf,.jpg,.png" style="margin-top:5px;">
            <button class="btn-aurea" style="width:100%; background:#25d366; color:white;" onclick="despachar(${p.fila}, '${p.celular}', '${p.nombre}')">💬 DESPACHAR Y AVISAR CLIENTE</button>
        `;
        contenedor.appendChild(tarjeta);
    });
}

// Guarda las tildes en Google Sheets
function registrarPasoDespacho(fila, cb) {
    if (cb.checked) cb.parentElement.classList.add("tachado"); else cb.parentElement.classList.remove("tachado");
    let pasos = Array.from(document.getElementById(`lista-pasos-despacho-${fila}`).querySelectorAll('input:checked')).map(c => c.value).join(',');
    fetch(urlAppsScript, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ accion: "guardar_progreso", fila: fila, progreso: pasos }) });
}

// Valida y despacha
function despachar(fila, celular, nombre) {
    // Alarma si faltan marcar pasos
    if (document.getElementById(`lista-pasos-despacho-${fila}`).querySelectorAll('input:not(:checked)').length > 0) {
        if (!confirm("⚠️ Faltan pasos de control por marcar. ¿Querés despachar la caja igual?")) return;
    }

    const archivo = document.getElementById(`archivo-rotulo-${fila}`).files[0];
    if(!archivo) return alert("⚠️ Subí el PDF o foto del Rótulo de correo primero.");
    
    const btn = event.target; btn.innerText = "⏳ Guardando..."; btn.disabled = true;

    const lector = new FileReader();
    lector.onloadend = function() {
        fetch(urlAppsScript, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ accion: "subir_archivo", fila: fila, tipo: "rotulo", nombreArchivo: archivo.name, mimeType: archivo.type, base64: lector.result })})
        .then(() => { 
            let tel = String(celular).replace(/\D/g, ""); if (tel.length === 10) tel = "549" + tel;
            let nom = nombre.split(" ")[0];
            window.open(`https://wa.me/${tel}?text=¡Hola ${nom}! 👋%0A%0A¡Tu cartel ya está empacado y listo!%0A%0AAcá te adjuntamos el comprobante de envío para que puedas hacer el seguimiento.%0A%0A¡Gracias por confiar en Áurea Deco!`, '_blank');
            location.reload(); 
        });
    };
    lector.readAsDataURL(archivo);
}