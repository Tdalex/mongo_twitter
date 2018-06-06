/**
 * Created by mohamedchakiri on 06/06/2018.
 */

var Twitter = require('twitter');
var config = require('./config.js');

var T = new Twitter(config);

var params = {
    q: '#worldcup',
    count: 100,
    result_type: 'recent',
    lang: 'fr'
}

T.get('search/tweets', params, function(err, data, response) {
    if(!err){
        // Loop through the returned tweets
        for(var i = 0; i < data.statuses.length; i++){
            // Get the tweet Id from the returned data
            var id = { id: data.statuses[i].id_str }
            console.log(data.statuses[i]);
        }
    } else {
        console.log(err);
    }
})