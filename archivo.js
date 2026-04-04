const urlAppsScript = "https://script.google.com/macros/s/AKfycbxC4Q2rPVwBMbdBdEhQVCIjPm_YxPucKJ6eS0fcKL1we734KNuCusPWzWnydWcyyP4Nyw/exec"; // Pegá tu URL acá

function cargarArchivo() {
    // Agregamos ?hoja=Historico para que el Apps Script sepa de dónde leer
    fetch(`${urlAppsScript}?hoja=Historico`)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById("cuerpo-archivo");
            tbody.innerHTML = "";
            data.reverse().forEach(p => { // Los más nuevos del archivo primero
                tbody.innerHTML += `
                    <tr>
                        <td><b>${p.id}</b></td>
                        <td>${new Date(p.fecha).toLocaleDateString()}</td>
                        <td>${p.nombre}<br><small>${p.celular}</small></td>
                        <td>${p.medida} - ${p.textos}</td>
                        <td>
                            ${p.linkPdf ? `<a href="${p.linkPdf}" target="_blank">PDF</a>` : ''}
                            ${p.linkRotulo ? `<a href="${p.linkRotulo}" target="_blank">Rótulo</a>` : ''}
                        </td>
                    </tr>
                `;
            });
        });
}

function filtrarArchivo() {
    let input = document.getElementById("buscador").value.toLowerCase();
    let filas = document.getElementById("cuerpo-archivo").getElementsByTagName("tr");
    for (let fila of filas) {
        fila.style.display = fila.innerText.toLowerCase().includes(input) ? "" : "none";
    }
}

cargarArchivo();