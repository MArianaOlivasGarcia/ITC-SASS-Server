


const { Router } = require('express');
const { create, getByAlumno, getById } = require('../controllers/expediente.controller');
const { validarJWT } = require('../middleware/validar-jwt.middleware');

const router = Router();

router.get('/create', [ validarJWT ] , create)

router.get('/alumno', validarJWT, getByAlumno)

router.get('/:id', getById )



module.exports = router;