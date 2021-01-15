const { response } = require("express");
const Item = require('../models/item-expediente.model');
const Alumno = require('../models/alumno.model');


const getById = async(req, res = response) => {

    try{

        const uid = req.params.id;
        
        const item = await Item.findById(uid)

        if ( !item ) {
            return res.status(404).json({
                status: false,
                message: `No existe un item con el ID ${uid}`
            })
        }

        const alumno = await Alumno.findOne({expediente: item.expediente});
        item.alumno = alumno;

        res.status(200).json({
            status: true,
            item
        })

    } catch(error){
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }

}


const getAllByCodigo = async(req, res = response) => {

    const codigo = req.params.codigo;

    const [aprobados, rechazados, pendientes] = await Promise.all([
        Item.find({codigo, arpobado: true}),
        Item.find({codigo, rechazado: true}),
        Item.find({codigo, revision: true})
    ])


    for (let i = 0; i < pendientes.length; i++) {
        const pendiente = pendientes[i];
        const alumno = await Alumno.findOne({expediente: pendiente.expediente});
        pendiente.alumno = alumno;
    }

    for (let i = 0; i < aprobados.length; i++) {
        const aprobado = aprobados[i];
        const alumno = await Alumno.findOne({expediente: aprobado.expediente});
        aprobado.alumno = alumno;
    }

    for (let i = 0; i < rechazados.length; i++) {
        const rechazado = rechazados[i];
        const alumno = await Alumno.findOne({expediente: rechazado.expediente});
        rechazado.alumno = alumno;
    }

    res.status(200).json({
        aprobados,
        rechazados,
        pendientes
    })

}

module.exports = {
    getById,
    getAllByCodigo
}