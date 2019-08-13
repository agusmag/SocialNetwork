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
//Se obtienen las rutas para los request de las publicaciones de usuarios.
var publicationRoutes = require('./routes/publication/publication');
//Se obtienen las rutas para los request de los mensajes privados.
var messageRoutes = require('./routes/message/message');

//Cargar middlewares (método que se ejecuta antes de que se llegue a un controlador)

//App.use() sirve para cargar middlewares

//Se configura el middleware del body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Cors - Middleware que configura cabeceras HTTP.
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
 
    next();
});


//Rutas
//Se configuran las rutas de la api.
//El /api actua como un base para todos los request.
app.use('/api', userRoutes);
app.use('/api', followRoutes);
app.use('/api', publicationRoutes);
app.use('/api', messageRoutes);

module.exports = app;