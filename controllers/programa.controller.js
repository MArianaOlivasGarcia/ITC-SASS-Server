const { response } = require("express");
const Programa = require('../models/programa.model')
const Alumno = require('../models/alumno.model')
const Periodo = require('../models/periodo.model')
const Solicitud = require('../models/solicitud-proyecto.model')


const create = async(req, res = response) => {

    try {

        const id = req.uid;

        const existe = await Programa.findOne({alumno:id});

        if ( existe ) {
            return res.status(400).json({
                status: false,
                message: 'Ya tienes un programa creado.'
            })
        }

        const [alumno, periodo, solicitud] = await Promise.all([
            Alumno.findById(id),
            Periodo.findOne({isActual:true}),
            Solicitud.findOne({aceptado:true, alumno:id})
                            .populate('proyecto')
        ]) 

        const data = {
            ... req.body,
            periodo,
            alumno,
            proyecto: solicitud.proyecto
        }

        const programa = new Programa(data);

        await programa.save();

        res.status(201).json({
            status: true,
            programa
        })

        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }
    
}


/* const upadate = async(req, res = response) => {
    
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

} */


const getByAlumnoId = async(req, res = response ) => {

    const alumno = req.uid;

    try {

        const programa = await Programa.findOne({alumno})
                            .populate('alumno')
                            .populate('periodo')
                            .populate('proyecto')

        if( !programa ) {
            return res.status(200).json({
                status: false,
                message: `No tienes asignado un programa.`
            })
        }

        res.json({
            status: true,
            programa
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }

}



module.exports = {/* 
    getAll,
    getAllPaginados, */
    getByAlumnoId,
    create,
    /* upadate */
}