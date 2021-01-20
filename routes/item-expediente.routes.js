const { Router } = require('express');
const { getById, getByStatusAndCodigo, aceptar, rechazar } = require('../controllers/item-expediente.controller');
const { validarJWT } = require('../middleware/validar-jwt.middleware');

const router = Router();

router.get('/all/:status/:codigo', getByStatusAndCodigo)

router.get('/:id', getById );

// TOKEN DEL USUARIO NO ALUMNO
router.put('/aceptar/:id', validarJWT, aceptar)

router.put('/rechazar/:id', validarJWT, rechazar)

module.exports = router;