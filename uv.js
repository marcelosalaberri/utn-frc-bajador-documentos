// librería
var JSZip;
require(["https://cdnjs.cloudflare.com/ajax/libs/jszip/3.2.2/jszip.min.js"], function (jszip) {
    JSZip = jszip;
});

// VARIABLES

var pedidos;
var zip;
var folder;
var elementos;
var array;
var c;
var desc;
var d;

// FUNCIONES

// más librerías
async function importar() {
    await import("https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js");
    await $.getScript('https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/1.3.8/FileSaver.min.js');
}

function inicializar() {
    // array de promesas
    pedidos = new Array();

    // armado del zip
    zip = new JSZip();
    folder = zip.folder('documentos');
    c = 0;
    d = 0;
}

// fix nombres 
function decode_utf8(s) {
    return decodeURIComponent(escape(s));
}

// función propia
function descargar_uv(link) {
    c++;
    let i = c;
    let promesa = fetch(link, {
        "method": "GET"
    }).then(function (respose) {
        if (respose.status == 200) {
            let s = respose.headers.get("Content-Disposition");
            let name = s.substring(s.indexOf('\"') + 1, s.lastIndexOf('\"'));
            name = decode_utf8(name); // fix nombre
            folder.file(i + "-" + name, respose.blob());
            console.log(++d + "/" + desc + " BAJADO! -> " + i + "-" + name);
        }
        else {
            console.log(++d + "/" + desc + " ERROR! -> " + respose.status);
        }
    }).catch(function (error) {
        console.log(++d + "/" + desc + " ERROR! -> " + error.message);
    });

    pedidos.push(promesa);
};

function obtener() {
    // obtengo todos los links resources que no sean class="autolink"
    elementos = $("a[class=''][href^='https://uv.frc.utn.edu.ar/mod/resource/view.php?id=']");

    desc = elementos.length;
    console.log("CANTIDAD ENCONTRADOS: " + desc);

    // para cada enlace descargo
    array = elementos.toArray();
    array.forEach(e => {
        oc = $(e).attr("onclick");
        if (oc.indexOf("redirect") >= 0)
            link = oc.substring(oc.indexOf('\'') + 1, oc.lastIndexOf('\''));
        else
            link = e.href;
        descargar_uv(link)
    });

    // esperamos que se descargue todo
    Promise.all(pedidos).then(function () {
        console.log("LISTO BAJADA!");
        console.log("GENERANDO ZIP...");

        // genero zip y descargo
        zip.generateAsync({ type: "blob" })
            .then(blob => {
                saveAs(blob, "documentos");
                console.log("FIN!");
            })
            .catch(e => console.log(e));
    });
}

// ejecuto pasos en orden necesario
async function bajar() {
    await importar();
    inicializar();
    obtener();
}

// COMENZAR
bajar();
