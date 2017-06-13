/**
 * Created by gaelph on 24/05/2017.
 */



var app = angular.module('cameraPOC', ['ngRoute', 'ngCookies']);

app.factory('$dexie', $dexie);
app.factory('ConfigService', ['$cookies', ConfigService]);
app.factory('LocalManager', ["$dexie", LocalManager]);
app.factory('RemoteManager', ['$dexie', 'RestService', 'RequestQueue', 'LocalManager', RemoteManager]);
app.factory('RequestQueue', ['$rootScope', 'LocalManager', 'RestService', RequestQueue]);
app.factory('RestService', ['$http', 'ConfigService', 'UserService', RestService]);
app.factory('UserService', ['ConfigService', '$location', '$http', '$cookies', UserService]);

app.controller('PhotoController', ['$scope', 'RemoteManager', 'UserService', 'ConfigService', PhotoController]);
app.controller('ServeurController', ['$scope', 'ConfigService', ServeurController]);
app.controller('TestCaseController', ['$scope', '$rootScope', 'RemoteManager', TestCaseController]);
app.controller('UserController', ['$scope', 'UserService', UserController]);

app.config(function ($routeProvider, $locationProvider) {
    $routeProvider.when('/', {
        controller: 'UserController',
        controllerAs: 'uc',
        templateUrl : 'js/templates/login.html'
    });

    $routeProvider.when('/gallery', {
        controller: 'PhotoController',
        controllerAs: 'pc',
        templateUrl : 'js/templates/gallery.html'
    });
});

/**
 *
 * @param {string|Element} selector
 * @return {*}
 */
window.$ = function (selector) {
    var selection = null;

    if (typeof selector === 'string') {
        selection = angular.element(document).find(selector);
    } else {
        selection = angular.element(selector);
    }

    return selection;
};