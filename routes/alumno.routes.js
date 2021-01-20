// path: api/alumno

const { Router } = require('express');
const { check } = require('express-validator');
const { register,
        login,
        renovarJWT,
        getAll,
        getAllByCarrera,
        getById,
        update,
        changePassword,
        renovarPassword } = require('../controllers/alumno.controller');
const { validarCampos } = require('../middleware/validar-campos.middleware');
const { validarJWT } = require('../middleware/validar-jwt.middleware');
const router = Router();


router.post('/register', [
    check('nombre', 'El nombre es requerido').not().isEmpty(),
    check('numero_control', 'El No. de Control es requerido').not().isEmpty(),
    check('carrera', 'La Carrera es requerida').not().isEmpty(),
    validarCampos
], register);



router.post('/login', [
    check('numero_control', 'El No. de Control es requerido').not().isEmpty(),
    check('password', 'La Contraseña es requerida').not().isEmpty(),
    validarCampos
], login);


router.get('/all', getAll)
 
router.get('/renovar', validarJWT, renovarJWT)


router.get('/:id', getById)

router.get('/all/:carrera', getAllByCarrera)


router.put('/password', [
    validarJWT,
    check('old_password', 'La Contraseña antigua es requerida').not().isEmpty(),
    check('new_password', 'La Nueva Contraseña es requerida').not().isEmpty(),
    validarCampos,
] ,changePassword )

// TODO: Solo ADMIN_ROLE
router.put('/renewpassword/:id', [
    check('password', 'La Contraseña es requerida').not().isEmpty(),
    validarCampos,
], renovarPassword )

router.put('/:id', update)


 



module.exports = router;