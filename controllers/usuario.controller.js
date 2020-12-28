const { response } = require("express");
const bcrypt = require('bcryptjs');
const Usuario = require("../models/usuario.model");



const getAll = async(req, res = response) => {

    try {

        const desde = Number(req.query.desde) || 0;
        const uid = req.uid;

        const [usuarios, total] = await Promise.all([
            Usuario.find( { _id: { $nin: [uid] } } ).populate('gestion').sort('role').skip(desde).limit(5),
            Usuario.countDocuments( { _id: { $nin: [uid] } } )
        ]);
        // TODO: Buscar otra forma de contar documentos omitiendo algunos
        res.status(200).json({
            status: true,
            usuarios,
            total: total
        })

    } catch (error) {
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

        const usuario = await Usuario.findById(uid)
            .populate('carrera')

        if (!usuario) {
            return res.status(404).json({
                status: false,
                message: 'No existe un usuario con ese id'
            })
        }

        return res.status(200).json({
            status: true,
            usuario
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }




}



const update = async(req, res = response) => {

    const uid = req.params.id;

    try {

        const usuario = await Usuario.findById(uid);

        if (!usuario) {
            return res.status(404).json({
                status: false,
                message: 'No existe un usuario con ese id'
            })
        }

        const { password, email, ...campos } = req.body;

        if (usuario.email !== email) {

            const doesExist = await Usuario.findOne({ email })

            if (doesExist) {
                return res.status(400).json({
                    status: false,
                    message: 'Ya existe un usuario con ese Correo electrónico'
                })
            }

        }

        campos.email = email;

        const usuarioActualizado = await Usuario.findByIdAndUpdate(uid, campos, { new: true });

        res.status(200).json({
            status: true,
            usuario: usuarioActualizado
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }

}




const renovarPassword = async(req, res = response) => {

    const uidUsuario = req.params.id;
    
    try {
        const { password } = req.body

        const usuario = await Usuario.findById( uidUsuario )

        if ( !usuario ) {
            return res.status(400).json({
                status: false,
                message: `El usuario con el id ${ uidUsuario } no existe.`
            })
        }

        // Encriptar la nueva contraseña
        const salt = bcrypt.genSaltSync();
        const newPassword  = bcrypt.hashSync( password, salt);


        // Actualizar 
        const usuarioActualizado = await Usuario.findByIdAndUpdate( uidUsuario, {password: newPassword}, { new: true });


        res.status(201).json({
            status: true,
            message: 'Contraseña actualizada con éxito',
            usuario: usuarioActualizado
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
    getAll,
    getById,
    update,
    renovarPassword
}