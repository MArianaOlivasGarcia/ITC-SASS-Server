


const { Router } = require('express');
const { create, getByAlumnoId, getById } = require('../controllers/expediente.controller');
const { validarJWT } = require('../middleware/validar-jwt.middleware');

const router = Router();

router.post('/create', [ validarJWT ] , create)

router.get('/:id', getById )

router.get('/alumno/:alumno', getByAlumnoId)



module.exports = router;