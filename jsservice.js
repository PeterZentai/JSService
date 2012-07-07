
/**
 * Module dependencies.
 */

var q = require('q');
var c = require('connect');

function JSObjectAdapter(type, instanceFactory) {

    //Object.defineProperty(this, "type", { value: type, enumerable: true });
    this.type = type;
    this.instanceFactory = instanceFactory;

    function handleRequest(req, res, next) {
        var memberName = this.getMemberName(req);
        var memberInfo = this.getMemberInfo(memberName);
        var methodArgs = this.getArguments(memberInfo, req);

        var _v = memberInfo.invoke(methodArgs);

        q.when(_v).then(function (value) {
           res.end(JSON.stringify(value));
        });
    };

    this.handleRequest = handleRequest;
};



JSObjectAdapter.prototype.getMemberName = function(req) {
    return req.url.substring(1);
}

JSObjectAdapter.prototype.getArguments = function(memberInfo, req) {
    return [1,2,3]
}

JSObjectAdapter.prototype.getMemberInfo = function(memberName) {
    var self = this;
    var member = this.type.prototype[memberName];

    var  memberInfo = {};

    memberInfo.invoke = function(args) {
        var instance = self.instanceFactory();
        var result = member.apply(instance, args);
        var defer = q.defer();

        function success(r) {
            defer.resolve(r);
        };
        function error(r) {
            defer.reject(r);
        };

        if (typeof result === 'function') {
            result(success, error);
        }
        return defer.promise;
    }

    return memberInfo;
}



//var z = new JSObjectAdapter('5','5');

exports.createAdapter = function(type, instanceFactory) {
    return function(req, res, next) {
        var adapter = new JSObjectAdapter(type, instanceFactory);
        adapter.handleRequest(req, res, next);
    }
}