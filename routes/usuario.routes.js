// path: api/dependencia
const { Router } = require('express');
const { getAll, getById, update, renovarPassword } = require('../controllers/usuario.controller');
const { check } = require('express-validator');
const { validarCampos } = require('../middleware/validar-campos.middleware');
const { validarJWT, validarADMIN_ROLE } = require('../middleware/validar-jwt.middleware');

const router = Router();


router.get('/all', [validarJWT, validarADMIN_ROLE] , getAll)

router.get('/:id', getById)

router.put('/:id',[validarJWT, validarADMIN_ROLE], update)


router.put('/password/:id', [
    check('password', 'La Contraseña es requerida').not().isEmpty(),
    validarCampos, 
    validarJWT,
    validarADMIN_ROLE,
], renovarPassword)


module.exports = router;