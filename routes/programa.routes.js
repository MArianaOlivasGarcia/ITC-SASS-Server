const { Router } = require('express');
const { validarJWT } = require('../middleware/validar-jwt.middleware');
const { create, getByAlumnoId } = require('../controllers/programa.controller');
const router = Router();

router.get('/alumno', validarJWT,  getByAlumnoId)


router.post('/create', validarJWT,  create)

module.exports = router;