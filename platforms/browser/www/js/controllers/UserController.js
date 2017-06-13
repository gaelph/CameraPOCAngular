/**
 * Created by gaelph on 25/05/2017.
 */

/**
 *
 * @param {$scope} $scope
 * @param {UserService} userService
 * @constructor
 */
function UserController ($scope, userService) {
    $scope.user = new User();
    $scope.messageErreur = "";
    $scope.auth = false;

    userService.validate();

    this.authentifier = function () {
        userService.authenticate($scope.user, function (error) {
            $scope.messageErreur = "Erreur de connection";
            $scope.user.username = "";
            $scope.user.password = "";
            $scope.auth = true;
        });
    };

    this.deconnecter = function () {
        userService.disconnect();
    };

}