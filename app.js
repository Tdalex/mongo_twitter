/**
 * Created by mohamedchakiri on 06/06/2018.
 */

var Twitter = require('twitter');
var mongo = require('mongodb');
var config = require('./config.js');
var server = require('./server.js');

var express = require('express');
var io = require('socket.io');

var app = express();
app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/views'));



var T = new Twitter(config);

var MongoClient = require('mongodb').MongoClient;
var url         = "mongodb://localhost:27017/";

var params = {
    q          : '#worldcup',
    result_type: 'mixed',
    count      : 100,
    lang       : 'fr'
}


MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mongo_twitter");

    function getTweet() {
        dbo.createCollection("listTweets", function(err, res) {
            if (err) throw err;
            console.log("Collection created!");
            // db.close();
        });

        T.get('search/tweets', params, function(err, data, response) {
            if(!err){
                // Loop through the returned tweets
                for(var i = 0; i < data.statuses.length; i++){
                    // Get the tweet Id from the returned data

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

    function groupBy(field, callback) {
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
            callback(docs);
            //db.close();
        });
    }

    function groupByRange(field, range, callback) {
        dbo.collection("listTweets").aggregate([
            {
                "$match": {
                }
            }, {
                "$group": {
                    "_id"  : field,
                    "count": {"$sum": 1},
                },
            }
        ]).toArray(function(err, docs) {
            if (err) console.log(err);

            var start  = 0,
                res    = [],
                result = [];
                max    = 0;

            docs.forEach(function(doc){
                var i = 1;
                while ( range * i <= doc._id){
                    i++;
                }

                if (res[i] === undefined) {
                    res[i] = 0;
                }

                res[i] = res[i] + doc.count;
            })

            for (var i = 0, len = res.length; i < len; i++) {
                if (res[i] !== undefined) {
                    max = range * i;
                    result.push({'_id': max - range + " - " + max, 'count': res[i]});
                }
            }
            //console.log(result);
            //db.close();
            callback(result);
        });
    }

    // getTweet();

   /* app.get('/', function(req, res) {
        groupBy('$user.location', function(locations){
            console.log(locations);
            res.render('home', { locations: JSON.stringify(locations) });
        });
    });*/

    //groupByRange('$retweet_count', 100);
    app.get('/', function(req, res) {
         groupByRange('$retweet_count', 100, function(rtCount){
            console.log(rtCount);
             groupBy('$user.location', function(locations){
                 console.log(locations);
                 groupByRange('$user.favourites_count', 10000, function(fvCount){
                    res.render('home', { rtCount: rtCount, locations: locations, fvCount: fvCount });
                });
            });
         });
    });

    app.listen(8080);

});
