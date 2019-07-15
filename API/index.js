'use strict'

//Express Connection
var app = require('./app');
var port = 3800;

//MongoDB Connection
var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/social_network', { useNewUrlParser: true })
    .then(() => {
        console.log("La conexión a la base de datos social_network se ha establecido correctamente");

        //Create server
        app.listen(port, () => {
            console.log("Servidor ejecutando correctamente en: http://localhost:"+port );
        });
    })
    .catch( error => {
        console.log( error );
    });

//node index.js inicia este archivo, pero estoy usando nodemon (en un script creado en el package.json) para que refresque solo los archivos.

