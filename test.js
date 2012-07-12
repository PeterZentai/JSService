/**
 * Created with JetBrains WebStorm.
 * User: peterzentai
 * Date: 7/10/12
 * Time: 2:14 PM
 * To change this template use File | Settings | File Templates.
 */
var connect = require('connect');
var app = require('connect')();

var initA = [];
for(var i = 0; i <100000; i++) {
    initA.push(i);
}

app.use("/foreach", function(req, res) {
    var result = [];
    initA.forEach(function(item) {
       result.push(item);
    });
    res.end(result.length.toString());
});

app.use("/map", function(req, res) {
    var result = initA.map(function(item) { return item;} );
    res.end(result.length.toString());
});


app.use("/for", function(req, res) {
    var result = [];
    function pusher(i) {
        result.push(i);
    };
    for(var i = 0, l = initA.length; i < l; i++) {
        pusher(i);
    }
    res.end(result.length.toString());
});

app.listen(3000);


