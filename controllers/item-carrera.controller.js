const { response } = require("express");
const ItemCarrera = require("../models/item-carrera.model");


const getAllByProyecto = async(req, res = response) => {

    try {
        const proyecto = req.params.proyecto;

        const itemsCarrera = await ItemCarrera.find({proyecto})

        res.status(200).json({
            status: true,
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




module.exports = {
    getAllByProyecto
}