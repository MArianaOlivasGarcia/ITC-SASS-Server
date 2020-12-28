const { Router } = require('express');
const router = Router();
const { getTodo, getColeccion } = require('../controllers/busqueda.controller');


router.get('/:busqueda', getTodo)

router.get('/coleccion/:coleccion/:busqueda', getColeccion)

module.exports = router;