/**
 * Created by gaelph on 26/05/2017.
 */

/**
 *
 * @param {$scope} $scope
 * @param {ConfigService} configService
 * @constructor
 */
function ServeurController ($scope, configService) {
    $scope.server = configService.get('server');

    this.setServer = function () {
        configService.put('server', $scope.server);
    }
};

