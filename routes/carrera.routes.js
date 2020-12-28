const { Router } = require('express');
const { getAll, create } = require('../controllers/carrera.controller');
const router = Router();



router.get('/all', getAll)

router.post('/create', create)


module.exports = router;