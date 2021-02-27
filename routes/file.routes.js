
const { Router } = require('express');
const expressFileUpload  = require('express-fileupload')
const { generateFileItems, uploadFile, obtenerFile } = require('../controllers/file.controller');
const { validarJWT } = require('../middleware/validar-jwt.middleware')

const router = Router();

router.use( expressFileUpload() )


router.get('/archivo/:archivo',  obtenerFile );

router.get('/:idItem', validarJWT ,  generateFileItems );

router.put('/item/:idItem', validarJWT ,  uploadFile );



module.exports = router;

