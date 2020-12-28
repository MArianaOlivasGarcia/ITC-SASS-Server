// path: api/dependencia
const { Router } = require('express');
const { getAll, getById, update, renovarPassword } = require('../controllers/usuario.controller');
const { check } = require('express-validator');
const { validarCampos } = require('../middleware/validar-campos.middleware');
const { validarJWT } = require('../middleware/validar-jwt.middleware');

const router = Router();


router.get('/all', validarJWT , getAll)

router.get('/:id', getById)

router.put('/:id', update)

// TODO: Solo ADMIN_ROLE
router.put('/password/:id', [
    check('password', 'La Contraseña es requerida').not().isEmpty(),
    validarCampos,
], renovarPassword)


module.exports = router;