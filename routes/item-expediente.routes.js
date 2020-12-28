const { Router } = require('express');
const { create, updateStatus, getById, getByTituloAndStatus, updateFecha } = require('../controllers/item-expediente.controller');

const router = Router();


router.post('/create/:expediente', create)

router.put('/status/:id', updateStatus)

router.put('/fecha/:id', updateFecha)

router.get('/:id', getById)

router.get('/all/:status/:titulo', getByTituloAndStatus)



module.exports = router;