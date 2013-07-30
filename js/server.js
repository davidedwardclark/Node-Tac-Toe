// NodeJS to MongoDB Connection via MongooseJS

var mongoose = require('mongoose');
var DATABASE = 'Node-Tac-Toe';

mongoose.connect('mongodb://localhost/' + DATABASE);
var databaseConnection = mongoose.connection;

databaseConnection.on('error', console.error.bind(console, 'Connection error:'));
databaseConnection.once('open', function callback() {
    console.log('Connected to ' + DATABASE + '.');

    // Schemas
    var nttGamesSchema = mongoose.Schema({
        date: { type: Date, default: Date.now },    // Date of game creation.
        player1Ip: String,                          // IP address of the first player.
        player2Ip: String                           // IP address of the second player.
    });
    var nttGames = mongoose.model('nttGames', nttGamesSchema);
    var nttMovesSchema = mongoose.Schema({
        player: Number,                             // Player 1 or player 2.
        square: Number,                             // Square they placed on.
        gameId: Object                              // Game id.
    });
    var nttMoves = mongoose.model('nttMoves', nttMovesSchema);

    // Create
    var gameDocument = new nttGames({ player1Ip: '64.251.74.162', player2Ip: '64.251.74.162'});
    var moveDocument = new nttMoves({ player: 1, position: 3, gameId: gameDocument._id});

    // Save
    gameDocument.save(function (err, gameDocument) {
        if (err) {
            console.log("Save error: " + err);
        } else {
            console.log("Game document saved. Id: " + gameDocument._id);
        }
    });
    moveDocument.save(function (err, moveDocument) {
        if (err) {
            console.log("Save error: " + err);
        } else {
            console.log("Move document saved. Id: " + moveDocument._id);
        }
    });

    // Find
    nttGames.find(function (err, gameDocument) {
        if (err) {
            console.log("Find error: " + err);
        } else {
            console.log("Game document found:")
            console.log(gameDocument);
        }
    });
    nttMoves.find(function (err, moveDocument) {
        if (err) {
            console.log("Find error: " + err);
        } else {
            console.log("Move document found:")
            console.log(moveDocument);
        }
    });
});
