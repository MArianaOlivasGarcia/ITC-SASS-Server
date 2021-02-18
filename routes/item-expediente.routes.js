const { Router } = require('express');
const { getById, getByStatusAndCodigo, actualizarFechasByCodigoAndPeriodo, actualizarFechas, aceptar, rechazar } = require('../controllers/item-expediente.controller');
const { validarJWT, validarADMIN_ROLE } = require('../middleware/validar-jwt.middleware');

const router = Router();

router.get('/all/:status/:codigo', validarJWT ,getByStatusAndCodigo)

router.get('/:id', getById );

// TOKEN DEL USUARIO NO ALUMNO
router.put('/aceptar/:id', validarJWT, aceptar)

router.put('/rechazar/:id', validarJWT, rechazar)

router.put('/fechas/all/:periodo/:codigo', [validarJWT, validarADMIN_ROLE], actualizarFechasByCodigoAndPeriodo )

router.put('/fechas/:id', [validarJWT, validarADMIN_ROLE], actualizarFechas)


module.exports = router;