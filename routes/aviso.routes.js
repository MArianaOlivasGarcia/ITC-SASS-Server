const { Router } = require('express');
const { create , getById, upadate, getAllPaginados, getAllByDisponiblePaginados} = require('../controllers/aviso.controller');
const router = Router();



router.get('/all', getAllPaginados)

router.get('/all/disponible', getAllByDisponiblePaginados)

router.get('/:id', getById)

router.put('/:id', upadate)

router.post('/create', create)

module.exports = router;