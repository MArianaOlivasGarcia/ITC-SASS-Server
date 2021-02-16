// path: api/auth
const { Router } = require('express');
const { register, login, renovarJWT, changePassword } = require('../controllers/auth.controller')
const { check } = require('express-validator');
const { validarCampos } = require('../middleware/validar-campos.middleware');
const { validarJWT, validarADMIN_ROLE } = require('../middleware/validar-jwt.middleware');
const router = Router();


router.post('/register', [
    check('nombre', 'El Nombre es requerido').not().isEmpty(),
    check('password', 'La Contraseña es requerida').not().isEmpty(),
    check('username', 'El Nombre de usuario es requerido').not().isEmpty(),
    validarCampos,
    validarJWT,
    validarADMIN_ROLE,
], register);


router.post('/login', [
    check('password', 'La Contraseña es requerida').not().isEmpty(),
    check('username', 'El Nombre de usuario es requerido').not().isEmpty(),
    validarCampos
], login);

 
router.put('/password', [
    validarJWT, 
    check('old_password', 'La Contraseña antigua es requerida').not().isEmpty(),
    check('new_password', 'La Nueva contraseña es requerida').not().isEmpty(),
    validarCampos, 
    validarJWT,
] ,changePassword )



router.get('/renovar', validarJWT, renovarJWT);

module.exports = router;