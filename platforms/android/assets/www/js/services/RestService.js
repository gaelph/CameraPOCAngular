/**
 * Created by gaelph on 24/05/2017.
 */

/**
 * Cette classe permet la relation simple avec un serveur fournissant une API REST JSON
 * @todo Implémenter l'ajout de paramètre d'authentification
 * @param {*} $http
 * @param {ConfigService} configService
 * @param {UserService} userService
 * @constructor
 */
function RestService ($http, configService, userService) {
    var _instance = this;
    // Properties
    /**
     * L'url de l'API
     * @type {string}
     * @default ""
     */
    this.apiUrl = "http://" + configService.get('server') + "/PHPCameraServerPOC/web/app_dev.php/";

    $http.defaults.headers.common['X-Access-Token'] = userService.getToken();
    $http.defaults.headers.common['Accept'] = "application/json";
    $http.defaults.headers.common['X-Requested-With'] = "XMLHttpRequest";
    $http.defaults.headers.post['Content-Type'] = "application/json";
    $http.defaults.headers.put['Content-Type'] = "application/json";

    /////// Méthodes ///////

    this.getApiUrl = function () {
        this.apiUrl = "http://" + configService.get('server') + "/PHPCameraServerPOC/web/app_dev.php/";
        return this.apiUrl;
    };

    this.get = function (query) {
        var _instance = this; // Un référence à cette instance dans la Promise

        $http.defaults.headers.common['X-Access-Token'] = userService.getToken();

        if (query instanceof Request) {
            query = query.url;
        }

        return new Promise(function (resolve, reject) {
            $http.get(_instance.getApiUrl() + query).then(function (response) {
                resolve(response.data);
            }, function () {
                userService.disconnect();

                reject();
            });
        });
    };

    this.put = function (query, object) {
        var _instance = this; // Un référence à l'instance dans la Promise

        $http.defaults.headers.common['X-Access-Token'] = userService.getToken();

        if (query instanceof Request) {
            object = query.body;
            query = query.url;
        }

        return new Promise(function (resolve, reject) {
            $http.put(_instance.getApiUrl() + query, object)
                .then(function (response) {
                    resolve(response.data);
                }, function () {
                    userService.disconnect();

                    reject();
                });
        });
    };

    this.post = function (query, object) {
        var _instance = this; // Un référence à l'instance dans la Promise

        $http.defaults.headers.common['X-Access-Token'] = userService.getToken();

        if (query instanceof Request) {
            object = query.body;
            query = query.url;

        }

        if (!(typeof object === 'string')) {
            object = JSON.stringify(object);
        }

        return new Promise(function (resolve, reject) {
            $http.post(_instance.getApiUrl() + query, object)
                .then(function (response) {
                    resolve(response.data);
                }, function () {
                    userService.disconnect();

                    reject();
                });
        });
    };

    this.merge = function (request, object) {
        return new Promise(function (resolve, reject) {
            _instance.get(request)
                .then(function (remoteObject) {
                    remoteObject = new object.constructor(remoteObject);
                    var remoteModifications = JSON.parse(remoteObject.modifications);
                    var localModifications = JSON.parse(object.modifications);

                    for (var prop in localModifications) {
                        if (object.hasOwnProperty(prop)
                            && remoteObject.hasOwnProperty(prop)
                            && remoteModifications.hasOwnProperty(prop)
                            && localModifications.hasOwnProperty(prop)) {
                            if (remoteModifications[prop] >= localModifications[prop]) {
                                object[prop] = remoteObject[prop];
                                localModifications[prop] = remoteModifications[prop];
                            } else if (remoteObject[prop] === object[prop]) {
                                localModifications[prop] = remoteModifications[prop];
                            } else if (remoteObject[prop] instanceof Date && object[prop] instanceof Date) {
                                if (remoteObject[prop].getTime() === object[prop].getTime()) {
                                    localModifications[prop] = remoteModifications[prop];
                                }
                            }
                        }
                    }
                    object.modifications = JSON.stringify(localModifications);

                    resolve(object);
                })
                .catch(reject);
        });
    };

    /**
     * Envoi une requête DELETE au serveur
     * @param {string} query Le chemin vers la resource à supprimer
     * @returns {Promise}
     */
    this.delete = function (query) {
        var _instance = this; // Une référence à l'instance pour la Promise

        $http.defaults.headers.common['X-Access-Token'] = userService.getToken();

        if (query instanceof Request) {
            query = query.url;
            object = query.body;
        }

        return new Promise(function (resolve, reject) {
            $http.delete(_instance.getApiUrl() + query)
                .then(function (response) {
                    resolve(response);
                }, function () {
                    userService.disconnect();

                    reject();
                });
        });
    };

    return this;
}

