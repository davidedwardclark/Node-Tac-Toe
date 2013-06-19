/*

JavaScript for NodeTacToe
Author: David Clark
Notes: JQuery is for wimps. Strict is for ballers. Nuff said.

*/

(function () {

    var gameOn = false;
    var whoseTurn = 1;
    var history = [];
    var player1 = [];
    var player2 = [];
    var blue = '#0033ff';
    var board = document.getElementById('board');
    var squares = board.getElementsByTagName('td');
    var newGame = document.getElementById('newgame');

    // Attach events
    newGame.addEventListener('click', function () {
        startGame();
    }, false);
    for (var i = 0; i < squares.length; i++) {
        squares[i].addEventListener('click', function () {
            checkSquare(this);
        }, false);
    }

    // Start a new game
    var startGame = function () {
        gameOn = true;
        whoseTurn = 1;
        history = [];
        player1 = [];
        player2 = [];
        board.setAttribute('class', '');
        updateStatus('Player 1&rsquo;<sup>s</sup> Turn');
        for (var i = 0; i < squares.length; i++) {
            squares[i].innerHTML = '&nbsp;';
            squares[i].setAttribute('style', '');
        }
    };
    
    // Check to see if someone has already selected that square
    // If they haven't then update the history & check the win state
    var checkSquare = function (elem) {
        var value = elem.innerHTML;
        if (gameOn && (value !== 'X') && (value !== 'O')) {
            selectSquare(elem);
            updateHistory(elem);
            checkWin();
            playSound('click');
        }
    };
    
    // Update the history
    var updateHistory = function (elem) {
        var player = whoseTurn;
        var square = Number(elem.getAttribute('class').replace('tile-', ''));
        var turn = { 'player' : player, 'square' : square };
        history.push(turn);
        if (player === 1) {
            player1.push(square);
        } else {
            player2.push(square);
        }
    };
    
    // Check if someone has won
    var checkWin = function () {
        var winningCombo;
        var winningCombinations = [
            [1, 2, 3], [4, 5, 6], [7, 8, 9], [1, 4, 7],
            [2, 5, 8], [3, 6, 9], [1, 5, 9], [7, 5, 3]
        ];
        var player1String = player1.join('');
        var player2String = player2.join('');
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
                endGame('win', winningCombo);
                return;
            }
        }
        if ((history.length === 9) && gameOn) {
            endGame('tie');
            return;
        }
        if (gameOn) {
            changeTurn();
        }
    };
    
    // Mark the square as selected
    var selectSquare = function (elem) {
        if (whoseTurn === 1) {
            elem.innerHTML = 'X';
        } else {
            elem.innerHTML = 'O';
        }
    };
    
    // Update the message board
    var updateStatus = function (value) {
        var container = document.getElementById('message');
        container.innerHTML = value;
    };
    
    // Update the message to let the user know whose turn it is
    var changeTurn = function () {
        if (whoseTurn === 1) {
            whoseTurn = 2;
            updateStatus('Player 2&rsquo;<sup>s</sup> Turn');
        } else {
            whoseTurn = 1;
            updateStatus('Player 1&rsquo;<sup>s</sup> Turn');
        }
    };
    
    // End the game and reset everything
    var endGame = function (status, winningCombo) {
        var winner = 'Player ' + whoseTurn;
        var highlight = [];
        gameOn = false;
        board.setAttribute('class', 'quiet');
        if (status === 'win') {
            playSound('endgame');
            updateStatus(winner + ' Wins');
            for (var i = 0; i < 3; i++) {
                highlight[i] = 'tile-' + winningCombo.shift();
                for (var j = 0; j < squares.length; j++) {
                    var currClass = squares[j].getAttribute('class');
                    if (currClass === highlight[i]) {
                        squares[j].style.color = blue;
                    }
                }
            }
        } else if (status === 'tie') {
            winningCombo = [];
            updateStatus('Tie');
        }
    };

    // Play sounds
    var playSound = function (audio) {
        var audio5js = new audio5js({
            swf_path: 'swf/audio5js.swf',
            throw_errors: true,
            format_time: true,
            ready: function () {
                if (audio === 'click') {
                    this.load('audio/click.mp3');
                } else if (audio === 'endgame') {
                    this.load('audio/endgame.mp3');
                }
                this.play();
            }
        });
    };

    // Start the game
    startGame();

}());