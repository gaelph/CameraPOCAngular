/**
 * Created by gaelph on 25/05/2017.
 */

/**
 * Contrôleur utilisé pour le login
 * @todo Renommer en LoginController
 * @param {$scope} $scope           Le scope du contrôleur
 * @param {UserService} userService Le service qui fait le lien avec le serveur
 * @constructor
 */
function UserController ($scope, userService) {
    /**
     * L'utilisateur
     * @type {User}
     */
    $scope.user = new User();
    /**
     * Message d'erreur
     * @type {string}
     */
    $scope.messageErreur = "";
    /**
     * Drapeau d'authentification
     * @deprecated
     * @type {boolean} true si l'utilisateur est authtifié, false sinon
     */
    $scope.auth = false;

    /**
     * À l'initialisation, on vérifie la présence d'un token
     */
    userService.validate();

    /**
     * Méthode à appeler pour authentifier l'utilisateur
     */
    this.authentifier = function () {
        userService.authenticate($scope.user, function (error) {
            $scope.messageErreur = "Erreur de connection";
            $scope.user.username = "";
            $scope.user.password = "";
            $scope.auth = true;
        });
    };

    /**
     * Méthode à appeler pour se déconnecter
     */
    this.deconnecter = function () {
        userService.disconnect();
    };

}