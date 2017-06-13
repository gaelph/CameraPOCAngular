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
    this.token = null;

    $http.defaults.headers.common['Accept'] = "application/json";
    $http.defaults.headers.common['X-Requested-With'] = "XMLHttpRequest";
    $http.defaults.headers.post['Content-Type'] = "application/json";

    this.authenticate = function (user, errorcallback) {
        var url = 'http://' + configService.get('server') + '/PHPCameraServerPOC/web/app_dev.php/users/authenticate';
        $http.post(url, user)
            .then(function (response) {
                _instance.token = response.data.token;
                $cookies.put('api-token', _instance.token);

                $location.url('/gallery');
            })
            .catch(function (response) {
                errorcallback(response.data);
            });
    };

    this.getToken = function () {
        return $cookies.get('api-token');
    };

    this.validate = function () {
        var token = _instance.getToken();
        if (token) {
            $location.url('/gallery');
        }
    };

    this.disconnect = function () {
        $cookies.remove('api-token');
        _instance.token = null;

        $location.url('/');
    };

    return this;
}

