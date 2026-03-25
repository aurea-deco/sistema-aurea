const urlAppsScript = "https://script.google.com/macros/s/AKfycbxC4Q2rPVwBMbdBdEhQVCIjPm_YxPucKJ6eS0fcKL1we734KNuCusPWzWnydWcyyP4Nyw/exec"; 

let pedidosGlobales = []; 

// ==========================================
// 🛠️ INYECCIÓN AUTOMÁTICA DE ESTILOS Y ANIMACIONES (UX INDUSTRIAL)
// ==========================================
(function injectarEstilosUX() {
    const estilo = document.createElement('style');
    estilo.innerHTML = `
        body { font-family: 'Montserrat', sans-serif; }
        @keyframes pulso-luz { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.1); } 100% { opacity: 1; transform: scale(1); } }
        .anim-oficina { display: inline-block; animation: pulso-luz 2s ease-in-out infinite; color: #d4af37; }
        @keyframes giro-engranaje { 100% { transform: rotate(360deg); } }
        .anim-fabrica { display: inline-block; animation: giro-engranaje 4s linear infinite; transform-origin: center; color: #004085; }
        @keyframes flecha-caja { 0% { transform: translateY(0); } 50% { transform: translateY(-4px); } 100% { transform: translateY(0); } }
        .anim-despacho { display: inline-block; animation: flecha-caja 1.5s ease-in-out infinite; color: #155724; }
        #tabla-pedidos tbody tr { cursor: pointer; transition: background 0.2s, transform 0.1s; }
        #tabla-pedidos tbody tr:hover { background-color: rgba(212, 175, 55, 0.05) !important; transform: scale(1.005); box-shadow: 0 4px 10px rgba(0,0,0,0.03); }
        #modal-overlay-aurea { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); z-index: 9999; display: flex; justify-content: center; align-items: center; padding: 20px; box-sizing: border-box; opacity: 0; transition: opacity 0.3s ease; }
        #modal-overlay-aurea.mostrar { opacity: 1; }
        #modal-ventana-aurea { transform: scale(0.9); transition: transform 0.3s ease; }
        #modal-overlay-aurea.mostrar #modal-ventana-aurea { transform: scale(1); }
    `;
    document.head.appendChild(estilo);
})();

// ==========================================
// CÁLCULO DE TIEMPO Y SEMÁFORO
// ==========================================
function calcularSemaforo(fechaCruda) {
    if (!fechaCruda) return "<span style='color:#999; font-size:11px;'>Sin fecha</span>";
    try {
        const fechaIngreso = new Date(fechaCruda);
        const hoy = new Date();
        const diasTranscurridos = Math.floor((hoy.getTime() - fechaIngreso.getTime()) / (1000 * 3600 * 24));

        let colorFondo = "#28a745"; let colorTexto = "white"; let estadoTiempo = "A Tiempo";
        if (diasTranscurridos >= 10) { colorFondo = "#dc3545"; estadoTiempo = "Demorado"; } 
        else if (diasTranscurridos >= 7) { colorFondo = "#ffc107"; colorTexto = "#333"; estadoTiempo = "Atención"; }

        const fechaFormateada = fechaIngreso.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
        return `
            <div style="display:flex; flex-direction:column; align-items:flex-start; gap:4px; font-family:'Montserrat', sans-serif;">
                <span style="font-size:11px; font-weight:600; color:#888;">Ingresó el ${fechaFormateada}</span>
                <span style="background:${colorFondo}; color:${colorTexto}; padding:3px 7px; border-radius:4px; font-size:10px; font-weight:800; letter-spacing:0.5px;">
                    ⏳ ${diasTranscurridos} DÍAS - ${estadoTiempo.toUpperCase()}
                </span>
            </div>
        `;
    } catch(e) { return fechaCruda; }
}

