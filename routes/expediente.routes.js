


const { Router } = require('express');
const { create, crearExpedientes, getByAlumno, getById, getEstructura } = require('../controllers/expediente.controller');
const { validarJWT, validarADMIN_ROLE } = require('../middleware/validar-jwt.middleware');

const router = Router();

router.get('/create', [ validarJWT ] , create)

router.get('/create/all/:periodo', [ validarJWT, validarADMIN_ROLE ] , crearExpedientes)

router.get('/alumno', validarJWT, getByAlumno)

router.get('/estructura', getEstructura)

router.get('/:id', validarJWT, getById )



module.exports = router;