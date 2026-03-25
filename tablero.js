const urlAppsScript = "https://script.google.com/macros/s/AKfycbxC4Q2rPVwBMbdBdEhQVCIjPm_YxPucKJ6eS0fcKL1we734KNuCusPWzWnydWcyyP4Nyw/exec"; 

let pedidosGlobales = []; 

// ==========================================
// CÁLCULO DE TIEMPO Y SEMÁFORO
// ==========================================
function calcularSemaforo(fechaCruda) {
    if (!fechaCruda) return "<span style='color:#999'>Sin fecha</span>";
    try {
        const fechaIngreso = new Date(fechaCruda);
        const hoy = new Date();
        const diferenciaTiempo = hoy.getTime() - fechaIngreso.getTime();
        const diasTranscurridos = Math.floor(diferenciaTiempo / (1000 * 3600 * 24));

        let colorFondo = "#28a745"; let colorTexto = "white"; let estadoTiempo = "A Tiempo";
        
        if (diasTranscurridos >= 10) { colorFondo = "#dc3545"; estadoTiempo = "Demorado"; } 
        else if (diasTranscurridos >= 7) { colorFondo = "#ffc107"; colorTexto = "#333"; estadoTiempo = "Atención"; }

        const fechaFormateada = fechaIngreso.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });

        return `
            <div style="display:flex; flex-direction:column; align-items:flex-start; gap:6px;">
                <span style="font-size:12px; font-weight:600; color:#888;">Ingresó el ${fechaFormateada}</span>
                <span style="background:${colorFondo}; color:${colorTexto}; padding:4px 8px; border-radius:6px; font-size:11px; font-weight:800; letter-spacing:0.5px;">
                    ⏳ ${diasTranscurridos} DÍAS - ${estadoTiempo.toUpperCase()}
                </span>
            </div>
        `;
    } catch(e) { return fechaCruda; }
}

// ==========================================
// CARGA DEL TABLERO
// ==========================================
function cargarTablero() {
    fetch(urlAppsScript).then(res => res.json()).then(datos => {
        pedidosGlobales = datos; 
        
        const tbody = document.getElementById("cuerpo-tabla");
        document.getElementById("cargando").style.display = "none";
        document.getElementById("tabla-pedidos").style.display = "table";
        tbody.innerHTML = "";
        
        const pedidosActivos = datos.filter(p => p.estado !== "Finalizado / Despachado");

        if (pedidosActivos.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 30px; color: #28a745; font-weight: bold;">Planta al día. No hay órdenes activas.</td></tr>`;
            return;
        }

        pedidosActivos.forEach(p => {
            // 🧠 TRADUCTOR AUTOMÁTICO DE ZONAS DE PLANTA
            let zonaPlanta = p.estado;
            let colorBg = "#eee"; let colorTxt = "#333";
            
            if(p.estado.includes("Diseño") || p.estado.includes("DXF") || p.estado === "Pendiente") { 
                zonaPlanta = "🏢 OFICINA";
                colorBg = "#fff3cd"; colorTxt = "#856404"; 
            }
            else if(p.estado.includes("Corte") || p.estado.includes("Taller")) { 
                zonaPlanta = "⚙️ FÁBRICA";
                colorBg = "#cce5ff"; colorTxt = "#004085"; 
            }
            else if(p.estado.includes("Despacho") || p.estado.includes("Finalizado")) { 
                zonaPlanta = "📦 DESPACHO";
                colorBg = "#d4edda"; colorTxt = "#155724"; 
            }

            let textoProgreso = p.progreso && p.progreso.trim() !== "" ? p.progreso.replace(/,/g, " ✔️<br>") + " ✔️" : "Esperando inicio...";

            tbody.innerHTML += `
                <tr onclick="abrirDetalle('${p.id}', '${zonaPlanta}', '${colorBg}', '${colorTxt}')" style="cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#f4f4f4'" onmouseout="this.style.background='transparent'" title="Hacé clic para ver toda la información">
                    <td style="font-weight:800; color:#888; vertical-align: top;">${p.id}</td>
                    <td style="vertical-align: top;"><strong>${p.nombre}</strong></td>
                    <td style="vertical-align: top;">${p.medida} <br><small style="color:#666;">Mod: ${p.modelo}</small></td>
                    <td style="vertical-align: top;">
                        <span style="background:${colorBg}; color:${colorTxt}; display:inline-block; margin-bottom:2px; padding:4px 8px; border-radius:4px; font-weight:bold; font-size:12px; letter-spacing:0.5px;">${zonaPlanta}</span>
                        <div style="font-size: 10px; color: #888; margin-bottom: 8px; font-style: italic;">Paso: ${p.estado}</div>
                        
                        <div style="font-size: 11px; color: #555; background: #fff; padding: 6px; border-left: 3px solid ${colorTxt}; margin-bottom: 8px;">
                            <strong>Avance:</strong><br>${textoProgreso}
                        </div>
                        
                        <div style="font-size: 11px; background: #fdfcf8; padding: 6px; border: 1px solid #eee; border-radius: 4px; max-width: 200px;">
                            <strong style="color: #333;">📝 Notas:</strong><br>
                            <span style="color: ${p.observaciones && p.observaciones.trim() !== '' ? '#dc3545' : '#28a745'}; font-weight: bold;">
                                ${p.observaciones && p.observaciones.trim() !== '' ? p.observaciones : '✅ SIN ERRORES'}
                            </span>
                        </div>
                    </td>
                    <td style="vertical-align: top;">${calcularSemaforo(p.fecha)}</td>
                </tr>
            `;
        });
    });
}

