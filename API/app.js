'use strict'

//Express configuration
var express = require('express');
var bodyParser = require('body-parser');

//Esto carga el framework
var app = express();

//Cargar rutas

//Cargar middlewares (método que se ejecuta antes de que se llegue a un controlador)

//App.use() sirve para cargar middlewares

//Se configura el middleware del body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Cors

//Rutas
//Se configuran las rutas de la api.

app.get('/', (req, res) => {
    res.status(200).send({
        message: 'Hola Mundo!'
    })
});

module.exports = app;