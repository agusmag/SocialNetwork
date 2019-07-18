'use strict'

//Para cifrar la contraseña.
var bcrypt = require('bcrypt-nodejs');
//Para gestionar los tokens de los usuarios.
var jwt = require('../../services/jwt');
//Para poder paginar la consulta.
var mongoosePaginate = require('mongoose-pagination');

//Para gestionar los archivos ( file system );
var fs = require('fs');
var path = require('path');

var User = require('../../models/user/user');

function test(req, res){
    res.status(200).send({
        message: "Método de prueba de la entidad usuario."
    })
};

//Método que registra un nuevo usuario.
function saveUser( req, res ){
    const params= req.body;
    let user = new User();

    //Se verifica que los parámetros requeridos se reciban.
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
                    }).exec( ( error, users ) => {
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
                            bcrypt.hash(params.password, null, null, ( error, hash ) => {
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
                                    if ( userStored ){
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

//Método que actualiza un usuario existente
function updateUser( req, res ){
    //Se obtiene el id de usuario por url.
    const userId = req.params.id;
    //Se obtienen los datos del usuario para actualizar, debo quitar la password, ya que esa clase de update va aparte.
    let update = req.body;

    //El delete elimina una propiedad de un objeto.
    delete update.password;

    //Si el usuario identificado es diferente al que llega por url, significa que se quiere actualizar otro que no es él.
    if ( userId != req.user.sub ){
        return res.status(500).send({
            message: "No tenés permiso para actualizar los datos del usuario."
        });
    }

    //Método para actualizar una entidad en la base de datos, si se pasan propiedades puedo retornar diferentes cosas. Por ejemplo:
    // Si indica new: true, me devuelve el objeto actualizado, el por defecto es el original
    User.findByIdAndUpdate( userId, update, { new: true }, ( error, userUpdated ) => {
        if ( error ){
            return res.status(500).send({
                message: "No se ha podido realizar esa operación."
            });
        }

        if ( !userUpdated ){
            return res.status(404).send({
                message: "No se ha podido actualizar el usuario."
            });
        }

        //Si se actualizó correctamente, muestro el usuario con los nuevos datos.
        return res.status(200).send({
            user: userUpdated
        })
    })
};

//Método para subir archivos de imagen/avatar de un usuario, para subir imágenes en el post, tengo que usar el form-data.
function uploadImage( req, res ) {
    const userId = req.params.id;

    //Los archivos que se agregan en un request, se agregan en files
    if ( req.files ){
        //Se guardan el nombre con extención, y la extención de la imagen para validarlo.
        const filePath = req.files.image.path;
        const fileName = filePath.split('/')[2];
        const fileExtention = fileName.split('.')[1];

        if ( userId != req.user.sub ){
            removeFilesOfUploads(res, filePath, "No tenés permiso para actualizar los datos del usuario.");
        }
        
        //Se podría optimizar esto con un helper.
        if( fileExtention == 'png' || fileExtention == 'jpg' || fileExtention == 'jpeg' || fileExtention == 'gif' ){
            //Se actualiza el usuario con la imagen.
        }else {
            //
            removeFilesOfUploads(res, filePath, "La extención no es válida.");
        }
    } else {
        return res.status(200).send({
            message: "No se han subido archivos e imágenes."
        });
    }
};

//Método para eliminar un archivo del storage.
function removeFilesOfUploads( res, filePath, message ){
    fs.unlink(filePath, ( error ) => {
        return res.status(500).send({
            message: message
        });
    })
}

//Método que loguea a un usuario existente y le asigna un token.
function loginUser( req, res ){
    const params = req.body;

    const email = params.email;
    const password = params.password;

    //El objeto directamente en la consulta funciona como un AND, es decir que se verifican todos los valores que le indique.
    User.findOne({ email: email }).exec( ( error, user ) => {
        if (error){
            return res.status(500).send({
                message: "Error en la consulta."
            });
        }

        //Si se encuentra un usuario entonces comparo las contraseñas con el compare de bcrypt.
        if (user){
            bcrypt.compare(password, user.password, ( error, check ) => {
                //Si el check obtenido el verdadero, significa que concuerdan los valores.
                if ( check ){

                    //Si se requiere el token, se recive un parámetro y en base a eso se llama al servicio de obtención de token.
                    if ( params.withToken ){
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
};

//Método que obtiene los datos de un usuario solicitado por id.
function getUser( req, res ){
    //Cuando llegan datos por url se usa params.
    const userId = req.params.id;

    User.findById(userId, ( error, user ) => {
        if (error){
            return res.status(500).send({
                message: "Error en la petición."
            });
        }

        if (!user){
            return res.status(404).send({
                message: "El usuario no existe"
            });
        }

        return res.status(200).send({
            user: user
        });
    })
};

//Método para devolver un listado paginado de los usuarios registrados
function getUsers( req, res ){
    //El req.user.sub se obtiene ya que al loguearse se generó un token que se almacena (por el payload) en sub el userId
    const identityUserId = req.user.sub;
    let page = 1;

    if (req.params.page){
        page = req.params.page;
    }

    const itemPerPage = 5;

    //El paginate sirve para filtrar la cantidad de usuarios dependiendo de un número de página que se indique y una cantidad por página
    User.find().sort('_id').paginate(page, itemPerPage, ( error, users, total) => {
        if ( error ) {
            return res.status(500).send({
                message: "Error en la petición."
            });
        }

        if ( !users ) {
            return res.status(404).send({
                message: "No hay usuarios disponibles."
            });
        }

        //Si o se indica el formato [clave]:[valor] nodeJs asume que es el mismo que la propiedad.
        return res.status(200).send({
            users,
            total,
            pages: Math.ceil(total/itemPerPage)
        });
    });
};

//Se está exportando un objeto json con los métodos del controller.
module.exports = {
    saveUser,
    updateUser,
    uploadImage,
    loginUser,
    getUser,
    getUsers,
    test
}