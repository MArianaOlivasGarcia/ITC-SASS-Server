const { response } = require("express");
const Solicitud = require('../models/solicitud-proyecto.model');
const Alumno = require('../models/alumno.model');


const getByStatus = async(req, res = response) => {

    const status = req.params.status;
    const desde = Number(req.query.desde) || 0;

   try {

        let solicitudes  = []; 
        let total;
        switch( status ) {

            case 'pendiente': 
                [solicitudes, total] = await Promise.all([
                                            Solicitud.find({pendiente: true}).sort('create_at').skip(desde).limit(5)
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
                                            Solicitud.find({aceptado: true}).sort('create_at').skip(desde).limit(5)
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
                                            Solicitud.find({rechazado: true}).sort('create_at').skip(desde).limit(5)
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
                                .populate('valido')


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

    // Ya tiene un proyecto PENDIENTE
    const hasPendiente = await Solicitud.findOne({alumno, pendiente: true});

    if ( hasPendiente ) {
        return res.status(400).json({
            status: false,
            message: 'Ya tienes una solicitud de proyecto pendiente.'
        })
    }

    // Ya tiene un proyecto ACEPTADO
    const hasAceptado = await Solicitud.findOne({alumno, aceptado: true});

    if ( hasAceptado ) {
        return res.status(400).json({
            status: false,
            message: 'Ya tienes un proyecto aprobado.'
        })
    }



    // SI TIENE UN PROYECTO RECHAZADO EDITARLO PARA NO GUARDAR OTRA SOLICITUD EN LA BASE DE DATOS
    const hasRechazado = await Solicitud.findOne({alumno, rechazado: true});

    if ( hasRechazado ) {

        const data = {
            proyecto: req.body,
            rechazado: false,
            aceptado: false,
            pendiente: true,
            error: undefined
        }

        const solicitudActualizada = await Solicitud.findByIdAndUpdate( hasRechazado, data, {new:true})
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
                                                    

        return res.json({
            status: true,
            message: 'Solicitud de proyecto enviada nuevamente con éxito.',
            solicitud: solicitudActualizada
        })
    }



    // NO TIENE UNO RECHAZADO ENTONCES CREAR NUEVO
    const data = {
        proyecto: req.body,
        alumno
    }

    const solicitud = new Solicitud(data);

    await solicitud.save();

    res.status(201).json({
        status: true,
        message: 'Solicitud de proyecto enviada con éxito.',
        solicitud
    })

}


const aceptar = async(req, res = response) => {

    const idSolicitud = req.params.id;
    const idUser = req.uid;

    try {

        const solicitud = await Solicitud.findById(idSolicitud);

        if ( !solicitud ) {
            return res.status(404).json({
                status: false,
                message: `No existe una solicitud con el ID ${idSolicitud}`
            }) 
        }

        const data = {
            valido: idUser,
            pendiente: false,
            aceptado: true,
            rechazado: false,
            error: undefined
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

        // Asignarle poroyecto al alumno
        const alumno = await Alumno.findById(solicitudActualizada.alumno);
        alumno.proyecto = solicitudActualizada.proyecto;
        await alumno.save();

        res.json({
            status: true,
            message: 'La solicitud ha sido aceptada.',
            solicitud: solicitudActualizada,
            alumno
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

        console.log( solicitud.aceptado )
        // VERIFICAR QUE NO ESTE ACEPTADA
        if ( solicitud.aceptado ) {
            return res.status(400).json({
                status: false,
                message: `La solicitud ya ha sido aceptada.`
            }) 
        }


        const data = {
            valido: idUser,
            error: req.body,
            pendiente: false,
            aceptado: false,
            rechazado: true,
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


module.exports = {
    getByStatus,
    getByAlumno,
    getById,
    getAceptadaByAlumno,
    aceptar,
    rechazar,
    create
}