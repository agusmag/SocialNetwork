'use strict'

const express = require('express');
const PublicationController = require('../../controllers/publication/publication');
const api = express.Router();
const mdAuth = require('../../middlewares/authenticate');

const multipart = require('connect-multiparty');
const mdUpload = multipart({ uploadDir: './uploads/publications'});

api.post('/publication', mdAuth.ensureAuth, PublicationController.savePublication);
api.get('/publications/:page?', mdAuth.ensureAuth, PublicationController.getPublications);
api.get('/publications-user/:id?/:page?', mdAuth.ensureAuth, PublicationController.getUserPublications);
api.get('/publication/:id', mdAuth.ensureAuth, PublicationController.getPublication);
api.delete('/publication/:id', mdAuth.ensureAuth, PublicationController.removePublication);
api.put('/image-publication/:id', [ mdAuth.ensureAuth, mdUpload ], PublicationController.uploadImage);
api.get('/image-publication/:imageFile', PublicationController.getImageFile);

module.exports = api;
