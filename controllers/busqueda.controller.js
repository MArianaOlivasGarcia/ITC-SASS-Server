const { response } = require("express");
const Usuario = require('../models/usuario.model')
const Alumno = require('../models/alumno.model')
const Dependencia = require('../models/dependencia.model')
const Proyecto = require('../models/proyecto.model')
const Carrera = require('../models/carrera.model')

const getTodo = async(req, res = response) => {

    const busqueda = req.params.busqueda;
    const regex = new RegExp( busqueda, 'i')

    const [ usuarios, alumnos ] = await Promise.all([
        Usuario.find({nombre: regex}),
        Alumno.find( { $or: [{nombre: regex },{apellidos: regex}]} )
                .populate('carrera', 'nombre')
    ])

    res.json({
        status: true,
        usuarios,
        alumnos
    })

}


const getProyectosByCarrera = async(req, res = response) => {

    const carrera = req.params.carrera
    const busqueda  = req.params.busqueda;
    const regex = new RegExp( busqueda, 'i' )

    let data = await Proyecto.find( {nombre: regex, 'carreras.carrera': carrera } )
                            .populate('dependencia', 'nombre')

    res.json({
        status: true,
        respuesta: data
    })
}


const getColeccion = async(req, res = response) => {

    const coleccion = req.params.coleccion;
    const busqueda  = req.params.busqueda;
    const regex = new RegExp( busqueda, 'i' )

    let data = [];

    switch( coleccion ) {

        case 'usuarios':
            data = await Usuario.find({nombre: regex})
        break;

        case 'alumnos':
            data = await Alumno.find( { $or: [{nombre: regex },{apellidos: regex},{numero_control: regex}]} )
                            .populate('carrera', 'nombre')
        break;

        case 'dependencias':
            data = await Dependencia.find( {nombre: regex} )
        break;

        case 'proyectos':
            data = await Proyecto.find( {$or: [{nombre: regex }]} )
                         .populate('dependencia', 'nombre')
                         .populate('periodo', 'nombre')
        break;

        case 'carreras':
            data = await Carrera.find( {nombre: regex} )
        break;


        default:
            return res.status(400).json({
                status: false,
                message: 'Las colecciones permitidas son usuarios, alumnos, dependencias o proyectos'
            })

    }

    
    res.json({
        status: true,
        respuesta: data
    })

    

}



module.exports = {
    getTodo,
    getColeccion,
    getProyectosByCarrera
}