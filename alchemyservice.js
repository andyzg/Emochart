var alchemy = require('./alchemyapi');
var alchemyapi = new alchemy();

exports.keyword = function(message, callback) {
	alchemyapi.keywords('text', message, { 'sentiment':1 }, function(response) {
		var data= response['keywords'];
    callback(data);
	});
}

exports.sentiment = function(message, callback) {
	alchemyapi.sentiment('html', message, {}, function(response) {
		var data = response['docSentiment'];
    console.log("Sentiment:" + data);
    if (data) {
      callback(data['score']);
    }
	});
}
