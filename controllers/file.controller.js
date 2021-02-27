const { response } = require("express");
const path = require('path');
const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater')
const moment = require('moment-timezone')

const expressions = require('angular-expressions');
const assign = require("lodash/assign");


const Alumno = require('../models/alumno.model');
const Solicitud = require('../models/solicitud.model');
const Item = require('../models/item-expediente.model');

// USO DEL ALUMNO PARA GENERAR SUS ARCHIVOS DE LOS ITEMS DEL EXPEDIENTE
const generateFileItems = async(req, res = response) => {

    const uid = req.uid;
    const idItem = req.params.idItem;

    const [solicitud, item] = await Promise.all([
        Solicitud.findOne({alumno:uid, aceptado:true})
                    .populate('alumno')
                    .populate({
                        path: 'alumno',
                        populate: { path: 'carrera' }
                    })
                    .populate('proyecto')
                    .populate({
                        path: 'proyecto',
                        populate: { path: 'dependencia' }
                    })
                    .populate({
                        path: 'proyecto',
                        populate: { path: 'periodo' }
                    }),
        Item.findById(idItem)
    ]) 

    if ( item.pendiente ){
        return res.status(400).json({
            status: false,
            message: 'Ya enviaste este documento a revisión.'
        })
    }

    if ( item.aceptado ){
        return res.status(400).json({
            status: false,
            message: 'Tu documento ya fue aceptado.'
        }) 
    }

    // VALIDAR QUE ESTE ENTRE LAS FECHAS DE INICIO Y MAXIMO (DE ENTREGA)
    const today = moment().format("YYYY-MM-DD");
    const hoy = new Date(today);
    const { fecha_inicial, fecha_limite } = item;
    const fi = new Date(fecha_inicial).getTime();
    const fl = new Date(fecha_limite).getTime();
    
    if ( hoy < fi  ){
        return res.status(400).json({
            status: false,
            message: `Aun no es fecha para el envio del archivo ${item.titulo}.`
        })
    } else if ( hoy > fl ){
        return res.status(400).json({
            status: false,
            message: `La fecha para el envio del archivo ${item.titulo} ya vencio.`
        })
    }

    // GENERAR EL ARCHIVO
   /*  const isDate = new Date(solicitud.inicio_servicio);
    const tsDate = new Date(solicitud.termino_servicio); */
    const fechaCompleta = moment().format("DD MMMM YYYY")
    const data = {
        alumno: solicitud.alumno.toJSON(),
        proyecto: solicitud.proyecto.toJSON(),
        periodo: solicitud.proyecto.periodo.toJSON(),
        inicio_servicio : solicitud.inicio_servicio,
        termino_servicio: solicitud.termino_servicio,
        hoy: moment().format("DD/MM/YYYY"),
        dia: fechaCompleta.split(' ')[0],
        mes: fechaCompleta.split(' ')[1],
        anio: fechaCompleta.split(' ')[2]
    }
    console.log(data)

    const viejoPath = path.join( __dirname, `../uploads/expedientes/${solicitud.alumno.numero_control}/${item.archivo}` );
    // Borrar el "PDF" anterior
    borrarArchivo(viejoPath);
    
    const extensionArchivo = 'docx';
    const nombreArchivo = `${solicitud.alumno.numero_control}-${item.codigo}.${ extensionArchivo }`

    await crearArchivo( item.codigo, data, nombreArchivo ,solicitud.alumno)
    // Cambiarle el nombre de archivo al itemdb

    let itemActualizado;
    // Si requiere reenvio ponerle archivoTemp
    if ( item.reenvio_required ) {
        itemActualizado = await Item.findByIdAndUpdate( item.id, {archivoTemp: nombreArchivo, 
                                                                  pendiente: true,
                                                                  rechazado: false,
                                                                  aceptado: false,
                                                                  iniciado: true,
                                                                  fecha_entrega: Date.now(),
                                                                  proceso: true}, {new:true});
    } else {
        // Si no requiere reenvio ponerle archivo
        itemActualizado = await Item.findByIdAndUpdate( item.id, {archivo: nombreArchivo, 
                                                                  pendiente: true,
                                                                  rechazado: false,
                                                                  aceptado: false,
                                                                  fecha_entrega: Date.now(),
                                                                  iniciado:true }, {new:true});
    }


    res.json({
        status: true,
        item: itemActualizado
    })
}



