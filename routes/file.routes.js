
const { Router } = require('express');
const router = Router();
const { createFile, prueba } = require('../controllers/file.controller');
const { validarJWT } = require('../middleware/validar-jwt.middleware')


router.get('/', prueba );
router.get('/:codigo', validarJWT ,  createFile );


module.exports = router;

