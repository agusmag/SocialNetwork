'use strict'

const moment = require('moment');
const mongoosePaginated = require('mongoose-pagination');

const User = require('../../models/user/user');
const Follow = require('../../models/follows/follow');
const Message = require('../../models/messages/message');

//Método que almacena un mensaje enviado de un usuario a otro
function saveMessage( req, res ) {
    const params = req.body;

    if ( !params.text || !params.receiver ) {
        return res.status(200).send({
            message: "No se ha podido almacenar el mensaje, faltan campos requeridos."
        });
    }

    let message = new Message();
    message.emitter = req.user.sub;
    message.receiver = params.receiver;
    message.text = params.text;
    message.viewed = "false";
    message.created_at = moment().unix();

    message.save(( err, messageStored ) => {
        if ( err ) {
            return res.status(500).send({
                message: "No se ha podido almacenar el mensaje. Error en la petición."
            });
        }

        if ( !messageStored ) {
            return res.status(404).send({
                message: "No se ha podido almacenar el mensaje. Error en la creación."
            });
        }

        return res.status(200).send({
            message: messageStored
        });
    });
};

//Método que obtiene los mensajes recibidos del usuario autenticado.
function getReceivedMessages( req, res ){
    const userId = req.user.sub;
    const itemsPerPage = 4;
    let page = 1;

    if ( req.params.page ) {
        page = req.params.page;
    }

    //Si se requiren filtrar campos en el populate se pasa un segunndo parámetro indicando separados por espacio los campos requeridos.
    Message.find({ receiver: userId }).populate('emitter', '_id nick name surname image').paginate( page, itemsPerPage, ( err, messages, total ) => {
        if ( err ) {
            return res.status(500).send({
                message: "No se han podido obtener mensajes. Error en la petición."
            });
        }

        if ( !messages ) {
            return res.status(404).send({
                message: "No hay mensajes recibidos."
            });
        }

        return res.status(200).send({
            total,
            pages: Math.ceil(total/itemsPerPage),
            page,
            message: messages
        })
    });
};

//Método que obtiene los mensajes enviados por el usuario autenticado
function getEmittedMessages( req, res ) {
    const userId = req.user.sub;
    const itemsPerPage = 4;
    let page = 1;

    if ( req.params.page ) {
        page = req.params.page;
    }

    Message.find({ emitter: userId }).populate('emitter receiver', '_id nick name surname image').paginate( page, itemsPerPage, ( err, messages, total ) => {
        if ( err ) {
            return res.status(500).send({
                message: "No se han podido obtener mensajes. Error en la petición."
            });
        }

        if ( !messages ) {
            return res.status(404).send({
                message: "No hay mensajes recibidos."
            });
        }

        return res.status(200).send({
            total,
            pages: Math.ceil(total/itemsPerPage),
            page,
            message: messages
        })
    });
};

//Método que obtiene la cantidad de mensajes no leidos.
function countUnviewedMessage( req, res ) {
    const userId = req.user.sub;

    Message.find({ receiver: userId, viewed: 'false' }).exec(( err, messages ) => {
        if ( err ) {
            return res.status(500).send({
                message: "Hubo un error al obtener los mensajes no leidos."
            });
        }

        return res.status(200).send({
            unviewed: messages.length
        });
    });
};

//Método que actualiza el estado de mensajes recibidos por otro usuario a read = true.
function readMessage( req, res ) {
    const userId = req.user.sub;
    const emitterId = req.params.id;

    //La estructura del update es: [búsqueda { valor1, valor2, valor3 }] | [que cambio { valorNuevo }] | [multi: true] para que actualice muchos registros. | [callback con los return res.status(x)]
    Message.update({ receiver: userId, emitter: emitterId, viewed: 'false' }, { viewed: 'true' }, { "multi": true }, ( err, messagesUpdated ) => {
        if ( err ) {
            return res.status(500).send({
                message: "Hubo un error al actualizar el mensaje. Error en la petición."
            });
        }

        if ( !messagesUpdated ) {
            return res.status(404).send({
                message: "Hubo un error al actualizar el mensaje."
            });
        }

        return res.status(200).send({
            messages: messagesUpdated
        });
    })
}

module.exports = {
    saveMessage,
    getEmittedMessages,
    getReceivedMessages,
    countUnviewedMessage,
    readMessage
};