const { Router } = require('express');
const { getById, getAllByCodigo } = require('../controllers/item-expediente.controller');

const router = Router();


router.get('/all/:codigo', getAllByCodigo );

router.get('/:id', getById );


module.exports = router;