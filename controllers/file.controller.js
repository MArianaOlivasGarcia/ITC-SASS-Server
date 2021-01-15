const { response } = require("express");
const Alumno = require('../models/alumno.model');
const Item = require('../models/item-expediente.model');
const Expediente = require('../models/expediente.model');
const { crearArchivo } = require('../helpers/crear-archivo.helper')
const path = require('path');
const fs = require('fs');


// ITC-VI-PO-002-02 Solicitud Servicio Social
const createFile = async(req, res = response) => {

    const uid = req.uid;
    const codigo = req.params.codigo;

    const alumno = await Alumno.findById(uid)
                            .populate('carrera')
                            .populate('proyecto')
                            .populate({
                                path: 'proyecto',
                                populate: { path: 'dependencia' }
                            });
    
    const data = {
        alumno: alumno.toJSON(),
    }

    let item = undefined;
    /* let proximoItem = undefined; */
    // TODO: Quitar el switch en caso de no ser necesario
    let expediente = undefined;
    switch( codigo ) {

        case 'ITC-VI-PO-002-02':

            item = await buscarItem(alumno, codigo)
            
            const viejoPath = path.join( __dirname, `../uploads/expedientes/${item.archivo}` );
            // Borrar el "PDF" anterior
            borrarArchivo(viejoPath);
            const nombreArchivo = `${alumno.numero_control}-${codigo}.docx`
            await crearArchivo( `${codigo}.docx`, data , nombreArchivo );
            // Cambiarle el nombre de archivo al itemdb
            item = await Item.findByIdAndUpdate( item.id, {archivo: nombreArchivo, revision: true, iniciado: true}, {new:true});

            expediente = await Expediente.findOne({alumno})
            const items = await Item.find({expediente})
                                    .sort('numero');;

            expediente.items = items;

        break;

        case 'ITC-VI-PO-002-03':
            
        break;

        default:
            return res.status(400).json({
                status: false,
                message: 'No es un código archivo válido'
            })

    }

    res.status(200).json({
        status: true,
        message: 'Archivo creado con éxito',
        item,
        expediente
    })

}


const borrarArchivo = (path) => {

    if ( fs.existsSync( path ) ) {
        fs.unlinkSync( path );
    }
        
}


const buscarItem = async (alumno, codigo) => {
    const item = await Item.findOne({expediente: alumno.expediente, codigo});
    return item;
}


const prueba = async (req, res = response) => {
    const inputPath = path.join( __dirname, `../assets/archivos/ITC-VI-PO-002-02.docx` )
    const outputPath = path.join( __dirname, `../assets/archivos/ITC-VI-PO-002-02.pdf` )


    
}

module.exports = {
    createFile,
    prueba
}