/**
 * Created by gaelph on 24/05/2017.
 */

/**
 *
 * @param $scope
 * @param {RemoteManager} remoteManager
 * @param {UserService} userService
 * @param {ConfigService} configService
 * @constructor
 */
function PhotoController ($scope, remoteManager, userService, configService) {
    var _instance = this;

    /**
     * Les options pour le plugin camera de Cordova
     * @type {{mediaType: number, destinationType: number}}
     */
    this.options = {
        mediaType:       Camera.MediaType.PICTURE,
        destinationType: Camera.DestinationType.DATA_URL,
        encodingType:    Camera.EncodingType.JPEG,
        quality:         50
    };

    $scope.photos = [];
    $scope.messageErreur = "";

    remoteManager.all('Photo')
        .then(function (photos) {
            $scope.photos = photos;
            $scope.$apply();
        })
        .catch(function () {
            $scope.messageErreur = 'Erreur en récupérant tous les fichers : ' + error.message;
        });

    this.makeImageUrl = function (imagePath) {
        return 'http://' + configService.get('server') + '/PHPCameraServerPOC/web/' + imagePath;
    };

    this.selectImg = function () {
        // On efface le message d'erreur s'il en est un
        _instance.messageErreur = "";
        // On indique qu'on souhaite prendre une photo de la biliothèqye de l'utilisateur
        _instance.options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
        // On lance la séléection d'image
        navigator.camera.getPicture(_instance._gotImage, _instance._gotError, _instance.options);

        if (device.platform === "browser") {
            // Pour le browser, on doit attendre la création de l'input type file et simuler son clic
            var inputFile = document.querySelector('.cordova-camera-select');

            // Tant qu'on ne trouve pas, on continue de chercher
            while (typeof inputFile === 'undefined') {
                inputFile = document.querySelector('.corodova-camera-select');
            }

            // Pour gérer l'annulation par l'utilisateur on ajoute un écouteur
            // Pour la prise de focus du body
            // On supprime alors le input type file
            document.body.onfocus = function UserCancel () {
                setTimeout(function () {
                    if (document.querySelector('.cordova-camera-select')) {
                        inputFile.parentNode.removeChild(inputFile);
                        document.body.onfocus = null;
                    }
                }, 500);
            };

            // Simulation du clic
            inputFile.click();
        }
    };

    this.takePicture = function () {
        $scope.messageErreur = "";
        // On indique la source CAMERA
        _instance.options.sourceType = Camera.PictureSourceType.CAMERA;
        // On lance la prise de vue
        navigator.camera.getPicture(_instance._gotImage, _instance._gotError, _instance.options);
    };



    this._gotImage = function (b64ImageString) {
        // On supprime le gestionnaire d'événement au focus du body, par sécurité
        document.body.onfocus = null;

        // La chaîne à utiliser comme attribut src d'une balise img
        var srcString = "data:image/jpeg;base64," + b64ImageString;
        // On nettoie la caméra
        navigator.camera.cleanup(function () {
        }, function () {
        });

        _instance._addPicture(srcString);
    };

    this._gotError = function () {
        // On supprime le gestionnaire d'événement au focus du body, par sécurité
        document.body.onfocus = null;
        // On afiche une erreur
        _instance.messageErreur = "Erreur Getting Image";
        console.log('Error Getting Image');
        navigator.camera.cleanup(function () {
        }, function () {
        });
    };

    /**
     * Ajoute une image à la galerie.
     * Insère dans la vue et dans la base de données
     * @param picture
     * @fires PictureGallery#photo-added
     */
    this._addPicture = function (picture) {
        // Création de l'instance de Photo
        var photo = new Photo({
            key:   Date.now(),
            value: picture
        });

        remoteManager.save('Photo', photo)
            .then(function (object) { // Cas de succès
                console.log('element added');

                $scope.photos.push(object);
                $scope.$apply();
            })
            .catch(function (error) { // Cas d'échec
                var errorP = document.getElementById('camera-error');
                errorP.innerHTML = error.message;
            });
    };

    this._removePicture = function (key) {
        // On supprime la photo
        remoteManager.get('Photo', key)
            .then(function (photo) {
                remoteManager.delete('Photo', photo.key)
                    .then(function (object) { // Cas de succès
                        console.log('element deleted');

                        var indexPhotoASupprimer = -1;
                        for (var i = 0; i < $scope.photos.length; i++) {
                            var photoCandidate = $scope.photos[i];
                            if (photoCandidate.key === photo.key) {
                                indexPhotoASupprimer = i;
                            }
                        }
                        if (indexPhotoASupprimer >= 0) {
                            $scope.photos.splice(indexPhotoASupprimer, 1);
                            $scope.$apply();
                        }
                    })
                    .catch(function (error) {
                        $scope.messageErreur = error;
                    });
            });
    };

    this.userDisconnect = function () {
        userService.disconnect();
    }
}

