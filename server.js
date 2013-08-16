/*

Server Side JavaScript for NodeTacToe
Author: David Clark

*/

var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var mongoose = require('mongoose');
var database = 'Node-Tac-Toe';

server.listen(8080);

app.get('/*', function (req, res) {
    var path = req.params[0] ? req.params[0] : 'index.html';
    res.sendfile('./' + path);
});

mongoose.connect('mongodb://localhost/' + database);
var databaseConnection = mongoose.connection;

databaseConnection.on('error', console.error.bind(console, 'Connection error:'));
databaseConnection.once('open', function callback() {

    console.log('Connected to database ' + database + '.');

    // Temp schema to hold move data.
    var tmpMovesSchema = mongoose.Schema({
        socketId: Object,                           // Socket id.
        player: Number,                             // Player 1 or player 2.
        square: Number                              // Square they placed on.
    });
    var tmpMoves = mongoose.model('tmpMoves', tmpMovesSchema);

    // Store moves as they come in.
    io.sockets.on('connection', function (socket) {
        socket.on('move', function (data) {

            // Save the data to the store.
            var tempDocument = new tmpMoves({
                socketId: socket.id,
                player: data.player,
                square: data.square
            });
            tempDocument.save(function (err, tempDocument) {
                if (err) {
                    console.log("Save error: " + err);
                } else {
                    console.log("Temp document saved.");
                }
            });

            // Emit back to the clients where the last user went.
            socket.emit('update', data);

        });
    });

});
