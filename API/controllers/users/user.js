'use strict'

//Para cifrar la contraseña
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../../services/jwt');

var User = require('../../models/user/user');

function test(req, res){
    res.status(200).send({
        message: "Método de prueba de la entidad usuario."
    })
}

//Método que crea un nuevo usuario.
function saveUser(req, res){
    var params= req.body;
    var user = new User();

    //Se verifica que los parámetros requeridos se reciban
    if (params.name && params.surname &&
        params.nick && params.email && params.password) {
            user.name = params.name;
            user.surname = params.surname;
            user.nick = params.nick;
            user.email = params.email;
            user.role = 'ROLE_USER';
            user.image = null;

            //Se verifica que no exista un usuario con esos datos, para ello se usa el find del mongoose y el $or para buscar por más de una condición.
            User.find({ $or:    
                            [
                                {email: user.email.toLowerCase()},
                                {nick: user.nick.toLowerCase()}
                            ]
                    //El exec ejecuta el query en la base.
                    }).exec( (error, users) => {
                        if (error){
                             return res.status(500).send({
                                message: "Error en la consulta de usuarios." 
                            });
                        }

                        //Se verifica que la consulta no me traiga usuarios que coincidan con esa búsqueda.
                        if (users && users.length > 0) {
                            return res.status(200).send({
                                message: "El usuario que se quiere registrar ya existe."
                            });
                        }else {
                            //Se le aplica un hash a la contraseña para que no sea visible.
                            bcrypt.hash(params.password, null, null, (error, hash) => {
                                user.password = hash;

                                //Se guarda el usuario en la base con el save del mongoose.
                                user.save(( error, userStored ) => {
                                    //Si hay un error se informa con un mensaje y status 500.
                                    if (error) {
                                        return res.status(500).send({
                                            message: "Error al guardar el usuario."
                                        });
                                    }

                                    //Si se tiene un usuario en respuesta, lo muestro con status 200, sino informo que no se pudo con un 404.
                                    if ( userStored){
                                        userStored.password = undefined;
                                        res.status(200).send({
                                            user: userStored
                                        });
                                    } else {
                                        res.status(404).send({
                                            message: "No se ha podido registrar el usuario"
                                        });
                                    }
                                })
                            });
                        }
                    });
    } else {
        req.status(200).send({
            message: "Faltan datos del usuario a crear."
        });
    }
};

//Método que loguea a un nuevo usuario existente.
function loginUser(req, res){
    var params = req.body;

    var email = params.email;
    var password = params.password;

    //El objeto directamente en la consulta funciona como un AND, es decir que se verifican todos los valores que le indique.
    User.findOne({email: email}).exec( (error, user) => {
        if (error){
            return res.status(500).send({
                message: "Error en la consulta."
            });
        }

        //Si se encuentra un usuario entonces comparo las contraseñas con el compare de bcrypt.
        if (user){
            bcrypt.compare(password, user.password, (error, check) => {
                //Si el check obtenido el verdadero, significa que concuerdan los valores.
                if (check){

                    //Si se requiere el token, se recive un parámetro y en base a eso se llama al servicio de obtención de token.
                    if (params.withToken){
                        //Generar y devolver token en base al usuario encontrado en la consulta.
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        })
                    }else{
                        //Devolver los datos del usuario
                        //Limpio la contraseña para que no se obtenga el hash de la misma.
                        user.password = undefined;
                        return res.status(200).send({
                            user: user
                        });
                    }
                    
                }else{
                    return res.status(404).send({
                        message: "El usuario no se ha podido identificar."
                    });
                }
            });
        }else {
            return res.status(404).send({
                message: "El usuario no se ha podido identificar."
            });
        }
    })
}

//Se está exportando un objeto json con los métodos del controller.
module.exports = {
    saveUser,
    loginUser,
    test
}