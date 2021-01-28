const { response } = require("express");
const Proyecto = require("../models/proyecto.model");
const Alumno = require("../models/alumno.model");
const Solicitud = require('../models/solicitud.model')
const Periodo = require('../models/periodo.model');
const ItemCarrera = require("../models/item-carrera.model");
const { Types } = require('mongoose');


const create = async(req, res = response) => {

    const { carreras  } = req.body;

    const proyecto = new Proyecto(req.body);
    const proyectoSaved = await proyecto.save(); 

    // Crear los items de la carrera
    if ( carreras ) {

        await carreras.forEach( async carrera => {
            
            const data = {
                ...carrera,
                proyecto: proyectoSaved
            }

            const itemCarrera = new ItemCarrera(data);
            await itemCarrera.save();

            
        });
        
    }

    res.status(201).json({
        status: true,
        proyecto: proyectoSaved
    })

}


const createByAlumno = async(req, res = response ) => {

    const id = req.uid;
    const { proyecto, ...obj } = req.body;
    
    try {

        const alumno = await Alumno.findById(id);
    
        if ( !alumno ){
            return res.status(404).json({
                status: false,
                message: `No existe un alumno con el ID ${id}` 
            })
        }
    
        
        const existeProyecto = await Proyecto.findOne({alumno})
       
        if ( existeProyecto ){
            return res.status(400).json({
                status: false,
                message: 'Ya has creado un proyecto.'
            })
        }

        // Obtener el periodo actual
        const periodoActual = await Periodo.findOne({isActual: true});

        if ( !periodoActual ) {
            return res.status(404).json({
                status: false,
                message: 'No hay un periodo actual.'
            })
        }

        const proyectoNew = new Proyecto({
            ...proyecto,
            periodo: periodoActual,
            alumno
        });
        await proyectoNew.save() 
        
        const solicitud = new Solicitud({
            alumno,
            proyecto: proyectoNew,
            ...obj
        })

        await solicitud.save();
 
        res.status(201).json({
            status: true,
            proyecto: proyectoNew
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }



}


const getAllByTipo = async(req, res = response) => {

    try {

        const desde = Number(req.query.desde) || 0;
        const tipo = req.params.tipo;

        let proyectos;
        let total;

        switch ( tipo ) {

            // NO creados por alumno
            case 'publico':
                [proyectos, total] = await Promise.all([
                    Proyecto.find({publico:true}).populate('dependencia').populate('periodo').skip(desde).limit(5),
                    Proyecto.countDocuments({publico:true})
                ]);
            break;

            // Creados por alumnos
            case 'privado':
                [proyectos, total] = await Promise.all([
                    Proyecto.find({publico:false}).populate('dependencia').populate('periodo').skip(desde).limit(5),
                    Proyecto.countDocuments({publico:false})
                ]);
            break;


            default:
                return res.status(400).json({
                    status: false,
                    message: 'El tipo válido tiene que ser publico o privado.'
                })
        }


        

        res.status(200).json({
            status: true,
            proyectos,
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


const getById = async(req, res = response) => {


    const uid = req.params.id

    try {

        const proyecto = await Proyecto.findById(uid)
                            .populate('dependencia', 'nombre')
                            .populate('alumno')
                            .populate({
                                path: 'alumno',
                                populate: { path: 'carrera'}
                            });


        if (!proyecto) {
            return res.status(404).json({
                status: false,
                message: 'No existe un proyecto con ese id'
            })
        }

        // Obtener los items de la carreras
        const itemsCarrera = await ItemCarrera.find({proyecto})
                                        .populate('carrera');
        
        
        res.status(200).json({
            status: true,
            proyecto,
            itemsCarrera
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }

}


const getAllByCarreraAndPeriodoActualAndFechas = async(req, res = response) => {

    const carrera = req.params.carrera
    const desde = Number(req.query.desde) || 0;

    try {


        const periodoActual = await Periodo.findOne({isActual: true})

        if ( !periodoActual ) {
            return res.status(404).json({
                status: false,
                message: 'No hay un periodo actual.'
            })
        }
    
        const hoy = new Date();
 
        const [proyectos, total] = await Promise.all([
            Proyecto.find({ 'carreras.carrera': carrera,
                            publico: true, 
                            periodo:periodoActual,
                            fecha_limite: { $gte: hoy },
                            fecha_inicial: { $lte: hoy } })
                .skip(desde)
                .limit(5)
                .populate('dependencia') 
                .populate('periodo')
                .populate({
                    path: 'carreras',
                    populate: { path: 'carrera'}
                }),
            Proyecto.countDocuments({ 'carreras.carrera': carrera })
        ]);

        res.status(200).json({
            status: true,
            proyectos,
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


const getAllByCarrera = async(req, res = response) => {

    const carrera = req.params.carrera

    try {

        const desde = Number(req.query.desde) || 0;

        const [proyectos, total] = await Promise.all([
            Proyecto.find({ 'carreras.carrera': carrera, publico: true })
                .skip(desde)
                .limit(5)
                .populate('dependencia')
                .populate('periodo')
                .populate({
                    path: 'carreras',
                    populate: { path: 'carrera'}
                }),
            Proyecto.countDocuments({ 'carreras.carrera': carrera })
        ]);

        res.status(200).json({
            status: true,
            proyectos,
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


const update = async(req, res = response) => {

    const uid = req.params.id;
    const { carreras, ...obj } = req.body;

    try {

        const proyecto = await Proyecto.findById(uid);

        if (!proyecto) {
            return res.status(404).json({
                status: false,
                message: 'No existe un proyecto con ese id'
            })
        }


        const proyectoActualizado = await Proyecto.findByIdAndUpdate(uid, req.body, { new: true })
                                            .populate('dependencia');




        // EDITAR LOS ITEMS CARRERAS
        if ( carreras ) {
            carreras.forEach( async carrera => {
                
                // Borrar Todos y añadir nuevos
                await ItemCarrera.deleteMany({proyecto});

                const data = {
                    ...carrera,
                    proyecto: proyectoActualizado
                }
                const nuevoItemCarrera = await ItemCarrera(data);
                await nuevoItemCarrera.save()

            });
        }
        // FIN EDITAR LOS ITEMS CARRERAS
        

        res.status(200).json({
            status: true,
            proyecto: proyectoActualizado
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }


}


const updateByAlumno = async(req, res = response) => {

    const uid = req.params.id;
    const alumno = req.uid;

    const { proyecto, ...obj } = req.body;

    try {

        const proyectoDb = await Proyecto.findById(uid);

        if (!proyectoDb) {
            return res.status(404).json({
                status: false,
                message: `No existe un proyecto con el ID ${uid}`
            })
        }

        if ( !proyectoDb.alumno == alumno ) {
            return res.status(400).json({
                status: false,
                message: `No puedes editar un proyecto que no es tuyo.`
            })
        }

        const solicitud = await Solicitud.findOne({alumno, proyecto: proyectoDb });

        if ( solicitud.pendiente || solicitud.aceptado ) {
            return res.status(400).json({
                status: false,
                message: `No puedes editar tu solicitud porque tienes una en Revisión o ya Aprobado.`
            })
        }

        // Si es rechazado puede editarlo
        const proyectoActualizado = await Proyecto.findByIdAndUpdate(uid, proyecto, { new: true })
                                            .populate('dependencia');

        // Si edito el proyecto lo vuelvo a mandar a la solicitud
        const data = {
            proyecto: proyectoActualizado,
            rechazado: false,
            aceptado: false,
            pendiente: true,
            error: undefined,
            fecha_solicitud: Date.now(),
            ...obj
        }

        await Solicitud.findOneAndUpdate( {alumno, proyecto: proyectoDb}, data, {new:true})
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

        res.status(200).json({
            status: true,
            proyecto: proyectoActualizado
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }
 

}


const deleteProyecto = async(req, res = response)  => {

    const uid = req.params.id;

    try {
        
        const proyecto = await Proyecto.findById( uid );

        if ( !proyecto ) {
            return res.status(404).json({
                status: false,
                message: `No existe un proyecto con el ID ${uid}`
            });
        }

        await Proyecto.findByIdAndDelete( uid );

        res.status(200).json({
            status: true,
            message: 'Proyecto eliminado con éxito.'
        })

    } catch(error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }

}


const getPersonal = async(req, res = response) => {

    const id = req.uid;

    try {

        const proyecto = await Proyecto.findOne({alumno: id })
                                            .populate('dependencia')

        if ( !proyecto ) {
            return res.status(200).json({
                status: true,
                message: 'No tienes un proyecto personal'
            })
        }

        const solicitud = await Solicitud.findOne({alumno: id, proyecto})
                                        .populate('proyecto')
                                        .populate({
                                            path: 'proyecto',
                                            populate: { path: 'dependencia' }
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


const getByAlumno = async(req, res = response) => {

    const id = req.uid;


    try{

        const alumno = await Alumno.findById(id)
                                .populate('proyecto')

        if( !alumno ) {
            return res.status(404).json({
                status: false,
                message: `No existe un alumno con el ID ${id}.`
            })
        }

        if( !alumno.proyecto ) {
            return res.json({
                status: true,
                message: `El Alumno no tiene un proyecto asignado.`
            })
        }

        res.json({
            satus: true,
            proyecto: alumno.proyecto
        })

    } catch(error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }

}



const duplicar = async(req, res = response ) => {

    const id = req.params.id;

    try {

        const proyectodb = await Proyecto.findById(id);

        const periodoActual = await Periodo.findOne({isActual: true});

        const proyectoNew = new Proyecto( proyectodb );

        proyectoNew._id = Types.ObjectId();
        proyectoNew.periodo = periodoActual;
        proyectoNew.isNew = true;
        proyectoNew.carreras = undefined;

        await proyectoNew.save();

        res.status(201).json({
            status: true,
            proyecto: proyectoNew
        })
        
    } catch(error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }

}





module.exports = {
    create,
    createByAlumno,
    getAllByTipo,
    getById,
    getPersonal,
    getAllByCarreraAndPeriodoActualAndFechas,
    getAllByCarrera,
    getByAlumno,
    update,
    updateByAlumno,
    deleteProyecto,
    duplicar
}