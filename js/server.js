// Hardcore Mongoose Action

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/blah');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    console.log("worked");
});

var kittySchema = mongoose.Schema({
    name: String
});

var Kitten = mongoose.model('Kitten', kittySchema);