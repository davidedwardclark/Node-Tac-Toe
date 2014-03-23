/*

Client Side JavaScript for NodeTacToe
Author: David Clark

*/

(function () {

    'use strict';

    var socket = io.connect('http://www.nodetactoe.com');
    var urlLocation = window.location.href;
    var room = window.location.pathname.split('/').pop();
    var player;
    var whoseTurn;
    var myTurn;
    var gameStarted;
    var winStatus = false;
    var winningCombo;
    var blue = '#0033ff';
    var body = document.getElementsByTagName('body')[0];
    var shareScreenURL = document.getElementById('shareScreenURL');
    var messageContainer = document.getElementById('message');
    var board = document.getElementById('board');
    var squares = board.getElementsByTagName('td');
    var player1History = [];
    var player2History = [];
    var player1String;
    var player2String;
    var winningCombinations = [
        [1, 2, 3], [4, 5, 6], [7, 8, 9], [1, 4, 7],
        [2, 5, 8], [3, 6, 9], [1, 5, 9], [7, 5, 3]
    ];
    var winningComboCheck;
    var whoWon;

    // Once connected emit which room we want to connect to.
    socket.on('connect', function () {
        socket.emit('room', room);
    });

    // Figure out which player this is.
    socket.on('player', function (data) {
        player = data;
        if (player === 1 || player === 2) {
            console.log('This is player ' + player + '.');
        }
        if (player === 1) {
            shareScreen(true);
        }
        if (player === 2) {
            updatePlayer('Player 2');
            shareScreen(false);
        }
        if (player === 3) {
            updatePlayer('Observer');
            socket.emit('observerHistoryRequest', true);
            console.log('This is an observer.');
        }
    });

    // Find out when the game has started.
    socket.on('gameStarted', function (data) {
        gameStarted = data;
        if (gameStarted === true) {
            if (player === 1) {
                shareScreen(false);
            }
            updateStatus('Your Turn');
            console.log('The game has started.');
        }
    });

    // Find out whose turn it is.
    socket.on('whoseTurn', function (data) {
        var statusMessage;
        whoseTurn = data;
        if (!winStatus) {
            if (whoseTurn === player) {
                myTurn = true;
                statusMessage = 'Your Turn';
                console.log('It is my turn.');
            } else {
                myTurn = false;
                statusMessage = 'Player ' + whoseTurn + '&rsquo;<sup>s</sup> Turn';
                console.log('It is player ' + whoseTurn + '\'s turn.');
            }
            updateStatus(statusMessage);
        }
    });

    // Find out where the other player went and place that piece on the board.
    socket.on('update', function (data) {
        var pieceType;
        if (!myTurn) {
            if (data.player === 1) {
                pieceType = 'X';
            } else {
                pieceType = 'O';
            }
            for (var i = 0; i < squares.length; i++) {
                if (Number(squares[i].getAttribute('class').replace('tile-', '')) === data.square) {
                    squares[i].innerHTML = pieceType;
                }
            }
            console.log(data);
        }
    });

    // Find out the game history and populate the observers game board with it.
    // We need to check to see if the game has finished yet.
    socket.on('gameHistory', function (data) {
        var gameHistory = data;
        var playerTurn;
        shareScreen(false);
        for (var i = 0; i < gameHistory.length; i++) {
            if (isEven(i)) {
                player1History.push(gameHistory[i]);
            } else {
                player2History.push(gameHistory[i]);
            }
        }
        player1String = player1History.join('');
        player2String = player2History.join('');
        for (var j = 0; j < winningCombinations.length; j++) {
            var combo = winningCombinations[j].join('');
            var regex = new RegExp('[' + combo + ']', 'g');
            var player1Match = player1String.match(regex);
            if ((player1Match === null) || (player1Match === undefined)) { player1Match = []; }
            var player2Match = player2String.match(regex);
            if ((player2Match === null) || (player2Match === undefined)) { player2Match = []; }
            if (player1Match.length === 3) {
               winningComboCheck = player1Match;
               whoWon = 1;
            }
            if (player2Match.length === 3) {
                winningComboCheck = player2Match;
                whoWon = 2;
            }
            if ((player1Match.length === 3) || (player2Match.length === 3)) {
                updateStatus('Player ' + whoWon + ' won');
                applyGameHistory(gameHistory);
                winningComboHighlight(winningComboCheck);
                board.setAttribute('class', 'quiet');
                return;
            } else {
                if (isEven(data.length)) {
                    playerTurn = 1;
                } else {
                    playerTurn = 2;
                }
                updateStatus('Player ' + playerTurn + '&rsquo;<sup>s</sup> Turn');
            }
        }
        if ( (!whoWon) && (gameHistory.length === 9) ) {
            updateStatus('Tie');
            applyGameHistory(gameHistory);
            board.setAttribute('class', 'quiet');
        }
        if ( (!whoWon) && (gameHistory.length < 9) ) {
            applyGameHistory(gameHistory);
        }
    });

    // Find out if anyone has won the game or if it is a tie game.
    socket.on('winStatus', function (data) {
        winStatus = true;
        if ( (data.player === 1) || (data.player === 2) ) {
            updateStatus('Player ' + data.player + ' Wins');
            board.setAttribute('class', 'quiet');
            winningComboHighlight(data.winningCombo);
            console.log('Player ' + data.player + ' won.');
        }
        if (data === 'tie') {
            board.setAttribute('class', 'quiet');
            updateStatus('Tie');
            console.log('Tie game.');
        }
    });

    // Board square events.
    for (var i = 0; i < squares.length; i++) {
        squares[i].addEventListener('click', function () {
            checkSquare(this);
        }, false);
    }

    // Check to see if the game has started, that it is the correct players turn
    // and that no one has already gone on that piece yet.
    // If so then select the square and emit the move.
    var checkSquare = function (elem) {
        var value = elem.innerHTML;
        if (gameStarted && !winStatus && myTurn && (value !== 'X') && (value !== 'O')) {
            selectSquare(elem);
            emitMove(elem);
            playSound('click');
        }
    };

    // Emit the move to the server.
    var emitMove = function (elem) {
        var square = Number(elem.getAttribute('class').replace('tile-', ''));
        socket.emit('move', {
            player: player,
            square: square
        });
    };

    // Mark the square as selected.
    var selectSquare = function (elem) {
        if (whoseTurn === 1) {
            elem.innerHTML = 'X';
        } else {
            elem.innerHTML = 'O';
        }
    };

    // Update the message board.
    var updateStatus = function (value) {
        messageContainer.innerHTML = value;
    };

    // Update the player.
    var updatePlayer = function (value) {
        var container = document.getElementById('player');
        container.innerHTML = value;
    };

    // Apply game history to the board.
    var applyGameHistory = function (value) {
        var movesMade = value;
        var pieceType;
        for (var i = 0; i < movesMade.length; i++) {
            for (var j = 0; j < squares.length; j++) {
                if (movesMade[i] === (j + 1)) {
                    if (isEven(i)) {
                        pieceType = 'X';
                    } else {
                        pieceType = 'O';
                    }
                    squares[j].innerHTML = pieceType;
                }
            }
        }
    };

    // Check if a number is odd or even.
    var isEven = function (value) {
        if (value%2 === 0) {
            return true;
        } else {
            return false;
        }
    };

    // Apply highlight to winning combo.
    var winningComboHighlight = function (value) {
        var winningCombo = value;
        var highlight = [];
        var currClass;
        for (var i = 0; i < 3; i++) {
            highlight[i] = 'tile-' + winningCombo.shift();
            for (var j = 0; j < squares.length; j++) {
                currClass = squares[j].getAttribute('class');
                if (currClass === highlight[i]) {
                    squares[j].style.color = blue;
                }
            }
        }
    };

    // Share screen.
    var shareScreen = function (value) {
        if (value === true) {
            console.log(urlLocation);
            body.setAttribute('class', 'sharescreen');
            shareScreenURL.innerHTML = urlLocation;
        }
        if (value === false) {
            body.setAttribute('class', '');
            board.setAttribute('class', 'show');
            messageContainer.setAttribute('class', 'show');
        }
    };

    // Play sounds.
    var playSound = function (audio) {
        var audio5js = new Audio5js({
            swf_path: '/libraries/audio5js.swf',
            throw_errors: true,
            format_time: true,
            ready: function () {
                if (audio === 'click') {
                    this.load('/audio/click.mp3');
                }
                this.play();
            }
        });
    };

})();