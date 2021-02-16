const { Router } = require('express');
const { getAll, create , getById, upadate, getAllPaginados} = require('../controllers/carrera.controller');
const router = Router();



router.get('/all', getAll)

router.get('/all/paginados', getAllPaginados)

router.get('/:id', getById)

router.put('/:id', upadate)

router.post('/create', create)

module.exports = router;