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
    fetch(urlAppsScript).then(res => res.json()).then(datos => renderizarTarjetas(datos));
    fetch(urlAppsScript + "?accion=listar_gcodes").then(res => res.json()).then(datos => renderizarListaSemanales(datos.archivos));
}

document.addEventListener("DOMContentLoaded", () => {
    cargarDatosSeguros();
    setInterval(cargarDatosSeguros, 30000);
});

// ==========================================
// RENDERIZAR LA LISTA COMPARTIDA DE G-CODES
// ==========================================
function renderizarListaSemanales(archivos) {
    const div = document.getElementById("lista-gcodes-semanales");
    div.innerHTML = archivos ? archivos.map(a => `
        <div style="display:flex; justify-content:space-between; align-items:center; background:#f4f4f4; padding:10px 15px; margin-bottom:5px; border-radius:6px; border-left:3px solid var(--oxido);">
            <span style="color:var(--antracita); font-size:13px; font-weight:600;">📄 ${a.nombre}</span>
            <button onclick="window.open('${a.url}', '_blank')" class="btn-aurea" style="padding:6px 12px; font-size:11px;">BAJAR</button>
        </div>
    `).join('') : "<p style='text-align:center;'>No hay archivos en la red.</p>";
}

function subirGcodeSemanal() {
    const input = document.getElementById('archivo-semanal');
    const archivo = input.files[0];
    if(!archivo) return alert("⚠️ Elegí un archivo .tap o .nc");
    
    const btn = document.getElementById('btn-subir-semanal');
    btn.innerText = "⏳ Subiendo..."; btn.disabled = true;
    
    const lector = new FileReader();
    lector.onloadend = function() {
        fetch(urlAppsScript, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ accion: "subir_archivo", tipo: "semanal", nombreArchivo: archivo.name, mimeType: archivo.type, base64: lector.result })})
        .then(() => { 
            alert("✅ Archivo subido a la red."); 
            btn.innerText = "📤 Subir Archivo"; btn.disabled = false;
            input.value = "";
            cargarDatosSeguros(); 
        });
    };
    lector.readAsDataURL(archivo);
}

// ==========================================
// RENDERIZAR TARJETAS DE PRODUCCIÓN
// ==========================================
function renderizarTarjetas(pedidos) {
    const contenedor = document.getElementById("contenedor-tarjetas");
    document.getElementById("cargando").style.display = "none";
    const produccion = pedidos.filter(p => p.estado === "Listo para Corte CNC");

    contenedor.innerHTML = produccion.length === 0 ? "<h3 style='color:#666;'>Sin pendientes en Taller</h3>" : "";
    
    produccion.forEach(p => {
        // Recuperar progreso (Checklist)
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
            <h3 style="margin:0;">⚙️ Producción CNC</h3>
            <button class="btn-aurea" style="background:#007bff; color:white; margin:10px 0;" onclick="window.open('${p.linkDxf}', '_blank')">📥 Bajar DXF Original</button>
            
            <div class="bloque-info">
                <strong>HOJA DE RUTA</strong>
                Medida: ${p.medida}<br>
                Texto: <strong style="display:inline; color:var(--antracita); font-size:14px;">"${p.textos}"</strong>
            </div>
            
            <div class="bloque-info" style="border-color: var(--antracita); margin-top:0;">
                <strong>PINTURA</strong>
                Frente: ${p.frente} / Fondo: ${p.fondo}
            </div>

            <div class="lista-pasos" id="lista-pasos-${p.fila}">
                <strong style="font-size:11px; color:var(--oxido); margin-bottom:5px; display:block;">PROGRESO EN PLANTA:</strong>
                <label class="paso-item ${isT('corte')}"><input type="checkbox" value="corte" onchange="registrarPaso(${p.fila}, this)" ${isC('corte')}> 1. Corte CNC</label>
                <label class="paso-item ${isT('pulido')}"><input type="checkbox" value="pulido" onchange="registrarPaso(${p.fila}, this)" ${isC('pulido')}> 2. Pulido</label>
                <label class="paso-item ${isT('plegado')}"><input type="checkbox" value="plegado" onchange="registrarPaso(${p.fila}, this)" ${isC('plegado')}> 3. Plegado</label>
                <label class="paso-item ${isT('cepillado')}"><input type="checkbox" value="cepillado" onchange="registrarPaso(${p.fila}, this)" ${isC('cepillado')}> 4. Cepillado</label>
                <label class="paso-item ${isT('pintado')}"><input type="checkbox" value="pintado" onchange="registrarPaso(${p.fila}, this)" ${isC('pintado')}> 5. Pintado</label>
                <label class="paso-item ${isT('armado')}"><input type="checkbox" value="armado" onchange="registrarPaso(${p.fila}, this)" ${isC('armado')}> 6. Armado</label>
            </div>

            <button class="btn-aurea btn-secundario" onclick="finalizarPedido(${p.fila})">✅ PIEZA TERMINADA</button>
        `;
        contenedor.appendChild(tarjeta);
    });
}

function registrarPaso(fila, cb) {
    if (cb.checked) cb.parentElement.classList.add("tachado"); else cb.parentElement.classList.remove("tachado");
    let pasos = Array.from(document.getElementById(`lista-pasos-${fila}`).querySelectorAll('input:checked')).map(c => c.value).join(',');
    fetch(urlAppsScript, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ accion: "guardar_progreso", fila: fila, progreso: pasos }) });
}

function finalizarPedido(fila) {
    if (document.getElementById(`lista-pasos-${fila}`).querySelectorAll('input:not(:checked)').length > 0) {
        if (!confirm("⚠️ Faltan etapas por marcar. ¿Terminar cartel y mandar a Despacho igual?")) return;
    }
    
    document.getElementById(`tarjeta-${fila}`).style.opacity = "0.5";
    fetch(urlAppsScript, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ accion: "marcar_terminado", fila: fila }) })
    .then(() => location.reload());
}