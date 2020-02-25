'use strict'

//Se cargan las bibliotecas que se podrían usar.
var mongoosePaginate = require('mongoose-pagination');

//Se cargan los modelos que se usarán en el controller.
var UserModel = require('../../models/user/user');
var Follow = require('../../models/follows/follow');

//Método para seguir a otro usuario.
function saveFollow(req, res) {
    const params = req.body;

    //Se crea una nueva instancia de follow para almacenar los datos.
    let follow = new Follow();
    //Se asigna el usuario del request que está logueado al objeto user del follow (que es el que sigue a alguien).
    follow.user = req.user.sub;
    follow.followed = params.followed;

    follow.save((err, followStored) => {
        if (err) {
            return res.status(500).send({
                message: "Error al guardar el seguimiento."
            });
        }

        if (!followStored) {
            return res.status(404).send({
                message: "Error al seguir a ese usuario."
            });
        }

        return res.status(200).send({
            follow: followStored
        });
    });

};

//Método para dejar de seguir a otro usuario.
function deleteFollow(req, res) {
    //Se obtiene el id del usuario logueado y el id del usuario al que se quiere dejar de seguir.
    const userId = req.user.sub;
    const followedId = req.params.id;

    Follow.find({ 'user': userId, 'followed': followedId }).remove((err) => {
        if (err) {
            return res.status(500).send({
                message: "Error al dejar de seguir a un usuario."
            });
        }

        return res.status(200).send({
            message: "El usuario se ha eliminado correctamente."
        });
    });
};

//Método para listar los usuarios seguidos paginadamente.
function getFollowingUsers(req, res) {
    //Se obtiene el id del usuario logueado.
    let userId = req.user.sub;
    let page = 1;

    //Si llega un id y un número de página por la url, usamos ese id para obtener su listado de seguidos, sino el del usuario autentificado.
    if (req.params.id && isNaN(req.params.id)) {
        userId = req.params.id;
    } else if (req.params.id) {
        page = req.params.id;
    }

    //Si llega un número de página por la url buscamos en ese página, sino se usa la primera por defecto.
    if (req.params.page) {
        page = req.params.page;
    }

    //Se usan por defecto 4 usarios por página.
    const itemsPerPage = 4;

    //Se busca todos los objetos que contengan el campo user con el id que se recibe.
    //Además, se populan los objetos, pero obteniendo el objeto entero, no solo el id, para eso se especifica el nombre del campo el cual quiero obtener su objeto entero.
    Follow.find({ user: userId }).populate({ path: 'followed' }).paginate(page, itemsPerPage, (err, follows, total) => {
        if (err) {
            return res.status(500).send({
                message: "Error al obtener los usuarios seguidos."
            });
        }

        if (!follows) {
            return res.status(404).send({
                message: "No hay usuarios seguidos."
            });
        }

        //Se retorna el total de usuarios seguidos, el total de páginas y la colección de seguidos.
        return res.status(200).send({
            total: total,
            page: Math.ceil(total / itemsPerPage),
            follows: follows
        })
    });
};

//Método que lista los usuarios que siguen al usuario autentificado.
function getFollowedUsers(req, res) {
    //Se obtiene el id del usuario logueado.
    let userId = req.user.sub;
    let page = 1;

    //Si llega un id y un número de página por la url, usamos ese id para obtener su listado de seguidos, sino el del usuario autentificado.
    if (req.params.id && isNaN(req.params.id)) {
        userId = req.params.id;
    } else if (req.params.id) {
        page = req.params.id;
    }

    //Si llega un número de página por la url buscamos en ese página, sino se usa la primera por defecto.
    if (req.params.page) {
        page = req.params.page;
    }

    //Se usan por defecto 4 usarios por página.
    const itemsPerPage = 4;

    //Se busca todos los objetos que contengan el campo followed(seguido) con el id que se recibe.
    //Además, se populan los objetos, pero obteniendo el objeto entero, no solo el id, para eso se especifica el nombre del campo el cual quiero obtener su objeto entero.
    Follow.find({ followed: userId }).populate('user').paginate(page, itemsPerPage, (err, follows, total) => {
        if (err) {
            return res.status(500).send({
                message: "Error al obtener los usuarios seguidores."
            });
        }

        if (!follows) {
            return res.status(404).send({
                message: "No hay usuarios seguidores."
            });
        }

        //Se retorna el total de usuarios seguidos, el total de páginas y la colección de seguidos.
        return res.status(200).send({
            total: total,
            page: Math.ceil(total / itemsPerPage),
            follows: follows
        })
    });
};

//Método que lista los usuarios seguidos o seguidores del usuario autentificado.
function getFollows(req, res) {
    const userId = req.user.sub;
    let find = Follow.find({ user: userId });
    let message = "seguidos.";
    let queryReturn = "followed";

    //Si se le pasa el parámetro followers a la request, entonces devuelve los seguidores, sino los seguidos.
    if (req.params.followers) {
        find = Follow.find({ followed: userId });
        message = "seguidores.";
        queryReturn = "user";
    }

    find.populate(queryReturn).exec((err, follows) => {

        if (err) {
            return res.status(500).send({
                message: "Error al obtener los usuarios " + message
            });
        }

        if (!follows) {
            return res.status(404).send({
                message: "No hay usuarios " + message
            });
        }

        return res.status(200).send({ follows });
    });
};

module.exports = {
    saveFollow,
    deleteFollow,
    getFollowingUsers,
    getFollowedUsers,
    getFollows
};