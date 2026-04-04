const urlAppsScript = "https://script.google.com/macros/s/AKfycbxC4Q2rPVwBMbdBdEhQVCIjPm_YxPucKJ6eS0fcKL1we734KNuCusPWzWnydWcyyP4Nyw/exec"; 
// Activar el lector de PDFs
const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

// Función para leer el PDF y extraer el código
async function extraerTNDelPDF(event, fila) {
    const archivo = event.target.files[0];
    if (!archivo || archivo.type !== "application/pdf") return;

    const inputTracking = document.getElementById(`tracking-${fila}`);
    if(inputTracking) inputTracking.value = "⏳ Leyendo..."; 

    try {
        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

        const buffer = await archivo.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({data: buffer});
        const pdf = await loadingTask.promise;
        
        let textoCompleto = "";
        const paginasALeer = Math.min(pdf.numPages, 2);

        for (let i = 1; i <= paginasALeer; i++) {
            const pagina = await pdf.getPage(i);
            const contenido = await pagina.getTextContent();
            textoCompleto += contenido.items.map(item => item.str).join(" ");
        }

        // 1. Limpiamos espacios y guiones
        const textoLimpio = textoCompleto.replace(/[\s-]/g, '').toUpperCase();
        
        // 2. NUEVA LUPA: Busca "TN" y captura todo el código alfanumérico largo que le sigue
        const coincidencia = textoLimpio.match(/TN([A-Z0-9]{15,30})/);

        if (coincidencia && coincidencia[1]) {
            // coincidencia[1] tiene exactamente lo que va DESPUÉS del TN
            if(inputTracking) inputTracking.value = coincidencia[1];
        } else {
            // Si por casualidad no encuentra el TN, intenta buscar el código corto T&T como plan B
            const fallback = textoLimpio.match(/[A-Z]{2}\d{9}[A-Z]{2}/);
            if (fallback) {
                if(inputTracking) inputTracking.value = fallback[0];
            } else {
                if(inputTracking) inputTracking.value = "";
                alert("⚠️ No encontré el código automático. Cargalo a mano.");
            }
        }
    } catch (error) {
        console.error("Error PDF:", error);
        if(inputTracking) inputTracking.value = "";
    }
}

// CALENDARIO DE FERIADOS ARGENTINOS (Fijos y estimativos)
const feriados = [
    "01-01", // Año Nuevo
    "02-16", // Carnaval (Ejemplo)
    "02-17", // Carnaval (Ejemplo)
    "03-24", // Día de la Memoria
    "04-02", // Malvinas
    "04-03", // Viernes Santo
    "05-01", // Día del Trabajador
    "05-25", // Revolución de Mayo
    "06-17", // Güemes
    "06-20", // Día de la Bandera
    "07-09", // Día de la Independencia
    "08-17", // San Martín
    "10-12", // Diversidad Cultural
    "11-20", // Soberanía Nacional
    "12-08", // Inmaculada Concepción
    "12-25"  // Navidad
];

