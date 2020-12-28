const { response } = require("express");
const ItemCarreraProyecto = require("../models/item-carrera-proyecto.model");
const Proyecto = require("../models/proyecto.model");


const create = async(req, res = response) => {

    const proyecto = new Proyecto(req.body);

    await proyecto.save();
 
    res.status(201).json({
        status: true,
        proyecto 
    })

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

        const [proyecto, carreras] = await Promise.all([
            Proyecto.findById(uid)
                .populate('dependencia', 'nombre'),
            ItemCarreraProyecto.find({proyecto:uid})
                .populate('carrera', 'nombre')
        ]);


        if (!proyecto) {
            return res.status(404).json({
                status: false,
                message: 'No existe un proyecto con ese id'
            })
        }

        proyecto.carreras = carreras;

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

// TODO: MODIFICAR
const getAllByCarrera = async(req, res = response) => {

    const carrera = req.params.carrera

    try {

        const desde = Number(req.query.desde) || 0;

        const [proyectos, total] = await Promise.all([
            Proyecto.find({ 'carreras.carrera': carrera })
                .skip(desde)
                .limit(5)
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
 


const createCarreraProyecto = async(req, res = response) => {

    const itemCarrera = new ItemCarreraProyecto(req.body);

    await itemCarrera.save();
 
    res.status(201).json({
        status: true,
        item: itemCarrera 
    })

}






module.exports = {
    create,
    getAll,
    getById,
    getAllByCarrera,
    update,
    createCarreraProyecto
}