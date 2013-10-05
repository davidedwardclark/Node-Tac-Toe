/*

Server Side JavaScript for NodeTacToe
Author: David Clark

*/

/* Variables */
var app = require('express')();
var server = require('http').createServer(app).listen(8080);
var io = require('socket.io').listen(server);
var mongoose = require('mongoose');

/* Routes */
app.get('/stats/', function (req, res) {
    res.sendfile('stats/index.html');
});
app.get('/stats/data/', function (req, res) {
    res.contentType('application/json');
    res.sendfile('stats/data/moves.json');
});
app.get('/game/:id', function (req, res) {
    res.sendfile('index.html');
});
app.get('/*', function (req, res) {
    var path = req.params[0] ? req.params[0] : 'index.html';
    res.sendfile('./' + path);
});

/* Database */
mongoose.connect('mongodb://localhost/Node-Tac-Toe');
mongoose.connection.once('open', function callback() {

    // Schema
    var movesSchema = mongoose.Schema({
        socketId: Object,   // Socket id of the player.
        roomId: String,     // Room id of the game.
        player: Number,     // Player 1 or player 2.
        square: Number      // Square they placed.
    });
    var moves = mongoose.model('moves', movesSchema);

    // Query the moves table.
    moves.find(function (err, moveDocument) {
        if (err) {
            console.log("Find error: ", err);
        } else {
            console.log("Move documents found:");
            console.log(moveDocument);
        }
    });

    // Sockets
    io.sockets.on('connection', function (socket) {

        var roomId;

        // Join the clients room.
        socket.on('room', function (room) {
            socket.join(room);
            roomId = room;
            console.log('Client connected to room: ' + roomId);
        });

        // On move.
        socket.on('move', function (data) {

            // Prepare the data.
            var move = new moves({
                socketId: socket.id,
                roomId: roomId,
                player: data.player,
                square: data.square
            });

            // Save it.
            move.save(function (error, move) {
                if (error) {
                    console.log('Save error: ', err);
                } else {
                    if (move.player === 1) {
                        var piece = 'X';
                    } else {
                        var piece = 'O';
                    }
                    console.log(
                        'Player ' + move.player +
                        ' (socket id: ' + socket.id + ')' +
                        ' of room ' + roomId +
                        ' placed an ' + piece +
                        ' on square ' + move.square +
                        '. This moves unique id is ' + move._id + '.'
                    );
                }
            });

            // Emit to opponent.
            io.sockets.in(roomId).emit('update', data);

        });

    });

});
