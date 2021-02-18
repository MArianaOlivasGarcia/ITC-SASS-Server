const { Router } = require('express');
const { getAll, getById, create, upadate, getAllPaginados, getProximo } = require('../controllers/periodo.controller');
const router = Router();



router.get('/proximo', getProximo)

router.get('/all', getAll)

router.get('/all/paginados', getAllPaginados )

router.get('/:id', getById)

router.put('/:id', upadate)

router.post('/create', create)



module.exports = router;