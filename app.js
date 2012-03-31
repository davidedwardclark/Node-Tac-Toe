/*

JavaScript for NodeTacToe
Author: David Clark
Notes: JQuery is for wimps. Strict is for ballers. Nuff said.

*/

// Game code
(function() {
    'use strict';
    
    // Variables
    var gameOn = true;
    var whoseTurn = 1;
    var history = [];
    var blue = '#0033ff';
    
    
    // Add click events to board squares
    var addEventListenerToSquares = function(func) {
        var board = document.getElementById('board');
        var squares = board.getElementsByTagName('td');
        for (var i = 0; i < squares.length; i++) {
            squares[i].addEventListener('click', function() {
                func(this);
            }, false);
        }
    };
    
    // Check to see if someone has already selected that square
    // If they haven't then fire the rest of the functions
    var checkSquare = function(elem) {
        var value = elem.innerHTML;
        if ((value !== 'X') && (value !== 'O') && gameOn) {
            updateHistory(elem);
            checkWin(elem);
        }
    };
    
    // Update the history
    var updateHistory = function(elem) {
        var player = whoseTurn;
        var square = Number(elem.getAttribute('class').replace('tile-', ''));
        var turn = { 'player' : player, 'square' : square };
        history.push(turn);
    };
    
    // Check if someone has won
    var checkWin = function(elem) {
        var player1 = [];
        var player2 = [];
        var winningCombinations = [ [1, 2, 3], [4, 5, 6], [7, 8, 9], [1, 4, 7], [2, 5, 8], [3, 6, 9], [1, 5, 9], [7, 5, 3] ];
        var winningCombo;
        
        for (var i = 0; i < history.length; i++) {
            if (history[i].player === 1) {
                player1.push(history[i].square);
            } else if (history[i].player === 2) {
                player2.push(history[i].square);
            }
        }
        
        if (player1.length >= 3) {
            var player1String = player1.join('');
            var player2String = player2.join('');
            for (var j = 0; j < winningCombinations.length; j++) {
                var combo = winningCombinations[j].join('');
                var regex = new RegExp('\[' + combo + '\]', 'g');
                var player1Match = player1String.match(regex);
                if ((player1Match === null) || (player1Match === undefined)) { player1Match = []; }
                var player2Match = player2String.match(regex);
                if ((player2Match === null) || (player2Match === undefined)) { player2Match = []; }
                if (player1Match.length === 3) { winningCombo = player1Match; }
                if (player2Match.length === 3) { winningCombo = player2Match; }
                if ((player1Match.length === 3) || (player2Match.length === 3)) {
                    gameOn = false;
                    player1 = [];
                    player2 = [];
                    selectSquare(elem);
                    endGame(winningCombo, 'win');
                    break;
                }
            }
        }
        if ((history.length === 9) && gameOn) {
            gameOn = false;
            player1 = [];
            player2 = [];
            winningCombo = [];
            selectSquare(elem);
            updateStatus('Tie');
            endGame(winningCombo, 'tie');
        }
        if (gameOn) {
            selectSquare(elem);
            changeTurn();
        }
    };
    
    // Mark the square as selected
    var selectSquare = function(elem) {
        if (whoseTurn === 1) {
            elem.innerHTML = 'X';
        } else {
            elem.innerHTML = 'O';
        }
    };
    
    // Update the message board
    var updateStatus = function(value) {
        var container = document.getElementById('message');
        container.innerHTML = value;
    };
    
    // Update the message to let the user know whose turn it is
    var changeTurn = function() {
        if (whoseTurn === 1) {
            whoseTurn = 2;
            updateStatus('Player 2&rsquo;<sup>s</sup> Turn');
        } else {
            whoseTurn = 1;
            updateStatus('Player 1&rsquo;<sup>s</sup> Turn');
        }
    };
    
    // End the game and reset everything
    var endGame = function(winningCombo, status) {
        if (status === 'win') {
            var winner = 'Player ' + whoseTurn;
            updateStatus(winner + ' Wins');
        }
        var board = document.getElementById('board');
        board.setAttribute('class','quiet');
        if (status === 'win') {
            var highlight = [];
            var squares = board.getElementsByTagName('td');
            for (var i = 0; i < 3; i++) {
                highlight[i] = 'tile-' + winningCombo.shift();
                for (var j = 0; j < squares.length; j++) {
                    var currClass = squares[j].getAttribute('class');
                    if (currClass === highlight[i]) {
                        squares[j].style.color = blue;
                    }
                }
            }
        }
        var newgame = document.getElementById('newgame');
        newgame.setAttribute('class','show');
        newgame.addEventListener('click', function() {
            gameOn = true;
            board.setAttribute('class','');
            updateStatus('Player 1&rsquo;<sup>s</sup> Turn');
            whoseTurn = 1;
            history = [];
            var squares = board.getElementsByTagName('td');
            for (var i = 0; i < squares.length; i++) {
                squares[i].innerHTML = '&nbsp;';
                squares[i].setAttribute('style','');
            }
            this.setAttribute('class','hide');
        }, false);
    };
    
    // Start the game
    addEventListenerToSquares(checkSquare);
      
}());

// Scott Jehl's device orientation change fix
(function(w){

	// This fix addresses an iOS bug, so return early if the UA claims it's something else.
	if( !( /iPhone|iPad|iPod/.test( navigator.platform ) && navigator.userAgent.indexOf( "AppleWebKit" ) > -1 ) ){
		return;
	}

    var doc = w.document;

    if( !doc.querySelector ){ return; }

    var meta = doc.querySelector( "meta[name=viewport]" ),
        initialContent = meta && meta.getAttribute( "content" ),
        disabledZoom = initialContent + ",maximum-scale=1",
        enabledZoom = initialContent + ",maximum-scale=10",
        enabled = true,
		x, y, z, aig;

    if( !meta ){ return; }

    function restoreZoom(){
        meta.setAttribute( "content", enabledZoom );
        enabled = true;
    }

    function disableZoom(){
        meta.setAttribute( "content", disabledZoom );
        enabled = false;
    }

    function checkTilt( e ){
		aig = e.accelerationIncludingGravity;
		x = Math.abs( aig.x );
		y = Math.abs( aig.y );
		z = Math.abs( aig.z );

		// If portrait orientation and in one of the danger zones
        if( !w.orientation && ( x > 7 || ( ( z > 6 && y < 8 || z < 8 && y > 6 ) && x > 5 ) ) ){
			if( enabled ){
				disableZoom();
			}        	
        }
		else if( !enabled ){
			restoreZoom();
        }
    }

	w.addEventListener( "orientationchange", restoreZoom, false );
	w.addEventListener( "devicemotion", checkTilt, false );

})( this );