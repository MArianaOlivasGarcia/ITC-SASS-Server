const { response } = require("express");
const Expediente = require("../models/expediente.model");
const Item = require("../models/item-expediente.model")


const create = async(req, res = response) => {

    const alumno = req.uid;

    try {

        const doesExist = await Expediente.findOne( { alumno } )

        if ( doesExist ) {
            return res.status(400).json({
                status: false,
                message: `El Alumno con el id ${alumno}, ya tiene un expediente.`
            })
        }

        const item = new Item( req.body );
        const expediente = new Expediente({ alumno, items: item });

        await item.save();
        await expediente.save();

 
        res.status(201).json({
            status: true, 
            expediente
        })

    }  catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }

}

const getByAlumnoId = async(req, res = response) => {

        const  alumno = req.params.alumno;

    try {

        const expediente = await Expediente.findOne( {alumno} )
            .populate( 'alumno', 'nombre' )
            .populate({
                path: 'items',
                populate: { path: 'item'}
            });

        if (!expediente) {
            return res.status(404).json({
                status: false,
                message: 'No existe un expediente con ese id alumno'
            })
        }

        res.status(200).json({
            status: true,
            expediente
        })

    } catch( error ){

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

        const expediente = await Expediente.findById(uid)
            .populate({
                path: 'items',
                populate: { path: 'item'}
            })

        if (!expediente) {
            return res.status(404).json({
                status: false,
                message: 'No existe un expediente con ese id'
            })
        }

        res.status(200).json({
            status: true,
            expediente
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
    create,
    getByAlumnoId,
    getById
}