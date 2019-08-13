'use strict'

const express = require('express');
const MessageController = require('../../controllers/message/message');
const api = express.Router();
const mdAuth = require('../../middlewares/authenticate');


api.post('/message', mdAuth.ensureAuth, MessageController.saveMessage);
api.get('/messages-out/:page?', mdAuth.ensureAuth, MessageController.getEmittedMessages);
api.get('/messages-in/:page?', mdAuth.ensureAuth, MessageController.getReceivedMessages);
api.get('/messages-in-unviewed', mdAuth.ensureAuth, MessageController.countUnviewedMessage);
api.put('/message/:id', mdAuth.ensureAuth, MessageController.readMessage);
module.exports = api;