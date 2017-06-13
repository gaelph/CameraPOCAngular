/**
 * Created by gaelph on 27/05/2017.
 */

describe("CameraPOC", function () {

    beforeEach(module('cameraPOC'));
    var photoController;

    beforeEach(inject(function (_$controller_) {
        var $scope = {};
        photoController = _$controller_('PhotoController', {"$scope": $scope});
    }));

    describe('PhotoController.makeImgUrl', function () {
        it('gives the url of an image', function () {
            var imagePath = 'image-test.jpg';
            var restult = photoController.makeImageUrl(imagePath);

            expect(restult).toMatch(/http:\/\/.*\/PHPCameraServerPOC\/web\/image-test.jpg/);
        });
    });
});