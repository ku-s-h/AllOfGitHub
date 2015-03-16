var request = require('request');
var parser = require('parse-link-header');
var fs = require('fs');

/* Load the config file */
var config = JSON.parse((fs.readFileSync(__dirname + '/config.json', {encoding: 'utf8'})));

var user_agent = config.User_Agent;
var client_id = config.Client_Id;
var client_secret = config.Client_Secret; 

/* Prepare for launch */
var headers = {
	'User-Agent': user_agent
};

var options = {
	url: 'https://api.github.com/repositories' +'?client_id='+client_id+'&client_secret='+client_secret,
	method: 'GET',
	headers: headers
};

/* For sane(er) printing */
var count = 0;

console.log('Starting server');

function GetRepo(opt) {
	/* And take off */
	request(opt, function (error, response, body) {
		if(error) {
			console.log(error);
		}
		body = JSON.parse(body.toString());
		var data = '';
		body.map(function(repo) {
			/* Store the returned repo ID, Full Name and Description in a text blob */
			data += repo.id + " " +repo.full_name+ " "+ repo.description +"\n";
			});
			/* Append the data to a text file for future */
			fs.appendFile('repodata.txt', data, function(err) {
				count++;
				console.log("Written data chunk no: " + count);
				if(err) {
					console.log(err);
				}
			});
		/* Get the link for next page of results from the link header */
		options.url = parser(response.headers.link).next.url + '&client_id='+client_id+'&client_secret='+client_secret;
		/* Make the new request */
		GetRepo(options);
	});
}

/* Start the World Engine */
GetRepo(options);
