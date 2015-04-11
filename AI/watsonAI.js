//---Module Dependencies--------------------------------------------------------
var https = require('https'),
  url = require('url'),
  path = require('path'),
  cfenv = require('cfenv');

//---/question POST Handler-----------------------------------------------------
// It will return the JSON in the format: {"answer":"<Response>"}
exports.question = function(req, res)
{
	//Get the environment variable for the service
	var vcapLocal = null
	try {
	  vcapLocal = require("../vcap-local.json");
	}
	catch (e) {}

	var appEnvOpts = vcapLocal ? {vcap:vcapLocal} : {}
	var watson = getWatsonQAServiceCreds(cfenv.getAppEnv(appEnvOpts));

//---Set up the communication to the Watson for Travel API----------------------
	var parts = url.parse(watson.url + '/v1/question/travel');

	var headers = {
		'Content-Type' : 'application/json',
		'X-synctimeout' : '30',
		'Authorization' : "Basic " + new Buffer(watson.username + ':' + watson.password).toString('base64')
	};

//---Get question from request page---------------------------------------------
	var question = req.body.question;
	console.log('Question from chat: ' + question);

	var options = {
		host: parts.hostname,
		port: 443,
		path: parts.pathname,
		method: 'POST',
		headers: headers,
		rejectUnauthorized: false,
		requestCert: true,
		agent:false
	};

	var output = '';

//---Create a request to POST to Watson-----------------------------------------
	var req = https.request(options, function(result)
	{
		result.on('data', function(chunk)
		{
			output += chunk;
		});

		result.on('end', function(chunk)
		{
			try
			{
				var answers = JSON.parse(output);
				var value = answers[0].question.evidencelist[0].text;
				// Escape the double quotes to prevent breaking the JSON
				value = value.replace(/"/g,'\\\"');
				var modifiedOutput = '{"answer":"'+ value + '"}';
				var myResponse = JSON.parse(modifiedOutput);

				//Provide a response back
				console.log("Answer to question: " + answers[0].question.evidencelist[0].text);
				res.json(myResponse);
			}
			catch (err)
			{
				console.log(err);
			}
		});
	});

	req.on('error', function(e)
	{
		console.log('Error: '+ e.message);
	});

	var questionToWatson =
	{
		'question' :
		{
			'questionText' : question,
			'evidenceRequest' : {'items' : 1}
		}
	};

	req.write(JSON.stringify(questionToWatson));
	req.end();
};

//---Server Functions-----------------------------------------------------------
// Ensures a Watson QA service is found in VCAPS
// If found, returns the service credentials
function getWatsonQAServiceCreds(appEnv) {
  var serviceCreds = appEnv.getServiceCreds("Watson_Question_Answer");
  if (!serviceCreds) {
    console.log("Watson QA service not bound to this application");
    return null;
  }

  return serviceCreds;
}
