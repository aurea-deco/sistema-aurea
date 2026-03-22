const urlAppsScript = "https://script.google.com/macros/s/AKfycbxC4Q2rPVwBMbdBdEhQVCIjPm_YxPucKJ6eS0fcKL1we734KNuCusPWzWnydWcyyP4Nyw/exec"; 

// ==========================================
// CÁLCULO DE TIEMPO Y SEMÁFORO
// ==========================================
function calcularSemaforo(fechaCruda) {
    if (!fechaCruda) return "<span style='color:#999'>Sin fecha</span>";
    
    try {
        // Leemos la fecha de ingreso
        const fechaIngreso = new Date(fechaCruda);
        const hoy = new Date();
        
        // Calculamos la diferencia en días
        const diferenciaTiempo = hoy.getTime() - fechaIngreso.getTime();
        const diasTranscurridos = Math.floor(diferenciaTiempo / (1000 * 3600 * 24));

        // Lógica del Semáforo (Podés cambiar los números 7 y 10)
        let colorFondo = "#28a745"; // Verde (Bien)
        let colorTexto = "white";
        let estadoTiempo = "A Tiempo";
        
        if (diasTranscurridos >= 10) {
            colorFondo = "#dc3545"; // Rojo (Demorado)
            estadoTiempo = "Demorado";
        } else if (diasTranscurridos >= 7) {
            colorFondo = "#ffc107"; // Amarillo (Precaución)
            colorTexto = "#333";
            estadoTiempo = "Atención";
        }

        const fechaFormateada = fechaIngreso.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });

        return `
            <div style="display:flex; flex-direction:column; align-items:flex-start; gap:6px;">
                <span style="font-size:12px; font-weight:600; color:#888;">Ingresó el ${fechaFormateada}</span>
                <span style="background:${colorFondo}; color:${colorTexto}; padding:4px 8px; border-radius:6px; font-size:11px; font-weight:800; letter-spacing:0.5px;">
                    ⏳ ${diasTranscurridos} DÍAS - ${estadoTiempo.toUpperCase()}
                </span>
            </div>
        `;
    } catch(e) { 
        return fechaCruda; 
    }
}

// ==========================================
// CARGA DEL TABLERO
// ==========================================
function cargarTablero() {
    fetch(urlAppsScript).then(res => res.json()).then(datos => {
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
            // Colores por etapa de producción
            let colorBg = "#eee"; let colorTxt = "#333";
            if(p.estado.includes("Diseño")) { colorBg = "#fff3cd"; colorTxt = "#856404"; }
            else if(p.estado.includes("DXF")) { colorBg = "#cce5ff"; colorTxt = "#004085"; }
            else if(p.estado.includes("Corte")) { colorBg = "#f8d7da"; colorTxt = "#721c24"; }
            else if(p.estado.includes("Despacho")) { colorBg = "#d4edda"; colorTxt = "#155724"; }

            tbody.innerHTML += `
                <tr>
                    <td style="font-weight:800; color:#888;">${p.id}</td>
                    <td><strong>${p.nombre}</strong></td>
                    <td>${p.medida} <br><small style="color:#666;">Mod: ${p.modelo}</small></td>
                    <td><span class="etiqueta-estado" style="background:${colorBg}; color:${colorTxt};">${p.estado}</span></td>
                    <td>${calcularSemaforo(p.fecha)}</td>
                </tr>
            `;
        });
    });
}

document.addEventListener("DOMContentLoaded", cargarTablero);
setInterval(cargarTablero, 30000);