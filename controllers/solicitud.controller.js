const { response } = require("express");
const path = require('path');
const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater')

const Solicitud = require('../models/solicitud.model');
const Alumno = require('../models/alumno.model');
const Usuario = require('../models/usuario.model');
const ItemCarrera = require("../models/item-carrera.model");
const Proyecto = require("../models/proyecto.model");
const Expediente = require("../models/expediente.model");
const Item = require("../models/item-expediente.model");
const { getEstructuraExpediente } = require("../helpers/expediente.helper");


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

    const hoy = Date.now();

    const proyectodb = await Proyecto.findById(proyecto._id).populate('periodo');
    const { fecha_inicio, fecha_termino } = proyectodb.periodo.recepcion_solicitudes
    const fi = new Date(fecha_inicio).getTime();
    const ft = new Date(fecha_termino).getTime();
    
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
            message: `La fecha de termino de servicio social tiene que ser menor ó igual a la fecha de termino del periodo ${proyectodb.periodo.nombre}.`
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

        if ( !hasRechazado.proyecto.publico ) {
            await Proyecto.findByIdAndDelete(hasRechazado.proyecto._id);
        }

        /* const proyecto = req.body; */
        const alumnodb = await Alumno.findById(alumno);

        const data = {
            proyecto,
            inicio_servicio,
            termino_servicio,
            rechazado: false,
            aceptado: false,
            pendiente: true,
            fecha_solicitud: Date.now(),
            error: undefined,
            fecha_validacion: undefined
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
        const itemCarrera = await ItemCarrera.findOne({proyecto, carrera: alumnodb.carrera})
        itemCarrera.cantidad = itemCarrera.cantidad - 1;
        if ( itemCarrera.cantidad == 0 ){
            await itemCarrera.deleteOne();
        } else {
            await itemCarrera.save();
        }             

        return res.json({
            status: true,
            message: 'Solicitud de Servicio Social enviada nuevamente con éxito.',
            solicitud: solicitudActualizada
        })
    }



    // NO TIENE UNO RECHAZADO ENTONCES CREAR NUEVO
    // Obtener el proyecto y quitarle 1 a la cantidad del itemCarrera
    /* const proyecto = req.body; */
    const alumnodb = await Alumno.findById(alumno);
    const itemCarrera = await ItemCarrera.findOne({proyecto, carrera: alumnodb.carrera})
    itemCarrera.cantidad = itemCarrera.cantidad - 1;
    if ( itemCarrera.cantidad == 0 ){
        await itemCarrera.deleteOne();
    } else {
        await itemCarrera.save();
    }

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

        const data = {
            usuario_valido: idUser,
            inicio_servicio,
            termino_servicio,
            pendiente: false,
            aceptado: true,
            rechazado: false,
            error: undefined,
            fecha_validacion: Date.now()
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

        const isDate = new Date(solicitudActualizada.inicio_servicio);
        const tsDate = new Date(solicitudActualizada.termino_servicio);


        const dataFile = {
            alumno: solicitudActualizada.alumno.toJSON(),
            proyecto: solicitudActualizada.proyecto.toJSON(),
            periodo: solicitudActualizada.proyecto.periodo.toJSON(),
            inicio_servicio: isDate.toISOString().substring(0,10),
            termino_servicio: tsDate.toISOString().substring(0,10)
        }

        const extencion = 'docx';
        const nombreArchivo = `${alumno.numero_control}-${solicitudActualizada.codigo}.${extencion}`;
        

        await crearArchivo( solicitudActualizada.codigo, dataFile, nombreArchivo, solicitudActualizada.alumno );
 

        solicitudActualizada.archivo = nombreArchivo;
        await solicitudActualizada.save();
        

        
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

        const solicitud = await Solicitud.findById(idSolicitud);

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
                message: `La solicitud ya ha sido aceptada.`
            }) 
        }

       /*  if ( solicitud.proyecto.carreras ){ */
            // Obtener el proyecto y sumarle 1 a la cantidad del itemCarrera
            const alumnodb = await Alumno.findById(solicitud.alumno);
                    
            const itemCarrera = await ItemCarrera.findOne({proyecto: solicitud.proyecto, carrera: alumnodb.carrera})
            
            if ( !itemCarrera ) {
                const newItemCarrera = new ItemCarrera({proyecto: solicitud.proyecto, carrera: alumnodb.carrera, cantidad:1})
                await newItemCarrera.save();
            } else {
                itemCarrera.cantidad = itemCarrera.cantidad + 1;
                await itemCarrera.save();
            }
            
            
/* 
        } */


        const data = {
            usuario_valido: idUser,
            error: req.body,
            pendiente: false,
            aceptado: false,
            rechazado: true,
            fecha_validacion: Date.now()
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



/***********

*************/



const crearArchivo = async( codigo, data, nombreArchivo, alumno ) => {

    // codigo, el archivo template (el que se va aditar)
    // data, Información

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
    getByStatus,
    getByAlumno,
    getById,
    getAceptadaByAlumno,
    getSolicitudAndProyectoPersonal,
    aceptar,
    rechazar,
    create
}