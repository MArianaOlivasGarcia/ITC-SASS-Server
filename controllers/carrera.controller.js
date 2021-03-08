const { response } = require("express");
const Carrera = require("../models/carrera.model");



const getAll = async(req, res = response) => {

    try {

        const carreras = await Carrera.find({}).sort('nombre');


        res.status(200).json({
            status: true,
            carreras
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }



}



const getAllPaginados = async(req, res = response) => {

    try {

        const desde = Number(req.query.desde) || 0;

        const [carreras, total] = await Promise.all([
            Carrera.find({ nombre: { $nin: ['TODAS'] } }).skip(desde).limit(5).sort('nombre'),
            Carrera.countDocuments({ nombre: { $nin: ['TODAS'] } })
        ]);


        res.status(200).json({
            status: true,
            carreras,
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


const create = async(req, res = response) => {

    const carrera = new Carrera(req.body);

    await carrera.save();

    res.status(201).json({
        status: true,
        carrera
    })

}


const upadate = async(req, res = response) => {
    
    const id = req.params.id

    try {

        const carreradb = await Carrera.findById(id);

        if( !carreradb ) {
            return res.status(404).json({
                status: false,
                message: `No existe un carrera con el ID ${id}`
            })
        }

        const carreraActualizada = await Carrera.findByIdAndUpdate(id, req.body, {new:true})
        
        res.status(200).json({
            status: true,
            carrera: carreraActualizada
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }

}


const getById = async(req, res = response ) => {

    const id = req.params.id

    try {

        const carrera = await Carrera.findById(id);

        if( !carrera ) {
            return res.status(404).json({
                status: false,
                message: `No existe una carrera con el ID ${id}`
            })
        }

        res.json({
            status: true,
            carrera
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
    getAll,
    getAllPaginados,
    getById,
    create,
    upadate
}