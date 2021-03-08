const { response, json } = require("express");
const path = require('path');
const fs = require('fs');
const libre = require('libreoffice-convert-win');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater')
const moment = require('moment-timezone')

const expressions = require('angular-expressions');
const assign = require("lodash/assign");


const Alumno = require('../models/alumno.model');
const Solicitud = require('../models/solicitud.model');
const Item = require('../models/item-expediente.model');
const Evaluacion = require('../models/evaluacion.model');

// USO DEL ALUMNO PARA GENERAR SUS ARCHIVOS DE LOS ITEMS DEL EXPEDIENTE
const generateFileItems = async(req, res = response) => {

    const uidAlumno = req.uid;
    const idItem = req.params.idItem;
    const { descripcion, calificaciones } = req.body;



    const [solicitud, item] = await Promise.all([
        Solicitud.findOne({alumno:uidAlumno, aceptado:true})
                    .populate('periodo')
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


    // Verificar que el item anterior este aceptado si no no puede avanzar}
        // Las tareas se realizan en orden aunque tengan la misma fecha
    const itemAnterior = await Item.findOne({numero: item.numero-1, alumno: item.alumno});
    
    if ( !itemAnterior.finalizado ) {
        return res.status(400).json({
            status: false,
            message: `No has enviado el archivo anterior a este (${itemAnterior.titulo}).`
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
    const {inicio_servicio, termino_servicio} = solicitud;
    
    const extensionArchivo = 'docx';

    let nombreArchivo = '';

    // Fechas BIMESTRE
    let fecha_bimestre = {};
    // Reportes bimestrales
    let numero_reporte = 0;
    let horas = '';
    let horas_acum = '';


    // SI ES EVALUACIÓN, EVALUACION FINAL O AUTOEVALUACIÓN
    let evaluacion = {};
    if ( item.isAutoEvaluacion || item.isEvaluacion || item.isEvaluacionFinal) {

        const dataEval = {
            calificaciones,
            item,
            alumno: uidAlumno,
            perido: solicitud.periodo
        }

        evaluacion = new Evaluacion(dataEval);
        await evaluacion.save()

    } 

    // VERIFICAR SI ES BIMESTRAL
    if  ( item.isBimestral ) {
        nombreArchivo = `${solicitud.alumno.numero_control}-${item.codigo}-${item.numero_bimestre}.${ extensionArchivo }`

        if ( item.numero_bimestre == 1 ){
            fecha_bimestre = {
                inicio:  {
                    dia: moment(inicio_servicio).format('D MMMM YYYY').split(' ')[0],
                    mes: moment(inicio_servicio).format('D MMMM YYYY').split(' ')[1],
                    anio: moment(inicio_servicio).format('D MMMM YYYY').split(' ')[2]
                },
                termino: {
                    dia: moment(inicio_servicio).add(2, 'months').format('D MMMM YYYY').split(' ')[0],
                    mes: moment(inicio_servicio).add(2, 'months').format('D MMMM YYYY').split(' ')[1],
                    anio: moment(inicio_servicio).add(2, 'months').format('D MMMM YYYY').split(' ')[2]
                }
            };
            horas = '180',
            horas_acum = '180',

            numero_reporte = 1;


        } else if ( item.numero_bimestre == 2 ) {
            fecha_bimestre = {
                inicio:  {
                    dia: moment(inicio_servicio).add(2, 'months')/* .add(1, 'days') */.format('D MMMM YYYY').split(' ')[0],
                    mes: moment(inicio_servicio).add(2, 'months')/* .add(1, 'days') */.format('D MMMM YYYY').split(' ')[1],
                    anio: moment(inicio_servicio).add(2, 'months')/* .add(1, 'days') */.format('D MMMM YYYY').split(' ')[2],
                },
                termino: {
                    dia: moment(inicio_servicio).add(4, 'months').format('D MMMM YYYY').split(' ')[0],
                    mes: moment(inicio_servicio).add(4, 'months').format('D MMMM YYYY').split(' ')[1],
                    anio: moment(inicio_servicio).add(4, 'months').format('D MMMM YYYY').split(' ')[2],
                }
            };
            horas = '160',
            horas_acum = '340',

            numero_reporte = 2;
        } else if ( item.numero_bimestre == 3 ) {
            fecha_bimestre = {
                inicio:  {
                    dia: moment(inicio_servicio).add(4, 'months')/* .add(1,'days') */.format('D MMMM YYYY').split(' ')[0],
                    mes: moment(inicio_servicio).add(4, 'months')/* .add(1,'days') */.format('D MMMM YYYY').split(' ')[1],
                    anio: moment(inicio_servicio).add(4, 'months')/* .add(1,'days') */.format('D MMMM YYYY').split(' ')[2],
                },
                termino: {
                    dia: moment(inicio_servicio).add(6, 'months').format('D MMMM YYYY').split(' ')[0],
                    mes: moment(inicio_servicio).add(6, 'months').format('D MMMM YYYY').split(' ')[1],
                    anio: moment(inicio_servicio).add(6, 'months').format('D MMMM YYYY').split(' ')[2],
                }
            };
            horas = '160',
            horas_acum = '500',

            numero_reporte = 3;
        }
        
    } else {
        nombreArchivo = `${solicitud.alumno.numero_control}-${item.codigo}.${ extensionArchivo }`
    }


    const fechaCompleta = moment().format("DD MMMM YYYY")
    const fechaInicio = moment(inicio_servicio).format("DD MMMM YYYY");
    const fechaTermino = moment(termino_servicio).format("DD MMMM YYYY");

    

    const data = {
        alumno: solicitud.alumno.toJSON(),
        proyecto: solicitud.proyecto.toJSON(),
        periodo: solicitud.periodo.toJSON(),
        inicio_servicio,
        termino_servicio,
        fs_completo: {
            inicio: {
                dia: fechaInicio.split(' ')[0],
                mes: fechaInicio.split(' ')[1],
                anio: fechaInicio.split(' ')[2],
            },
            termino: {
                dia: fechaTermino.split(' ')[0],
                mes: fechaTermino.split(' ')[1],
                anio: fechaTermino.split(' ')[2],
            }
        }, 
        hoy: moment().format("DD/MM/YYYY"),
        hoy_completo: {
            dia: fechaCompleta.split(' ')[0],
            mes: fechaCompleta.split(' ')[1],
            anio: fechaCompleta.split(' ')[2],
        },
        fecha_bimestre,
        numero_reporte: numero_reporte.toString(),
        horas,
        horas_acum,
        plan_trabajo: descripcion,
        resumen_actividades: descripcion,
        evaluacion: {
            calificaciones: evaluacion.calificaciones,
            sumatoria: evaluacion.sumatoria,
            nivel_desempeno: evaluacion.nivel_desempeno
        }
    }


    console.log(data)


    const viejoPath = path.join( __dirname, `../uploads/expedientes/${solicitud.alumno.numero_control}/${item.archivo}` );
    
    // Borrar el "PDF" anterior
    borrarArchivo(viejoPath);
    
    /* const extensionArchivo = 'docx';
    const nombreArchivo = `${solicitud.alumno.numero_control}-${item.codigo}.${ extensionArchivo }` */

    await Promise.all([
        crearArchivo( item, data, nombreArchivo , solicitud.alumno),
        convertirPDF( item, nombreArchivo, solicitud.alumno.numero_control),
    ])
    // Cambiarle el nombre de archivo al itemdb

    let itemActualizado;
    // Si requiere reenvio ponerle archivoTemp
    if ( item.reenvio_required ) {
        itemActualizado = await Item.findByIdAndUpdate( item.id, {archivoOriginal: `${nombreArchivo.split('.')[0]}.pdf`, 
                                                                  pendiente: false,
                                                                  rechazado: false,
                                                                  aceptado: false,
                                                                  iniciado: true,
                                                                  fecha_entrega: moment().format('YYYY-MM-DD'),
                                                                  proceso: true}, {new:true});
    } else {
        // Si no requiere reenvio ponerle archivo
        itemActualizado = await Item.findByIdAndUpdate( item.id, {archivo: `${nombreArchivo.split('.')[0]}.pdf`, 
                                                                  pendiente: true,
                                                                  rechazado: false,
                                                                  aceptado: false,
                                                                  fecha_entrega: moment().format('YYYY-MM-DD'),
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

    if ( item.aceptado ) {
        return res.status(400).json({
            status: false,
            message: `Este item ya esta aceptado.`
        }) 
    }

    // Procesar la imagen
    const file = req.files.archivo;

    const nombreCortado = file.name.split('.'); //nombre.archivo.jpg
    const extensionArchivo = nombreCortado[ nombreCortado.length - 1 ];

    const extensionesValidas = ['pdf'];
    if( !extensionesValidas.includes( extensionArchivo ) ){
        return res.status(400).json({
            status: true,
            message: 'No es una extensión permitida. Tiene que ser .pdf'
        }) 
    }

    // Generar el nombre del Archivo
    // VERIFICAR SI ES BIMESTRAL
    let nombreArchivo;

    // Si es algo que se entrega bimestralmente
    if  ( item.isBimestral ) {
        nombreArchivo = `${ alumno.numero_control}-${item.codigo}-${item.numero_bimestre}.${ extensionArchivo }`
    } else {
        nombreArchivo = `${ alumno.numero_control }-${ item.codigo }.${ extensionArchivo }`;
    }

    

   
    // Path para guardar el archivo
    const path = `./uploads/expedientes/temp/${ nombreArchivo }`;
    //***** Actualizar el archivo al item */
    const data = {
        archivoTemp: nombreArchivo,
        iniciado: true,
        pendiente: true,
        rechazado: false,
        proceso: false
    };

    const itemActualizado = await Item.findByIdAndUpdate(idItem, data, {new: true});

 
    // Mover el archivo a al path
    file.mv( path, (err) => {

        if (err) {
            console.log(err);
            return res.status(500).json({
                status: false,
                message: 'Error al mover el archivo.'
            })
        }    

        res.json({
            status: true,
            message: 'Archivo subido con éxito.',
            item: itemActualizado,
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







const aceptarFile = async( req, res = response) => {

    const idItem = req.params.idItem;
    const item = await Item.findById(idItem).populate('alumno', 'numero_control')

    const { archivoTemp } = item;
    const pathArchivo = `./uploads/expedientes/temp/${archivoTemp}`;
    const pathDestino = `./uploads/expedientes/${item.alumno.numero_control}/${archivoTemp}`;


    if ( fs.existsSync( pathArchivo ) ) {
        fs.renameSync(pathArchivo, pathDestino)
        await item.updateOne({archivo: archivoTemp, $unset: {archivoTemp: 1 } });
    } else { 
        return res.status(400).json({
            status: true,
            message: `No existe el archivo ${archivoTemp}.` 
        })
    }

    res.status(200).json({
        status: true,
        message: 'Archivo aceptado con éxito.'
    })

}


// TODO: Mandar un mensaje de que se rechazo el archivo que mando el alumno
const rechazarFile = async( req, res = response) => {

    const idItem = req.params.idItem;
    const item = await Item.findById(idItem);

    const { archivoTemp } = item;
    const pathArchivo = `./uploads/expedientes/temp/${archivoTemp}`;

    if ( fs.existsSync( pathArchivo ) ) {
        borrarArchivo( pathArchivo )
        await item.updateOne({ $unset: {archivoTemp: 1 } });
    } else { 
        return res.status(400).json({
            status: true,
            message: `No existe el archivo ${archivoTemp}.` 
        })
    }

    res.status(200).json({
        status: true,
        message: 'Archivo rechazado con éxito.'
    })


}




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

const crearArchivo = async( item, data, nombreArchivo, alumno ) => {

    // codigo, el archivo template (el que se va aditar)
    // data, Información

    const content = fs.readFileSync(path.resolve( __dirname, `../assets/archivos/${item.codigo}.docx`), 'binary');

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
    
    let carpeta = '';

    if ( item.reenvio_required ) {
        carpeta = path.resolve(__dirname, `../uploads/expedientes/original`);
    } else {
        carpeta = path.resolve(__dirname, `../uploads/expedientes/${numeroControl}`);
    }
    

    if ( !fs.existsSync(carpeta) ) {
        fs.mkdirSync(carpeta)
    }

    fs.writeFileSync(path.resolve(__dirname, `${carpeta}/${nombreArchivo}`), buf)



}

const convertirPDF = async(item, nombreArchivo, numeroControl) => {

    const extend = '.pdf'

    const carpetaAlumno = path.resolve(__dirname, `../uploads/expedientes/${numeroControl}`);
    const carpetaOriginal = path.resolve(__dirname, `../uploads/expedientes/original`);

    if ( !fs.existsSync(carpetaAlumno) ) {
        fs.mkdirSync(carpetaAlumno)
    }

    let enterPath = '';
    let outputPath = '';
    if ( item.reenvio_required ) {
        enterPath = path.resolve(__dirname, `${carpetaOriginal}/${nombreArchivo}`);
        outputPath = path.resolve(__dirname, `${carpetaOriginal}/${nombreArchivo.split('.')[0]}${extend}`);
    } else {
        enterPath = path.resolve(__dirname, `${carpetaAlumno}/${nombreArchivo}`);
        outputPath = path.resolve(__dirname, `${carpetaAlumno}/${nombreArchivo.split('.')[0]}${extend}`);
    }

    const file = fs.readFileSync(enterPath);
    // Convert it to pdf format with undefined filter (see Libreoffice doc about filter)
    libre.convert(file, extend, undefined, (err, done) => {
        if( err ) {
            console.log('ERROR' + err)
        }

        fs.writeFileSync(outputPath, done)
    })


}

const borrarArchivo = (path) => {

    if ( fs.existsSync( path ) ) {
        fs.unlinkSync( path );
    }
        
}



module.exports = {
    generateFileItems,
    uploadFile,
    obtenerFile,
    aceptarFile,
    rechazarFile
}