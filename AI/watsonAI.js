var path = require('path'),
	url = require('url'),
	https = require('https');

// Handler for /question POST remarks
// It will return the JSON in the format: {"answer":"<Response>"}
exports.question = function(req, res)
{
	//Get the environment variable for the service
	var VCAP_SERVICES;
	var password;
	var username;
	var watson_url;

	try
	{
		VCAP_SERVICES = JSON.parse(process.env.VCAP_SERVICES);
		password = VCAP_SERVICES['question_and_answer'][0].credentials.password;
		username = VCAP_SERVICES['question_and_answer'][0].credentials.username;
		watson_url = VCAP_SERVICES['question_and_answer'][0].credentials.url;
	}
	catch(err)
	{
		throw 'Could not load Watson QAAPI service';
	}

	// Set up the communication to the Watson for Travel API
	var parts = url.parse(watson_url + '/v1/question/travel');

	var headers =
	{
		'Content-Type' : 'application/json',
		'X-synctimeout' : '30',
		'Authorization' : "Basic " + new Buffer(username+':'+password).toString('base64')
	};

	// Get the question from the requesting page. The question id (the question text box) will be obtained
	var question = req.body.question;

	console.log('Question from chat: ' + question);

	var options = 
	{
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

	//Create a request to POST to Watson
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