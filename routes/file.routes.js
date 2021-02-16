
const { Router } = require('express');
const expressFileUpload  = require('express-fileupload')
const { generateFile, uploadFile, obtenerFile } = require('../controllers/file.controller');
const { validarJWT } = require('../middleware/validar-jwt.middleware')

const router = Router();

router.use( expressFileUpload() )


router.get('/archivo/:archivo',  obtenerFile );

router.get('/:idItem', validarJWT ,  generateFile );

router.put('/item/:idItem', validarJWT ,  uploadFile );



module.exports = router;

