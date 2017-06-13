/**
 * Created by gaelph on 25/05/2017.
 */

/**
 *
 * @param {ConfigService} configService
 * @param {$location} $location
 * @param {$http} $http
 * @param {$cookies} $cookies
 * @return {UserService}
 * @constructor
 */
function UserService (configService, $location, $http, $cookies) {
    var _instance = this;
    // TODO : Déterminer l'utilité de cette variable
    this.token = null;

    // Définition des headers utilisés
    // On demande du json
    $http.defaults.headers.common['Accept'] = "application/json";
    // On signale qu'on a envoyé la requête par Ajax
    $http.defaults.headers.common['X-Requested-With'] = "XMLHttpRequest";
    // On signale q'uon envoie du json
    $http.defaults.headers.post['Content-Type'] = "application/json";

    /**
     * Méthode d'authentifications
     * @param {User} user               L'utilisateur à authentufier
     * @param {Function} errorcallback  Méthode à appeler en cas d'erreur
     */
    this.authenticate = function (user, errorcallback) {
        // L'url de l'API pour l'authentification
        var url = 'http://' + configService.get('server') + '/PHPCameraServerPOC/web/app_dev.php/users/authenticate';

        $http.post(url, user)
            .then(function (response) {
                // Stockage du token
                _instance.token = response.data.token;
                $cookies.put('api-token', _instance.token);

                $location.url('/gallery');
            })
            .catch(function (response) {
                errorcallback(response.data);
            });
    };

    /**
     * Renvoie le token ou null s'il n'y en a pas
     * @return {*|string}
     */
    this.getToken = function () {
        return $cookies.get('api-token');
    };

    /**
     * Vérifie qu'on a un token et change l'adresse vers l'app
     */
    this.validate = function () {
        var token = _instance.getToken();
        if (token) {
            $location.url('/gallery');
        }
    };

    /**
     * Déconnecte l'utilisateur
     */
    this.disconnect = function () {
        $cookies.remove('api-token');
        _instance.token = null;

        $location.url('/');
    };

    return this;
}

