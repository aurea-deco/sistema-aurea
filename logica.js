// ⚠️ PEGA TU LINK DE APPS SCRIPT ACÁ:
const urlAppsScript = "https://script.google.com/macros/s/AKfycbxC4Q2rPVwBMbdBdEhQVCIjPm_YxPucKJ6eS0fcKL1we734KNuCusPWzWnydWcyyP4Nyw/exec"; 

// ==========================================
// CEREBRO LECTOR V2.1 (AJUSTE SUCURSAL Y FILTROS)
// ==========================================
function procesarTexto() {
    const rawText = document.getElementById("texto-whatsapp").value;
    if (!rawText.trim()) {
        alert("⚠️ Por favor, pegá el texto del mensaje primero.");
        return;
    }

    // 1. Limpieza de basura de WhatsApp y formatos raros
    let textoLimpio = rawText.replace(/\[\d{1,2}:\d{2}.*?\]\s*.*?:/g, "\n"); 
    textoLimpio = textoLimpio.replace(/\n+/g, '\n').trim();

    let lineas = textoLimpio.split('\n').map(l => l.trim()).filter(l => l !== "");

    let nombre = "", dni = "", tel = "", cp = "", prov = "", loc = "", direccion = "";
    let medida = "", posicion = "", textos = "", frente = "", fondo = "";

    // 2. BÚSQUEDA LÍNEA POR LÍNEA
    for (let l of lineas) {
        let soloNumeros = l.replace(/\D/g, ''); 
        
        if (/^\d{7,8}$/.test(l.replace(/\./g, ''))) {
            dni = l.replace(/\./g, '');
        }
        else if (/^\d{4}$/.test(l)) {
            cp = l;
        }
        else if (soloNumeros.length >= 10 && soloNumeros.length <= 14 && l !== dni) {
            tel = l;
        }
    }

    const provincias = ["Buenos Aires", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán", "CABA", "Capital Federal"];
    
    for (let i = 0; i < lineas.length; i++) {
        let l = lineas[i];
        for (let p of provincias) {
            if (new RegExp("\\b" + p + "\\b", "i").test(l)) {
                prov = p;
                if (i > 0 && !/\d/.test(lineas[i-1])) {
                    loc = lineas[i-1];
                }
                break;
            }
        }
    }

    for (let l of lineas) {
        if (/[a-zA-Z]/.test(l) && !/horizontal|vertical|frente|fondo|datos|texto|número|numero|medida|cartel/i.test(l)) {
            if (l !== loc && l.toUpperCase() !== prov.toUpperCase()) {
                nombre = l;
                break; 
            }
        }
    }

    const txtUnido = lineas.join(" | ");

    let matchMedida = txtUnido.match(/\b\d{2,3}\s*[xX*]\s*\d{2,3}\b/);
    if (matchMedida) medida = matchMedida[0].toLowerCase(); 

    let matchPos = txtUnido.match(/\b(Horizontal|Vertical)\b/i);
    if (matchPos) posicion = matchPos[1];

    let matchFondo = txtUnido.match(/Fondo\s*[:\-]?\s*([^|]+)/i);
    if (matchFondo) fondo = matchFondo[1].trim();

    let matchFrente = txtUnido.match(/Frente\s*[:\-]?\s*([^|]+)/i);
    if (matchFrente) frente = matchFrente[1].trim();

    let matchDatos = txtUnido.match(/(?:Datos|Texto|Número|Numero|Detalle)s?\s*[:\-]?\s*([^|]+)/i);
    if (matchDatos) textos = matchDatos[1].trim();

    // CALLE: Excluimos explícitamente las palabras de diseño (Datos, Texto, Número)
    for (let l of lineas) {
        let upperL = l.toUpperCase();
        if (l.length > 5 && l !== nombre && l !== loc && upperL !== prov.toUpperCase() && l !== tel &&
            !upperL.includes("FRENTE") && !upperL.includes("FONDO") && !upperL.includes("CARTEL") && 
            !upperL.includes("HORIZONTAL") && !upperL.includes("VERTICAL") && 
            !upperL.includes("DATOS") && !upperL.includes("TEXTO") && !upperL.includes("NÚMERO") && !upperL.includes("NUMERO") && 
            !/^\d+$/.test(l)) {
            
            direccion = l.split(' y:')[0].replace(/:\s*$/, '').trim();
            break;
        }
    }

    // 3. INYECCIÓN EN EL HTML
    const inyectar = (id, valor) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.innerText = valor ? valor.toUpperCase() : "";
        }
    };

    // LOGICA DE SUCURSAL: Si lee "sucursal", tilda el check y vacía la calle
    if (/sucursal/i.test(txtUnido)) {
        if (document.getElementById("check-sucursal")) {
            document.getElementById("check-sucursal").checked = true;
        }
        direccion = ""; 
    }

    inyectar("nombre-cliente", nombre);
    inyectar("dni", dni);
    inyectar("telefono", tel);
    inyectar("provincia", prov);
    inyectar("localidad", loc);
    inyectar("cp", cp);
    inyectar("calle", direccion); // Ahora si es sucursal, entra vacío
    
    inyectar("medidas", medida);
    inyectar("posicion", posicion);
    inyectar("fondo", fondo);
    inyectar("frente", frente);
    inyectar("datos-cartel", textos);

    inyectar("fecha-ingreso", new Date().toLocaleDateString('es-AR'));

    alert("✅ ¡Auto-completado exitoso! Revisá que todos los datos estén en su lugar.");
}

