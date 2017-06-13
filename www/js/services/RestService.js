/**
 * Created by gaelph on 24/05/2017.
 */

/**
 * Service d'accès à l'API REST JSON
 * @param {$http} $http                 Service Ajax Angular
 * @param {ConfigService} configService Service d'options de configuration pour connaître l'addresse du serveur
 * @param {UserService} userService     Service utilisateur (tokens)
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

    // Définition des headers à envoyer à chaque requête
    // Le token de l'utilisateur
    $http.defaults.headers.common['X-Access-Token'] = userService.getToken();
    // On demande du JSON
    $http.defaults.headers.common['Accept'] = "application/json";
    // On signale l'emploi de Ajax pour la requête
    $http.defaults.headers.common['X-Requested-With'] = "XMLHttpRequest";
    // Pour les requêtes PUT et POST, on signale l'envoi de json
    $http.defaults.headers.post['Content-Type'] = "application/json";
    $http.defaults.headers.put['Content-Type'] = "application/json";

    /////// Méthodes ///////

    /**
     * Construit l'URL de l'API
     * @return {string}
     */
    this.getApiUrl = function () {
        this.apiUrl = "http://" + configService.get('server') + "/PHPCameraServerPOC/web/app_dev.php/";
        return this.apiUrl;
    };

    /**
     * Envoi d'une requête GET
     * @param {string} query    L'url de la requêten relative au résultat de getApiUrl
     * @return {Promise}        Une promise qui résout au corps de la réponse
     */
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

    /**
     * envoi d'une requête PUT
     * @param {string} query    URL de la requête, relative au résultat de getApiUrl()
     * @param {object} object   L'objet à ajouter
     * @return {Promise}        Une Promise qui résout au corps de la réponse
     */
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

    /**
     * Envoi d'une requête POST
     * @param {string} query    L'URL de la requête, relative au résultat de getApiUrl()
     * @param {object} object   L'objet à envoyer
     * @return {Promise}        Un Promise qui résout au corps de la réponse
     */
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

    /**
     * Fusionne une copie locale à une copie distante en fonction des timestamps dans leurs objets "modifications"
     * respctifs
     * @param {string|Request} request  La requête ou l'url de l'api
     * @param {object} object           L'objet à mettre à jour
     * @return {Promise}                Une promise qui résout au résultat de la fusion
     */
    this.merge = function (request, object) {
        return new Promise(function (resolve, reject) {
            // On va chercher la copie distante
            _instance.get(request)
                .then(function (remoteObject) {
                    // Hydratation du résultat
                    remoteObject = new object.constructor(remoteObject);
                    // Les objets modificiations
                    var remoteModifications = JSON.parse(remoteObject.modifications);
                    var localModifications = JSON.parse(object.modifications);

                    // On énumère les modification et on compare chacune d'elle
                    for (var prop in localModifications) {
                        // On s'assure que la propriété qu'on regarde exite
                        // - dans l'objet local
                        // - dans l'objet distant
                        // - dans les modifications locales
                        // - dans les modifications distantes
                        if (object.hasOwnProperty(prop)
                            && remoteObject.hasOwnProperty(prop)
                            && remoteModifications.hasOwnProperty(prop)
                            && localModifications.hasOwnProperty(prop)) {

                            // Si les modifications distantes sont plus récentes
                            // On copie les modifications distantes dans l'objet local
                            if (remoteModifications[prop] >= localModifications[prop]) {
                                object[prop] = remoteObject[prop];
                                localModifications[prop] = remoteModifications[prop];
                            }
                            // Si les valeurs sont égales, on s'assure de l'égalité des timestamp
                            else if (remoteObject[prop] === object[prop]) {
                                localModifications[prop] = remoteModifications[prop];
                            }
                            // en cas de date, on compare les timestampes
                            else if (remoteObject[prop] instanceof Date && object[prop] instanceof Date) {
                                if (remoteObject[prop].getTime() === object[prop].getTime()) {
                                    localModifications[prop] = remoteModifications[prop];
                                }
                            }
                        }
                    }
                    // On stringify les modifications
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

