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
    if (!Array.from(inputs).some(i => i.files.length > 0)) fetch(urlAppsScript).then(res => res.json()).then(datos => renderizarTarjetas(datos));
}

document.addEventListener("DOMContentLoaded", () => { cargarDatosSeguros(); setInterval(cargarDatosSeguros, 30000); });

function copiarDatos(nombre, dni, celular, direccion, localidad, provincia, cp) {
    const texto = `Nombre: ${nombre}\nDNI: ${dni}\nTeléfono: ${celular}\nDirección: ${direccion}\nLocalidad: ${localidad}\nProvincia: ${provincia}\nCP: ${cp}`;
    navigator.clipboard.writeText(texto).then(() => alert("📋 ¡Datos copiados! Listos para pegar en Mi Correo."));
}

function renderizarTarjetas(pedidos) {
    const contenedor = document.getElementById("contenedor-tarjetas");
    document.getElementById("cargando").style.display = "none";
    const despacho = pedidos.filter(p => p.estado === "Listo para Despacho");

    contenedor.innerHTML = despacho.length === 0 ? "<h3 style='color:#666;'>No hay cajas pendientes.</h3>" : "";
    
    despacho.forEach(p => {
        let pasos = p.progreso ? p.progreso.split(',') : [];
        const isC = (paso) => pasos.includes(paso) ? 'checked' : '';
        const isT = (paso) => pasos.includes(paso) ? 'tachado' : '';

        const tarjeta = document.createElement("div");
        tarjeta.className = "tarjeta-aurea";
        tarjeta.style.borderTopColor = "#0056b3";
        tarjeta.id = `tarjeta-${p.fila}`;
        
        tarjeta.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="id-pedido">${p.id}</span>
                <div style="display:flex; gap:5px;">
                    <span style="background:var(--antracita); color:var(--dorado); padding:4px 8px; border-radius:4px; font-size:10px; font-weight:bold;">${p.tipoEnvio.toUpperCase()}</span>
                    ${obtenerSemaforo(p.fecha)}
                </div>
            </div>
            
            <h3 style="margin:10px 0 5px 0; color:var(--antracita); font-size:18px;">📦 ${p.nombre}</h3>
            
            <div style="background:#f0f8ff; border:1px solid #cce5ff; padding:12px; border-radius:8px; margin:10px 0; font-size:13px; line-height:1.5; position:relative;">
                <strong>DNI/CUIT:</strong> ${p.dni}<br>
                <strong>Tel:</strong> ${p.celular}<br>
                <strong>Dirección:</strong> ${p.direccion}<br>
                <strong>Destino:</strong> ${p.localidad}, ${p.provincia}<br>
                <strong>C.P.:</strong> <span style="font-size:16px; font-weight:900; color:#0056b3;">${p.cp}</span>
                <button class="btn-aurea" style="position:absolute; bottom:10px; right:10px; padding:5px 10px; font-size:10px; background:var(--antracita); color:white;" onclick="copiarDatos('${p.nombre}', '${p.dni}', '${p.celular}', '${p.direccion}', '${p.localidad}', '${p.provincia}', '${p.cp}')">📋 COPIAR DATOS</button>
            </div>
            <div style="margin-top: 15px; border-top: 1px dashed #ccc; padding-top: 10px;">
                <strong style="font-size: 11px; color: var(--oxido); display: block; margin-bottom: 5px;">📝 NOTAS / ERRORES:</strong>
                <textarea id="nota-${p.fila}" style="width: 100%; box-sizing: border-box; padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 12px; resize: vertical; font-family: inherit;" placeholder="Si hay algún error, anotalo acá...">${p.observaciones || ''}</textarea>
                <button style="width: 100%; background: #eee; color: #333; border: 1px solid #ccc; padding: 5px; border-radius: 4px; cursor: pointer; font-size: 11px; margin-top: 5px; font-weight: bold;" onclick="guardarNota(${p.fila})">💾 GUARDAR NOTA</button>
            </div>
            <div style="margin-bottom: 15px; background: #e9ecef; padding: 10px; border-radius: 6px;">
                <label style="font-size: 11px; font-weight: bold; color: #444; display:block; margin-bottom:5px;">CÓDIGO DE SEGUIMIENTO (Opcional):</label>
                <input type="text" id="tracking-${p.fila}" placeholder="Ej: SD123456789AR" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing:border-box; font-family: 'Montserrat'; font-weight: bold;">
                <a href="https://www.correoargentino.com.ar/formularios/e-commerce" target="_blank" style="display:block; text-align:right; font-size:10px; color:#0056b3; margin-top:5px; text-decoration:none; font-weight:bold;">🔗 Abrir web de Correo Argentino</a>
            </div>

            <div class="lista-pasos" id="lista-pasos-despacho-${p.fila}" style="margin-bottom:15px;">
                <strong style="font-size:11px; color:#0056b3; margin-bottom:5px; display:block;">CONTROL DE EMBALAJE:</strong>
                <label class="paso-item ${isT('calidad')}"><input type="checkbox" value="calidad" onchange="registrarPasoDespacho(${p.fila}, this)" ${isC('calidad')}> 1. Controlar Datos</label>
                <label class="paso-item ${isT('embalaje')}"><input type="checkbox" value="embalaje" onchange="registrarPasoDespacho(${p.fila}, this)" ${isC('embalaje')}> 2. Embalado con Punteras</label>
                <label class="paso-item ${isT('etiqueta')}"><input type="checkbox" value="etiqueta" onchange="registrarPasoDespacho(${p.fila}, this)" ${isC('etiqueta')}> 3. Etiqueta Pegada y Controlada</label>
            </div>
            
            <input type="file" id="archivo-rotulo-${p.fila}" accept=".pdf,.jpg,.png" style="margin-top:5px;">
            <button class="btn-aurea" id="btn-despachar-${p.fila}" style="width:100%; background:#25d366; color:white; margin-top:10px;" onclick="despachar(${p.fila}, '${p.celular}', '${p.nombre}')">💬 DESPACHAR Y AVISAR</button>
        `;
        contenedor.appendChild(tarjeta);
    });
}

function registrarPasoDespacho(fila, cb) {
    if (cb.checked) cb.parentElement.classList.add("tachado"); else cb.parentElement.classList.remove("tachado");
    let pasos = Array.from(document.getElementById(`lista-pasos-despacho-${fila}`).querySelectorAll('input:checked')).map(c => c.value).join(',');
    fetch(urlAppsScript, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ accion: "guardar_progreso", fila: fila, progreso: pasos }) });
}

function despachar(fila, celular, nombre) {
    if (document.getElementById(`lista-pasos-despacho-${fila}`).querySelectorAll('input:not(:checked)').length > 0) {
        if (!confirm("⚠️ Faltan pasos de control por marcar. ¿Querés despachar igual?")) return;
    }

    const archivo = document.getElementById(`archivo-rotulo-${fila}`).files[0];
    if(!archivo) return alert("⚠️ Subí el comprobante del correo primero.");
    
    const trackingCode = document.getElementById(`tracking-${fila}`).value.trim();

    // TRUCO NINJA: Guardamos el tracking en la base de datos sin alterar la planilla
    if (trackingCode !== "") {
        let pasos = Array.from(document.getElementById(`lista-pasos-despacho-${fila}`).querySelectorAll('input:checked')).map(c => c.value);
        pasos.push(`TRACKING_${trackingCode}`);
        fetch(urlAppsScript, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ accion: "guardar_progreso", fila: fila, progreso: pasos.join(',') }) });
    }

    const btn = document.getElementById(`btn-despachar-${fila}`); 
    btn.innerText = "⏳ Guardando..."; btn.disabled = true;

    const lector = new FileReader();
    lector.onloadend = function() {
        fetch(urlAppsScript, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ accion: "subir_archivo", fila: fila, tipo: "rotulo", nombreArchivo: archivo.name, mimeType: archivo.type, base64: lector.result })})
        .then(() => { 
            let tel = String(celular).replace(/\D/g, ""); if (tel.length === 10) tel = "549" + tel;
            let nom = nombre.split(" ")[0];
            let msj = `¡Hola ${nom}! 👋%0A%0A¡Tu cartel ya está empacado y en camino! 🚀%0A%0AAcá te adjuntamos el comprobante.`;
            if (trackingCode !== "") {
                msj += `%0A%0ATu Código de Seguimiento es: *${trackingCode}*%0A%0APodés seguir el paquete desde la web de Correo Argentino acá:%0Ahttps://www.correoargentino.com.ar/formularios/e-commerce`;
            }
            msj += `%0A%0A¡Gracias por confiar en Áurea Deco! ✨`;
            window.open(`https://wa.me/${tel}?text=${msj}`, '_blank');
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