'use strict'

//Se usa express para cargar el Router() para gestionar las rutas de ese controller.
var express = require('express');
//Se usa el middleware mdAuth para validar el token en cada request que se haga al controller.
var mdAuth = require('../../middlewares/authenticate');

//Se usa el middleware multipart para la carga de imágenes, le tengo que pasar el directorio donde almacenará las imágenes.
var multipart = require('connect-multiparty');  
var mdUpload = multipart({ uploadDir: './uploads/users'});

//Se usa el controller de user para obtener los métodos con la lógica que reaccionará al request de una url determinada.
var UserController = require('../../controllers/users/user');


//Para acceder a los métodos de HTTP Request.
var api = express.Router();

api.post('/register', UserController.saveUser);
api.put('/update/:id', mdAuth.ensureAuth, UserController.updateUser);
//Si el request tiene más de 1 middleware se tiene que pasar un array.
api.post('/upload-image/:id', [ mdAuth.ensureAuth, mdUpload ], UserController.uploadImage);
api.post('/login', UserController.loginUser);
//Para pasar parámetros por url se indica con :[valor]?[otro_valor]=[valor_valor]?[etc]
api.get('/user/:id', mdAuth.ensureAuth, UserController.getUser);
api.get('/users/:page?', mdAuth.ensureAuth, UserController.getUsers);
//Para usar un middleware en un request, se le pasa como segundo parámetro en el request mismo del Router()
//Un ejemplo seria api.get('/getInfo', mdAuth.ensureAuth, UserController.getInfo);
api.get('/test', mdAuth.ensureAuth, UserController.test);

//Se exportan las rutas ante los request para ese controller.
module.exports = api;