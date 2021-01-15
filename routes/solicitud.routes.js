const { Router } = require('express');
const { validarJWT } = require('../middleware/validar-jwt.middleware')
const { create, getByStatus, getPendienteByAlumno, getById, aceptar, rechazar} = require('../controllers/solicitud.controller');
const router = Router();

router.get('/all/:status', getByStatus)

router.get('/alumno', validarJWT,  getPendienteByAlumno)

router.get('/:id', getById)

router.post('/', validarJWT, create )

// CAMBIAR POR TOKEN
router.put('/aceptar/:id', aceptar)

router.put('/rechazar/:id', rechazar)

module.exports = router;