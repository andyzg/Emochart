var alchemy = require('./alchemyapi');
var alchemyapi = new alchemy();

var test = "I like apples";

exports.keyword = function(callback) {
	alchemyapi.keywords('text', test, { 'sentiment':1 }, function(response) {
		var data= response['keywords'];
    callback("Keyword:" + data);
	});
}

exports.sentiment = function(callback) {
	alchemyapi.sentiment('html', test, {}, function(response) {
		var data = response['docSentiment']['score'];
    console.log("Sentiment:" + data);
    callback(data);
	});
}
