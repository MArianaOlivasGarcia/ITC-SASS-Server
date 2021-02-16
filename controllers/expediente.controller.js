const { response } = require("express");
const { getEstructuraExpediente } = require("../helpers/expediente.helper");
const Expediente = require("../models/expediente.model");
const Item = require('../models/item-expediente.model');
const Alumno = require('../models/alumno.model');
const Solicitud = require('../models/solicitud.model');

const create = async(req, res = response) => {

    const alumno = req.uid;

    try {

        const alumnodb = await Alumno.findById(alumno);

        
        // Verificar que no tenga un expediente ya creado.
        const doesExist = await Expediente.findOne( { alumno } )

        if ( doesExist ) {
            return res.status(400).json({
                status: false,
                message: `El Alumno con el ID ${alumno}, ya tiene un expediente.`
            })
        }


        //Obtener la solicitud aceptada del alumno que contiene el proyecto y su fechas de servicio social
        const solicitud = await Solicitud.findOne({alumno, aceptado:true});

        // Crear el expediente
        const expediente = new Expediente({alumno, solicitud});
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

        if ( expediente ) {
            expediente.items = items;
        }

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


    try{

        const id = req.params.id;

        const expediente = await Expediente.findById(id)
                                .populate('alumno')
                                .populate('programa')
                                .populate({
                                    path: 'programa',
                                    populate: { path: 'proyecto' }
                                })

        const items = await Item.find({expediente}).sort('numero')

        if ( expediente ) {
            expediente.items = items;
        }

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



// TODO: Hacer que la estructura sea dinamica
// Obtener la estructura por algun codigo/clave/plan del expediente
const getEstructura = async(req, res = response) => {

    try{

        res.status(200).json({
            estructura: getEstructuraExpediente()
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
    getByAlumno,
    getById,
    getEstructura
}