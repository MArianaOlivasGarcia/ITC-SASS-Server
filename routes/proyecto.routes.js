// path: api/proyecto
const { Router } = require('express');
const { create,
        createByAlumno,
        getAllByTipo,
        getById,
        getPersonal,
        getByAlumno,
        getAllByCarreraAndPeriodoActual,
        update,
        updateByAlumno,
        deleteProyecto} = require('../controllers/proyecto.controller');
const { validarJWT } = require('../middleware/validar-jwt.middleware');
const router = Router();

router.post('/create', create)

router.post('/create/alumno', validarJWT ,createByAlumno)

router.get('/all/:tipo', getAllByTipo)

router.get('/all/carrera/:carrera', getAllByCarreraAndPeriodoActual)

router.get('/alumno', validarJWT, getByAlumno)

router.get('/alumno/personal', validarJWT, getPersonal)

router.get('/:id', getById)

router.put('/alumno/:id',validarJWT,  updateByAlumno )

router.put('/:id', update)

router.delete('/:id', deleteProyecto)


module.exports = router;