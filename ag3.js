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

// librerías
async function importar() {
    await import("https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js");
    await $.getScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.2.2/jszip.min.js');
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

// reescribo la función que se llama normalmente por cada click en "Descargar Archivo"
function descargar() {
    var params = descargar.arguments;
    var url = params[0];
    var docparam = url.indexOf('?pD=');
    var arcparam = url.indexOf('&pC=');
    var doc = url.substring(docparam + 4, arcparam);
    var arc = url.substring(arcparam + 4, url.length)

    document.frmDescargar.pD.value = doc;
    document.frmDescargar.pC.value = arc;
    document.frmDescargar.t.value = params[2];
    document.frmDescargar.p.value = params[3];

    // obtengo los datos de cada formulario en vez de hacer submit
    datos = new URLSearchParams(new FormData(frmDescargar));

    c++;
    let i = c;

    let promesa = fetch("https://www.frc.utn.edu.ar/Academico3/descargar/default.frc", {
        "body": datos,
        "method": "POST"
    }).then(function (respose) {
        if (respose.status == 200) {
            let s = respose.headers.get("Content-Disposition");
            let name = s.substring(s.indexOf('\"') + 1, s.lastIndexOf('\"'));
            // name = decode_utf8(name); // fix nombre
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
    // obtengo todos los enlaces "Descargar Archivo"
    elementos = $("a[onclick^='descargar']:odd");

    desc = elementos.length;
    console.log("CANTIDAD ENCONTRADOS: " + desc);

    // para cada enlace hago click
    elementos.each(function (i) {
        $(this).click()
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
