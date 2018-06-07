var express = require('express');


var app = express();
app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/views'));

app.get('/', function(req, res) {
    res.render('home');
});

app.listen(8080);