const { response } = require("express");
const Aviso = require("../models/aviso.model");



const getAllByDisponiblePaginados = async(req, res = response) => {

    try {

        const desde = Number(req.query.desde) || 0;

        const [avisos, total] = await Promise.all([
            Aviso.find({disponible:true}).skip(desde).limit(5),
            Aviso.countDocuments({disponible:true})
        ]);


        res.status(200).json({
            status: true,
            avisos,
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



const getAllPaginados = async(req, res = response) => {

    try {

        const desde = Number(req.query.desde) || 0;

        const [avisos, total] = await Promise.all([
            Aviso.find({}).skip(desde).limit(10),
            Aviso.countDocuments()
        ]);


        res.status(200).json({
            status: true,
            avisos,
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

    const aviso = new Aviso(req.body);

    await aviso.save();

    res.status(201).json({
        status: true,
        aviso
    })

}


const upadate = async(req, res = response) => {
    
    const id = req.params.id

    try {

        const avisodb = await Aviso.findById(id);

        if( !avisodb ) {
            return res.status(404).json({
                status: false,
                message: `No existe un carrera con el ID ${id}`
            })
        }

        const avisoActualizado = await Aviso.findByIdAndUpdate(id, req.body, {new:true})
        
        res.status(200).json({
            status: true,
            aviso: avisoActualizado
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

        const aviso = await Aviso.findById(id);

        if( !aviso ) {
            return res.status(404).json({
                status: false,
                message: `No existe una aviso con el ID ${id}`
            })
        }

        res.json({
            status: true,
            aviso
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
    getAllByDisponiblePaginados,
    getAllPaginados,
    getById,
    create,
    upadate
}