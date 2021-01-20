const { Router } = require('express');
const { getAll, getById, create, upadate, getAllPaginados } = require('../controllers/periodo.controller');
const router = Router();



router.get('/all', getAll)

router.get('/all/paginados', getAllPaginados )

router.get('/:id', getById)

router.put('/:id', upadate)

router.post('/create', create)



module.exports = router;