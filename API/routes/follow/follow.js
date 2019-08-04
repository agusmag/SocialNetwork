'use strict'

//Se cargan las entidades que se requieran.
var express = require('express');
var FollowController = require('../../controllers/follow/follow');
var api = express.Router();
var mdAuth = require('../../middlewares/authenticate');

api.post('/follow-user', mdAuth.ensureAuth, FollowController.saveFollow);
api.delete('/unfollow-user/:id', mdAuth.ensureAuth, FollowController.deleteFollow);
api.get('/follows/:id?/:page?', mdAuth.ensureAuth, FollowController.getFollowingUsers);
api.get('/followers/:id?/:page?', mdAuth.ensureAuth, FollowController.getFollowedUsers);
api.get('/follows-list/:followers?', mdAuth.ensureAuth, FollowController.getFollows);

module.exports = api;

