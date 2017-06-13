/**
 * Created by gaelph on 24/05/2017.
 */

// Déclaration de notre module
var app = angular.module('cameraPOC', ['ngRoute', 'ngCookies']);

// Déclaration des services
app.factory('$dexie', $dexie); // DB
app.factory('ConfigService', ['$cookies', ConfigService]); // Config
app.factory('LocalManager', ["$dexie", LocalManager]); // Manager Local
app.factory('RemoteManager', ['$dexie', 'RestService', 'RequestQueue', 'LocalManager', RemoteManager]); // Manager
// distant
app.factory('RequestQueue', ['$rootScope', 'LocalManager', 'RestService', RequestQueue]); // File d'attente de requêtes
app.factory('RestService', ['$http', 'ConfigService', 'UserService', RestService]); // Accès l'api rest
app.factory('UserService', ['ConfigService', '$location', '$http', '$cookies', UserService]); // Gestion User

// Déclaration des contrôleurs
app.controller('PhotoController', ['$scope', 'RemoteManager', 'UserService', 'ConfigService', PhotoController]);
app.controller('ServeurController', ['$scope', 'ConfigService', ServeurController]);
app.controller('TestCaseController', ['$scope', '$rootScope', 'RemoteManager', TestCaseController]);
app.controller('UserController', ['$scope', 'UserService', UserController]);

// Configuration des routes
app.config(function ($routeProvider, $locationProvider) {
    // route de base, login
    $routeProvider.when('/', {
        controller: 'UserController',
        controllerAs: 'uc',
        templateUrl : 'js/templates/login.html'
    });

    // route de la gallery
    $routeProvider.when('/gallery', {
        controller: 'PhotoController',
        controllerAs: 'pc',
        templateUrl : 'js/templates/gallery.html'
    });
});

/**
 * Méthode imitant le sélecteur de jQuery
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