// ==========================================
// ARMADO DEL DASHBOARD SUPERIOR
// ==========================================
function armarDashboardLive(pedidosActivos) {
    let dashboard = document.getElementById("dashboard-live-aurea");
    let contOficina = 0; let contFabrica = 0; let contDespacho = 0;

    pedidosActivos.forEach(p => {
        if(p.estado.includes("Diseño") || p.estado.includes("DXF") || p.estado === "Pendiente") contOficina++;
        else if(p.estado.includes("Corte") || p.estado.includes("Taller")) contFabrica++;
        else if(p.estado.includes("Despacho") || p.estado.includes("Finalizado")) contDespacho++;
    });

    if (dashboard) {
        document.getElementById("cont-oficina").innerText = contOficina;
        document.getElementById("cont-fabrica").innerText = contFabrica;
        document.getElementById("cont-despacho").innerText = contDespacho;
        document.getElementById("cont-total").innerText = pedidosActivos.length;
        return; 
    }

    const tabla = document.getElementById("tabla-pedidos");
    dashboard = document.createElement("div");
    dashboard.id = "dashboard-live-aurea";
    dashboard.style.cssText = "margin-bottom: 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; font-family:'Montserrat', sans-serif;";
    
    const armarTarjeta = (id, titulo, valor, color, bg) => `
        <div style="background:white; padding:15px; border-radius:8px; border-left: 5px solid ${color}; box-shadow:0 3px 10px rgba(0,0,0,0.05); text-align:center;">
            <div style="font-size:11px; font-weight:700; color:#888; text-transform:uppercase; letter-spacing:1px; margin-bottom:5px;">${titulo}</div>
            <div id="${id}" style="font-size:30px; font-weight:900; color:${color}; line-height:1;">${valor}</div>
            <div style="font-size:10px; color:#555; margin-top:3px;">Órdenes Activas</div>
        </div>
    `;

    dashboard.innerHTML = `
        ${armarTarjeta("cont-oficina", "🏢 OFICINA", contOficina, "#856404", "#fff3cd")}
        ${armarTarjeta("cont-fabrica", "⚙️ FÁBRICA", contFabrica, "#004085", "#cce5ff")}
        ${armarTarjeta("cont-despacho", "📦 DESPACHO", contDespacho, "#155724", "#d4edda")}
        <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; background:#1a1a1a; color:white; border-radius:8px; padding:10px; box-shadow:0 3px 10px rgba(0,0,0,0.1);">
            <div id="cont-total" style="font-size:30px; font-weight:900; color:#d4af37;">${pedidosActivos.length}</div>
            <div style="font-size:10px; font-weight:700; color:#d4af37; letter-spacing:1px;">TOTAL EN PLANTA</div>
        </div>
    `;
    tabla.parentNode.insertBefore(dashboard, tabla);
}

// ==========================================
// EL BUSCADOR INTELIGENTE (GOOGLE INTERNO)
// ==========================================
function armarBuscador() {
    if (document.getElementById("contenedor-buscador-aurea")) return;

    const tabla = document.getElementById("tabla-pedidos");
    const buscadorDiv = document.createElement("div");
    buscadorDiv.id = "contenedor-buscador-aurea";
    buscadorDiv.style.cssText = "margin-bottom: 20px; position: relative; font-family:'Montserrat', sans-serif;";
    
    buscadorDiv.innerHTML = `
        <span style="position: absolute; left: 18px; top: 16px; font-size: 18px; opacity: 0.5;">🔍</span>
        <input type="text" id="input-buscador-aurea" placeholder="Buscar por ID, nombre, texto a calar, localidad o celular..." 
            style="width: 100%; padding: 18px 20px 18px 50px; border-radius: 8px; border: 1px solid #ccc; font-size: 15px; font-family: 'Montserrat', sans-serif; font-weight: 500; box-sizing: border-box; box-shadow: 0 4px 10px rgba(0,0,0,0.03); outline: none; transition: all 0.3s;" 
            onkeyup="filtrarYRenderizarTabla()" 
            onfocus="this.style.borderColor='#d4af37'; this.style.boxShadow='0 4px 15px rgba(212, 175, 55, 0.2)';" 
            onblur="this.style.borderColor='#ccc'; this.style.boxShadow='0 4px 10px rgba(0,0,0,0.03)';">
    `;
    tabla.parentNode.insertBefore(buscadorDiv, tabla);
}

