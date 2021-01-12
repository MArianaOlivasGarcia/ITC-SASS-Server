const { response } = require("express");
const Proyecto = require("../models/proyecto.model");
const Alumno = require("../models/alumno.model");

const create = async(req, res = response) => {

    const proyecto = new Proyecto(req.body);

    await proyecto.save();

    res.status(201).json({
        status: true,
        proyecto 
    })

}



const createByAlumno = async(req, res = response ) => {

    const id = req.uid;

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

        const data = {
            ...req.body,
            alumno
        }
        const proyecto = new Proyecto(data);
        await proyecto.save()
        
        alumno.proyecto = proyecto._id;
        await alumno.save();
        
        res.status(201).json({
            status: true,
            proyecto
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }



}


const getAll = async(req, res = response) => {

    try {

        const desde = Number(req.query.desde) || 0;

        const [proyectos, total] = await Promise.all([
            Proyecto.find({}).populate('dependencia')/* .skip(desde).limit(5) */,
            Proyecto.countDocuments()
        ]);

        res.status(200).json({
            status: true,
            proyectos
            /* total */
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
                            .populate({
                                path: 'carreras',
                                populate: { path: 'carrera'}
                            })
                            .populate('alumno');


        if (!proyecto) {
            return res.status(404).json({
                status: false,
                message: 'No existe un proyecto con ese id'
            })
        }

        res.status(200).json({
            status: true,
            proyecto
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
                /* .skip(desde)
                .limit(5) */
                .populate('dependencia')
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

    try {

        const proyecto = await Proyecto.findById(uid);

        if (!proyecto) {
            return res.status(404).json({
                status: false,
                message: 'No existe un proyecto con ese id'
            })
        }


        const proyectoActualizado = await Proyecto.findByIdAndUpdate(uid, req.body, { new: true });

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

        const proyecto = await Proyecto.findOne({alumno: id, publico: false})

        res.status(200).json({
            status: true,
            proyecto
        })

    }catch(error) {
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
    getAll,
    getById,
    getPersonal,
    getAllByCarrera,
    update,
    deleteProyecto
}