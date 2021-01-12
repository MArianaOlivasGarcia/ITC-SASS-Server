const { Router } = require('express');
const router = Router();
const { getTodo, getColeccion, getProyectosByCarrera } = require('../controllers/busqueda.controller');


router.get('/:busqueda', getTodo)

router.get('/coleccion/:coleccion/:busqueda', getColeccion)

router.get('/proyectos/:carrera/:busqueda', getProyectosByCarrera)


module.exports = router;