// ==========================================
// VENTANA FLOTANTE (MODAL) DE DETALLES
// ==========================================
function abrirDetalle(idBuscado, zonaPlanta, colorBg, colorTxt) {
    const p = pedidosGlobales.find(pedido => pedido.id === idBuscado);
    if (!p) return;

    let modalOverlay = document.getElementById("modal-overlay-aurea");
    if (!modalOverlay) {
        modalOverlay = document.createElement("div");
        modalOverlay.id = "modal-overlay-aurea";
        modalOverlay.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; display:flex; justify-content:center; align-items:center; padding:20px; box-sizing:border-box;";
        modalOverlay.onclick = function(e) { if(e.target === modalOverlay) cerrarDetalle(); };
        document.body.appendChild(modalOverlay);
    }

    modalOverlay.innerHTML = `
        <div style="background:#fffcf5; width:100%; max-width:700px; max-height:90vh; overflow-y:auto; border-radius:12px; padding:30px; box-shadow:0 10px 30px rgba(0,0,0,0.5); position:relative; font-family:'Montserrat', sans-serif;">
            
            <button onclick="cerrarDetalle()" style="position:absolute; top:20px; right:20px; background:#dc3545; color:white; border:none; border-radius:50%; width:35px; height:35px; font-size:16px; font-weight:bold; cursor:pointer; box-shadow:0 2px 5px rgba(0,0,0,0.2);">X</button>
            
            <h2 style="margin-top:0; color:var(--antracita); border-bottom:3px solid var(--dorado); padding-bottom:10px;">📋 FICHA TÉCNICA: ${p.id}</h2>
            
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:20px; margin-top:20px;">
                
                <div style="background:white; padding:15px; border-radius:8px; border:1px solid #ddd;">
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

                <div style="background:white; padding:15px; border-radius:8px; border:1px solid #ddd;">
                    <h4 style="margin:0 0 10px 0; color:#8c5642;">⚙️ Detalles de Fabricación</h4>
                    <p style="margin:5px 0; font-size:14px;"><strong>Medida:</strong> ${p.medida} (${p.posicion})</p>
                    <p style="margin:5px 0; font-size:14px;"><strong>Pintura Frente:</strong> ${p.frente}</p>
                    <p style="margin:5px 0; font-size:14px;"><strong>Pintura Fondo:</strong> ${p.fondo}</p>
                    <p style="margin:5px 0; font-size:14px;"><strong>Modelo Elegido:</strong> ${p.modelo || 'Pendiente'}</p>
                    <div style="background:#fdfcf8; border:1px solid var(--dorado); padding:8px; border-radius:4px; margin-top:10px;">
                        <strong style="font-size:11px; color:var(--oxido); display:block;">TEXTO A CALAR:</strong>
                        <span style="font-family:monospace; font-size:15px; font-weight:bold;">${p.textos}</span>
                    </div>
                </div>
            </div>

            <div style="margin-top:20px; background:#f8f9fa; padding:15px; border-radius:8px; border-left:5px solid ${colorTxt};">
                <p style="margin:5px 0; font-size:14px;"><strong>ZONA DE PLANTA:</strong> <span style="background:${colorBg}; color:${colorTxt}; padding:3px 8px; border-radius:4px; font-weight:bold;">${zonaPlanta}</span></p>
                <p style="margin:5px 0; font-size:14px; color:#666;"><strong>Paso Interno:</strong> ${p.estado}</p>
                <p style="margin:10px 0 5px 0; font-size:14px;"><strong>Avance de Taller (Tildes):</strong> ${p.progreso || 'Ninguno todavía'}</p>
                <p style="margin:10px 0 0 0; font-size:14px; color:${p.observaciones ? '#dc3545' : '#28a745'};"><strong>📝 Notas/Errores:</strong> ${p.observaciones || 'Sin errores registrados.'}</p>
            </div>

            <div style="margin-top:20px; display:flex; gap:10px; flex-wrap:wrap;">
                ${p.linkPdf ? `<a href="${p.linkPdf}" target="_blank" style="background:#dc3545; color:white; padding:8px 15px; border-radius:4px; text-decoration:none; font-size:12px; font-weight:bold;">📄 VER PDF</a>` : ''}
                ${p.linkDxf ? `<a href="${p.linkDxf}" target="_blank" style="background:#007bff; color:white; padding:8px 15px; border-radius:4px; text-decoration:none; font-size:12px; font-weight:bold;">⚙️ VER DXF</a>` : ''}
                ${p.linkRotulo ? `<a href="${p.linkRotulo}" target="_blank" style="background:#28a745; color:white; padding:8px 15px; border-radius:4px; text-decoration:none; font-size:12px; font-weight:bold;">🏷️ VER RÓTULO</a>` : ''}
            </div>

        </div>
    `;
    modalOverlay.style.display = "flex";
    document.body.style.overflow = "hidden"; 
}

function cerrarDetalle() {
    const modalOverlay = document.getElementById("modal-overlay-aurea");
    if (modalOverlay) modalOverlay.style.display = "none";
    document.body.style.overflow = "auto"; 
}

document.addEventListener("DOMContentLoaded", cargarTablero);
setInterval(cargarTablero, 30000);