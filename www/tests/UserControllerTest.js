/**
 * Created by gaelph on 27/05/2017.
 */
"use strict";

function testAsyncFunction(func, done) {
    func();
    setTimeout(function () {
        done();
    }, 6000);
}

describe("CameraPOC", function () {

    beforeEach(module('cameraPOC'));
    var userController;
    var $scope = {};

    beforeEach(inject(function (_$controller_) {
        $scope.user = new User();
        $scope.user.username = "gael";
        $scope.user.password = "password";
        userController = _$controller_('UserController', {"$scope": $scope});
    }));

    describe('UserController.authenticate()', function () {

        beforeEach(function (done) {
            var originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
            testAsyncFunction(function () {
                userController.authentifier();
            }, done);
        });

        it('authentifie un utilisateur', function (done) {
            expect($scope.auth).toBeTruthy();
            done();
        });
    });
});