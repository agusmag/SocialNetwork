'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Se le tiene que indicar un tipo especial a las foreign keys, en este caso de userId.
var PublicationSchema = Schema({
    user: { type: Schema.ObjectId, ref: 'User'},
    text: String,
    file: String,
    create_at: String
});

module.exports = mongoose.model('Publication', PublicationSchema);