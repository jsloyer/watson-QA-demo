//---Module Dependencies--------------------------------------------------------
var express = require('express'),
  bodyParser     = require("body-parser"),
  methodOverride = require("method-override"),
  app = express(),
  http = require('http'),
  url = require('url'),
  path = require('path'),
  cfenv = require('cfenv');

//---Routers and View Engine----------------------------------------------------
app.use(express.favicon());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

//---App Env-----------------------------------------------------------
var appEnv = cfenv.getAppEnv();

// If dev, turn on error handler
if (appEnv.isLocal) {
  app.use(express.errorHandler());
}

//---Handle HTTP Requests-------------------------------------------------------
app.get('/', routes.index);

var simpleAI = require('./AI/simpleAI');
app.post('/question', simpleAI.question);

//---Start HTTP Server----------------------------------------------------------
var server = http.Server(app);
server.listen(appEnv.port, function() {
    console.log("server started on port " + appEnv.port);
});
