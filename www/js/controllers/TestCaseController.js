/**
 * Created by gaelph on 25/05/2017.
 */

/**
 * Contrôleur gérant l'affichage du formulaire "TestCase"
 * @param {*} $scope
 * @param {$rootScope} $rootScope
 * @param {RemoteManager} remoteManager
 * @constructor
 */
function TestCaseController ($scope, $rootScope,  remoteManager) {
    // l'instance de TestCase associée au contrôleur
    $scope.testCase = new TestCase();

    // À l'initialisation, on va chercher les données
    remoteManager.get('TestCase', 1)
        .then(function (testCase) {
            $scope.testCase = testCase;
            $scope.$apply(); // Rafraîchissement de la vue
        });

    // Quand les données on changée, on rafraîchit l'interface
    // @todo mettre ça dans une fonction pour éviter le code dupliqué
    $rootScope.$on('data-changed', function (event) {
        remoteManager.get('TestCase', 1)
            .then(function (testCase) {
                $scope.testCase = testCase;
                $scope.$apply();
            });
    });

    /**
     * Méthode appelée au clic sur le bouton 'Mettre à jour'
     */
    this.update = function () {
        remoteManager.save('TestCase', $scope.testCase, 'put')
            .then(function (testCase) {
                $scope.testCase = testCase;
            });
    }
}

