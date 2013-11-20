/*

Server Side JavaScript for NodeTacToe
Author: David Clark

*/

/* Variables */
var express = require('express');
var app = express();
var server = require('http').createServer(app).listen(8080);
var io = require('socket.io').listen(server);
var mongoose = require('mongoose');

/* Routes */
app.get('/game/:id', function (req, res) {
    res.sendfile('index.html');
});
app.get('/stats/', function (req, res) {
    res.sendfile('stats/index.html');
});
app.get('/stats/data/', function (req, res) {
    res.contentType('application/json');
    res.sendfile('stats/data/moves.json');
});

/* Routes to static files. */
app.use('/audio', express.static('audio'));
app.use('/css', express.static('css'));
app.use('/images', express.static('images'));
app.use('/js', express.static('js'));
app.use('/libraries', express.static('libraries'));
app.use('/stats', express.static('stats'));

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

    // Sockets
    io.sockets.on('connection', function (socket) {

        var roomId;
        var history = [];
        var player1 = [];
        var player2 = [];
        var winningCombo;
        var winningCombinations = [
            [1, 2, 3], [4, 5, 6], [7, 8, 9], [1, 4, 7],
            [2, 5, 8], [3, 6, 9], [1, 5, 9], [7, 5, 3]
        ];
        var player1String;
        var player2String;

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

            // Store move in global history.
            history.push({player: data.player, square: data.square});

            // Store move in player history.
            if (data.player === 1) {
                player1.push(data.square);
                console.log(player1);
            } else {
                player2.push(data.square);
                console.log(player2);
            }

            // Check win state.
            player1String = player1.join('');
            player2String = player2.join('');
            for (var j = 0; j < winningCombinations.length; j++) {
                var combo = winningCombinations[j].join('');
                var regex = new RegExp('[' + combo + ']', 'g');
                var player1Match = player1String.match(regex);
                if ((player1Match === null) || (player1Match === undefined)) { player1Match = []; }
                var player2Match = player2String.match(regex);
                if ((player2Match === null) || (player2Match === undefined)) { player2Match = []; }
                if (player1Match.length === 3) { winningCombo = player1Match; }
                if (player2Match.length === 3) { winningCombo = player2Match; }
                if ((player1Match.length === 3) || (player2Match.length === 3)) {
                    if (data.player === 1) {
                        console.log("Player 1 won.");
                    } else {
                        console.log("Player 2 won.");
                    }
                    console.log(winningCombo);
                }
            }

            // Emit to opponent.
            io.sockets.in(roomId).emit('update', data);

        });

    });

});
