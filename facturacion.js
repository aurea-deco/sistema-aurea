const urlAppsScript = "https://script.google.com/macros/s/AKfycbxC4Q2rPVwBMbdBdEhQVCIjPm_YxPucKJ6eS0fcKL1we734KNuCusPWzWnydWcyyP4Nyw/exec";  

function cargarParaFacturar() {
    fetch(urlAppsScript)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById("cuerpo-facturas");
            tbody.innerHTML = "";
            
            // Filtramos solo los que están listos para facturar (Despachados o Entregados)
            const listos = data.filter(p => 
                p.estado && 
                (p.estado.includes("Despacho") || p.estado.includes("Finalizado") || p.estado.includes("Entregado en Local")) && 
                p.medioPago === "Transferencia Bancaria"
            );
            if (listos.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">🎉 ¡Todo al día! No hay comprobantes pendientes.</td></tr>`;
                return;
            }

            listos.forEach(p => {
                // Limpiamos un poco el monto por si lo escribiste con signos $
                let montoLimpio = String(p.monto).replace("$", "").trim();
                let dniLimpio = String(p.dni).trim();

                tbody.innerHTML += `
                    <tr>
                        <td><b>${p.id}</b></td>
                        <td>${p.nombre}</td>
                        <td>
                            ${dniLimpio !== "S/D" && dniLimpio !== "" ? dniLimpio : "<span style='color:red;'>Falta DNI</span>"}
                            ${dniLimpio !== "S/D" && dniLimpio !== "" ? `<button onclick="copiarTexto('${dniLimpio}')" style="cursor:pointer; background:none; border:none; font-size:14px;" title="Copiar DNI">📋</button>` : ""}
                        </td>
                        <td>Cartel ${p.medida} - ${p.textos}</td>
                        <td style="font-size: 16px; font-weight: bold; color: #28a745;">
                            $${montoLimpio}
                            <button onclick="copiarTexto('${montoLimpio}')" style="cursor:pointer; background:none; border:none; font-size:14px;" title="Copiar Monto">📋</button>
                        </td>
                        <td>
                            <button onclick="marcarFacturado('${p.id}')" style="background:#17a2b8; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; font-weight:bold;">
                                ✔️ LISTO
                            </button>
                        </td>
                    </tr>
                `;
            });
        })
        .catch(err => {
            document.getElementById("cuerpo-facturas").innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Error al cargar los datos.</td></tr>`;
        });
}

// 🪄 Función mágica para copiar al portapapeles
function copiarTexto(texto) {
    navigator.clipboard.writeText(texto).then(() => {
        // Podrías poner un mini cartelito acá si querés
    });
}

// 🪄 Función para sacarlo de la lista una vez que hiciste la factura
function marcarFacturado(idPedido) {
    if(confirm(`¿Confirmás que ya emitiste la factura para el pedido ${idPedido} en ARCA?`)) {
        // Le cambiamos el estado en el Excel para que no aparezca más acá
        fetch(urlAppsScript, {
            method: 'POST',
            body: JSON.stringify({ 
                accion: "guardar_observacion", // Usamos una acción que ya tenés creada
                fila: document.getElementById('cuerpo-facturas').rows[0].rowIndex, // Ojo, esto es ilustrativo, en tu código de editar deberíamos mandar el ID
            })
        })
        // Nota: Para que el botón LISTO funcione 100% automático, tendríamos que agregar una acción "marcar_facturado" 
        // en tu Código.gs, o bien lo podés usar solo como control visual por ahora.
        alert("En la próxima versión agregamos que este botón lo mande al archivo definitivo. ¡Por ahora copiate los datos!");
    }
}

cargarParaFacturar();