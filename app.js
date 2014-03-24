var express = require('express');
var consolidate = require('consolidate');
var graph = require('fbgraph');

var app = express();
var server = require('http').createServer(app);

var io = require('socket.io').listen(server);

var FB_KEY = require('./fb_key');

var alchemyService = require('./alchemyservice');

// all environments
app.set('views',__dirname + '/views');
app.set('view engine', 'jade');
app.set('port', 3000);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(__dirname + "../public"));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

// this should really be in a config file!
var conf = {
	client_id:        FB_KEY.APP_ID
	, client_secret:  FB_KEY.APP_SECRET
	, scope:          'email, user_about_me, user_birthday, user_location, publish_stream, user_status'
	, redirect_uri:   'http://localhost:3000/auth/facebook'
};

// Routes
app.get('/', function(req, res){
	res.redirect('/auth/facebook');
});

app.get('/auth/facebook', function(req, res) {

  // we don't have a code yet
  // so we'll redirect to the oauth dialog
  if (!req.query.code) {
  	var authUrl = graph.getOauthUrl({
  		"client_id":     conf.client_id
  		, "redirect_uri":  conf.redirect_uri
  		, "scope":         conf.scope
  	});
    
    if (!req.query.error) { //checks whether a user denied the app facebook login/permissions
    	console.log("Redirecting to authentication url");
      res.redirect(authUrl);
    } else {  //req.query.error == 'access_denied'
      res.send('access denied');
    }
    return;
  }

  console.log("Authorized, logging in");
  // code is set
  // we'll send that and get the access token
  graph.authorize({
  	"client_id":      conf.client_id
  	, "redirect_uri":   conf.redirect_uri
  	, "client_secret":  conf.client_secret
  	, "code":           req.query.code
  }, function (err, facebookRes) {
  	res.redirect('/UserHasLoggedIn');
  });
});


// user gets sent here after being authorized
app.get('/UserHasLoggedIn', function(req, res) {
  console.log("Running FQL queries");
	example(req, res);
});

var port = 3000;
server.listen(port, function(){
	console.log('Express server listening on port ' + port);
	console.log('To view the example, point your favorite browser to: localhost:3000'); 
});


function example(req, res) {
	var output = {};

  var query = "SELECT message, time FROM status WHERE uid = me()";
 
  graph.fql(query, function(err, data) {
    console.log(data); // { data: [ { name: 'Ricky Bobby' } ] }
    process(data);
    res.render("index", {
      data:data['data']
    });
  });
}

function process(data) {
  data['data'].forEach(function(status_update) {
    alchemyService.sentiment(status_update['message'], function(score) {
      var time = new Date(status_update['time']*1000);
      io.sockets.emit('status', {
        score:score,
        time:time
      });
    });
  });
}

io.sockets.on('connection', function(socket) {
  console.log("Connected with the socket");
});
