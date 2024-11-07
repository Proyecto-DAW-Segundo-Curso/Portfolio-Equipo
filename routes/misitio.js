const express = require("express");

// Creamos el enrutador de express
const router = express.Router();

// Ruteo
router.get('/', (req, res) => {
    res.render('misitioHome', {layout: 'misitio'})
})
