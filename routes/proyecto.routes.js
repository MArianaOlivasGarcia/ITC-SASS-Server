// path: api/proyecto
const { Router } = require('express');
const { create,
        createByAlumno,
        getAllByTipo,
        getById,
        getByAlumno,
        getAllByCarreraAndPeriodoProximoAndFechas,
        update,
        updateByAlumno,
        deleteProyecto,
        duplicar,
        adoptar } = require('../controllers/proyecto.controller');
const { validarJWT, validarADMIN_ROLE } = require('../middleware/validar-jwt.middleware');
const router = Router();

router.post('/create', [ validarJWT, validarADMIN_ROLE ], create)

router.post('/create/alumno', validarJWT ,createByAlumno)

router.get('/all/:tipo', getAllByTipo)

router.get('/all/carrera/:carrera', getAllByCarreraAndPeriodoProximoAndFechas)

router.get('/alumno', validarJWT, getByAlumno)

router.get('/duplicar/:id', [ validarJWT, validarADMIN_ROLE ] , duplicar)

router.get('/adoptar/:id', [ validarJWT, validarADMIN_ROLE ], adoptar)

router.get('/:id', getById)

router.put('/alumno/:id',validarJWT,  updateByAlumno )

router.put('/:id', [ validarJWT, validarADMIN_ROLE ] ,update)

router.delete('/:id', deleteProyecto)


module.exports = router;