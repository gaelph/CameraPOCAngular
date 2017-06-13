/**
 * Created by gaelph on 24/05/2017.
 */

/**
 * Controlleur de la gallery
 * @param {$scope} $scope               Le scope du contrôleur
 * @param {RemoteManager} remoteManager Le manager distant
 * @param {UserService} userService     Le service de gestion de l'utilisateur
 * @param {ConfigService} configService Le service de récupération de configurations
 * @constructor
 */
function PhotoController ($scope, remoteManager, userService, configService) {
    // Référence à l'instance dans les closures
    var _instance = this;

    /**
     * Les options pour le plugin camera de Cordova
     * @type {{mediaType: number, destinationType: number}}
     */
    this.options = {
        mediaType:       Camera.MediaType.PICTURE, // Images, pas vidéo ou son
        destinationType: Camera.DestinationType.DATA_URL, // On souhaite récupérer l'image sous forme base64
        encodingType:    Camera.EncodingType.JPEG, // On souhaite du jpeg
        quality:         50 // Qualité de l'encodage JPEG
    };

    /**
     * Un tableau d'instances de Photo à afficher
     * @type {Photo[]}
     */
    $scope.photos = [];
    /**
     * Un message d'erreur à afficher
     * @type {string}
     */
    $scope.messageErreur = "";

    /**
     * À l'instanciation, on va chercher toutes les photos
     */
    remoteManager.all('Photo')
        .then(function (photos) {
            $scope.photos = photos;
            $scope.$apply(); // Force le rafraîchissement de la vue
        })
        .catch(function () {
            $scope.messageErreur = 'Erreur en récupérant tous les fichers : ' + error.message;
        });

    /**
     * Compose l'url d'une image en fonction du srveur configuré et de imagePath
     * @param {string} imagePath    Le chemin vers l'image sur le serveur
     * @return {string}             L'url absolue
     */
    this.makeImageUrl = function (imagePath) {
        return 'http://' + configService.get('server') + '/PHPCameraServerPOC/web/' + imagePath;
    };

    /**
     * Action appelée quand l'utilisateur souhaite sélectionner une image depuis sa bibliothèque
     */
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

    /**
     * Méthode appelée quand l'utilisateur souhaite prendre une photo avec son appareil photo / webcam
     */
    this.takePicture = function () {
        $scope.messageErreur = "";
        // On indique la source CAMERA
        _instance.options.sourceType = Camera.PictureSourceType.CAMERA;
        // On lance la prise de vue
        navigator.camera.getPicture(_instance._gotImage, _instance._gotError, _instance.options);
    };


    /**
     * Quand l'utilisateur a choisi une image ou pris une image
     * @param {string} b64ImageString   L'image encodée en base64
     * @private
     */
    this._gotImage = function (b64ImageString) {
        // On supprime le gestionnaire d'événement au focus du body, par sécurité
        document.body.onfocus = null;

        // La chaîne à utiliser comme attribut src d'une balise img
        var srcString = "data:image/jpeg;base64," + b64ImageString;
        // On nettoie la caméra
        navigator.camera.cleanup(function () {
        }, function () {
        });

        // Ajout de l'image dans les bases et l'ui
        _instance._addPicture(srcString);
    };

    /**
     * La sélection/prise de vue a échoué
     * @private
     */
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

        // Enregistrement sue le serveur
        remoteManager.save('Photo', photo)
            .then(function (object) { // Cas de succès
                console.log('element added');

                // Ajout à la vue
                $scope.photos.push(object);
                $scope.$apply();
            })
            .catch(function (error) { // Cas d'échec
                var errorP = document.getElementById('camera-error');
                errorP.innerHTML = error.message;
            });
    };

    /**
     * Supprime une photo
     * @param {*} key   L'identifiant de l'image à supprimer
     * @private
     */
    this._removePicture = function (key) {
        // On vérifie l'existance de la photo sur le serveur
        remoteManager.get('Photo', key)
            .then(function (photo) { // La photo existe
                // On supprime sur le serveur
                remoteManager.delete('Photo', photo.key)
                    .then(function (object) { // Cas de succès
                        console.log('element deleted');

                        // Pour le rafraîchissement de la vue
                        var indexPhotoASupprimer = -1;
                        for (var i = 0; i < $scope.photos.length; i++) {
                            var photoCandidate = $scope.photos[i];
                            if (photoCandidate.key === photo.key) {
                                indexPhotoASupprimer = i;
                            }
                        }
                        // Rafraîssement effectif
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

    /**
     * Fonction appelée quand l'utilisateur clique sur 'déconnecter'
     */
    this.userDisconnect = function () {
        userService.disconnect();
    }
}

