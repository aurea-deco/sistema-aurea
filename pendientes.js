alert("¡HOLA! EL CÓDIGO SÍ ESTÁ CONECTADO");
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

document.addEventListener("DOMContentLoaded", () => {
    cargarDatos();
    setInterval(cargarDatos, 30000); // Se actualiza solo cada 30 segundos
});

function cargarDatos() {
    const urlFresca = urlAppsScript + "?t=" + new Date().getTime();
    
    fetch(urlFresca)
        .then(res => res.json())
        .then(pedidos => {
            // ESTO NOS VA A MOSTRAR LA VERDAD EN LA CONSOLA:
            console.log("🚨 DATOS QUE LLEGARON DE GOOGLE:", pedidos);
            renderizarTarjetas(pedidos);
        })
        .catch(e => {
            console.error("🚨 ERROR GIGANTE AL CARGAR:", e);
            alert("¡Falló la conexión con Google! Apretá F12.");
        });
}
function renderizarTarjetas(pedidos) {
    const contenedor = document.getElementById("contenedor-tarjetas") || document.getElementById("contenedor-pendientes");
    if (document.getElementById("cargando")) document.getElementById("cargando").style.display = "none";

    // --- MODO ESCÁNER INICIO ---
    let htmlDebug = `<div style="background:#111; color:#0f0; padding:20px; border-radius:8px; font-family:monospace; text-align:left; font-size:14px; box-shadow: 0 4px 10px rgba(0,0,0,0.5); width: 100%;">`;
    htmlDebug += `<h3 style="color:#fff; margin-top:0;">🕵️‍♂️ RADIOGRAFÍA DE LA BASE DE DATOS</h3>`;
    htmlDebug += `<p style="color:#aaa;">Si el LinkPDF dice "undefined" o algo raro, el código está leyendo la columna equivocada.</p><hr style="border-color:#333;">`;

    pedidos.forEach(p => {
        // Filtramos para mostrar solo pedidos válidos
        if(p.id && p.id.trim() !== "") {
            htmlDebug += `<div style="margin-bottom:10px; padding-bottom:10px; border-bottom:1px dashed #333;">`;
            htmlDebug += `<strong>ID:</strong> ${p.id} <br>`;
            htmlDebug += `<strong>Estado:</strong> "${p.estado}" <br>`;
            htmlDebug += `<strong>Link PDF:</strong> "${p.linkPdf}"`;
            htmlDebug += `</div>`;
        }
    });
    htmlDebug += `</div>`;
    
    contenedor.innerHTML = htmlDebug;
    // --- MODO ESCÁNER FIN ---
}

// ==========================================
// ENVÍO DE PDF A GRUPO DE WHATSAPP INTERNO
// ==========================================
function enviarWhatsApp(celular, nombre, linkPdf) {
    // 1. Armamos el mensaje con formato para el equipo interno
    let msj = `%0A%0A👤 *Cliente:* ${nombre}%0A📱 *Tel:* ${celular}%0A📄 *Ver PDF:* ${linkPdf}%0A%0A`;

    // 2. Usamos el link universal de WhatsApp SIN número de teléfono.
    // Esto hace que WhatsApp Web/App te abra la lista de tus chats y grupos para que elijas a cuál mandarlo.
    window.open(`https://wa.me/?text=${msj}`, '_blank');
}

function confirmarModelo(fila, num) {
    if (!confirm(`¿Confirmar que el cliente eligió la Opción ${num}? El pedido pasará al Taller para prepararlo en DXF.`)) return;

    document.body.style.cursor = "wait";

    fetch(urlAppsScript, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ accion: "actualizar_modelo", fila: fila, modelo: num })
    }).then(() => {
        document.body.style.cursor = "default";
        alert("✅ Modelo confirmado. Enviado a DXF.");
        cargarDatos();
    }).catch(() => {
        document.body.style.cursor = "default";
        alert("❌ Error de conexión al guardar.");
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
