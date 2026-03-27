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
                    ${obtenerSemaforo(p.fecha)}
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
                    <input type="text" id="tracking-${p.fila}" value="${p.tracking || ''}" placeholder="Ej: SD123456789AR" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing:border-box; font-family: 'Montserrat'; font-weight: bold; text-transform: uppercase;">
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
                <button class="btn-aurea" id="btn-despachar-${p.fila}" style="width:100%; background:#25d366; color:white; padding:12px; font-size:14px; border-radius:6px; font-weight:900; border:none; cursor:pointer;" onclick="despachar(${p.fila}, '${p.celular}', '${p.nombre}')">💬 DESPACHAR Y AVISAR</button>
            `}
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
// ==========================================
// MÓDULO LOGÍSTICA: EXTRAER TRACKING AUTO
// ==========================================
async function leerTrackingLocal(input, fila) {
    if (!input.files || input.files.length === 0) return;
    
    const file = input.files[0];
    if (file.type !== "application/pdf") return;

    const inputTracking = document.getElementById(`tracking-${fila}`);
    inputTracking.placeholder = "Buscando código...";

    try {
        // Configuramos el motor lector de PDF
        if (!window.pdfjsLib) {
            inputTracking.placeholder = "Falta motor PDF.js en HTML";
            return;
        }
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
        }

        // Leemos el archivo en memoria antes de subirlo
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        // El código del Correo Argentino siempre está en la primera carilla
        const pagina = await pdf.getPage(1);
        const contenido = await pagina.getTextContent();
        
        // Unimos todas las palabras sueltas del PDF en un solo texto gigante
        const textoCompleto = contenido.items.map(item => item.str).join(" ");
        
        // 🔎 RASTREADOR: Busca 2 letras, 9 números y 2 letras (Ej: HC398625165AR)
        const regex = /[A-Z]{2}\d{9}[A-Z]{2}/i;
        const match = textoCompleto.match(regex);

        if (match) {
            inputTracking.value = match[0].toUpperCase();
            if (typeof mostrarNotificacion === "function") {
                mostrarNotificacion("✅ Tracking extraído automáticamente.");
            }
        } else {
            inputTracking.placeholder = "Código no detectado. Ingresar manual.";
        }

    } catch (error) {
        console.error("Error leyendo PDF:", error);
        inputTracking.placeholder = "Error al leer PDF. Ingresar manual.";
    }
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