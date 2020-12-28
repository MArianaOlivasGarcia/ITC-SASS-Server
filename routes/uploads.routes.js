/*
    ruta: api/upload/
*/
const { Router } = require('express');
const expressFileUpload  = require('express-fileupload')
const { imageUpload, obtenerImagen, fileUpload } = require('../controllers/uploads.controller');
const { validarJWT } = require('../middleware/validar-jwt.middleware')

const router = Router();

router.use( expressFileUpload() )

router.put('/archivo/:item', [validarJWT], fileUpload )

router.put('/:coleccion/:id', imageUpload )

router.get('/:coleccion/:foto', obtenerImagen )




module.exports = router;