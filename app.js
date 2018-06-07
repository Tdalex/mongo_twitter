/**
 * Created by mohamedchakiri on 06/06/2018.
 */

var Twitter = require('twitter');
var mongo = require('mongodb');
var config = require('./config.js');
var express = require('express');


var app = express();
app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/views'));

app.get('/', function(req, res) {
    res.render('home');
});

app.listen(8080);

var T = new Twitter(config);

var MongoClient = require('mongodb').MongoClient;
var url         = "mongodb://localhost:27017/";

var params = {
    q          : '#worldcup',
    count      : 100,
    result_type: 'mixed',
    lang       : 'fr'
}


MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mongo_twitter");

    function getTweet() {
        dbo.createCollection("listTweets", function(err, res) {
            if (err) throw err;
            console.log("Collection created!");
            //db.close();
        });

        T.get('search/tweets', params, function(err, data, response) {
            if(!err){
                // Loop through the returned tweets
                for(var i = 0; i < data.statuses.length; i++){
                    // Get the tweet Id from the returned data
                    //console.log(data.statuses[i]);

                    dbo.collection("listTweets").insertOne(data.statuses[i], function(err, res) {
                        if (err) throw err;
                        console.log("1 document inserted");

                    });
                }
            } else {
                console.log(err);
            }
            //db.close();
        });
    }

    function groupBy(field) {
        dbo.collection("listTweets").aggregate([
            {
                "$match": {}
            }, {
                "$group": {
                    "_id"  : field,
                    "count": {"$sum": 1}
                },
            }
        ]).toArray(function(err, docs) {
            if (err) console.log(err);
            console.log(docs);
            //db.close();
        });
    }

    getTweet();

    groupBy('$user.location');
});
