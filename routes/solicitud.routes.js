const { Router } = require('express');
const { validarJWT } = require('../middleware/validar-jwt.middleware')
const { create, getByStatus, getByAlumno, getById, aceptar, rechazar, getAceptadaByAlumno} = require('../controllers/solicitud.controller');
const router = Router();

router.get('/all/:status', getByStatus)

router.get('/alumno', validarJWT,  getByAlumno)

router.get('/alumno/aceptado', validarJWT,  getAceptadaByAlumno)

router.get('/:id', getById)

router.post('/', validarJWT, create )

// TOKEN DEL USUARIO NO ALUMNO
router.put('/aceptar/:id', validarJWT, aceptar)

router.put('/rechazar/:id', validarJWT, rechazar)

module.exports = router;