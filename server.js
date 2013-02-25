/*

NodeTacToe Server Side
Stack: MongoDB, MongooseJS, NodeJS, Express, Socket.IO
Site: http://www.nodetactoe.com/

*/

var express = require('express');
var app = express();

app.get('/hello.txt', function (req, res) {
    var body = 'Hello World';
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Length', body.length);
    res.end(body);
});

app.listen(8080);