
/**
 * Module dependencies.
 */

var q = require('q');
var url = require('url');
Function.prototype.curry = function() {
    var self = this;
    var args = arguments;
    return function() {
        var _args =  Array.prototype.slice.call(args, 1);
        var _args2 = Array.prototype.slice.call(arguments);
        args = _args.concat(_args2);
        return self.apply(null, args);
    }
}


function DefaultArgumentBinder(name, options, request) {
    return request.query[name];
}

function JSObjectAdapter(type, instanceFactory) {

    Object.defineProperty(this, "type", { value:type, enumerable:true, enumerable:true, writable:false, configurable:false });
    Object.defineProperty(this, "instanceFactory", { value: instanceFactory, enumerable: true, writable:false, configurable:false });

    function handleRequest(req, res, next) {
        var serviceInstance = instanceFactory();

        var memberName = this.resolveMemberName(req, serviceInstance);
        var member     = this.resolveMember(req, memberName);
        var memberInfo = this.createMemberContext(member, serviceInstance);
        var methodArgs = this.resolveArguments(req, serviceInstance, memberInfo);


        var _v = memberInfo.invoke(methodArgs);

        q.when(_v).then(function (value) {
           res.end(JSON.stringify(value));
        });
    };

    this.handleRequest = handleRequest;
};


Object.defineProperty(JSObjectAdapter.prototype, "type", { value: undefined, configurable:true });
Object.defineProperty(JSObjectAdapter.prototype, "instanceFactory", { value: undefined, configurable:true });

JSObjectAdapter.prototype.resolveMemberName = function(request, serviceInstance) {
    var parsedUrl = url.parse(request.url);
    //there will always be a leading '/'
    var pathElements = parsedUrl.pathname.split('/').slice(1);
    var memberName = pathElements[0];
    return memberName;
}

JSObjectAdapter.prototype.resolveMember = function(request, memberName) {
    var prefixedMemberName = request.method + "_" + memberName;
    if (prefixedMemberName in this.type.prototype) {
        return this.type.prototype[prefixedMemberName];
    } else {
        return this.type.prototype[memberName];
    };
}



JSObjectAdapter.prototype.createMemberContext = function(member, serviceInstance) {
    var self = this;

    var memberContext = {};

    var params = member.params;
    var paramBinders = [];

    for(var i = 0; i < params.length; i++) {
        var param = params[i];
        paramBinders.push(DefaultArgumentBinder.curry(null, param.name, {}))
    }

    memberContext.paramBinders = paramBinders;
    memberContext.resultType = member.resultType;
    memberContext.elementType = member.elementType;


    memberContext.invoke = function(args, request, response) {
        var executionContext = {
            request: request,
            response: response
        };

        Object.defineProperty(serviceInstance, "executionContext", {
            value: executionContext,
            enumerable: false,
            writable: false,
            configurable: false
        });

        var fn = function(){

        }
        var user = {"name":"fubar"};

        var result = member.apply(serviceInstance, args);
        var defer = q.defer();

        function success(r) {
            defer.resolve(r);
        }
        function error(r) {
            defer.reject(r);
        }

        if (typeof result === 'function') {
            result(success, error);
        } else {
            return q.fcall(function() { return result });
        }
        return defer.promise;
    }

    return memberContext;
}

JSObjectAdapter.prototype.resolveArguments = function(request, serviceInstance, memberContext) {

    var paramBinders = memberContext.paramBinders;
    var paramValues = [];
    for(var i = 0; i < paramBinders.length; i++) {
        var binder = paramBinders[i];
        var result = binder(request);
        paramValues.push(result);
    }
    return paramValues;
}


//var z = new JSObjectAdapter('5','5');

exports.createAdapter = function(type, instanceFactory) {
    return function(req, res, next) {
        var adapter = new JSObjectAdapter(type, instanceFactory);
        adapter.handleRequest(req, res, next);
    }
}