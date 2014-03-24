var express = require('express');
var consolidate = require('consolidate');
var graph = require('fbgraph');

var app = express();
var server = require('http').createServer(app);

//Create the AlchemyAPI object
var AlchemyAPI = require('./alchemyapi');
var alchemyapi = new AlchemyAPI();

// all environments
app.engine('dust',consolidate.dust);
app.set('views',__dirname + '/views');
app.set('view engine', 'dust');
app.set('port', process.env.PORT || 3000);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

// this should really be in a config file!
var conf = {
	client_id:      '565928233514418'
	, client_secret:  'c0d19555413804017d64253633825336'
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
    	res.redirect(authUrl);
    } else {  //req.query.error == 'access_denied'
    res.send('access denied');
}
return;
}

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
	example(req, res);
});


var port = process.env.PORT || 3000;
server.listen(port, function(){
	console.log('Express server listening on port ' + port);
	console.log('To view the example, point your favorite browser to: localhost:3000'); 
});


function example(req, res) {
  var query = "SELECT message FROM status WHERE uid = me()";

  graph.fql(query, function(err, response) {
    console.log(response); // { data: [ { name: 'Ricky Bobby' } ] }
    res.render('example', {
      data:response['data']
    });
  });

}
