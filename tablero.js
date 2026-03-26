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
        pedidosAMostrar = pedidosGlobales.filter(p => p.estado !== "Entregado");
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
                        <strong style="color: #333; font-size:10px; text-transform:uppercase;">📝 Estado:</strong><br>
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
        const pedidosActivos = datos.filter(p => p.estado !== "Entregado");
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

          <div style="margin-top:25px; display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px; border-top: 1px solid rgba(0,0,0,0.1); padding-top: 20px;">
                
                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                    <button onclick="editarPedido('${p.id}')" style="background:#ffc107; color:#1a1a1a; padding:10px 15px; border-radius:4px; text-decoration:none; font-size:12px; font-weight:900; box-shadow:0 3px 6px rgba(0,0,0,0.1); border:none; cursor:pointer;">✏️ EDITAR</button>
                    
                    <button onclick="borrarPedido('${p.id}')" style="background:#dc3545; color:white; padding:10px 15px; border-radius:4px; text-decoration:none; font-size:12px; font-weight:900; box-shadow:0 3px 6px rgba(0,0,0,0.1); border:none; cursor:pointer;">🗑️ ELIMINAR</button>

                    <button onclick="marcarEntregado('${p.id}')" style="background:#20c997; color:white; padding:10px 15px; border-radius:4px; text-decoration:none; font-size:12px; font-weight:900; box-shadow:0 3px 6px rgba(0,0,0,0.2); border:none; cursor:pointer; transition:0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">📦 MARCAR COMO ENTREGADO</button>
                </div>

                <div style="display:flex; gap:10px;">
                    <button onclick="imprimirFicha('${p.id}')" style="background:#1a1a1a; color:#d4af37; padding:10px 15px; border-radius:4px; text-decoration:none; font-size:12px; font-weight:900; box-shadow:0 3px 6px rgba(0,0,0,0.2); border:none; cursor:pointer; transition:0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">🖨️ IMPRIMIR FICHA</button>
                    
                    ${p.linkPdf ? `<a href="${p.linkPdf}" target="_blank" style="background:#6c757d; color:white; padding:10px 15px; border-radius:4px; text-decoration:none; font-size:12px; font-weight:bold; box-shadow:0 3px 6px rgba(0,0,0,0.1);">📄 PDF</a>` : ''}
                    ${p.linkDxf ? `<a href="${p.linkDxf}" target="_blank" style="background:#007bff; color:white; padding:10px 15px; border-radius:4px; text-decoration:none; font-size:12px; font-weight:bold; box-shadow:0 3px 6px rgba(0,0,0,0.1);">⚙️ DXF</a>` : ''}
                </div>
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
// GENERADOR DE FICHA DE INGRESO (ORDEN DE TRABAJO EXACTA)
// ==========================================
function imprimirFicha(idBuscado) {
    const p = pedidosGlobales.find(pedido => pedido.id === idBuscado);
    if (!p) return;

    // Formato de fecha YYYY-MM-DD igual al de tu imagen
    let fechaIngreso = "S/D";
    if(p.fecha) {
        try { 
            const d = new Date(p.fecha);
            fechaIngreso = d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,'0') + "-" + String(d.getDate()).padStart(2,'0');
        } catch(e){}
    }

    // Si el modelo ya dice "OPCIÓN", lo dejamos, sino se lo agregamos
    let textoModelo = 'S/D';
    if(p.modelo) {
        textoModelo = String(p.modelo).toUpperCase().includes('OPCIÓN') ? p.modelo : 'OPCIÓN ' + p.modelo;
    }

    const ventana = window.open('', '_blank');
    
    const plantilla = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Ficha - ${p.id}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap');
                
                body { font-family: 'Montserrat', 'Arial', sans-serif; margin: 0; padding: 40px; color: #000; background: #fff; }
                .hoja { max-width: 800px; margin: 0 auto; }
                
                /* HEADER */
                .grid-header { display: grid; grid-template-columns: 25% 45% 30%; border: 4px solid #1a1a1a; }
                .logo-caja { padding: 15px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; }
                
                /* Logo dibujado en CSS para evitar que se rompa al imprimir */
                .circulo-logo { width: 100px; height: 100px; background: #8c5642; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #fff; margin-bottom: 5px; border: 1px solid #fff; box-shadow: 0 0 0 1px #8c5642;}
                .circulo-logo .aurea { font-family: 'Georgia', serif; font-size: 24px; margin-bottom: 2px; }
                .circulo-logo .obj { font-size: 7px; text-transform: uppercase; letter-spacing: 1px; }
                .logo-texto-abajo { font-size: 10px; font-weight: 900; text-transform: uppercase; margin-top: 5px; }
                
                .datos-header { border-left: 4px solid #1a1a1a; border-right: 4px solid #1a1a1a; padding: 20px 25px; display: flex; flex-direction: column; justify-content: center; gap: 20px; }
                .dato-h { display: flex; align-items: baseline; justify-content: space-between; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
                .dato-h .lbl { font-size: 11px; font-weight: 900; }
                .dato-h .val-id { font-size: 20px; font-weight: 900; color: #a04000; } 
                .dato-h .val-fec { font-size: 16px; font-weight: 900; }
                
                .titulo-header { background: #1a1a1a; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 900; text-align: center; line-height: 1.2; padding: 20px; }

                /* TITULOS SECCION */
                .titulo-seccion { background: #1a1a1a; color: #fff; padding: 8px 15px; font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; border-left: 4px solid #1a1a1a; border-right: 4px solid #1a1a1a; margin-top: -4px;}

                /* SECCION CLIENTE */
                .seccion-cliente { border: 4px solid #1a1a1a; border-top: none; }
                .fila { border-bottom: 1px solid #666; padding: 10px 15px; display: flex; align-items: baseline; }
                .fila:last-child { border-bottom: none; }
                .fila.split { display: grid; grid-template-columns: 1fr 1fr; padding: 0; }
                .split > div { padding: 10px 15px; display: flex; align-items: baseline; }
                .split > div:first-child { border-right: 1px solid #666; }
                
                .lbl { font-size: 11px; font-weight: 900; margin-right: 10px; flex-shrink: 0; text-transform: uppercase; }
                .val { font-size: 15px; font-weight: 900; text-transform: uppercase; }

                /* FOOTER GRID (Carteleria + Montos) */
                .grid-footer { display: grid; grid-template-columns: 60% 40%; border: 4px solid #1a1a1a; border-top: none; }
                .col-izq { border-right: 4px solid #1a1a1a; }
                .fila-cart { border-bottom: 1px solid #666; padding: 10px 15px; display: flex; align-items: baseline; }
                .fila-cart .lbl { width: 85px; }
                .caja-texto { padding: 15px; }
                .caja-texto .lbl { margin-bottom: 15px; display: block; font-size: 12px;}
                .caja-texto .val-texto { font-size: 24px; font-family: monospace; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; }
                
                .col-der { display: flex; flex-direction: column; }
                .caja-der { border-bottom: 4px solid #1a1a1a; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; text-align: center; }
                .caja-der:last-child { border-bottom: none; background: #f4f6f9; }
                .caja-der .lbl-der { font-size: 11px; font-weight: 900; text-transform: uppercase; margin-bottom: 15px; }
                .val-monto { font-size: 26px; font-weight: 900; }
                .val-modelo { font-size: 28px; font-weight: 900; color: #007bff; text-transform: uppercase; }
                .val-seg { font-size: 16px; font-weight: 900; color: #0056b3; }
                
                @media print {
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 0; }
                    .hoja { margin: 0; }
                }
            </style>
        </head>
        <body>
            <div class="hoja">
                <div class="grid-header">
                    <div class="logo-caja">
                        <div class="circulo-logo">
                            <div class="aurea">ÁUREA</div>
                            <div class="obj">objetos de diseño</div>
                        </div>
                        <div class="logo-texto-abajo">objetos de diseño</div>
                    </div>
                    <div class="datos-header">
                        <div class="dato-h">
                            <span class="lbl">ID PEDIDO:</span>
                            <span class="val-id">${p.id}</span>
                        </div>
                        <div class="dato-h">
                            <span class="lbl">FECHA DE INGRESO:</span>
                            <span class="val-fec">${fechaIngreso}</span>
                        </div>
                    </div>
                    <div class="titulo-header">
                        FICHA DE<br>PEDIDO
                    </div>
                </div>

                <div class="titulo-seccion">DATOS DEL CLIENTE</div>
                <div class="seccion-cliente">
                    <div class="fila">
                        <span class="lbl">NOMBRE Y APELLIDO:</span>
                        <span class="val">${p.nombre}</span>
                    </div>
                    <div class="fila">
                        <span class="lbl">PROVINCIA:</span>
                        <span class="val">${p.provincia}</span>
                    </div>
                    <div class="fila">
                        <span class="lbl">LOCALIDAD:</span>
                        <span class="val">${p.localidad}</span>
                    </div>
                    <div class="fila">
                        <span class="lbl">DIRECCIÓN:</span>
                        <span class="val">${p.direccion}</span>
                    </div>
                    <div class="fila">
                        <span class="lbl">CÓDIGO POSTAL:</span>
                        <span class="val">${p.cp || ' - '}</span>
                    </div>
                    <div class="fila">
                        <span class="lbl">TELÉFONO:</span>
                        <span class="val">${p.celular}</span>
                    </div>
                    <div class="fila split">
                        <div>
                            <span class="lbl">DNI / CUIT:</span>
                            <span class="val">${p.dni || ' - '}</span>
                        </div>
                        <div>
                            <span class="lbl" style="width: 50px;">ENVÍO:</span>
                            <span class="val">${p.tipoEnvio || ' - '}</span>
                        </div>
                    </div>
                </div>

                <div class="titulo-seccion">CARTELERÍA</div>
                <div class="grid-footer">
                    <div class="col-izq">
                        <div class="fila-cart">
                            <span class="lbl">POSICIÓN:</span>
                            <span class="val">${p.posicion || ' - '}</span>
                        </div>
                        <div class="fila-cart">
                            <span class="lbl">MEDIDAS:</span>
                            <span class="val">${p.medida}</span>
                        </div>
                        <div class="fila-cart">
                            <span class="lbl">FONDO:</span>
                            <span class="val">${p.fondo}</span>
                        </div>
                        <div class="fila-cart">
                            <span class="lbl">FRENTE:</span>
                            <span class="val">${p.frente}</span>
                        </div>
                        <div class="caja-texto">
                            <span class="lbl">DATOS / TEXTO:</span>
                            <div class="val-texto">${p.textos.replace(/\n/g, '<br>')}</div>
                        </div>
                    </div>
                    
                    <div class="col-der">
                        <div class="caja-der">
                            <div class="lbl-der">MONTO A FACTURAR</div>
                            <div class="val-monto">${p.monto && p.monto !== "" ? '$' + p.monto : 'S/D'}</div>
                        </div>
                        <div class="caja-der">
                            <div class="lbl-der">MODELO CONFIRMADO</div>
                            <div class="val-modelo">${textoModelo}</div>
                        </div>
                        <div class="caja-der">
                            <div class="lbl-der">SEGUIMIENTO DE ENVÍO</div>
                            <div class="val-seg">Sin Seguimiento</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <script>
                // Dispara impresión apenas termina de "dibujar" el HTML
                window.onload = function() { window.print(); }
            </script>
        </body>
        </html>
    `;

    ventana.document.write(plantilla);
    ventana.document.close();
}
// ==========================================
// MÓDULO DE ADMINISTRACIÓN (V3 FINAL)
// ==========================================

function borrarPedido(idPedido) {
    if (confirm(`⚠️ Vas a ELIMINAR el pedido ${idPedido}.\n\n¿Estás seguro?`)) {
        cerrarDetalle();
        
        fetch(urlAppsScript, {
            method: 'POST',
            body: JSON.stringify({ accion: "borrar", id: idPedido })
        })
        .then(() => {
            // Recarga obligatoria para limpiar la tabla
            setTimeout(() => {
                alert("✅ Pedido eliminado.");
                cargarTablero(); 
            }, 1000);
        })
        .catch(() => alert("Error: Revisá que tu Apps Script esté en 'Cualquier Persona'"));
    }
}

// Abre la ventana de edición (La interfaz queda igual)
function editarPedido(idBuscado) {
    const p = pedidosGlobales.find(pedido => pedido.id === idBuscado);
    if (!p) return;

    cerrarDetalle();

    let modalOverlay = document.getElementById("modal-edicion-aurea");
    if (!modalOverlay) {
        modalOverlay = document.createElement("div");
        modalOverlay.id = "modal-edicion-aurea";
        modalOverlay.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:10000; display:flex; justify-content:center; align-items:center; padding:20px; box-sizing:border-box;";
        document.body.appendChild(modalOverlay);
    }

    modalOverlay.innerHTML = `
        <div style="background:#fffcf5; border: 2px solid #d4af37; width:100%; max-width:500px; border-radius:8px; padding:30px; position:relative; font-family:'Montserrat', sans-serif;">
            <h2 style="margin-top:0; border-bottom:3px solid #1a1a1a; padding-bottom:10px;">✏️ EDITAR: ${p.id}</h2>
            <div style="display:flex; flex-direction:column; gap:15px; margin-top:20px;">
                <div><label>Nombre:</label><br><input type="text" id="edit-nombre" value="${p.nombre || ''}" style="width:100%; padding:8px;"></div>
                <div><label>Celular:</label><br><input type="text" id="edit-celular" value="${p.celular || ''}" style="width:100%; padding:8px;"></div>
                <div><label>Textos:</label><br><textarea id="edit-textos" rows="2" style="width:100%; padding:8px;">${p.textos || ''}</textarea></div>
                <div><label>Estado:</label><br>
                    <select id="edit-estado" style="width:100%; padding:8px;">
                        <option value="${p.estado}" selected>Actual: ${p.estado}</option>
                        <option value="Pendiente">Pendiente</option>
                        <option value="Esperando Diseño">Esperando Diseño</option>
                        <option value="Listo para Corte CNC">Listo para Corte CNC</option>
                        <option value="En Pintura / Armado">En Pintura / Armado</option>
                        <option value="Embalaje y Despacho">Embalaje y Despacho</option>
                    </select>
                </div>
                <div><label>Notas:</label><br><textarea id="edit-observaciones" rows="2" style="width:100%; padding:8px;">${p.observaciones || ''}</textarea></div>
            </div>
            <div style="margin-top:20px; display:flex; justify-content:flex-end; gap:10px;">
                <button onclick="document.getElementById('modal-edicion-aurea').style.display='none'" style="padding:10px; cursor:pointer;">CANCELAR</button>
                <button onclick="guardarEdicion('${p.id}')" style="background:#28a745; color:white; padding:10px; border:none; cursor:pointer;">💾 GUARDAR</button>
            </div>
        </div>
    `;
    modalOverlay.style.display = "flex";
}

// Dispara el guardado
function guardarEdicion(idBuscado) {
    document.getElementById("modal-edicion-aurea").style.display = "none";
    
    fetch(urlAppsScript, {
        method: 'POST',
        body: JSON.stringify({
            accion: "editar",
            id: idBuscado,
            datos: {
                nombre: document.getElementById("edit-nombre").value,
                celular: document.getElementById("edit-celular").value,
                textos: document.getElementById("edit-textos").value,
                estado: document.getElementById("edit-estado").value,
                observaciones: document.getElementById("edit-observaciones").value
            }
        })
    })
    .then(() => {
        setTimeout(() => {
            alert("✅ Pedido actualizado.");
            cargarTablero(); 
        }, 1000);
    })
    .catch(() => alert("Error: Revisá que tu Apps Script esté en 'Cualquier Persona'"));
}
// ==========================================
// MÓDULO LOGÍSTICA: MARCAR ENTREGADO (ARCHIVAR)
// ==========================================
function marcarEntregado(idPedido) {
    if (confirm(`📦 ¿Confirmás que el pedido ${idPedido} ya fue ENTREGADO al cliente?\n\nEsto lo retirará de la planta y borrará la fila de la base de datos activa.`)) {
        cerrarDetalle();
        
        // Enviamos la misma orden de "borrar" al Apps Script que armamos antes
        fetch(urlAppsScript, {
            method: 'POST',
            redirect: 'follow',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ accion: "borrar", id: idPedido })
        })
        .then(() => {
            setTimeout(() => {
                alert("🎉 ¡Excelente! Pedido entregado y archivado exitosamente.");
                cargarTablero(); 
            }, 1000);
        })
        .catch(() => alert("Error de conexión al intentar archivar el pedido."));
    }
}
document.addEventListener("DOMContentLoaded", cargarTablero);
setInterval(cargarTablero, 30000);