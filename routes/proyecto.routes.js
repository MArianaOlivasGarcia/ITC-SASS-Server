// path: api/proyecto
const { Router } = require('express');
const { create,
        createByAlumno,
        getAll,
        getById,
        getPersonal,
        update,
        getAllByCarrera,
        deleteProyecto} = require('../controllers/proyecto.controller');
const { validarJWT } = require('../middleware/validar-jwt.middleware');
const router = Router();

router.post('/create', create)

router.post('/create/alumno', validarJWT ,createByAlumno)

router.get('/all', getAll)

router.get('/all/:carrera', getAllByCarrera)

router.get('/:id', getById)

router.get('/alumno/personal', validarJWT, getPersonal)

router.put('/:id', update)

router.delete('/:id', deleteProyecto)


module.exports = router;