const uploadFile = async( req, res = response ) => {

    const idItem = req.params.idItem
    const idAlumno = req.uid;

 
    // Validar que exista un archivo 
    if( !req.files || Object.keys(req.files).length === 0 ){
        return res.status(400).json({
            status: false,
            message: 'No hay ningún archivo'
        }) 
    }


    // Bucar el alumno
    const alumno =  await Alumno.findById(idAlumno);

    if ( !alumno ) {
        return res.status(404).json({
            status: false,
            message: `El alumno con el ID ${idAlumno} no existe.`
        }) 
    }

    // Bucar el Item
    const item = await Item.findById(idItem);

    if ( !item ) {
        return res.status(404).json({
            status: false,
            message: `El item con el ID ${idItem} no existe.`
        }) 
    }

    // Procesar la imagen
    const file = req.files.archivo;

    const nombreCortado = file.name.split('.'); //nombre.archivo.jpg
    const extensionArchivo = nombreCortado[ nombreCortado.length - 1 ];

    const extensionesValidas = ['docx', 'pdf'];
    if( !extensionesValidas.includes( extensionArchivo ) ){
        return res.status(400).json({
            status: true,
            message: 'No es una extensión permitida. Tiene que ser .docx ó .pdf'
        }) 
    }

    // Generar el nombre del Archivo
    const nombreArchivo = `${ alumno.numero_control }-${ item.codigo }.${ extensionArchivo }`;

    // Path para guardar la imagen
    const path = `./uploads/expedientes/temp/${nombreArchivo}`;


    //***** Actualizar el archivo al item */

    item.archivoTemp = nombreArchivo;
    await item.save();

 
    // Mover el archivo a al path
    file.mv( path, (err) => {

        if (err) {
            console.log(err);
            return res.status(500).json({
                status: false,
                message: 'Error al mover el archivo'
            })
        }    

        res.json({
            status: true,
            message: 'Archivo subido con éxito',
            nombreArchivo
        })

    })


}

// OBTENER EL ARCHIVO
const obtenerFile = async( req, res = response ) => {

    
    const archivo = req.params.archivo;
    const numero_control = archivo.slice(0, 8);
    const pathFile = path.join( __dirname, `../uploads/expedientes/${ numero_control }/${ archivo }` );


    if ( fs.existsSync (pathFile) ){
        res.download( pathFile )
    } else {
        const pathFile = path.join( __dirname, `../assets/no-img.jpg` );
        res.sendFile( pathFile );
    }
    
}




const generateFile = async( req, res = response ) => {

    const codigo = req.params.codigo;
    const alumno = req.params.alumno;

    const alumnodb = await Alumno.findById(alumno)
                              .populate('carrera')

                              
    await crearArchivo(codigo, data, nombreArchivo, alumnodb)

}


// TODO: Mover archivo  de expedientes/temp a expedientes
// cambiar el item.archivoTemp = undefined y cambiar item.archivo 
const aceptarFile = async( req, res = response) => {}
// TODO: Eliminar archivo  de expedientes/temp y eliminar el item.archivoTemp = undefined
const rechazarFile = async( req, res = response) => {}




// ******************
// FUNCIONES DE AYUDA 
// ******************

expressions.filters.lower = function(input) {
    if(!input) return input;
    return input.toLowerCase();
}

function angularParser(tag) {
    if (tag === '.') {
        return {
            get: function(s){ return s;}
        };
    }
    const expr = expressions.compile(
        tag.replace(/(’|‘)/g, "'").replace(/(“|”)/g, '"')
    );
    return {
        get: function(scope, context) {
            let obj = {};
            const scopeList = context.scopeList;
            const num = context.num;
            for (let i = 0, len = num + 1; i < len; i++) {
                obj = assign(obj, scopeList[i]);
            }
            return expr(scope, obj);
        }
    };
}

const crearArchivo = async( codigo, data, nombreArchivo, alumno ) => {

    // codigo, el archivo template (el que se va aditar)
    // data, Información

    const content = fs.readFileSync(path.resolve( __dirname, `../assets/archivos/${codigo}.docx`), 'binary');

    const zip = new PizZip(content);
    let doc;
    try {
        doc = new Docxtemplater(zip, {parser:angularParser});
    } catch (error) {
        console.log(error)
    }
    doc.setData(data)

    try {
        doc.render()
    } catch (error) {
        console.log(error)
    }

    const buf = doc.getZip().generate({type: 'nodebuffer'})

    const numeroControl = alumno.numero_control;
    const carpetaAlumno = path.resolve(__dirname, `../uploads/expedientes/${numeroControl}`);

    if ( !fs.existsSync(carpetaAlumno) ) {
        fs.mkdirSync(carpetaAlumno)
    }


    fs.writeFileSync(path.resolve(__dirname, `${carpetaAlumno}/${nombreArchivo}`), buf)

}

const borrarArchivo = (path) => {

    if ( fs.existsSync( path ) ) {
        fs.unlinkSync( path );
    }
        
}





module.exports = {
    generateFileItems,
    uploadFile,
    obtenerFile
}