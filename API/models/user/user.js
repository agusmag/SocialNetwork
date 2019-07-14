'use strict'

var mongoose = require('mongoose');
//Esto permite crear esquemas para los modelos.
var Schema = mongoose.Schema;

//Se definen las propiedades del esquema usuario.
//El id no hace falta agregarlo, se agrega solo.
var UserSchema = Schema({
    name: String,
    surname: String,
    nick: String,
    email: String,
    password: String,
    role: String,
    image: String
});

//Se tiene que exportar un modelo para ser tomado como entidad.
//El método model pluraliza el nombre del modelo, es decir, en la base se toma como users
module.exports = mongoose.model('User', UserSchema);