// Filtra la tabla basándose en lo que escribiste
function filtrarYRenderizarTabla() {
    const inputBuscador = document.getElementById("input-buscador-aurea");
    const termino = inputBuscador ? inputBuscador.value.toLowerCase().trim() : "";
    
    let pedidosAMostrar = [];

    if (termino === "") {
        // Si el buscador está vacío, mostramos solo los activos
        pedidosAMostrar = pedidosGlobales.filter(p => p.estado !== "Finalizado / Despachado");
    } else {
        // Si hay texto, buscamos en TODOS los pedidos (historial completo)
        pedidosAMostrar = pedidosGlobales.filter(p => {
            // Unimos todos los datos clave en un solo texto para buscar ahí
            const datosCombinados = `${p.id} ${p.nombre} ${p.textos} ${p.medida} ${p.localidad} ${p.provincia} ${p.celular} ${p.estado} ${p.modelo}`.toLowerCase();
            return datosCombinados.includes(termino);
        });
    }

    renderizarTablaHTML(pedidosAMostrar);
}

// ==========================================
// RENDERIZADO DE LA TABLA
// ==========================================
function renderizarTablaHTML(pedidos) {
    const tbody = document.getElementById("cuerpo-tabla");
    tbody.innerHTML = "";

    if (pedidos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 40px; color: #666; font-weight: bold; background:white; border-radius:8px;">🔍 No se encontraron resultados.</td></tr>`;
        return;
    }

    pedidos.forEach(p => {
        let zonaPlanta = p.estado;
        let colorBg = "#eee"; let colorTxt = "#333"; 
        
        if(p.estado.includes("Diseño") || p.estado.includes("DXF") || p.estado === "Pendiente") { 
            zonaPlanta = `<span class="anim-oficina">🏢</span> OFICINA`; colorBg = "#fff3cd"; colorTxt = "#856404"; 
        }
        else if(p.estado.includes("Corte") || p.estado.includes("Taller")) { 
            zonaPlanta = `<span class="anim-fabrica">⚙️</span> FÁBRICA`; colorBg = "#cce5ff"; colorTxt = "#004085"; 
        }
        else if(p.estado.includes("Despacho") || p.estado.includes("Finalizado")) { 
            zonaPlanta = `<span class="anim-despacho">📦</span> DESPACHO`; colorBg = "#d4edda"; colorTxt = "#155724"; 
        }

        let textoProgreso = p.progreso && p.progreso.trim() !== "" ? p.progreso.replace(/,/g, " ✔️<br>") + " ✔️" : "Esperando inicio...";

        tbody.innerHTML += `
            <tr onclick="abrirDetalle('${p.id}', '${zonaPlanta.replace(/"/g, '&quot;')}', '${colorBg}', '${colorTxt}')">
                <td style="font-weight:900; color:#b0b0b0; vertical-align: top; padding:15px; text-align:center; font-size:11px;">${p.id}</td>
                <td style="vertical-align: top; padding:15px;">
                    <strong>${p.nombre}</strong><br>
                    <small style="font-size:11px; color:#777; font-family:monospace; background:#eee; padding:1px 4px; border-radius:3px;">${p.textos}</small>
                </td>
                <td style="vertical-align: top; padding:15px; font-size:12px;"><strong>${p.medida}</strong><br><small style="color:#888;">Opción: ${p.modelo || 'Pend'}</small></td>
                <td style="vertical-align: top; padding:15px;">
                    <span style="background:${colorBg}; color:${colorTxt}; display:inline-block; margin-bottom:3px; padding:3px 7px; border-radius:4px; font-weight:800; font-size:11px; letter-spacing:0.5px; box-shadow: inset 0 -1px 0 rgba(0,0,0,0.1);">${zonaPlanta}</span>
                    <div style="font-size: 10px; color: #888; margin-bottom: 7px; font-style: italic;">(${p.estado})</div>
                    <div style="font-size: 11px; background: #fdfcf8; padding: 6px; border: 1px solid #eee; border-radius: 4px; border-left: 3px solid ${p.observaciones && p.observaciones.trim() !== '' ? '#dc3545' : '#28a745'};">
                        <strong style="color: #333; font-size:10px; text-transform:uppercase;">📝 Bitácora:</strong><br>
                        <span style="color: ${p.observaciones && p.observaciones.trim() !== '' ? '#dc3545' : '#555'}; font-weight: ${p.observaciones ? 'bold' : 'normal'};">
                            ${p.observaciones && p.observaciones.trim() !== '' ? p.observaciones : '✅ Sin errores.'}
                        </span>
                    </div>
                </td>
                <td style="vertical-align: top; padding:15px;">${calcularSemaforo(p.fecha)}</td>
            </tr>
        `;
    });
}

