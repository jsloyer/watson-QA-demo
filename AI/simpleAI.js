var path = require('path'),
	url = require('url'),
	https = require('https');

// Handler for /question POST remarks
// It will return the JSON in the format: {"answer":"<Response>"}
exports.question = function(req, res)
{
	var question = req.body.question;
	var response;

	//Simple responses based on keywords
	if (question) {
		if (question.toLowerCase().indexOf("what") >= 0) {
			response = "You should walk around and converse with the locals.";
		}
		else if (question.toLowerCase().indexOf("where") >= 0) {
			response = "Go where your heart tells you to go.";
		}
		else if (question.toLowerCase().indexOf("safe") >= 0) {
			response = "It is not safe. Get far away!";
		}
		else if (question.toLowerCase().indexOf("ferry") >= 0) {
			response = "No such ferry exists.";
		}
		else if (question.toLowerCase().indexOf("airport") >= 0) {
			response = "Do not bring anything on the airplane.";
		}
	}

	// Default answer
	if (!response) {
		response = "I do not know the answer.";
	}

	var output = '{"answer":"'+ response + '"}';
	var answers = JSON.parse(output);
	res.json(answers);
};