// 2. GUARDAR EN GOOGLE SHEETS
function guardarPedido() {
    const checkDomicilio = document.getElementById('check-domicilio').checked;
    const checkSucursal = document.getElementById('check-sucursal').checked;
    let tipoEnvio = "No especificado";
    if (checkDomicilio) tipoEnvio = "Envío a Domicilio";
    if (checkSucursal) tipoEnvio = "Envío a Sucursal";

    const datosParaGuardar = {
        accion: "ingreso_nuevo",
        fecha: document.getElementById('fecha-ingreso').innerText,
        nombre: document.getElementById('nombre-cliente').innerText,
        celular: document.getElementById('telefono').innerText,
        provincia: document.getElementById('provincia').innerText,
        localidad: document.getElementById('localidad').innerText,
        direccion: document.getElementById('calle').innerText + " " + document.getElementById('altura').innerText,
        medidas: document.getElementById('medidas').innerText,
        posicion: document.getElementById('posicion').innerText, 
        textos: document.getElementById('datos-cartel').innerText,
        frente: document.getElementById('frente').innerText,
        fondo: document.getElementById('fondo').innerText,
        modelo: "Pendiente", 
        monto: document.getElementById('monto').innerText,
        dni: document.getElementById('dni').innerText,
        cp: document.getElementById('cp').innerText,
        tipoEnvio: tipoEnvio
    };

    if (!datosParaGuardar.nombre) {
        alert("⚠️ Primero pegá el texto y tocá 'Autocompletar'.");
        return;
    }

    // ACÁ ESTABA EL ERROR: Ahora busca el botón correctamente sin importar cómo se llame su clase
    const btn = document.querySelector('button[onclick="guardarPedido()"]');
    if (btn) {
        btn.innerText = "⏳ Guardando...";
        btn.disabled = true;
    }

    fetch(urlAppsScript, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(datosParaGuardar)
    })
    .then(() => {
        alert("✅ Pedido ingresado a la planta.");
        if (btn) {
            btn.innerText = "✔️ ¡Guardado!";
            btn.style.backgroundColor = "#28a745";
            btn.style.color = "white";
        }
        
        setTimeout(() => {
            document.getElementById('texto-whatsapp').value = "";
            if (btn) {
                btn.innerText = "💾 Guardar en Sistema";
                btn.style.backgroundColor = "var(--antracita)";
                btn.style.color = "var(--dorado)";
                btn.disabled = false;
            }
        }, 3000);
    })
    .catch(error => {
        alert("❌ Error de conexión.");
        if (btn) {
            btn.innerText = "💾 Reintentar";
            btn.disabled = false;
        }
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