var express= require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var auth = require("./auth");
var urlTool = require("url");


var app = express();
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

app.use( express.static(__dirname + "/html"));

app.get("/help", function(req,res){
	res.status(200).send("App is up and running");
});

app.post("/apirequest", (req,res)=>{
	
	var resp = req.body;
	var b = req.body.apibody.replace(/\r/g,"");
	b = b.replace(/\n/g,"");
	b = b.replace(/\t/g,"");
	req.body.apibody = b;
	
	// res.body = JSON.stringify(resp,null,2);
	console.log("/APIREQUEST");
	
	var host  = req.body.apihost;
	hostElem = host.split('/');
	host     = hostElem[0];
	var path  = req.body.apipath;
	if(path && (path[0] != '/')){
		path = "/" + path;
		console.log("prepending '/' to path");
	}
	hostElem.forEach( (item,i)=> {
		if( (i>0) && (item != "")) {
			console.log("(" + i + "): Prepending: /" + item);
			path = "/" + item + path;
		}
	});
	
	var verb  = req.body.apiverb;
	console.log("\n\nAPIBODY: " + req.body.apibody);
	var body  = req.body.apibody == "" ? {} : JSON.parse(req.body.apibody);
	
	console.log("\nVERB: " + verb + ", HOST: " + host);
	console.log("PATH: " + path);
	console.log("BODY: " + JSON.stringify(body,null,2) + "\n");
	res.type('json');
	
	var p;
	if( verb == "GET"){
		p = auth.get(host,path);
		p.then( (results)=>{
			console.log("GET: success: " + results);
			res.status(200).json(results);	
		},(errors)=>{
			console.log("?? GET: error: " + JSON.stringify(errors,null,2));
			var em = {
				statusmsg: "API Test target returned an error: "
			};
			res.status(errors.statusCode).json(errors.body);
		});
	} else if(verb == "POST") {
		p = auth.post(host,path,body);
		p.then( (results)=>{
			console.log("POST: success: " + results);
			res.status(200).json(results);	
		},(errors)=>{
			console.log("?? POST: error: " + JSON.stringify(errors,null,2));
			var em = {
				statusmsg: "API Test target returned an error: "
			};
			res.status(errors.statusCode).json(errors.body);
		});
	} else if(verb == "PUT") {
		p = auth.put(host,path,body);
		p.then( (results)=>{
			console.log("PUT: success: " + results);
			res.status(200).json(results);	
		},(errors)=>{
			console.log("?? PUT: error: " + JSON.stringify(errors,null,2));
			var em = {
				statusmsg: "API Test target returned an error: "
			};
			res.status(errors.statusCode).json(errors.body);
		});
	} else {
		res.type('text');
		res.status(405).send("API Test Application does not support: " + verb);
	}	
});

var ourPort = process.env.PORT || 80;
app.listen(ourPort, ()=>{
	console.log("API Test Comparison Server up, listening on port:  " + ourPort );
});
