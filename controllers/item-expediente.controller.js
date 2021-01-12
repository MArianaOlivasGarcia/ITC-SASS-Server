const { response } = require("express");
const Item = require('../models/item-expediente.model');

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


module.exports = {
    getById
}