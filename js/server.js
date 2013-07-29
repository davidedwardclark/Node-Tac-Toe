// NodeJS to MongoDB Connection via MongooseJS

var DATABASE = 'Node-Tac-Toe';
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/' + DATABASE);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', function callback() {
    console.log('Connected to ' + DATABASE + '.');
});

var NTT_Games = new Schema({
    date: { type: Date, default: Date.now },    // Date of game creation.
    p1Ip: String,                               // IP address of the first player.
    p2Ip: String                                // IP address of the second player.
});

var NTT_Moves = new Schema({
    date: { type: Date, default: Date.now },    // Date of move.
    player: String,                             // Player 1 or player 2?
    position: Number                            // Where did they place
});

var blogSchema = new Schema({
  title:  String,
  author: String,
  body:   String,
  comments: [{ body: String, date: Date }],
  date: { type: Date, default: Date.now },
  hidden: Boolean,
  meta: {
    votes: Number,
    favs:  Number
  }
});

var kittySchema = mongoose.Schema({
    name: String
});

kittySchema.methods.speak = function () {
    var greeting = this.name ? "Meow name is " + this.name : "I don't have a name";
    console.log(greeting);
};

var Kitten = mongoose.model('Kitten', kittySchema);

var silence = new Kitten({ name: 'Silence' });
console.log(silence.name);

var fluffy = new Kitten({ name: 'fluffy' });
fluffy.speak();

fluffy.save(function (err, fluffy) {
    if (err) {
        console.log(err);
    }
    fluffy.speak();
});

Kitten.find(function (err, kittens) {
    if (err) {
        console.log(err);
    }
    console.log(kittens);
});

// Kitten.find({ name: /^Fluff/ }, callback);

