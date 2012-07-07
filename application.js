/**
 * Created with JetBrains WebStorm.
 * User: zpace
 * Date: 7/6/12
 * Time: 8:00 PM
 * To change this template use File | Settings | File Templates.
 */

var jsservice = require('./jsservice.js');
console.dir(jsservice)

function serviceClass() {

};

serviceClass.prototype.myFunction = function(a,b,c) {
    return a + b + c;
};

serviceClass.prototype.myFunctionAsync = function(a,b,c) {

    return function(result, error) {
        setTimeout( function() {
            result(a + b + c);
        }, 5000);
    }
};

var instance = new serviceClass();

function instanceFactory() {
    return instance;
}

var adapter = jsservice.createAdapter(serviceClass,  instanceFactory);
console.dir(adapter);

var app = require('connect')();
app.use("/xxx", function(a, b) {b.end("A")});
app.use("/x", adapter);
app.listen(3000);
console.log("started");