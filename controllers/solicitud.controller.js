const { response } = require("express");
const path = require('path');
const fs = require('fs');
const libre = require('libreoffice-convert-win');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater')
const moment = require("moment-timezone");

const expressions = require('angular-expressions');
const assign = require("lodash/assign");


const Solicitud = require('../models/solicitud.model');
const Alumno = require('../models/alumno.model');
const Usuario = require('../models/usuario.model');
const ItemCarrera = require("../models/item-carrera.model");
const Proyecto = require("../models/proyecto.model");
const Carrera = require("../models/carrera.model");



const getByStatus = async(req, res = response) => {

    const status = req.params.status;
    const desde = Number(req.query.desde) || 0;
    const idUser = req.uid;

   try {

        const usuario = await Usuario.findById(idUser)
                                        .populate('gestion')
    

        if( usuario.gestion.nombre == 'TODAS' ) {

        let solicitudes  = []; 
        let total;
        switch( status ) {

            case 'pendiente': 
                [solicitudes, total] = await Promise.all([
                                            Solicitud.find({pendiente: true}).sort({fecha_solicitud: -1}).skip(desde).limit(5)
                                                                .populate('alumno').populate('proyecto')
                                                                .populate({
                                                                    path: 'alumno',
                                                                    populate: { path: 'carrera' }
                                                                }),
                                            Solicitud.countDocuments({pendiente: true})
                                        ]);
            break;

            case 'aceptado':
                [solicitudes, total] = await Promise.all([
                                            Solicitud.find({aceptado: true}).sort({fecha_solicitud: -1}).skip(desde).limit(5)
                                                                .populate('alumno').populate('proyecto')
                                                                .populate({
                                                                    path: 'alumno',
                                                                    populate: { path: 'carrera' }
                                                                }),
                                            Solicitud.countDocuments({aceptado: true})
                                        ]);
            break;

            case 'rechazado':
                [solicitudes, total] = await Promise.all([
                                            Solicitud.find({rechazado: true}).sort({fecha_solicitud: -1}).skip(desde).limit(5)
                                                                .populate('alumno').populate('proyecto')
                                                                .populate({
                                                                    path: 'alumno',
                                                                    populate: { path: 'carrera' }
                                                                }),
                                            Solicitud.countDocuments({rechazado: true})
                                        ]);
            break;
        
            default:
                return res.status(400).json({
                    status: false,
                    message: 'Los estados permitidos son pendiente, aceptado, rechazado'
                })
        }

        res.json({
            status: true,
            solicitudes,
            total
        })
        } else {
        
        let solicitudes  = []; 
        let solicitudesTemp = [];
        let total;
        switch( status ) {

            case 'pendiente': 
                solicitudesTemp = await Solicitud.find({pendiente: true }).sort({fecha_solicitud: -1})
                                                                .skip(desde).limit(5)
                                                                .populate('alumno').populate('proyecto')
                                                                .populate({
                                                                    path: 'alumno',
                                                                    populate: { path: 'carrera' }
                                                                });
                                        
            
            solicitudes = solicitudesTemp.filter( solicitud => {

                const { gestion } = usuario;
                const { carrera } = solicitud.alumno;

                return gestion._id == carrera._id.toString();

            })

            total = solicitudes.length; 

            break;

            case 'aceptado':
                solicitudesTemp = await Solicitud.find({aceptado: true }).sort({fecha_solicitud: -1}).skip(desde).limit(5)
                                                                .populate('alumno').populate('proyecto')
                                                                .populate({
                                                                    path: 'alumno',
                                                                    populate: { path: 'carrera' }
                                                                });

                solicitudes = solicitudesTemp.filter( solicitud => {
                    const { gestion } = usuario;
                    const { carrera } = solicitud.alumno;
                                                
                    return gestion._id == carrera._id.toString()
                })
                                                
                total = solicitudes.length; 
            break;

            case 'rechazado':
                solicitudesTemp = await Solicitud.find({rechazado: true}).sort({fecha_solicitud: -1}).skip(desde).limit(5)
                                                               .populate('alumno')
                                                                .populate('proyecto')
                                                                .populate({
                                                                    path: 'alumno',
                                                                    populate: { path: 'carrera' }
                                                             });

                solicitudes = solicitudesTemp.filter( solicitud => {
                    const { gestion } = usuario;
                    const { carrera } = solicitud.alumno;

                    return gestion._id == carrera._id.toString()
                })
                                                                                                
                total = solicitudes.length;                                   
            break;
        
            default:
                return res.status(400).json({
                    status: false,
                    message: 'Los estados permitidos son pendiente, aceptado, rechazado'
                })
        }

        res.json({
            status: true,
            solicitudes,
            total
        })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }



}


const getByAlumno = async(req, res = response) => {

    const alumno = req.uid;

    try {

        const solicitud = await Solicitud.findOne({alumno})
                                .populate('proyecto')
                                .populate('alumno')

        if ( !solicitud ) {
            return res.json({
                status: true,
                message: 'El alumno no tiene solicitud pendiente.'
            })
        }

        res.json({
            status: true,
            solicitud
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }

}


const getById = async(req, res = response) => {

    const id = req.params.id;

    try{

        const solicitud = await Solicitud.findById(id)
                                .populate('alumno')
                                .populate('usuario_valido')
                                .populate('proyecto')
                                .populate({
                                    path: 'proyecto',
                                    populate: {
                                        path: 'periodo'
                                    }
                                })
                                .populate({
                                    path: 'alumno',
                                    populate: {
                                        path: 'carrera'
                                    }
                                })
                                .populate({
                                    path: 'proyecto',
                                    populate: {
                                        path: 'dependencia'
                                    }
                                })


        if ( !solicitud ) {
            return res.status(404).json({
                status: false,
                message: `No existe una solicitud con el ID ${id}.`
            })
        }

        res.json({
            status: true,
            solicitud
        })

    }catch(error){
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }

}


const create = async(req, res = response) => {

    const alumno = req.uid;
    const {proyecto, inicio_servicio, termino_servicio } = req.body;

    
    const hoy = new Date(moment().format("YYYY-MM-DD"));

    const proyectodb = await Proyecto.findById(proyecto._id).populate('periodo');
    const { inicio, termino } = proyectodb.periodo.recepcion_solicitudes
    const fi = new Date(inicio).getTime();
    const ft = new Date(termino).getTime();
    
    if ( hoy < fi  ){
        return res.status(400).json({
            status: false,
            message: `Aun no es fecha de recepción de solicitudes de servicio social para el periodo ${proyectodb.periodo.nombre}.`
        })
    } else if ( hoy > ft ){
        return res.status(400).json({
            status: false,
            message: `La recepción de solicitudes de servicio social para el periodo ${proyectodb.periodo.nombre} ya vencio.`
        })
    }

    const fip = new Date(proyectodb.periodo.fecha_inicio).getTime();
    const ftp = new Date(proyectodb.periodo.fecha_termino).getTime();

    const fis = new Date(inicio_servicio).getTime();

    if ( fis < fip  ){
        return res.status(400).json({
            status: false,
            message: `La fecha de inicio de servicio social tiene que ser posterior ó igual a la fecha de inicio del periodo ${proyectodb.periodo.nombre}.`
        })
    } else if ( fis > ftp ){
        return res.status(400).json({
            status: false,
            message: `La fecha de inicio de servicio social tiene que ser menor ó igual a la fecha de termino del periodo ${proyectodb.periodo.nombre}.`
        })
    }

    // Ya tiene una solicitud
    const existeSolicitud = await Solicitud.findOne({alumno});

    if ( existeSolicitud && existeSolicitud.pendiente ) {
        return res.status(400).json({
            status: false,
            message: 'Ya tienes una solicitud pendiente.'
        })
    }

    if ( existeSolicitud && existeSolicitud.aceptado ) {
        return res.status(400).json({
            status: false,
            message: 'Ya tienes una solicitud aprobada.'
        })
    }


    // SI TIENE UNA SOLICITUD RECHAZADA EDITARLO PARA NO GUARDAR OTRA SOLICITUD EN LA BASE DE DATOS
    const hasRechazado = await Solicitud.findOne({alumno, rechazado: true})
                                .populate('proyecto');


    if ( hasRechazado ) {

        // Si el proyecto de la solicitud rechazada es No es publico, borrarlo
        if ( !hasRechazado.proyecto.publico ) {
            await Proyecto.findByIdAndDelete(hasRechazado.proyecto._id);
        }

        const alumnodb = await Alumno.findById(alumno);

        const data = {
            proyecto,
            inicio_servicio,
            termino_servicio,
            rechazado: false,
            aceptado: false,
            pendiente: true,
            fecha_solicitud: moment().format("YYYY-MM-DD"),
            $unset: {error: 1, fecha_validacion: 1},
        }

        const solicitudActualizada = await Solicitud.findByIdAndUpdate( hasRechazado._id, data, {new:true})
                                                    .populate('alumno')
                                                    .populate({
                                                        path: 'alumno',
                                                        populate: { path: 'carrera'}
                                                    })
                                                    .populate('proyecto')
                                                    .populate({
                                                        path: 'proyecto',
                                                        populate: { path: 'dependencia'}
                                                    })
        // Obtener el proyecto y quitarle 1 a la cantidad del itemCarrera
        const todas = await Carrera.findOne({nombre:'TODAS'});
        const itemCarrera = await ItemCarrera.findOne({proyecto, $or: [{carrera: alumnodb.carrera}, {carrera: todas}] })

        if ( itemCarrera.disponibilidad == 0 ){
            res.status(400).json({
                status: false,
                message: 'Ya no hay un espacio disponibles para ti.'
            }) 
        }
        itemCarrera.disponibilidad = itemCarrera.disponibilidad - 1;
        await itemCarrera.save();


        return res.json({
            status: true,
            message: 'Solicitud de Servicio Social enviada nuevamente con éxito.',
            solicitud: solicitudActualizada
        })
    }



    // NO TIENE UNO RECHAZADO ENTONCES CREAR NUEVO
    // Obtener el proyecto y quitarle 1 a la disponiblidad del itemCarrera
    const [alumnodb, todas] = await Promise.all([
        Alumno.findById(alumno),
        Carrera.findOne({nombre:'TODAS'})
    ]);

    const itemCarrera = await ItemCarrera.findOne({proyecto, $or: [{carrera: alumnodb.carrera}, {carrera: todas}] })
    
    if ( itemCarrera.disponibilidad == 0 ){
        res.status(400).json({
            status: false,
            message: 'Ya no hay un espacio disponibles para ti.'
        }) 
    }
    itemCarrera.disponibilidad = itemCarrera.disponibilidad - 1;
    await itemCarrera.save();
    

    const data = {
        proyecto,
        inicio_servicio,
        termino_servicio,
        alumno
    }

    const solicitud = new Solicitud(data);

    await solicitud.save();

    res.status(201).json({
        status: true,
        message: 'Solicitud de Servicio Social enviada con éxito.',
        solicitud
    })

}


const getAceptadaByAlumno = async(req, res = response) => {

    try {

        const alumno = req.uid;

        const exist = await Solicitud.findOne({aceptado:true, alumno})
                                .populate('proyecto');

        if ( !exist ) {
            return res.json({
                status: true,
                message: `El Alumno no tiene un proyecto aceptado.`
            }) 
        }

        res.json({
            satus: true,
            proyecto: exist.proyecto
        })
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }

}


const getSolicitudAndProyectoPersonal = async(req, res = response) => {

    const id = req.uid;

    try {

        const proyecto = await Proyecto.findOne({alumno: id, publico: false})

        const solicitud = await Solicitud.findOne({alumno: id, proyecto})
                                        .populate('usuario_reviso')
                                        .populate('proyecto')
                                        .populate({
                                            path: 'proyecto',
                                            populate: { path: 'dependencia' }
                                        })
                                        .populate({
                                            path: 'proyecto',
                                            populate: { path: 'periodo' }
                                        })
        
        res.status(200).json({
            status: true,
            solicitud
        })

    }catch(error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }

}


const aceptar = async(req, res = response) => {

    const idSolicitud = req.params.id;
    const idUser = req.uid;

    const { inicio_servicio, termino_servicio } = req.body;

    try {

        const solicitud = await Solicitud.findById(idSolicitud);

        if ( !solicitud ) {
            return res.status(404).json({
                status: false,
                message: `No existe una solicitud con el ID ${idSolicitud}`
            }) 
        }

        // VERIFICAR QUE NO ESTE ACEPTADA
        if ( solicitud.rechazado ) {
            return res.status(400).json({
                status: false,
                message: `No puedes aceptar una solicitud rechazada.`
            }) 
        }

        // VERIFICAR QUE NO ESTE ACEPTADA
        if ( solicitud.aceptado ) {
            return res.status(400).json({
                status: false,
                message: `La solicitud ya ha sido aceptada.`
            }) 
        }

        const data = {
            usuario_valido: idUser,
            /* inicio_servicio,
            termino_servicio, */
            pendiente: false,
            aceptado: true,
            rechazado: false,
            $unset: {error: 1},
            fecha_validacion: moment().format("YYYY-MM-DD")
        }

        const solicitudActualizada = await Solicitud.findByIdAndUpdate(idSolicitud, data, {new:true} )
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
                                                            .populate('periodo')
                                                            .populate('usuario_valido')


        // ====== CREAR EL EXPEDIENTE
        const alumno = await Alumno.findById(solicitudActualizada.alumno);
       /* const expediente = new Expediente({alumno, solicitud: solicitudActualizada});
        await expediente.save();
 
        const estructura = getEstructuraExpediente(expediente._id, alumno);
 */
        // Crear los items de acuerdo a la estructura

        /* for (let i = 0; i < estructura.length; i++) {
            const item = estructura[i];
            const nuevoItem = new Item( item );
            await nuevoItem.save()
            
        } */ 

        /*alumno.solicitud = solicitudActualizada*/
        alumno.periodo_servicio = solicitudActualizada.periodo;
        alumno.proyecto = solicitudActualizada.proyecto;
        /*alumno.expediente = expediente; */ 
        await alumno.save();
 
        // GENERAR ARCHIVO
        const fechaCompleta = moment().format("DD MMMM YYYY")

        const dataFile = {
            alumno: solicitudActualizada.alumno.toJSON(),
            proyecto: solicitudActualizada.proyecto.toJSON(),
            periodo: solicitudActualizada.periodo.toJSON(),
            inicio_servicio: solicitudActualizada.inicio_servicio,
            termino_servicio: solicitudActualizada.termino_servicio,
            hoy: moment().format("DD/MM/YYYY"),
            dia: fechaCompleta.split(' ')[0],
            mes: fechaCompleta.split(' ')[1],
            anio: fechaCompleta.split(' ')[2]
        }

        const extencion = '.docx';
        const nombreSolicitud = `${alumno.numero_control}-${solicitudActualizada.codigo}${extencion}`;
        const nombrePresentacion = `${alumno.numero_control}-${'ITC-VI-PO-002-06'}${extencion}`;
        const nombreHojaDatos = `${alumno.numero_control}-${'HOJA-DE-DATOS'}${extencion}`;
        
        
            await Promise.all([
                crearArchivo( solicitudActualizada.codigo, dataFile, nombreSolicitud, alumno ),
                crearArchivo( 'ITC-VI-PO-002-06', dataFile, nombrePresentacion, alumno ),
                crearArchivo( 'HOJA-DE-DATOS', dataFile, nombreHojaDatos, alumno ),
            ]);

            
            await convertirPDF(nombreSolicitud, alumno.numero_control),

            setTimeout(async ()=>{
                await convertirPDF(nombrePresentacion, alumno.numero_control)
            }, 15000);
            
            setTimeout(async ()=>{
                await convertirPDF(nombreHojaDatos, alumno.numero_control)
            }, 30000);
           
            // Borrar los .docx
           /*  setTimeout(()=>{
                borrarArchivo( `./uploads/expedientes/${alumno.numero_control}/${nombreSolicitud}` );
                borrarArchivo( `./uploads/expedientes/${alumno.numero_control}/${nombrePresentacion}` );
                borrarArchivo( `./uploads/expedientes/${alumno.numero_control}/${nombreHojaDatos}` );
            }, 30000); */
/* 
             */
         

        solicitudActualizada.archivo = `${nombreSolicitud.split('.')[0]}.pdf`;
        await solicitudActualizada.save();
        

        /* 
        await convertirPDF(nombrePresentacion, alumno.numero_control)
         */
        res.json({
            status: true,
            message: 'La solicitud ha sido aceptada.',
            solicitud: solicitudActualizada,
        })

    } catch(error){
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }



}


const rechazar = async(req, res = response) => {

    const idSolicitud = req.params.id;
    const idUser = req.uid;

    try {

        const solicitud = await Solicitud.findById(idSolicitud).populate('proyecto');

        if ( !solicitud ) {
            return res.status(404).json({
                status: false,
                message: `No existe una solicitud con el ID ${idSolicitud}.`
            }) 
        }

        // VERIFICAR QUE NO ESTE ACEPTADA
        if ( solicitud.aceptado ) {
            return res.status(400).json({
                status: false,
                message: `No puedes rechazar una solicitud aceptada.`
            }) 
        }

        // VERIFICAR QUE NO ESTE RECHAZADA
        if ( solicitud.rechazado ) {
            return res.status(400).json({
                status: false,
                message: `La solicitud ya ha sido rechazada.`
            }) 
        }

        const { proyecto } = solicitud;

        if ( proyecto.publico ) {
            const [alumnodb, todas] = await Promise.all([
                Alumno.findById(solicitud.alumno),
                Carrera.findOne({nombre:'TODAS'})
            ]);
            const itemCarrera = await ItemCarrera.findOne({proyecto, $or: [{carrera: alumnodb.carrera}, {carrera: todas}] })
            
            itemCarrera.disponibilidad = itemCarrera.disponibilidad + 1;
            await itemCarrera.save();
        }

              
        const data = {
            usuario_valido: idUser,
            error: req.body,
            pendiente: false,
            aceptado: false,
            rechazado: true,
            fecha_validacion: moment().format("YYYY-MM-DD")
        }

        const solicitudActualizada = await Solicitud.findByIdAndUpdate(idSolicitud, data, {new:true} )
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
                                                })
                                                .populate('usuario_valido')

        
        res.json({
            status: true,
            message: 'La solicitud ha sido rechazada.',
            solicitud: solicitudActualizada
        })

    } catch(error){
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }



}

const getCantidadAceptadasAndRechazadas = async(req, res = response) => {

    try{

        const periodo = req.params.periodo;

        const [ totalAceptado, totalRechazado, totalPendiente ] = await Promise.all([
                    Solicitud.countDocuments({aceptado:true, periodo}), 
                    Solicitud.countDocuments({rechazado:true, periodo}), 
                    Solicitud.countDocuments({pendiente:true, periodo}), 
        ]);

        res.status(200).json({
            status: true,
            totalAceptado,
            totalRechazado,
            totalPendiente
        })

    }catch(error){
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }


}

/***********

*************/
expressions.filters.lower = function(input) {
    if(!input) return input;
    return input.toLowerCase();
}

expressions.filters.upper = function(input) {
    if(!input) return input;
    return input.toUpperCase();
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

    const archivoPath = path.resolve(__dirname, `${carpetaAlumno}/${nombreArchivo}`)
    console.log(archivoPath)
    fs.writeFileSync(archivoPath, buf)

    
}


const convertirPDF = async(nombreArchivo, numeroControl) => {

    const extend = '.pdf'

    const carpetaAlumno = path.resolve(__dirname, `../uploads/expedientes/${numeroControl}`);

    if ( !fs.existsSync(carpetaAlumno) ) {
        fs.mkdirSync(carpetaAlumno)
    }

    const enterPath = path.resolve(__dirname, `${carpetaAlumno}/${nombreArchivo}`);
    const outputPath = path.resolve(__dirname, `${carpetaAlumno}/${nombreArchivo.split('.')[0]}${extend}`);

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
    getByStatus,
    getByAlumno,
    getById,
    getAceptadaByAlumno,
    getSolicitudAndProyectoPersonal,
    getCantidadAceptadasAndRechazadas,
    aceptar,
    rechazar,
    create
}