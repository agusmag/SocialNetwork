'use strict'

//Middleware para autentificar al usuario en cada request que haga a la API.

var jwt = require('jwt-simple');
var moment = require('moment');
var jwtService = require('../services/jwt');

var secret = jwtService.getSecretPass();

//Se exporta directamente la funcionalidad del middleware, el next es para que nodeJs siga con la cola de ejecución y no se detenga en este método.
exports.ensureAuth = function( req, res, next ){
    if (!req.headers.authorization){
        return res.status(403).send({
            message: "La petición no tiene la cabecera de autentificación."
        })
    }

    //Se quitan las comillas del token para dejarlo limpio para identificarlo.
    var token = req.headers.authorization.replace(/['"]+/g, '');

    //Se usa un try-catch ya que si el decode falla, la aplicación se queda trabada.
    try{
        //Se descifra el payload del token
        var payload = jwt.decode(token, secret);

        if (payload.exp <= moment().unix()){
            return res.status(401).send({
                message: "El token de sesión ha expirado."
            });
        }
    }catch(exception){
        return res.status(404).send({
            message: "El token no es válido"
        });
    }

    //Se crea una variable en el request con el payload decodificado para usarlo en los controllers.
    req.user = payload;

    next();
};



