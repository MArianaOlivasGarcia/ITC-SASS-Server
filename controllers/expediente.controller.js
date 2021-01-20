const { response } = require("express");
const { getEstructuraExpediente } = require("../helpers/expediente.helper");
const Expediente = require("../models/expediente.model");
const Item = require('../models/item-expediente.model');
const Alumno = require('../models/alumno.model');
const Programa = require('../models/programa.model');

const create = async(req, res = response) => {

    const alumno = req.uid;

    try {

        const alumnodb = await Alumno.findById(alumno);

        // Verificar que ya tenga un programa.
        const programa = await Programa.findOne({alumno});

        if ( !programa ) {
            return res.status(400).json({
                status: false,
                message: `No puedes crear un expediente porque no tienes un programa.`
            })
        }

        // Verificar que no tenga un expediente ya creado.
        const doesExist = await Expediente.findOne( { alumno } )

        if ( doesExist ) {
            return res.status(400).json({
                status: false,
                message: `El Alumno con el ID ${alumno}, ya tiene un expediente.`
            })
        }

        // Crear el expediente
        const expediente = new Expediente({alumno, programa});
        await expediente.save();

        const estructura = getEstructuraExpediente(expediente._id, alumno);

        // Crear los items de acuerdo a la estructura

        for (let i = 0; i < estructura.length; i++) {
            const item = estructura[i];
            const nuevoItem = new Item( item );
            await nuevoItem.save()
            
        }

        /* estructura.forEach( async item => {
            const nuevoItem = new Item( item );
            await nuevoItem.save();
        }) */

        
        // ASIGANARLO AL ALUMNO Y GUARDAR 
        alumnodb.expediente = expediente;
        await alumnodb.save();

        res.status(201).json({
            status: true,
            message: 'Expediente creado con éxito.',
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


const getByAlumno = async(req, res = response) => {

    try{

        const alumno = req.uid;

        const expediente = await Expediente.findOne({alumno})
                                .populate('programa')
                                .populate({
                                    path: 'programa',
                                    populate: { path: 'proyecto' }
                                })

        const items = await Item.find({expediente}).sort('numero')

        if ( !expediente ) {
            return res.status(404).json({
                status: false,
                message: 'El Alumno no cuenta con un expediente.'
            })
        }

        expediente.items = items;
        res.status(200).json({
            status: true,
            expediente
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