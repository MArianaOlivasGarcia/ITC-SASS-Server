
const { Router } = require('express');
const expressFileUpload  = require('express-fileupload')
const { generateFile, uploadFile } = require('../controllers/file.controller');
const { validarJWT } = require('../middleware/validar-jwt.middleware')

const router = Router();

router.use( expressFileUpload() )
// DE PRUEBA
router.get('/:idItem', validarJWT ,  generateFile );

router.put('/item/:idItem', validarJWT ,  uploadFile );



module.exports = router;

