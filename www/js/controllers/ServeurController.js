/**
 * Created by gaelph on 26/05/2017.
 */

/**
 * Controlleur qui gère l'input pour donner l'addresse du serveur de l'API REST
 * @param {$scope} $scope
 * @param {ConfigService} configService
 * @constructor
 */
function ServeurController ($scope, configService) {
    $scope.server = configService.get('server');

    /**
     * Modifie le cookie associé à l'url du serveur pour l'API REST
     */
    this.setServer = function () {
        configService.put('server', $scope.server);
    }
};

