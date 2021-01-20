const { response } = require("express");
const path = require('path');
const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater')
/* const {createReport} = require('docx-templates')
 */ 

const Periodo = require('../models/periodo.model');
const Alumno = require('../models/alumno.model');
const Programa = require('../models/programa.model');
const Item = require('../models/item-expediente.model');


const generateFile = async(req, res = response) => {

    const uid = req.uid;
    const idItem = req.params.idItem;

    const [alumno, programa, periodoActual, item] = await Promise.all([
        Alumno.findById(uid).populate('carrera').populate('periodo'),
        Programa.findOne({alumno:uid}).populate('proyecto'),
        Periodo.findOne({isActual:true}),
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
  
    const data = {
        alumno: alumno.toJSON(),
        programa: programa.toJSON(),
        periodo: periodoActual.toJSON()
    }

    const viejoPath = path.join( __dirname, `../uploads/expedientes/${item.archivo}` );
    // Borrar el "PDF" anterior
    borrarArchivo(viejoPath);
    const nombreArchivo = `${alumno.numero_control}-${item.codigo}`
    
    await crearArchivo( item.codigo, data, nombreArchivo)
    // Cambiarle el nombre de archivo al itemdb

    let itemActualizado;
    // Si requiere reenvio ponerle archivoTemp
    if ( item.reenvio_required ) {
        itemActualizado = await Item.findByIdAndUpdate( item.id, {archivoTemp: nombreArchivo, 
                                                                  pendiente: true,
                                                                  rechazado: false,
                                                                  aceptado: false,
                                                                  iniciado: true,
                                                                  proceso: true}, {new:true});
    } else {
        // Si no requiere reenvio ponerle archivo
        itemActualizado = await Item.findByIdAndUpdate( item.id, {archivo: nombreArchivo, 
                                                                  pendiente: true,
                                                                  rechazado: false,
                                                                  aceptado: false,
                                                                  iniciado:true}, {new:true});
    }


    res.json({
        status: true,
        item: itemActualizado
    })
}


const crearArchivo = async( codigo, data, nameFile ) => {

    // codigo, el archivo template (el que se va aditar)
    // data, Información
    // nameFile, nombre del archivo expediente resultante

    const content = fs.readFileSync(path.resolve( __dirname, `../assets/archivos/${codigo}.docx`), 'binary');

    const zip = new PizZip(content);
    let doc;
    try {
        doc = new Docxtemplater(zip);
    } catch (error) {
        console.log(error)
    }
    doc.setData(data)

    try {
        doc.render()
    } catch (error) {
        console.log('segundo error')
        console.log(error)
    }

    const buf = doc.getZip().generate({type: 'nodebuffer'})
    fs.writeFileSync(path.resolve(__dirname, `../uploads/expedientes/${nameFile}.docx`), buf)

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


// TODO: Mover archivo  de expedientes/temp a expedientes
// cambiar el item.archivoTemp = undefined y cambiar item.archivo 
const aceptarFile = async( req, res = response) => {}
// TODO: Eliminar archivo  de expedientes/temp y eliminar el item.archivoTemp = undefined
const rechazarFile = async( req, res = response) => {}




const borrarArchivo = (path) => {

    if ( fs.existsSync( path ) ) {
        fs.unlinkSync( path );
    }
        
}





module.exports = {
    generateFile,
    uploadFile
}