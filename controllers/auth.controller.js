// Renovar token

const { response } = require("express");
const bcrypt = require('bcryptjs');
const { generarJWT } = require("../helpers/jwt.helper")
const Usuario = require('../models/usuario.model')
const { getMenuFrontEnd } = require('../helpers/menu-frontend.helper');
 
const register = async(req, res = response) => {

    
    const { username, password } = req.body;
    
    try {

        const doesExist = await Usuario.findOne({ username })

        if (doesExist) {
            return res.status(400).json({
                status: false,
                message: `El Nombre de usuario ${username} ya ésta registrado.`
            })
        }

        const usuario = new Usuario(req.body);
        // ** Encriptar contraseña **//
        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync(password, salt);
        const savedUsuario = await usuario.save();
        //** Generar Token **/
        const token = await generarJWT(savedUsuario.id);


        res.status(201).json({
            status: true,
            message: `Usuario creado con éxito`,
            usuario: savedUsuario,
            accessToken: token
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }

}



const login = async(req, res = response) => {

    const { username, password } = req.body;

    try {
    
        const usuario = await Usuario.findOne({ username })


        if (!usuario) {
            return res.status(404).json({
                status: false,
                message: 'Nombre de usuario y/o Contraseña invalido(s) -C'
            })
        }


        const validarPassword = bcrypt.compareSync( password, usuario.password)


        if (!validarPassword) {
            return res.status(404).json({
                status: false,
                message: 'Nombre de usuario y/o Contraseña invalido(s) -P'
            });
        }

        const token = await generarJWT(usuario.id);


        res.status(200).json({
            status: true,
            usuario,
            menu: getMenuFrontEnd( usuario.role ),
            accessToken: token
        });


    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }
    
}




const renovarJWT = async(req, res = response) => {

    const uid = req.uid

    const accessToken = await generarJWT(uid)

    let user = await Usuario.findById(uid)
                        .populate('gestion');


    res.json({
        status: true,
        user,
        menu: getMenuFrontEnd( user.role ),
        accessToken
    })
}




const changePassword = async(req, res = response) => {

    const uidUsuario = req.uid;
    const { old_password, new_password } = req.body

    try {


        const usuario = await Usuario.findById( uidUsuario )

        if ( !usuario ) {
            return res.status(400).json({
                status: false,
                message: `El usuario con el id ${ uidUsuario } no existe.`
            })
        }


        // Validar contraseña anterior
        const validarPassword = bcrypt.compareSync(old_password, usuario.password)

        if (!validarPassword) {
            return res.status(404).json({
                status: false,
                message: 'La Contraseña anterior no coincide.'
            });
        }

        // Encriptar la nueva contraseña
        const salt = bcrypt.genSaltSync();
        const password  = bcrypt.hashSync( new_password.toString(), salt);


        // Actualizar 
        const usuarioActualizado = await Usuario.findByIdAndUpdate( uidUsuario, {password}, { new: true });



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
    renovarJWT,
    register,
    login,
    changePassword
}