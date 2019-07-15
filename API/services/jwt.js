'use strict'

//Servicio para gestionar los tokens de la aplicación

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'clave_secreta_social_network_am';

//Genera un token en base a los datos del usuario.
function createToken( user ){ 
    //Objeto con los datos de usuario que yo quiero almacenar en un token
    var payload = {
        sub: user._id,
        name: user.name,
        surname: user.surname,
        nick: user.nick,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(), //Con moment puedo obtener un momento exacto de tiempo.
        exp: moment().add(30, 'days').unix() //Al momento actual se le suman 30 días con esos parámetros.
    };

    
    //Con el encode jwt crea un token en base al payload con los datos del usuario y una clave secreta estática propia.
    return jwt.encode(payload, secret);
}

//Retorna la clave secreta para la generación de tokens.
function getSecretPass(){
    return secret;
}

module.exports = {
    createToken,
    getSecretPass
};