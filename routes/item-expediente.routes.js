const { Router } = require('express');
const { getById } = require('../controllers/item-expediente.controller');

const router = Router();


router.get('/:id', getById );




module.exports = router;