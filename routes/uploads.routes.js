/*
    ruta: api/upload/
*/
const { Router } = require('express');
const expressFileUpload  = require('express-fileupload')
const { imageUpload, obtenerImagen, fileUpload, firmaUpload, obtenerFirma, deleteFirma } = require('../controllers/uploads.controller');
const { validarJWT } = require('../middleware/validar-jwt.middleware')

const router = Router();

router.use( expressFileUpload() )

router.put('/archivo/:item', [validarJWT], fileUpload )

router.put('/:coleccion/:id', imageUpload )

router.put('/firma/:coleccion/:id', firmaUpload )

router.get('/:coleccion/:foto', obtenerImagen )

router.get('/firma/:coleccion/:firma', obtenerFirma )

router.delete('/firma/:idAlumno', deleteFirma);

module.exports = router;