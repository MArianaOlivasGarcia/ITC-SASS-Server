const { Router, response } = require('express');
const router = Router();

const Alumno = require('../models/alumno.model');

const {crearArchivo} = require('../tests/test')


router.post('/test/:id', async(req, res = response) => {

    try {
        const uid = req.params.id;

        const alumno = await Alumno.findById(uid)

        if( !alumno ) {
            return res.status(404).json({
                status: false,
                message: 'No existe un alumno con ese id'
            })
        }

        await crearArchivo( 'prueba3.docx', alumno.toJSON() , 'HojaDatos.docx' )
        
        res.status(200).json({
            status: true,
            message: 'Archivo creado con éxito'
        })

    } catch( error ){
        console.log(error);
        return res.status(600).json({
            status: true,
            message: 'Hable con el administrador'
        })
    }

})


module.exports = router;