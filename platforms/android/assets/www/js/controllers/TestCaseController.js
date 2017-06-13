/**
 * Created by gaelph on 25/05/2017.
 */

/**
 *
 * @param {*} $scope
 * @param {RemoteManager} remoteManager
 * @constructor
 */
function TestCaseController ($scope, $rootScope,  remoteManager) {
    $scope.testCase = new TestCase();

    remoteManager.get('TestCase', 1)
        .then(function (testCase) {
            $scope.testCase = testCase;
            $scope.$apply();
        });

    $rootScope.$on('data-changed', function (event) {
        remoteManager.get('TestCase', 1)
            .then(function (testCase) {
                $scope.testCase = testCase;
                $scope.$apply();
            });
    });

    this.update = function () {
        remoteManager.save('TestCase', $scope.testCase, 'put')
            .then(function (testCase) {
                $scope.testCase = testCase;
            })
    }
}

