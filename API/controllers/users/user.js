'use strict'

//Para cifrar la contraseña.
const bcrypt = require('bcrypt-nodejs');
//Para gestionar los tokens de los usuarios.
const jwt = require('../../services/jwt');
//Para poder paginar la consulta.
const mongoosePaginate = require('mongoose-pagination');

//Para gestionar los archivos ( file system );
const fs = require('fs');
const path = require('path');

const User = require('../../models/user/user');
const Follow = require('../../models/follows/follow');
const Publication = require('../../models/publications/publication');

//Método que registra un nuevo usuario.
function saveUser(req, res) {
    const params = req.body;
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
        User.find({
            $or:
                [
                    { email: user.email.toLowerCase() },
                    { nick: user.nick.toLowerCase() }
                ]
            //El exec ejecuta el query en la base.
        }).exec((error, users) => {
            if (error) {
                return res.status(500).send({
                    message: "Error en la consulta de usuarios."
                });
            }

            //Se verifica que la consulta no me traiga usuarios que coincidan con esa búsqueda.
            if (users && users.length > 0) {
                return res.status(200).send({
                    message: "El usuario que se quiere registrar ya existe."
                });
            } else {
                //Se le aplica un hash a la contraseña para que no sea visible.
                bcrypt.hash(params.password, null, null, (error, hash) => {
                    user.password = hash;

                    //Se guarda el usuario en la base con el save del mongoose.
                    user.save((error, userStored) => {
                        //Si hay un error se informa con un mensaje y status 500.
                        if (error) {
                            return res.status(500).send({
                                message: "Error al guardar el usuario."
                            });
                        }

                        //Si se tiene un usuario en respuesta, lo muestro con status 200, sino informo que no se pudo con un 404.
                        if (userStored) {
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
        res.status(200).send({
            message: "Faltan datos del usuario a crear."
        });
    }
};

//Método que actualiza un usuario existente
function updateUser(req, res) {
    //Se obtiene el id de usuario por url.
    const userId = req.params.id;
    //Se obtienen los datos del usuario para actualizar, debo quitar la password, ya que esa clase de update va aparte.
    let update = req.body;

    //El delete elimina una propiedad de un objeto.
    delete update.password;

    //Si el usuario identificado es diferente al que llega por url, significa que se quiere actualizar otro que no es él.
    if (userId != req.user.sub) {
        return res.status(500).send({
            message: "No tenés permiso para actualizar los datos del usuario."
        });
    }

    User.find({
        $or: [
            { email: update.email.toLowerCase() },
            { nick: update.nick.toLowerCase() }
        ]
    }).exec((err, users) => {
        if (err) {
            return res.status(500).send({
                message: "Hubo un error al actualizar los datos del usuario.",
                error: err
            })
        }
        let userIsSet = false;

        users.forEach(user => {
            if (user && user._id != userId && !userIsSet) {
                userIsSet = true;
            }
        });

        if (userIsSet) {
            return res.status(200).send({
                message: "Los datos ya están en uso."
            });
        }

        //Método para actualizar una entidad en la base de datos, si se pasan propiedades puedo retornar diferentes cosas. Por ejemplo:
        // Si indica new: true, me devuelve el objeto actualizado, el por defecto es el original
        User.findByIdAndUpdate(userId, update, { new: true }, (error, userUpdated) => {
            if (error) {
                return res.status(500).send({
                    message: "No se ha podido realizar esa operación."
                });
            }

            if (!userUpdated) {
                return res.status(404).send({
                    message: "No se ha podido actualizar el usuario."
                });
            }

            //Si se actualizó correctamente, muestro el usuario con los nuevos datos.
            return res.status(200).send({
                user: userUpdated
            });
        })
    });
};

//Método para subir archivos de imagen/avatar de un usuario, para subir imágenes en el post, tengo que usar el form-data.
function uploadImage(req, res) {
    const userId = req.params.id;

    //Los archivos que se agregan en un request, se agregan en files
    if (req.files) {
        //Se guardan el nombre con extención, y la extención de la imagen para validarlo.
        const filePath = req.files.image.path;
        const fileName = filePath.split('/')[2];
        const fileExtention = fileName.split('.')[1].toLowerCase();
        let existingFileName = null;

        if (userId != req.user.sub) {
            return removeFilesOfUploads(res, filePath, "No tenés permiso para actualizar los datos del usuario.");
        }

        //Se podría optimizar esto con un helper.
        if (fileExtention == 'png' || fileExtention == 'jpg' || fileExtention == 'jpeg' || fileExtention == 'gif') {
            //Se busca el usuario previamente y se verifica si existe una imagen previa, en caso de existir, se elimina para no generar basura.
            User.findById( userId, (err, userFinded) => {
                if (userFinded && userFinded.image ) {
                    existingFileName = './uploads/users/' + userFinded.image;
                    fs.unlink( existingFileName, ( err ) => {
                        if ( err ) {
                           console.log("Hubo un error interno al eliminar la imagen previa del usuario" + userFinded.email + " del Storage" );
                        }
                    });
                }

                //Se actualiza el usuario con la imagen.
                User.findByIdAndUpdate(userId, { image: fileName }, { new: true }, (error, userUpdated) => {
                    if (error) {
                        return res.status(500).send({
                            message: "No se ha podido realizar esa operación."
                        });
                    }

                    if (!userUpdated) {
                        return res.status(404).send({
                            message: "No se ha podido actualizar el usuario."
                        });
                    }

                    //Si se actualizó correctamente, muestro el usuario con los nuevos datos.
                    return res.status(200).send({
                        user: userUpdated
                    });
                });
            });

        } else {
            return removeFilesOfUploads(res, filePath, "La extención no es válida.");
        }
    } else {
        return res.status(200).send({
            message: "No se han subido archivos e imágenes."
        });
    }
};

//Método para eliminar un archivo del storage.
function removeFilesOfUploads(res, filePath, message) {
    fs.unlink(filePath, (error) => {
        return res.status(500).send({
            message: message
        });
    })
};

//Método para obtener la imágen de un usuario.
function getImageFile(req, res) {
    //Parámetro que recibe por url.
    const imageFile = req.params.imageFile;
    const pathFile = './uploads/users/' + imageFile;

    fs.exists(pathFile, (exists) => {
        if (exists) {
            //Si existe esa ruta a ese archivo, lo devuelvo con el método propio de express.
            return res.sendFile(path.resolve(pathFile));
        } else {
            return res.status(404).send({
                message: "La imagen no existe."
            });
        }
    });
};

//Método que loguea a un usuario existente y le asigna un token.
function loginUser(req, res) {
    const params = req.body;

    const email = params.email;
    const password = params.password;

    //El objeto directamente en la consulta funciona como un AND, es decir que se verifican todos los valores que le indique.
    User.findOne({ email: email }).exec((error, user) => {
        if (error) {
            return res.status(500).send({
                message: "Error en la consulta."
            });
        }

        //Si se encuentra un usuario entonces comparo las contraseñas con el compare de bcrypt.
        if (user) {
            bcrypt.compare(password, user.password, (error, check) => {
                //Si el check obtenido el verdadero, significa que concuerdan los valores.
                if (check) {
                    //Si se requiere el token, se recive un parámetro y en base a eso se llama al servicio de obtención de token.
                    if (params.withToken) {
                        //Generar y devolver token en base al usuario encontrado en la consulta.
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        })
                    } else {
                        //Devolver los datos del usuario
                        //Limpio la contraseña para que no se obtenga el hash de la misma.
                        user.password = undefined;
                        return res.status(200).send({
                            user: user
                        });
                    }
                } else {
                    return res.status(404).send({
                        message: "El usuario no se ha podido identificar."
                    });
                }
            });
        } else {
            return res.status(404).send({
                message: "El usuario no se ha podido identificar."
            });
        }
    })
};

//Método que obtiene los datos de un usuario solicitado por id.
function getUser(req, res) {
    //Cuando llegan datos por url se usa params.
    const userId = req.params.id;

    User.findById(userId, (err, user) => {
        if (err) {
            return res.status(500).send({
                message: "Error en la petición."
            });
        }

        if (!user) {
            return res.status(404).send({
                message: "El usuario no existe"
            });
        }

        //Se verifica que el usuario que se está buscando sea un seguidor del usuario autentificado o no.
        followAuthenticatedUser(req.user.sub, userId).then((value) => {
            user.password = undefined;
            //Si todo va bien, devuelve objetos usuario de follow y following para saber si es seguido/seguidor/ambos o null.
            return res.status(200).send({
                user,
                following: value.following,
                follower: value.followed
            });
        });
    });
};

//Método asincrónico que espera a consultar si el usuario es seguido y sigue al usuario autentificado.
async function followAuthenticatedUser(identityUserId, userId) {
    const following = await Follow.findOne({ user: identityUserId, followed: userId }).exec()
        .then((following) => {
            return following;
        })
        .catch((err) => {
            return handleError(err);
        });

    const followed = await Follow.findOne({ "user": userId, "followed": identityUserId }).exec()
        .then((follower) => {
            return follower;
        })
        .catch((err) => {
            return handleError(err);
        });

    return {
        following: following,
        followed: followed
    };
};

//Método para devolver un listado paginado de los usuarios registrados
function getUsers(req, res) {
    //El req.user.sub se obtiene ya que al loguearse se generó un token que se almacena (por el payload) en sub el userId
    const identityUserId = req.user.sub;
    let page = 1;

    if (req.params.page) {
        page = req.params.page;
    }

    const itemPerPage = 5;

    //El paginate sirve para filtrar la cantidad de usuarios dependiendo de un número de página que se indique y una cantidad por página
    User.find().sort('_id').paginate(page, itemPerPage, (error, users, total) => {
        if (error) {
            return res.status(500).send({
                message: "Error en la petición."
            });
        }

        if (!users) {
            return res.status(404).send({
                message: "No hay usuarios disponibles."
            });
        }

        followUserIds(identityUserId).then((value) => {
            //Si o se indica el formato [clave]:[valor] nodeJs asume que es el mismo que la propiedad.
            return res.status(200).send({
                users,
                users_following: value.following,
                users_followers: value.followed,
                total,
                pages: Math.ceil(total / itemPerPage)
            });
        }).catch((err) => {
            return handleError(err);
        })
    });
};

//Método asincrónico que espera a que se ejecute la consulta de listar los id de los seguidores/seguidos del usuario autentificado.
async function followUserIds(userId) {
    //Se usa el select para filtrar que campos se quieren traer y cuales excluir, con el :0 se excluyen.
    const following = await Follow.find({ user: userId }).select({ '_id': 0, '__v': 0, 'user': 0 }).exec()
        .then((follows) => {
            let followsClean = [];

            //Se recorre el arreglo de follows para ir agregando los ids al arreglo final.
            follows.forEach((follow) => {
                followsClean.push(follow.followed);
            });

            return followsClean;
        })
        .catch((err) => {
            return handleError(err);
        });

    const followed = await Follow.find({ followed: userId }).select({ '_id': 0, '__v': 0, 'followed': 0 }).exec()
        .then((follows) => {
            let followsClean = [];

            follows.forEach((follow) => {
                followsClean.push(follow.user);
            });

            return followsClean;
        })
        .catch((err) => {
            return handleError(err);
        });

    return {
        following: following,
        followed: followed
    }
};

//Método que retorna los contadores de seguidos/seguidores/publicaciones, etc.
function getCounters(req, res) {
    let userId = req.user.sub;

    if (req.params.id) {
        userId = req.params.id;
    }

    getFollowCount(userId).then((value) => {
        return res.status(200).send({
            value
        });
    });
};

//Método asincrónico que returna los diferentes contadores(totales) a modo de estadística de un usuario espeficado.
async function getFollowCount(userId) {
    const followingCounter = await Follow.countDocuments({ user: userId }).exec()
        .then((total) => {
            return total;
        })
        .catch((err) => {
            return handleError(err);
        });

    const followedCounter = await Follow.countDocuments({ followed: userId }).exec()
        .then((total) => {
            return total;
        })
        .catch((err) => {
            return handleError(err);
        });

    const publications = await Publication.countDocuments({ user: userId }).exec()
        .then((total) => {
            return total;
        })
        .catch((err) => {
            return handleError(err);
        });

    return {
        following: followingCounter,
        followed: followedCounter,
        publications
    };
};

//Se está exportando un objeto json con los métodos del controller.
module.exports = {
    saveUser,
    updateUser,
    uploadImage,
    getImageFile,
    loginUser,
    getUser,
    getUsers,
    getCounters
};