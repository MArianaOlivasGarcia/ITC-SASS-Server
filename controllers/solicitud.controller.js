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


const getPendienteByAlumno = async(req, res = response) => {

    const alumno = req.uid;

    try {

        const solicitud = await Solicitud.findOne({alumno})

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

    const doesExist = await Solicitud.findOne({alumno});

    if ( doesExist ) {
        return res.status(400).json({
            status: false,
            message: 'Ya te has postulado a un proyecto.'
        })
    }

    const data = {
        proyecto: req.body,
        alumno
    }

    const solicitud = new Solicitud(data);

    await solicitud.save();

    res.status(201).json({
        status: true,
        solicitud
    })

}


const aceptar = async(req, res = response) => {

    const id = req.params.id;
    const { valido } = req.body;

    try {

        const solicitud = await Solicitud.findById(id);

        if ( !solicitud ) {
            return res.status(404).json({
                status: false,
                message: `No existe una solicitud con el ID ${id}`
            }) 
        }

        const data = {
            valido,
            pendiente: false,
            aceptado: true,
            rechazado: false,
        }

        const solicitudActualizada = await Solicitud.findByIdAndUpdate(id, data, {new:true} );

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

    const id = req.params.id;
    const { valido, error } = req.body;

    try {

        const solicitud = await Solicitud.findById(id);

        if ( !solicitud ) {
            return res.status(404).json({
                status: false,
                message: `No existe una solicitud con el ID ${id}`
            }) 
        }

        const data = {
            valido,
            error,
            pendiente: false,
            aceptado: false,
            rechazado: true,
        }

        const solicitudActualizada = await Solicitud.findByIdAndUpdate(id, data, {new:true} );

        
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



module.exports = {
    getByStatus,
    getPendienteByAlumno,
    getById,
    aceptar,
    rechazar,
    create
}