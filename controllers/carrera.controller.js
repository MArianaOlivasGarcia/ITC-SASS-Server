const { response } = require("express");
const Carrera = require("../models/carrera.model");



const getAll = async(req, res = response) => {

    try {

        const carreras = await Carrera.find().sort('nombre');

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


const create = async(req, res = response) => {

    const carrera = new Carrera(req.body);

    await carrera.save();

    res.status(201).json({
        status: true,
        carrera
    })

}



module.exports = {
    getAll,
    create
}