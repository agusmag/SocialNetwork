'use strict'

//Express configuration
var express = require('express');
var bodyParser = require('body-parser');

//Esto carga el framework
var app = express();

//Cargar rutas
//Se obtienen las rutas para los request de los usuarios.
var userRoutes = require('./routes/users/user');
//Se obtienen las rutas para los request de follows entre usuarios.
var followRoutes = require('./routes/follow/follow');

//Cargar middlewares (método que se ejecuta antes de que se llegue a un controlador)

//App.use() sirve para cargar middlewares

//Se configura el middleware del body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Cors

//Rutas
//Se configuran las rutas de la api.
//El /api actua como un base para todos los request.
app.use('/api', userRoutes);
app.use('/api', followRoutes);

module.exports = app;