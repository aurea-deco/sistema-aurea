const urlAppsScript = "https://script.google.com/macros/s/AKfycbxC4Q2rPVwBMbdBdEhQVCIjPm_YxPucKJ6eS0fcKL1we734KNuCusPWzWnydWcyyP4Nyw/exec";  

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

document.addEventListener("DOMContentLoaded", () => {
    cargarDatos();
    setInterval(cargarDatos, 30000);
});

function cargarDatos() {
    const urlFresca = urlAppsScript + "?t=" + new Date().getTime();
    fetch(urlFresca).then(res => res.json()).then(pedidos => renderizarTarjetas(pedidos));
}

function renderizarTarjetas(pedidos) {
    const contenedor = document.getElementById("contenedor-tarjetas");
    if (!contenedor) return;
    
    // Filtramos los que dicen "Esperando Diseño" Y tienen PDF
    const pendientes = pedidos.filter(p => p.estado === "Esperando Diseño" && p.linkPdf && p.linkPdf.includes("http"));

    if (document.getElementById("cargando")) document.getElementById("cargando").style.display = "none";
    contenedor.innerHTML = "";

    if (pendientes.length === 0) {
        contenedor.innerHTML = "<h3 style='color:#666; text-align:center; width:100%;'>No hay pedidos confirmados con PDF aún.</h3>";
        return;
    }

    pendientes.forEach(p => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "tarjeta-aurea";
        tarjeta.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="id-pedido">${p.id}</span>
                ${obtenerSemaforo(p.fecha, p.estado)}
            </div>
            <h3>📏 ${p.medida} <small>(${p.posicion})</small></h3>
            <p>👤 <strong>${p.nombre}</strong></p>
            <div class="caja-resaltada"><strong>TEXTO:</strong> ${p.textos}</div>
            <a href="${p.linkPdf}" target="_blank" class="btn-aurea">📥 VER PDF</a>
            <div style="margin-top:10px; display:grid; grid-template-columns: repeat(3, 1fr); gap:5px;">
                ${[1,2,3,4,5,6].map(n => `<button class="btn-mod" onclick="confirmarModelo(${p.fila}, ${n})">${n}</button>`).join('')}
            </div>
        `;
        contenedor.appendChild(tarjeta);
    });
}

function confirmarModelo(fila, num) {
    if (!confirm(`¿Confirmar Opción ${num}?`)) return;
    fetch(urlAppsScript, {
        method: 'POST',
        body: JSON.stringify({ accion: "actualizar_modelo", fila: fila, modelo: num })
    }).then(() => {
        alert("✅ Enviado a fábrica.");
        cargarDatos();
    });
}