const { response } = require("express");
const { getEstructuraExpediente } = require("../helpers/expediente.helper");
const Expediente = require("../models/expediente.model");
const Item = require('../models/item-expediente.model');
const Alumno = require('../models/alumno.model');

const create = async(req, res = response) => {

    const alumno = req.uid;

    try {

        const alumnodb = await Alumno.findById(alumno);

        if ( !alumnodb ){
            return res.status(404).json({
                status: false,
                message: `El Alumno con el ID ${alumno} no éxiste.`
            })
        }

        const doesExist = await Expediente.findOne( { alumno } )

        if ( doesExist ) {
            return res.status(400).json({
                status: false,
                message: `El Alumno con el ID ${alumno}, ya tiene un expediente.`
            })
        }

        const expediente = new Expediente({alumno });
        await expediente.save();

        const estructura = getEstructuraExpediente(expediente._id);

 
        estructura.forEach( async item => {
            const nuevoItem = new Item( item );
            await nuevoItem.save();
        })

        // OBTENER EL EXPEDIENTE
        const expedientedb = await Expediente.findById(expediente._id)
        const items = await Item.find({expediente: expedientedb})
                                                .sort('numero');
        expedientedb.items = items;

        // ASIGANARLO AL ALUMNO Y GUARDAR
        alumnodb.expediente = expedientedb;
        await alumnodb.save();

        res.status(201).json({
            status: true,
            message: 'Expdiente creado con éxito.',
            expediente: expedientedb
        })

    }  catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }

}

const getByAlumno = async(req, res = response) => {

    try{

        const alumno = req.params.alumno;

        res.status(200).json({
            alumno
        })

    } catch(error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }

}

const getById = async(req, res = response) => {



}






module.exports = {
    create,
    getByAlumno,
    getById
}