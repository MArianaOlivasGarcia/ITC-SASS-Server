// path: api/proyecto
const { Router } = require('express');
const { create, getAll, getById, update, getAllByCarrera, createCarreraProyecto } = require('../controllers/proyecto.controller');
const router = Router();

router.post('/create', create)

router.post('/create/carrera', createCarreraProyecto)

router.get('/all', getAll)

router.get('/all/:carrera', getAllByCarrera)

router.get('/:id', getById)


router.put('/:id', update)


module.exports = router;