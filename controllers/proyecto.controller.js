const { response } = require("express");
const Proyecto = require("../models/proyecto.model");
const Alumno = require("../models/alumno.model");
const Solicitud = require('../models/solicitud.model')
const Periodo = require('../models/periodo.model');
const ItemCarrera = require("../models/item-carrera.model");
const { Types } = require('mongoose');


const create = async(req, res = response) => {

    const { carreras, ...obj } = req.body;

    const proyecto = new Proyecto(req.body);
    await proyecto.save(); 

    // Crear los items de la carrera
    if ( carreras ) {

        await carreras.forEach( async carrera => {
            
            const data = {
                ...carrera,
                proyecto
            }

            const itemCarrera = new ItemCarrera(data);
            await itemCarrera.save();

            
        });
        
    }

    res.status(201).json({
        status: true,
        proyecto
    })

}


const createByAlumno = async(req, res = response ) => {

    const id = req.uid;
    const {proyecto} = req.body;
    
    
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

        const [existeSolicitud, periodoProximo] = await  Promise.all([
            Solicitud.findOne({alumno}),
            Periodo.findOne({isProximo: true})
        ])
        
        if ( !periodoProximo ) {
            return res.status(404).json({
                status: false,
                message: 'No hay un periodo próximo.'
            })
        }

        // VALIDAR LAS FECHAS DE RECEPCION DE SOLICITUDES
        const hoy = Date.now();
        const { fecha_inicio, fecha_termino } = periodoProximo.recepcion_solicitudes
        const fi = new Date(fecha_inicio).getTime();
        const ft = new Date(fecha_termino).getTime();
        
        if ( hoy < fi  ){
            return res.status(400).json({
                status: false,
                message: `Aun no es fecha de recepción de solicitudes de servicio social para el periodo ${periodoProximo.nombre}.`
            })
        } else if ( hoy > ft ){
            return res.status(400).json({
                status: false,
                message: `La recepción de solicitudes de servicio social para el periodo ${periodoProximo.nombre} ya vencio.`
            })
        }
        
        if ( !existeSolicitud ) {

            const proyectoNew = new Proyecto({
                ...proyecto,
                periodo: periodoProximo,
                alumno
            });
            await proyectoNew.save() 

            const solicitud = new Solicitud({
                alumno,
                proyecto: proyectoNew,
            })

            await solicitud.save();
        
            return res.status(201).json({
                status: true,
                proyecto: proyectoNew
            })

        }

        if ( existeSolicitud.pendiente ) {
            return res.status(400).json({
                status: false,
                message: 'Ya tienes una solicitud pendiente.'
            })
        }

        if ( existeSolicitud.aceptado ) {
            return res.status(400).json({
                status: false,
                message: 'Ya tienes una solicitud aprobada.'
            })
        }

        if ( existeSolicitud.rechazado ) {

            const proyectoNew = new Proyecto({
                ...proyecto,
                periodo: periodoProximo,
                alumno,
            });
            await proyectoNew.save() 

            const data = {
                alumno,
                proyecto: proyectoNew,
                rechazado: false,
                aceptado: false,
                pendiente: true,
                error: undefined,
                fecha_solicitud: Date.now(),
                fecha_validacion: undefined
            }
            
            await Solicitud.findByIdAndUpdate( existeSolicitud._id, data, {new:true});
            
        
            res.status(201).json({
                status: true,
                proyecto: proyectoNew
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
           /*  case 'privado':
                [proyectos, total] = await Promise.all([
                    Proyecto.find({publico:false}).populate('dependencia').populate('periodo').skip(desde).limit(5),
                    Proyecto.countDocuments({publico:false})
                ]);
            break; */
             case 'privado':
                const solicitudes = await Solicitud.find({aceptado:true})
                                                .skip(desde).limit(5)
                                                .populate('proyecto')
                                                .populate({
                                                    path: 'proyecto',
                                                    populate: { path: 'dependencia' }
                                                })
                                                .populate({
                                                    path: 'proyecto',
                                                    populate: { path: 'periodo' }
                                                })
                
                proyectos = solicitudes.map( solicitud => solicitud.proyecto );
                total = proyectos.length;

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


const getAllByCarreraAndPeriodoProximoAndFechas = async(req, res = response) => {

    const carrera = req.params.carrera
    const desde = Number(req.query.desde) || 0;

    try {


        const periodoProximo = await Periodo.findOne({isProximo: true})

        if ( !periodoProximo ) {
            return res.status(404).json({
                status: false,
                message: 'No hay un periodo proximo.'
            })
        }
    
/*         const hoy = new Date();
 */ 
        const [proyectos, total] = await Promise.all([
            Proyecto.find({ 'carreras.carrera': carrera,
                            'carreras.cantidad': { $gt: 0 },
                            publico: true, 
                            periodo: periodoProximo,
                            /* fecha_limite: { $gte: hoy },
                            fecha_inicial: { $lte: hoy }  */})
                .skip(desde)
                .limit(5)
                .populate('dependencia') 
                .populate('periodo')
                .populate({
                    path: 'carreras',
                    populate: { path: 'carrera'}
                }),
            Proyecto.countDocuments({ 'carreras.carrera': carrera,
                                      'carreras.cantidad': { $gt: 0 },
                                      publico: true, 
                                      periodo: periodoProximo,
                                      /* fecha_limite: { $gte: hoy },
                                      fecha_inicial: { $lte: hoy }  */})
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

        if ( !proyectoDb.alumno == alumno  && proyectoDb.publico ) {
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

        /* if( !alumno.proyecto ) {
            return res.json({
                status: true,
                message: `El Alumno no tiene un proyecto asignado.`
            })
        }
 */
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

        const [ proyectodb, periodoProximo ] = await Promise.all([
            Proyecto.findById(id).populate('periodo').populate('dependencia'),
            Periodo.findOne({isProximo: true})
        ])
    

        if ( proyectodb.periodo.isProximo ) {
            return res.status(400).json({
                status: false,
                message: 'No puedes duplicar un proyecto del periodo próximo.'
            })
        }

        
        const proyectoNew = new Proyecto( proyectodb );

        proyectoNew._id           = Types.ObjectId();
        proyectoNew.periodo       = periodoProximo;
        proyectoNew.carreras      = undefined;
        proyectoNew.fecha_inicial = Date.now();
        proyectoNew.fecha_limite  = Date.now();
        proyectoNew.isNew         = true;

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


const adoptar = async(req, res = response) => {

    const id = req.params.id;

    try {

        const [ proyecto, periodoProximo ] = await Promise.all([
            Proyecto.findById(id).populate('periodo').populate('dependencia'),
            Periodo.findOne({isProximo: true})
        ])

        if ( proyecto.adoptado ){
            return res.status(400).json({
                status: false,
                message: 'Ya has adoptado este proyecto.'
            })
        }
    
        
        const proyectoNew = new Proyecto( proyecto );

        proyectoNew._id = Types.ObjectId();
        proyectoNew.periodo = periodoProximo;
        proyectoNew.publico = true;
        proyectoNew.alumno = undefined;
        proyectoNew.carreras = undefined;
        proyectoNew.fecha_inicial = Date.now();
        proyectoNew.fecha_limite = Date.now();
        proyectoNew.isNew = true;

        proyecto.adoptado = true;

        await Promise.all([
            proyectoNew.save(),
            proyecto.save()
        ])

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
    getAllByCarreraAndPeriodoProximoAndFechas,
    getAllByCarrera,
    getByAlumno,
    update,
    updateByAlumno,
    deleteProyecto,
    duplicar,
    adoptar
}