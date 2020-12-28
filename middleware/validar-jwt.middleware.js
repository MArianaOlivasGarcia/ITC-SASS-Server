const jwt = require('jsonwebtoken')
const Usuario = require('../models/usuario.model')

const validarJWT = (req, res, next) => {

    if (!req.headers['authorization']) {
        return res.status(401).json({
            status: false,
            message: 'No hay accessToken en la petición.'
        })
    }

    try {
        const authHeader = req.headers['authorization'];
        const bearerToken = authHeader.split(' ');
        const token = bearerToken[1];

        const { uid } = jwt.verify(token, process.env.JWT_SEED)

        req.uid = uid;

        next();

    } catch (error) {
        return res.status(401).json({
            status: false,
            message: 'accessToken no válido.'
        })
    }



}



const validarADMIN_ROLE = async(req, res, next) => {

    const uid = req.uid;

    try {

        const usuario = await Usuario.findById( uid );

        if ( !usuario ) {
            return res.status(404).json({
                status: false,
                message: `El usuario con el id ${ uid } no existe`
            })
        }
        
        if ( usuario.role !== 'ADMIN_ROLE' ) {
            return res.status(403).json({
                status: false,
                message: 'No tiene privilegios para hacer esto'
            })
        }


        next()

    } catch( error ) {
        res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }

}

// Cuando edita, solo puede hacerse a si mismo
const validarMismoAlumno = async(req, res, next) => {

    const uid = req.uid;
    const id = req.params.id;

    try {

        if ( uid === id ) {
            
            next()
        
        } else {
            return res.status(403).json({
                status: false,
                message: 'No tiene privilegios para hacer esto'
            })
        }



    } catch( error ) {
        res.status(500).json({
            status: false,
            message: 'Hable con el administrador'
        })
    }

}


module.exports = {
    validarJWT,
    validarADMIN_ROLE,
    validarMismoAlumno
}