// ==========================================
// CEREBRO PRINCIPAL (CARGA DE DATOS)
// ==========================================
function cargarTablero() {
    fetch(urlAppsScript).then(res => res.json()).then(datos => {
        pedidosGlobales = datos; 
        
        const loading = document.getElementById("cargando");
        const tabla = document.getElementById("tabla-pedidos");
        if(loading) loading.style.display = "none";
        if(tabla) tabla.style.display = "table";

        // Solo armamos el dashboard superior contando los activos
        const pedidosActivos = datos.filter(p => p.estado !== "Finalizado / Despachado");
        armarDashboardLive(pedidosActivos);
        
        // Inyectamos el buscador si no existe
        armarBuscador();

        // Mandamos a filtrar (esto detecta si hay texto escrito o no, y dibuja la tabla correcta)
        filtrarYRenderizarTabla();
    });
}

// ==========================================
// VENTANA FLOTANTE MAESTRA (GLASSMORPHISM)
// ==========================================
function abrirDetalle(idBuscado, zonaTraducida, colorBg, colorTxt) {
    const p = pedidosGlobales.find(pedido => pedido.id === idBuscado);
    if (!p) return;

    let modalOverlay = document.getElementById("modal-overlay-aurea");
    if (!modalOverlay) {
        modalOverlay = document.createElement("div");
        modalOverlay.id = "modal-overlay-aurea";
        modalOverlay.onclick = function(e) { if(e.target === modalOverlay) cerrarDetalle(); };
        document.body.appendChild(modalOverlay);
    }

    const zonaLimpia = zonaTraducida.replace(/<[^>]*>?/gm, '').trim();

    modalOverlay.innerHTML = `
        <div id="modal-ventana-aurea" style="background: rgba(255, 252, 245, 0.90); border: 1px solid rgba(255,255,255,0.5); width:100%; max-width:750px; max-height:90vh; overflow-y:auto; border-radius:12px; padding:35px; box-shadow:0 15px 35px rgba(0,0,0,0.2); position:relative; font-family:'Montserrat', sans-serif;">
            <button onclick="cerrarDetalle()" style="position:absolute; top:20px; right:20px; background:white; color:#333; border:1px solid #ddd; border-radius:50%; width:35px; height:35px; font-size:18px; font-weight:bold; cursor:pointer; display:flex; justify-content:center; align-items:center; box-shadow:0 2px 4px rgba(0,0,0,0.1); transition:0.2s;" onmouseover="this.style.background='#dc3545'; this.style.color='white';">×</button>
            <h2 style="margin-top:0; color:#1a1a1a; border-bottom:3px solid #d4af37; padding-bottom:10px; font-weight:900;">📋 FICHA TÉCNICA: ${p.id}</h2>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:20px; margin-top:20px;">
                <div style="background:rgba(255,255,255,0.7); padding:15px; border-radius:8px; border:1px solid #ddd;">
                    <h4 style="margin:0 0 10px 0; color:#8c5642;">👤 Datos del Cliente</h4>
                    <p style="margin:5px 0; font-size:14px;"><strong>Nombre:</strong> ${p.nombre}</p>
                    <p style="margin:5px 0; font-size:14px;"><strong>DNI:</strong> ${p.dni || '-'}</p>
                    <p style="margin:5px 0; font-size:14px;"><strong>Celular:</strong> ${p.celular}</p>
                    <hr style="border:0; border-top:1px dashed #ccc; margin:15px 0;">
                    <h4 style="margin:0 0 10px 0; color:#8c5642;">📦 Datos de Envío</h4>
                    <p style="margin:5px 0; font-size:14px;"><strong>Destino:</strong> ${p.localidad}, ${p.provincia} (CP: ${p.cp || '-'})</p>
                    <p style="margin:5px 0; font-size:14px;"><strong>Dirección:</strong> ${p.direccion}</p>
                    <p style="margin:5px 0; font-size:14px;"><strong>Método:</strong> ${p.tipoEnvio || '-'}</p>
                </div>
                <div style="background:rgba(255,255,255,0.7); padding:15px; border-radius:8px; border:1px solid #ddd;">
                    <h4 style="margin:0 0 10px 0; color:#8c5642;">⚙️ Detalles de Fabricación</h4>
                    <p style="margin:5px 0; font-size:14px;"><strong>Medida:</strong> ${p.medida} (${p.posicion})</p>
                    <p style="margin:5px 0; font-size:14px;"><strong>Pintura Frente:</strong> ${p.frente}</p>
                    <p style="margin:5px 0; font-size:14px;"><strong>Pintura Fondo:</strong> ${p.fondo}</p>
                    <p style="margin:5px 0; font-size:14px;"><strong>Modelo Elegido:</strong> ${p.modelo || 'Pendiente'}</p>
                    <div style="background:#fdfcf8; border:1px solid #d4af37; padding:8px; border-radius:4px; margin-top:10px;">
                        <strong style="font-size:11px; color:#8c5642; display:block;">TEXTO A CALAR:</strong>
                        <span style="font-family:monospace; font-size:15px; font-weight:bold;">${p.textos}</span>
                    </div>
                </div>
            </div>
            
            
            <div style="margin-top:20px; background:rgba(248, 249, 250, 0.8); padding:15px; border-radius:8px; border-left:5px solid ${colorTxt};">
                <p style="margin:5px 0; font-size:14px;"><strong>ZONA DE PLANTA:</strong> <span style="background:${colorBg}; color:${colorTxt}; padding:3px 8px; border-radius:4px; font-weight:bold;">${zonaLimpia}</span></p>
                <p style="margin:5px 0; font-size:14px; color:#666;"><strong>Paso Interno:</strong> ${p.estado}</p>
                <p style="margin:10px 0 5px 0; font-size:14px;"><strong>Avance de Taller (Tildes):</strong> ${p.progreso || 'Ninguno todavía'}</p>
                <p style="margin:10px 0 0 0; font-size:14px; color:${p.observaciones && p.observaciones.trim() !== '' ? '#dc3545' : '#28a745'};"><strong>📝 Notas/Errores:</strong> ${p.observaciones || 'Sin errores registrados.'}</p>
            </div>

            <div style="margin-top:20px; display:flex; gap:10px; flex-wrap:wrap;">
                <button onclick="imprimirFicha('${p.id}')" style="background:#1a1a1a; color:#d4af37; padding:10px 15px; border-radius:4px; text-decoration:none; font-size:12px; font-weight:900; box-shadow:0 3px 6px rgba(0,0,0,0.2); border:none; cursor:pointer; transition:0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">🖨️ IMPRIMIR FICHA</button>
                
                ${p.linkPdf ? `<a href="${p.linkPdf}" target="_blank" style="background:#dc3545; color:white; padding:10px 15px; border-radius:4px; text-decoration:none; font-size:12px; font-weight:bold; box-shadow:0 3px 6px rgba(0,0,0,0.1);">📄 VER PDF</a>` : ''}
                ${p.linkDxf ? `<a href="${p.linkDxf}" target="_blank" style="background:#007bff; color:white; padding:10px 15px; border-radius:4px; text-decoration:none; font-size:12px; font-weight:bold; box-shadow:0 3px 6px rgba(0,0,0,0.1);">⚙️ VER DXF</a>` : ''}
                ${p.linkRotulo ? `<a href="${p.linkRotulo}" target="_blank" style="background:#28a745; color:white; padding:10px 15px; border-radius:4px; text-decoration:none; font-size:12px; font-weight:bold; box-shadow:0 3px 6px rgba(0,0,0,0.1);">🏷️ VER RÓTULO</a>` : ''}
            </div>

        </div>
    `;
    // ... (sigue el código para mostrar el modal) ...
    modalOverlay.style.display = "flex";
    document.body.style.overflow = "hidden"; 
    setTimeout(() => { modalOverlay.classList.add("mostrar"); }, 10);
}

