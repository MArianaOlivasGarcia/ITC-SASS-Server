const { response } = require("express");
const Expediente = require("../models/expediente.model");
const Item = require("../models/item-expediente.model")

const updateStatus = async(req, res = response) => {

    const uid = req.params.id;

    try {
        
        const { status } = req.body;

        const item = await Item.findById(uid)

        if (!item) {
            return res.status(404).json({
                status: false,
                message: 'No existe un item con ese id'
            })
        }
        
        const itemActualizado = await Item.findByIdAndUpdate( uid, { status }, { new: true });

        res.status(200).json({
            status: true,
            item: itemActualizado
        })

                            

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }


}
 


const create = async(req, res = response ) => {

    const idExp = req.params.expediente;

    try {

        const expediente = await Expediente.findById(idExp)
        
        if (!expediente) {
            return res.status(404).json({
                status: false,
                message: 'No existe un expediente con ese id'
            })
        }

        const item = new Item( req.body );

        await item.save();

        const expedienteActualizado = await Expediente.findByIdAndUpdate(idExp, 
                            { $push: { items: item }}, {new: true});
       

        res.status(201).json({
            status: true,
            expediente: expedienteActualizado
        })


    } catch( error ) {

        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })

    }
    

}



const getById = async(req, res = response ) => {

    const uid = req.params.id

    try {

        const item = await Item.findById(uid)

        if (!item) {
            return res.status(404).json({
                status: false,
                message: 'No existe un item con ese id'
            })
        }

        res.status(200).json({
            status: true,
            item
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }


}


const getByTituloAndStatus = async(req, res = response ) => {

    const titulo = req.params.titulo;
    const status = req.params.status;

    const statusValidos = ['Aprobado', 'Rechazado', 'En revisión', 'No iniciado', 'No disponible', 'Entrante'];

    if ( !statusValidos.includes( status ) ){
        return res.status(400).json({
            status: false,
            message: 'No es una status válido'
        })
    }

    const items = await Item.find({ titulo, status})

    

    res.json({
        ok: true,
        items
    })

}


const updateFecha = async( req, res = response ) => {

    const uid = req.params.id;

    try {
        
        const { ends_in } = req.body;

        const item = await Item.findById(uid)

        if (!item) {
            return res.status(404).json({
                status: false,
                message: 'No existe un item con ese id'
            })
        }
        
        const itemActualizado = await Item.findByIdAndUpdate( uid, { ends_in }, { new: true });

        res.status(200).json({
            status: true,
            item: itemActualizado
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
    updateStatus,
    create,
    getById,
    getByTituloAndStatus,
    updateFecha
}