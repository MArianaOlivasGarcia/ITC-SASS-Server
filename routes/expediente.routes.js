


const { Router } = require('express');
const { create, getByAlumno, getById } = require('../controllers/expediente.controller');
const { validarJWT } = require('../middleware/validar-jwt.middleware');

const router = Router();

router.post('/create', [ validarJWT ] , create)

router.get('/:id', getById )

router.get('/alumno/:alumno', getByAlumno)



module.exports = router;