function cerrarDetalle() {
    const modalOverlay = document.getElementById("modal-overlay-aurea");
    if (modalOverlay) {
        modalOverlay.classList.remove("mostrar");
        setTimeout(() => { modalOverlay.style.display = "none"; document.body.style.overflow = "auto"; }, 300);
    }
}
// ==========================================
// GENERADOR DE HOJA DE RUTA (FICHA DE PRODUCCIÓN)
// ==========================================
function imprimirFicha(idBuscado) {
    const p = pedidosGlobales.find(pedido => pedido.id === idBuscado);
    if (!p) return;

    // Abre una pestaña nueva invisible
    const ventana = window.open('', '_blank');
    
    // Plantilla HTML optimizada para impresoras (Blanco, Negro y grises)
    const plantilla = `
        <html>
        <head>
            <title>Ficha Producción - ${p.id}</title>
            <style>
                body { font-family: 'Arial', sans-serif; padding: 20px; color: #000; margin: 0; }
                .contenedor { max-width: 800px; margin: 0 auto; border: 2px solid #000; padding: 20px; }
                .cabecera { text-align: center; border-bottom: 3px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
                .cabecera h1 { margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px; }
                .cabecera h2 { margin: 5px 0 0 0; font-size: 32px; font-family: monospace; }
                .seccion { border: 1px solid #000; margin-bottom: 15px; border-radius: 4px; overflow: hidden; }
                .titulo-seccion { background: #e0e0e0; font-weight: bold; padding: 8px 15px; border-bottom: 1px solid #000; font-size: 14px; text-transform: uppercase; }
                .contenido-seccion { padding: 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px; }
                .fila-completa { grid-column: span 2; }
                .caja-textos { margin: 20px; padding: 20px; border: 3px dashed #000; text-align: center; }
                .caja-textos strong { display: block; margin-bottom: 10px; font-size: 12px; text-transform: uppercase; color: #555; }
                .caja-textos span { font-family: monospace; font-size: 28px; font-weight: bold; text-transform: uppercase; }
                @media print {
                    body { -webkit-print-color-adjust: exact; }
                }
            </style>
        </head>
        <body>
            <div class="contenedor">
                <div class="cabecera">
                    <h1>ÁUREA DECO - ORDEN DE TRABAJO</h1>
                    <h2>${p.id}</h2>
                </div>

                <div class="seccion">
                    <div class="titulo-seccion">👤 Cliente y Logística</div>
                    <div class="contenido-seccion">
                        <div><strong>Nombre:</strong> ${p.nombre}</div>
                        <div><strong>Celular:</strong> ${p.celular}</div>
                        <div><strong>DNI:</strong> ${p.dni || '-'}</div>
                        <div><strong>Método:</strong> ${p.tipoEnvio || '-'}</div>
                        <div class="fila-completa"><strong>Destino:</strong> ${p.localidad}, ${p.provincia} (CP: ${p.cp || '-'})</div>
                        <div class="fila-completa"><strong>Dirección Física:</strong> ${p.direccion}</div>
                    </div>
                </div>

                <div class="seccion">
                    <div class="titulo-seccion">⚙️ Fabricación y Pintura</div>
                    <div class="contenido-seccion">
                        <div><strong>Medida:</strong> ${p.medida} (${p.posicion})</div>
                        <div><strong>Opción Elegida:</strong> ${p.modelo || 'Pendiente'}</div>
                        <div><strong>Color Frente:</strong> ${p.frente}</div>
                        <div><strong>Color Fondo:</strong> ${p.fondo}</div>
                    </div>
                    
                    <div class="caja-textos">
                        <strong>Texto Exacto a Calar / Diseñar:</strong>
                        <span>${p.textos}</span>
                    </div>
                </div>
            </div>
            
            <script>
                // Dispara la impresión automáticamente en cuanto carga
                window.onload = function() { 
                    window.print(); 
                    // Opcional: cierra la pestaña solita después de imprimir
                    // setTimeout(window.close, 500); 
                }
            </script>
        </body>
        </html>
    `;

    // Escribe la plantilla en la pestaña nueva
    ventana.document.write(plantilla);
    ventana.document.close();
}

document.addEventListener("DOMContentLoaded", cargarTablero);
setInterval(cargarTablero, 30000);