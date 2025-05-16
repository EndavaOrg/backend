var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var userSchema = new Schema({
	'Name' : String,
	'Surname' : String,
	'Email' : String,
	'dateOfBirth' : String
});

module.exports = mongoose.model('user', userSchema);
