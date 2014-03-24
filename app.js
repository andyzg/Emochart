/**
   Copyright 2013 AlchemyAPI

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/


var express = require('express');
var consolidate = require('consolidate');

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var alchemyService = require('./alchemyservice');

// all environments
app.set('views',__dirname + '/views');
app.set('view engine', 'jade');
app.set('port', process.env.PORT || 3000);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(__dirname + "../public"));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', getChart);

io.sockets.on('connection', function(socket) {
  console.log("Connected with the socket");
});

var port = process.env.PORT || 3000;
server.listen(port, function(){
	console.log('Express server listening on port ' + port);
	console.log('To view the example, point your favorite browser to: localhost:3000'); 
});

var test = "I like apples";

function getChart(req, res) {
	var data = {};

	//Start the analysis chain
	alchemyService.sentiment(function(response) {
    res.render("index", {
      sentiment:response
    }); 
  });
}

function keyword(output, callback) {
	alchemyapi.keywords('text', test, { 'sentiment':1 }, function(response) {
		output['keywords'] = response['keywords'];
    callback();
	});
}

function sentiment(output) {
	alchemyapi.sentiment('html', test, {}, function(response) {
		output['sentiment'] = response['docSentiment']['score'];
    console.log(response['docSentiment']['score']);
	});
}
