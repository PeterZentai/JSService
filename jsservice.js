
/**
 * Module dependencies.
 */

 var q = require('q');
var c = require('connect');
var http = require('http');
var deferred = q.defer();
console.dir(deferred);

var p = deferred.promise;

var app = c();
app.use("/",function(req, res) { res.end('1')});

var s = http.createServer(app).listen(3000);
s.on('request', function() { console.log('request')});
console.dir(s);

q.when(p).then(function() { console.log("!")});
setTimeout(function() { console.dir(app);}, 2000);