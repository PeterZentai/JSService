
/**
 * Module dependencies.
 */

var q = require('q');

function JSObjectAdapter(type, instanceFactory) {

    Object.defineProperty(this, "type", { value: type, enumerable: true, enumerable: true, writable:false, configurable:false });
    Object.defineProperty(this, "instanceFactory", { value: instanceFactory, enumerable: true, writable:false, configurable:false });

    function handleRequest(req, res, next) {
        var serviceInstance = instanceFactory();

        var memberName = this.resolveMemberName(req, serviceInstance);
        var member     = this.resolveMember(req, memberName);
        var memberInfo = this.createMemberInfo(member, instance);
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
    return request.url.substring(1);
}

JSObjectAdapter.prototype.resolveMember = function(request, memberName) {
    var prefixedMemberName = request.method + "_" + memberName;
    if (prefixedMemberName in this.type.prototype) {
        this.type.prototype[prefixedMemberName];
    } else {
        this.type.prototype[memberName];
    };
}



JSObjectAdapter.prototype.createMemberInfo = function(member, instance) {
    var self = this;

    memberInfo.resultType = member.resultType;
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
        } else {
            return q.fcall(function() { return result });
        }
        return defer.promise;
    }

    return memberInfo;
}

JSObjectAdapter.prototype.resolveArguments = function(request, serviceInstance, memberInfo) {
    var argInfos = memberInfo.getArgumentInfos();
    //argInfo: { name: "name", type: "type", binder: "function" }

}


//var z = new JSObjectAdapter('5','5');

exports.createAdapter = function(type, instanceFactory) {
    return function(req, res, next) {
        var adapter = new JSObjectAdapter(type, instanceFactory);
        adapter.handleRequest(req, res, next);
    }
}