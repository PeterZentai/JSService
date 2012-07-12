/**
 * Created with JetBrains WebStorm.
 * User: zpace
 * Date: 7/6/12
 * Time: 8:00 PM
 * To change this template use File | Settings | File Templates.
 */

var service = require('./jsservice.js');

console.dir(service);

function ServiceClass() {
    this.requestContext = null;
}


//ServiceClass.prototype.get_index = function(a,b,c) {
//    var result = [];
//    for(var i = 0; i < 1000; i++) {
//        result.push({a:a, b:b, c:c});
//    };
//    return result;
//};

ServiceClass.prototype.index = function(a,b,c) {

    var options = {
        host: 'index.hu',
        port:80
    };



    return function(success, error) {
        var req = require('http').request(options, function(res) {
            success( res.headers );
        });
        req.end();
    }
};

ServiceClass.prototype.index.params = [{ name: "a"},{ name: "b"},{ name: "c"}];

var instance = new ServiceClass();

function instanceFactory() {
    return instance;
}

var adapter = service.createAdapter(ServiceClass,  instanceFactory);
console.dir(adapter);
var connect = require('connect');
var app = require('connect')();
app.use(connect.query());
app.use("/xxx", function(a, b) {b.end("A")});
app.use("/x", adapter);

app.listen(3000);
console.log("started");