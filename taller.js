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
        let bg = "#28a745", color = "white"; 
        if (dias >= 10) { bg = "#dc3545"; color = "white"; } 
        else if (dias >= 7) { bg = "#ffc107"; color = "#333"; } 
        
        return `<span style="background:${bg}; color:${color}; padding:4px 8px; border-radius:4px; font-size:10px; font-weight:bold; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">⏳ ${dias} DÍAS</span>`;
    } catch(e) { return ""; }
}

function cargarDatosSeguros() {
    const inputs = document.querySelectorAll('input[type="file"]');
    const usandoArchivo = inputs.length > 0 && Array.from(inputs).some(input => input && input.files && input.files.length > 0);
    
    if (!usandoArchivo) {
        // Carga las tarjetas
        fetch(urlAppsScript).then(res => res.json()).then(datos => renderizarTarjetas(datos)).catch(e => console.log(e));
        
        // Carga la lista de G-Codes del servidor
        fetch(urlAppsScript + "?accion=listar_gcodes")
            .then(res => res.json())
            .then(datos => renderizarListaSemanales(datos.archivos))
            .catch(e => console.log(e));
    }
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
    if(!div) return;
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

    if (produccion.length === 0) {
        contenedor.innerHTML = "<h3 style='color:#666;'>Sin pendientes en Fábrica</h3>";
        return;
    }
    
    contenedor.innerHTML = "";
    
    produccion.forEach(p => {
        let pasos = p.progreso ? p.progreso.split(',') : [];
        const isC = (paso) => pasos.includes(paso) ? 'checked' : '';
        const isT = (paso) => pasos.includes(paso) ? 'tachado' : '';

        const tarjeta = document.createElement("div");
        tarjeta.className = "tarjeta-aurea";
        
        // ACÁ ESTABA EL ERROR: Faltaba asignarle el ID a la tarjeta para que el botón la pueda encontrar
        tarjeta.id = `tarjeta-${p.fila}`; 
        
        tarjeta.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="id-pedido">${p.id}</span> 
                ${obtenerSemaforo(p.fecha)}
            </div>
            
            <h3 style="margin:10px 0 5px 0;">⚙️ Fabricación</h3>
            
            <button class="btn-aurea" style="background:#007bff; color:white; margin:10px 0;" onclick="window.open('${p.linkDxf}', '_blank')">📥 Bajar Dxf (opcional)</button>
            
            <div class="bloque-info">
                <strong>HOJA DE RUTA</strong><br>
                Medida: ${p.medida}<br>
                Texto: <strong style="display:inline; color:var(--antracita); font-size:14px;">"${p.textos}"</strong>
            </div>
            
            <div class="bloque-info" style="border-color: var(--antracita); margin-top:0;">
                <strong>PINTURA</strong><br>
                Frente: ${p.frente} / Fondo: ${p.fondo}
            </div>

            <div class="lista-pasos" id="lista-pasos-${p.fila}">
                <strong style="font-size:11px; color:var(--oxido); margin-bottom:5px; display:block;">PROGRESO EN PLANTA:</strong>
                <label class="paso-item ${isT('corte')}"><input type="checkbox" value="corte" onchange="registrarPaso(${p.fila}, this)" ${isC('corte')}> 1. Cortado </label>
                <label class="paso-item ${isT('pulido')}"><input type="checkbox" value="pulido" onchange="registrarPaso(${p.fila}, this)" ${isC('pulido')}> 2. Pulido</label>
                <label class="paso-item ${isT('plegado')}"><input type="checkbox" value="plegado" onchange="registrarPaso(${p.fila}, this)" ${isC('plegado')}> 3. Plegado</label>
                <label class="paso-item ${isT('cepillado')}"><input type="checkbox" value="cepillado" onchange="registrarPaso(${p.fila}, this)" ${isC('cepillado')}> 4. Cepillado</label>
                <label class="paso-item ${isT('pintado')}"><input type="checkbox" value="pintado" onchange="registrarPaso(${p.fila}, this)" ${isC('pintado')}> 5. Pintado</label>
                <label class="paso-item ${isT('armado')}"><input type="checkbox" value="armado" onchange="registrarPaso(${p.fila}, this)" ${isC('armado')}> 6. Armado</label>
            </div>
            <div style="margin-top: 15px; border-top: 1px dashed #ccc; padding-top: 10px;">
                <strong style="font-size: 11px; color: var(--oxido); display: block; margin-bottom: 5px;">📝 NOTAS / ERRORES:</strong>
                <textarea id="nota-${p.fila}" style="width: 100%; box-sizing: border-box; padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 12px; resize: vertical; font-family: inherit;" placeholder="Si hay algún error, anotalo acá...">${p.observaciones || ''}</textarea>
                <button style="width: 100%; background: #eee; color: #333; border: 1px solid #ccc; padding: 5px; border-radius: 4px; cursor: pointer; font-size: 11px; margin-top: 5px; font-weight: bold;" onclick="guardarNota(${p.fila})">💾 GUARDAR NOTA</button>
            </div>

            <button class="btn-aurea" id="btn-finalizar-${p.fila}" style="background-color:var(--dorado); color:var(--antracita); margin-top:10px;" onclick="finalizarPedido(${p.fila})">✅ Cartel Terminado</button>
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
    
    // Bloqueamos el botón y avisamos que está cargando
    const boton = document.getElementById(`btn-finalizar-${fila}`);
    if(boton) { boton.innerText = "⏳ Guardando..."; boton.disabled = true; }
    
    // Hacemos transparente la tarjeta
    const tarjeta = document.getElementById(`tarjeta-${fila}`);
    if(tarjeta) tarjeta.style.opacity = "0.5";

    // Enviamos a Google
    fetch(urlAppsScript, { 
        method: 'POST', 
        mode: 'no-cors', 
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ accion: "marcar_terminado", fila: fila }) 
    })
    .then(() => {
        alert("✅ Cartel terminado y enviado a Despacho.");
        location.reload(); // Recarga la página para refrescar los datos limpios
    })
    .catch((e) => {
        console.error(e);
        alert("❌ Error de conexión al intentar guardar.");
        if(tarjeta) tarjeta.style.opacity = "1";
        if(boton) { boton.innerText = "✅ PIEZA TERMINADA"; boton.disabled = false; }
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
// ==========================================
// SISTEMA DE NOTIFICACIONES FLOTANTES (TOASTS)
// ==========================================
function mostrarNotificacion(mensaje, tipo = "exito") {
    let contenedor = document.getElementById("contenedor-toast");
    if (!contenedor) {
        contenedor = document.createElement("div");
        contenedor.id = "contenedor-toast";
        document.body.appendChild(contenedor);
    }

    const toast = document.createElement("div");
    toast.className = `toast-aurea ${tipo}`;
    
    // Si es éxito pone un tilde verde gigante, si es error pone una cruz roja
    let icono = tipo === "error" ? "❌" : "✅";

    toast.innerHTML = `<span style="font-size: 24px;">${icono}</span> <span>${mensaje}</span>`;
    contenedor.appendChild(toast);

    // Animación de entrada
    setTimeout(() => toast.classList.add("mostrar"), 10);

    // Se va solo a los 3.5 segundos
    setTimeout(() => {
        toast.classList.remove("mostrar");
        setTimeout(() => toast.remove(), 400); 
    }, 3500);
}
// ==========================================
// RADAR DE DEEP LINKING (BUSCADOR AUTOMÁTICO)
// ==========================================
function enfocarPedidoDesdeTablero() {
    // 1. Leemos si la URL trae un número de pedido (Ej: ?id=396)
    const parametros = new URLSearchParams(window.location.search);
    const idBuscado = parametros.get('id');

    if (idBuscado) {
        // 2. Le damos 1.5 segundos al sistema para que descargue los datos de Google y dibuje las tarjetas
        setTimeout(() => {
            // Agarramos todas las tarjetas que haya en la pantalla
            const tarjetas = document.querySelectorAll('.tarjeta-aurea, .tarjeta-despacho, .tarjeta-taller'); 
            
            for (let tarjeta of tarjetas) {
                // Si el texto de la tarjeta contiene el ID que buscamos...
                if (tarjeta.innerText.includes(idBuscado)) {
                    
                    // A. Bajamos la pantalla suavemente hasta dejar la tarjeta en el centro
                    tarjeta.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // B. Le clavamos un efecto de luz verde flúor para que resalte
                    tarjeta.style.transition = "all 0.5s ease-in-out";
                    tarjeta.style.boxShadow = "0 0 30px #25d366, inset 0 0 10px #25d366";
                    tarjeta.style.transform = "scale(1.02)";
                    
                    // C. A los 3 segundos le sacamos el brillo para que vuelva a la normalidad
                    setTimeout(() => {
                        tarjeta.style.boxShadow = "";
                        tarjeta.style.transform = "scale(1)";
                    }, 3000);
                    
                    break; // Cortamos la búsqueda porque ya lo encontramos
                }
            }
        }, 1500); 
    }
}

// 3. Activamos el radar apenas carga la página
document.addEventListener("DOMContentLoaded", enfocarPedidoDesdeTablero);