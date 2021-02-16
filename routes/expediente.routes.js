


const { Router } = require('express');
const { create, getByAlumno, getById, getEstructura } = require('../controllers/expediente.controller');
const { validarJWT } = require('../middleware/validar-jwt.middleware');

const router = Router();

router.get('/create', [ validarJWT ] , create)

router.get('/alumno', validarJWT, getByAlumno)

router.get('/estructura', getEstructura)

router.get('/:id', validarJWT, getById )



module.exports = router;