// Ahora recibe la fecha Y el estado
function obtenerSemaforo(fechaCruda, estadoActual) {
    if (!fechaCruda) return "";
    
    // Si ya está despachado, mostramos el tilde verde y cortamos
    if (estadoActual && (estadoActual.toLowerCase().includes("despacho") || estadoActual.toLowerCase().includes("entregado") || estadoActual.toLowerCase().includes("finalizado"))) {
        return `<span style="background:#17a2b8; color:white; padding:4px 8px; border-radius:4px; font-size:10px; font-weight:bold; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">✅ DESPACHADO</span>`;
    }

    try {
        let fechaInicio = new Date(fechaCruda);
        let hoy = new Date();
        
        let diasHabiles = 0;
        let temp = new Date(fechaInicio);
        
        while (temp < hoy) {
            temp.setDate(temp.getDate() + 1);
            
            let mes = String(temp.getMonth() + 1).padStart(2, '0');
            let dia = String(temp.getDate()).padStart(2, '0');
            let diaMes = `${mes}-${dia}`;
            
            let esFinde = temp.getDay() === 0 || temp.getDay() === 6;
            let esFeriado = feriados.includes(diaMes);

            if (!esFinde && !esFeriado) { 
                diasHabiles++;
            }
        }

        let bg = "#28a745", color = "white"; 
        if (diasHabiles >= 7) { bg = "#dc3545"; color = "white"; } 
        else if (diasHabiles >= 5) { bg = "#ffc107"; color = "#333"; } 
        
        return `<span style="background:${bg}; color:${color}; padding:4px 8px; border-radius:4px; font-size:10px; font-weight:bold; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">⏳ ${diasHabiles} DÍAS HÁBILES</span>`;
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

// ==========================================
// RENDERIZADO DE LA PANTALLA DE DESPACHO
// ==========================================
function renderizarTarjetas(pedidos) {
    const contenedor = document.getElementById("contenedor-tarjetas");
    document.getElementById("cargando").style.display = "none";
    
    const despacho = pedidos.filter(p => (p.estado === "Listo para Despacho" || p.estado.includes("Finalizado")) && p.estado !== "Entregado");

    contenedor.innerHTML = despacho.length === 0 ? "<h3 style='color:#666; text-align:center;'>No hay cajas pendientes.</h3>" : "";
    
    despacho.forEach(p => {
        let pasos = p.progreso ? p.progreso.split(',') : [];
        const isC = (paso) => pasos.includes(paso) ? 'checked' : '';
        const isT = (paso) => pasos.includes(paso) ? 'tachado' : '';

        const tarjeta = document.createElement("div");
        tarjeta.className = "tarjeta-aurea";
        tarjeta.style.borderTopColor = "#0056b3";
        tarjeta.id = `tarjeta-${p.fila}`;
        
        const yaDespachado = p.estado.includes("Finalizado");
        
        tarjeta.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="id-pedido">${p.id}</span>
                <div style="display:flex; gap:5px;">
                    <span style="background:var(--antracita); color:var(--dorado); padding:4px 8px; border-radius:4px; font-size:10px; font-weight:bold;">${p.tipoEnvio.toUpperCase()}</span>
                    ${obtenerSemaforo(p.fecha, p.estado)}
                </div>
            </div>
            
            <h3 style="margin:10px 0 5px 0; color:var(--antracita); font-size:18px;">📦 ${p.nombre}</h3>
            
            <div style="background:#fffcf5; border:1px solid #d4af37; padding:10px; border-radius:6px; margin:10px 0; font-size:13px; box-shadow: inset 0 0 5px rgba(212, 175, 55, 0.2);">
                <strong style="color:#1a1a1a; font-size:11px; display:block; margin-bottom:6px;">🛠️ VERIFICACIÓN DE PRODUCTO:</strong>
                <div style="line-height:1.6;">
                    <strong>Medida:</strong> <span style="font-weight:900; background:#eee; padding:2px 6px; border-radius:4px;">${p.medida || '---'}</span><br>
                    <strong>Texto / Calle:</strong> <span style="font-family:monospace; font-weight:bold; font-size:14px; color:#0056b3; text-transform:uppercase;">${p.textos || '---'}</span>
                </div>
            </div>

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

            <div class="lista-pasos" id="lista-pasos-despacho-${p.fila}" style="margin-bottom:15px; margin-top:15px;">
                <strong style="font-size:11px; color:#0056b3; margin-bottom:5px; display:block;">CONTROL DE EMBALAJE:</strong>
                <label class="paso-item ${isT('calidad')}"><input type="checkbox" value="calidad" onchange="registrarPasoDespacho(${p.fila}, this)" ${isC('calidad')}> 1. Controlar Datos</label>
                <label class="paso-item ${isT('embalaje')}"><input type="checkbox" value="embalaje" onchange="registrarPasoDespacho(${p.fila}, this)" ${isC('embalaje')}> 2. Embalado con Punteras</label>
                <label class="paso-item ${isT('etiqueta')}"><input type="checkbox" value="etiqueta" onchange="registrarPasoDespacho(${p.fila}, this)" ${isC('etiqueta')}> 3. Etiqueta Pegada y Controlada</label>
            </div>
            
            ${yaDespachado ? `
                <div style="background:#d4edda; padding:10px; border-radius:6px; margin-bottom:15px; border: 1px solid #c3e6cb;">
                    <strong style="color:#155724; font-size:12px; display:block; text-align:center;">✅ Paquete en tránsito</strong>
                    ${p.linkRotulo ? `
                        <div style="margin-top:10px;">
                            <button onclick="imprimirRotuloDoble('${p.linkRotulo}', event)" style="width:100%; background:#0056b3; color:white; padding:10px; border-radius:4px; font-size:12px; font-weight:bold; border:none; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1);">🖨️ IMPRIMIR DOBLE (2x Hoja)</button>
                        </div>
                    ` : ''}
                </div>

                <div style="margin-bottom: 15px; background: #e9ecef; padding: 10px; border-radius: 6px;">
                    <label style="font-size: 11px; font-weight: bold; color: #444; display:block; margin-bottom:5px;">CÓDIGO DE SEGUIMIENTO:</label>
                    <input type="file" id="archivo-rotulo-${p.fila}" accept=".pdf" style="width:100%; margin-bottom:10px;" onchange="extraerTNDelPDF(event, ${p.fila})"> 
                    <a href="https://www.correoargentino.com.ar/formularios/e-commerce" target="_blank" style="display:block; text-align:right; font-size:10px; color:#0056b3; margin-top:5px; text-decoration:none; font-weight:bold;">🔗 Rastrear en Correo Argentino</a>
                </div>
                <button onclick="marcarEntregado('${p.id}')" style="width:100%; background:#20c997; color:white; padding:12px; border-radius:6px; font-size:14px; font-weight:900; border:none; cursor:pointer; box-shadow:0 3px 6px rgba(0,0,0,0.2);">📦 MARCAR COMO ENTREGADO</button>
            ` : `
                <div style="background: #e9ecef; padding: 10px; border-radius: 6px; margin-bottom:15px;">
                    <label style="font-size: 11px; font-weight: bold; color: #444; display:block; margin-bottom:5px;">1. SUBIR RÓTULO (PDF):</label>
                    <input type="file" id="archivo-rotulo-${p.fila}" accept=".pdf" style="width:100%; margin-bottom:10px; font-size:12px;" onchange="leerTrackingLocal(this, ${p.fila})">
                    
                    <label style="font-size: 11px; font-weight: bold; color: #444; display:block; margin-bottom:5px;">2. CÓDIGO DE SEGUIMIENTO:</label>
                    <input type="text" id="tracking-${p.fila}" value="${p.tracking || ''}" placeholder="Se autocompleta al subir el PDF..." style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing:border-box; font-family: 'Montserrat'; font-weight: bold; text-transform: uppercase;">
                </div>
                <button class="btn-rojo" style="width:100%; padding:10px; font-size:14px; margin-top:15px;" onclick="despachar(${p.fila}, '${p.celular}', '${p.nombre}', this)">
    📦 DESPACHAR Y AVISAR
</button>
            `}
        `;
        contenedor.appendChild(tarjeta);
    });
}

function registrarPasoDespacho(fila, cb) {
    if (cb.checked) cb.parentElement.classList.add("tachado"); else cb.parentElement.classList.remove("tachado");
    let pasos = Array.from(document.getElementById(`lista-pasos-despacho-${fila}`).querySelectorAll('input:checked')).map(c => c.value).join(',');
    fetch(urlAppsScript, { method: 'POST',  body: JSON.stringify({ accion: "guardar_progreso", fila: fila, progreso: pasos }) });
}

// Agregamos "botonElemento" al final
function despachar(fila, celular, nombre, botonElemento) {
    const inputArchivo = document.getElementById(`archivo-rotulo-${fila}`);
    const archivo = inputArchivo ? inputArchivo.files[0] : null;
    
    if(!archivo) return alert("⚠️ Subí el comprobante del correo primero.");
    
    const inputTracking = document.getElementById(`tracking-${fila}`);
    let trackingCode = inputTracking ? inputTracking.value.trim() : "";

    if (botonElemento) {
        botonElemento.innerText = "⏳ Guardando..."; 
        botonElemento.disabled = true;
    }

    const lector = new FileReader();
    lector.onloadend = function() {
        fetch(urlAppsScript, { 
            method: 'POST', 
            mode: 'no-cors',
            body: JSON.stringify({ 
                accion: "subir_archivo", 
                fila: fila, 
                tipo: "rotulo", 
                nombreArchivo: archivo.name, 
                mimeType: archivo.type, 
                base64: lector.result,
                tracking: trackingCode
            })
        })
        .then(() => { 
            // Solo refresca para que el pedido desaparezca y se archive
            location.reload(); 
        })
        .catch(err => {
            alert("❌ Error al guardar.");
            if (botonElemento) {
                botonElemento.innerText = "Reintentar"; 
                botonElemento.disabled = false;
            }
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
// MÓDULO LOGÍSTICA: MARCAR ENTREGADO (ARCHIVAR)
// ==========================================
function marcarEntregado(idPedido) {
    if (confirm(`📦 ¿Confirmás que el paquete del pedido ${idPedido} ya fue ENTREGADO o despachado con éxito?\n\nEsto lo retirará de la pantalla y archivará la fila en la base de datos.`)) {
        
        fetch(urlAppsScript, {
            method: 'POST',
            redirect: 'follow',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ accion: "borrar", id: idPedido })
        })
        .then(() => {
            setTimeout(() => {
                alert("🎉 ¡Excelente! Pedido archivado exitosamente.");
                cargarDatosSeguros(); // Recarga la tabla en la página de despacho
            }, 1000);
        })
        .catch(() => alert("Error de conexión al intentar archivar el pedido."));
    }
}
// ==========================================
// MÓDULO LOGÍSTICA: GENERADOR DE RÓTULOS (ESCALA 90% POSICIÓN FIJA)
// ==========================================
async function imprimirRotuloDoble(linkDrive, event) {
    if (!event || !event.target) return;
    const btn = event.target;
    const textoOriginal = btn.innerText;
    
    try {
        if (!window.PDFLib) throw new Error("Falta instalar el motor PDFLib en el HTML.");

        btn.innerText = "⏳ 1/3 Extrayendo Link...";
        btn.disabled = true;

        const matchId = linkDrive.match(/[-\w]{25,}/);
        if (!matchId) throw new Error("El link de Drive no tiene un ID válido.");
        
        const directUrl = `https://drive.google.com/uc?export=download&id=${matchId[0]}`;
        const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(directUrl)}`;

        btn.innerText = "⏳ 2/3 Descargando PDF...";
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error("El servidor bloqueó la descarga.");
        
        const pdfBytesOriginal = await response.arrayBuffer();

        const bytesHex = new Uint8Array(pdfBytesOriginal).slice(0, 4);
        if (bytesHex[0] !== 0x25 || bytesHex[1] !== 0x50) {
            throw new Error("Google Drive bloqueó el archivo. Asegurate de que la carpeta esté pública.");
        }

        btn.innerText = "⏳ 3/3 Acomodando 2-UP...";
        
        const { PDFDocument } = window.PDFLib;
        const pdfOriginal = await PDFDocument.load(pdfBytesOriginal);
        
        // Agarramos la página original INTACTA
        const primeraPagina = pdfOriginal.getPages()[0]; 
        const { width: origWidth, height: origHeight } = primeraPagina.getSize();

        const pdfNuevo = await PDFDocument.create();
        
        // Creamos la Hoja A4 Apaisada (Horizontal)
        const anchoHoja = 841.89;
        const altoHoja = 595.28;
        const hojaA4 = pdfNuevo.addPage([anchoHoja, altoHoja]); 

        const paginaEmbebida = await pdfNuevo.embedPage(primeraPagina);

        // 📏 TAMAÑO IDEAL (90%)
        const escala = 0.90; 
        const anchoFinal = origWidth * escala;
        const altoFinal = origHeight * escala;

        // 🎯 POSICIONES FIJAS (Sin centrado automático para que no lo empuje el blanco)
        const margen = 20; // 20 puntos de margen para que la impresora no muerda el borde

        // Alineamos las dos etiquetas arriba del todo
        const posY = altoHoja - altoFinal - margen;

        // Uno arranca en la orilla izquierda, el otro arranca justo en la mitad de la hoja
        const posXIzquierda = margen;
        const posXDerecha = (anchoHoja / 2) + margen;

        // 1. ESTAMPAMOS IZQUIERDA
        hojaA4.drawPage(paginaEmbebida, { 
            x: posXIzquierda, 
            y: posY, 
            width: anchoFinal, 
            height: altoFinal 
        });

        // 2. ESTAMPAMOS DERECHA
        hojaA4.drawPage(paginaEmbebida, { 
            x: posXDerecha, 
            y: posY, 
            width: anchoFinal, 
            height: altoFinal 
        });

        const pdfFinalBytes = await pdfNuevo.save();
        const blob = new Blob([pdfFinalBytes], { type: 'application/pdf' });
        
        window.open(URL.createObjectURL(blob), '_blank');

    } catch (error) {
        console.error(error);
        alert("❌ ERROR: " + error.message);
    } finally {
        btn.innerText = textoOriginal;
        btn.disabled = false;
    }
}
