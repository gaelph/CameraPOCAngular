/**
 * Created by gaelph on 24/05/2017.
 */

/**
 * @param {LocalManager} localManager
 * @param {RestService} restService
 * @constructor
 */
function RequestQueue($rootScope, localManager, restService) {
    if (RequestQueue._instance) {
        return RequestQueue._instance;
    }
    RequestQueue._instance = this;

    /**
     *
     * @type {Request[]}
     */
    this.queue = [];

    this._getAllRequestsFromDB = function () {
        localManager.all('Request')
            .then(function (result) {
                RequestQueue._instance.queue = result;
            });
    };
    this._getAllRequestsFromDB();

    /**
     * Ajoute une requête à la file d'attente
     * La requête est stockée dans la base, la liste est rechagée
     * @param {Request} request
     * @todo déterminer si maintenir un copie de la collection en permanance en mémoire est pertinent
     */
    this.put = function (request) {
        console.log('Queued request : ' + request.method + ' ' + request.url);
        localManager.save('Request', request);
        this._getAllRequestsFromDB();
    };

    /**
     * Envoie toutes les requêtes en attente
     */
    this.sendAllPending = function () {
        // 2numération de la collection
        this.queue.each(function (request) {
            request = new Request(request.id, request.method, request.url, request.body);
            // Lancement de la requête
            console.log("Sending pending : " + request.method + ' ' + request.url);
            if (request.method !== 'put' ) {
                restService[request.method](request)
                    .catch(function (xhr) { // Échec de la requête
                        // Affichage d'une erreur
                        document.getElementById('camera-error').innerHTML = xhr.responseText;
                    });
            } else {
                restService.merge(request, request.body)
                    .then(function (mergedObject) {
                        restService.put(request)
                            .then(function () {
                                $rootScope.$emit('data-changed');
                            })
                            .catch(function (xhr) {
                                document.getElementById('camera-error').innerHTML = xhr.responseText;
                            });
                    })
                    .catch(function (response) {
                        console.warn('Error: Postponed PUT request');
                        console.error(response);
                    });
            }
        }).then(function () { // À la fin de l'énumération
            RequestQueue._instance.queue.delete() // On supprime toutes les requêtes, echec ou non
                .then(function () {
                    // On recharge la page pour refléter les cas de succès et d'échec
                    //window.location.reload();
                })
                .catch(function (error) {
                    // Erreur à la suppression
                    console.error(error.failures);
                    //window.location.reload();
                });
        })
    };

    document.addEventListener('online', function () {
        RequestQueue._instance.sendAllPending();
    });

    return this;
}

