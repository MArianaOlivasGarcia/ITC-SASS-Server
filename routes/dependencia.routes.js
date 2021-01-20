// path: api/dependencia
const { Router } = require('express');
const { check } = require('express-validator');
const { create, getAllPaginados, getById, update, getAll } = require('../controllers/dependencia.controller');
const { validarCampos } = require('../middleware/validar-campos.middleware');
const router = Router();


router.post('/create', [
    check('nombre', 'El nombre es requerido').not().isEmpty(),
    check('representante_legal', 'El Nombre del representante legal es requerido').not().isEmpty(),
    check('domicilio', 'El Domicilio es requerido').not().isEmpty(),
    check('email', 'El Correo electrónico es requerido').not().isEmpty(),
    check('email', 'El Correo electrónico no es válido').isEmail(),
    validarCampos
], create);


router.get('/all', getAll)

router.get('/all/paginados', getAllPaginados )

router.get('/:id', getById)

router.put('/:id', update)



module.exports = router;