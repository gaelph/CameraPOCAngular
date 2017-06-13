/**
 * Created by gaelph on 24/05/2017.
 */

/**
 * Manager pour la base de données distant (REST)
 * @param {$dexie} $dexie               Le service d'accès à la base de données
 * @param {RestService} restService     Le service d'accès à l'API REST
 * @param {RequestQueue} requestQueue   Le service de mise en attente des requêtes
 * @param {LocalManager} localManager   Service Manager pour la base de données locale utilisé en fallback
 * @constructor
 */
function RemoteManager ($dexie, restService, requestQueue, localManager) {
    var _instance = this;

    /**
     * Renvoie le nom de la table pour la classe donnée
     * @param {string} className    Le nom de la classe
     * @return {string} Le nom de la table
     * @private
     */
    this._slug = function (className) {
        return className.toLowerCase() + 's';
    };

    /**
     * Récupère tous les éléments de la table
     * @param {string} className    Le nom de la classe des objets à récupérer
     * @return {Promise}            Une promise qui résout à une collection d'objets
     */
    this.all = function (className) {
        return new Promise(function (resolve, reject) {
            // Si on une connection réseau
            if (navigator.connection.type !== Connection.NONE) {
                // Envoie d'une requête GET : http://api-url.api/slug/
                restService.get(_instance._slug(className))
                    .then(function (objects) {
                        var modelArray = [];
                        // hydratation du résultat
                        objects.forEach(function (object) {
                            modelArray.push(new window[className](object));
                        });

                        // On efface la table locale et on insère tout
                        localManager.clearStore(className);
                        localManager.bulkSave(className, modelArray)
                            .then(function () {
                                resolve(modelArray); // Résolution
                            })
                            .catch(reject);
                    });
            }
            else {
                // Si on n'a pas de réseau,
                // On lit les données dans la base locale
                console.log("No network reading locally");
                localManager.all(className).then(resolve);
            }
        });
    };

    /**
     * Récupère un élément
     * @param {string} className    Le nom de la classe
     * @param {number} id           L'identifiant de l'élément à récupérer
     * @returns {Promise}           Une promise qui résout à l'instance de l'objet récupéré
     */
    this.get = function (className, id) {
        return new Promise(function (resolve, reject) {
            if (navigator.connection.type !== Connection.NONE) {
                // Envoie d'une requète GET : http://api-url.api/slugs/id
                restService.get(_instance._slug(className) + "/" + id)
                    .then(function (response) { // Cas de succès de la requête REST
                        var model = new window[className](response); // On instancie le model

                        // On enregistre dans la base
                        localManager.save(className, model)
                            .then(function () {
                                resolve(model);
                            }) // Sucès
                            .catch(reject); // Échec
                    })
                    .catch(reject); // Échec de la requète REST
            }
            else {
                // Si on n'a pas de réseau,
                // On lit les données dans la base locale
                console.log("No network reading locally");
                localManager.get(className, id)
                    .then(resolve)
                    .catch(reject);
            }
        });
    };

    /**
     * Mets à jour un élément
     * @param {string} className    Le nom de la classe de l'objet
     * @param {object} object       L'objet à mettre à jour
     * @return {Promise}            Une promise qui résout à l'objet mis à jour
     */
    this.update = function (className, object) {
        // On récupère la clé primaire
        var pK = object.hasOwnProperty('id') ? object.id : object.key;

        return new Promise(function (resolve, reject) {
            // Si on a une connection réseau
            if (navigator.connection.type !== Connection.NONE) {
                // MERGE:  On fusionne notre version à celle du serveur
                restService.merge(_instance._slug(className) + '/' + pK, object)
                    .then(function (mergedObject) {
                        // mergedObject est un objet valide à mettre à jour, timestamps mis à jour
                        // Envoi d'une requête PUT : http://api-url.api/slugs/pK
                        restService.put(_instance._slug(className) + '/' + pK, mergedObject)
                            .then(function (updatedObject) {
                                // On enregistre la nouvelle version dans la base
                                localManager.save(className, updatedObject)
                                    .then(function (result) {
                                        // Hydratation de la classe
                                        var resultInstance = new window[className](updatedObject);
                                        resolve(resultInstance);
                                    }) // Succès
                                    .catch(reject); // Échec
                            })
                            .catch(reject);
                    });
            } else {
                // Pas de réseau
                // On stocke la requète dans la base de données locale
                console.log('No network queuing PUT REQUEST');
                // Instanciation
                var request = new Request(null, 'put', _instance._slug(className) + '/' + pK, object);
                // Mise en attente
                requestQueue.put(request);
                // enregistrement dans la base locale
                localManager.save(className, object)
                    .then(function (result) {
                        resolve(object);
                    }) // Succès
                    .catch(reject); // Échec
            }
        });
    };

    /**
     * Enregistre un nouvel enregistrement
     * @param {string} className    Le nom de la classe de l'objet
     * @param {object} object       L'objet à insérer dans la base
     * @return {Promise}            Une Promise qui résout à l'objet inséré
     */
    this.persist = function (className, object) {
        return new Promise (function (resolve, reject) {
            // Si on est en ligne, on envoie la requète sur le serveur
            // Si tout va bien, on enregistre dans la DB
            if (navigator.connection.type !== Connection.NONE) {
                // On supprime les caractères spéciaux pour la rétro compatibilité IE
                //object.value = object.value.replace(/\s/g, '');
                // Envoie d'une requète POST
                restService.post(query, object)
                    .then(function (object) { // Cas de succès de la requète REST
                        // On stocke dans la base locale
                        localManager.save(className, object)
                            .then(function (result) {
                                var resultInstance = new window[className](object);
                                resolve(resultInstance);
                            }) // Succès
                            .catch(reject); // Échec
                    })
                    .catch(reject); // Cas d'échec de la requète REST
            } else {
                // Pas de réseau
                // On stocke la requète dans la base de données locale
                console.log('No network queuing POST REQUEST');
                var request = new Request(null, 'post', _instance._slug(className), object);
                requestQueue.put(request);
                localManager.save(className, object)
                    .then(function (result) {
                        resolve(object);
                    }) // Succès
                    .catch(reject); // Échec
            }
        });
    };

    /**
     * Insère un nouvel enregistrement ou met un enregistrement à jour
     * @param {string} className    Le nom de la classe de l'objet à insérer ou mettre à jour
     * @param {object} object       L'objet à persister
     * @return {Promise}            Une Promise qui résout à l'objet inséré ou mis à jour
     */
    this.save = function (className, object) {
        var modifications = {}; // Initialisation des modifications
        var now = +new Date(); // Timestamp de maintenant

        // Initialisation de l'objet modifications
        for (var prop in object) {
            if (object.hasOwnProperty(prop) && prop !== 'modifications') {
                modifications[prop] = now;
            }
        }

        object.modifications = JSON.stringify(modifications);

        return new Promise(function (resolve, reject) {
            // On récupère l'identifiant de l'objet
            var pK = object.hasOwnProperty('id') ? object.id : object.key;

            // On regarde s'il exite une enregistrement local avec cet id
           localManager.get(className, pK)
               .then(function (existingObject) {
                   // Si un objet existe, on fait un update
                    if (typeof existingObject !== 'undefined') {
                        _instance.update(className, object)
                            .then(resolve)
                            .catch(reject);
                    } else {
                        // Sinon on fait un nouvel enregistrement
                        _instance.persist(className, object)
                            .then(resolve)
                            .catch(reject);
                    }
               })
               .catch(reject);
        });
    };

    /**
     * Supprime un enregistrement de la base de données
     * @param className
     * @param id
     * @return {Promise}
     */
    this.delete = function (className, id) {
        return new Promise(function (resolve, reject) {
            // Si on est en ligne, on envoie la requète sur le serveur
            // Si tout va bien, on enregistre dans la DB
            if (navigator.connection.type !== Connection.NONE) {
                // Requête DELETE
                restService.delete(_instance._slug(className) + "/" + id)
                    .then(function (responseKey) { // Cas de succès de la requête AJAX
                        // Enregistrement dans la DB
                        localManager.delete(className, id)
                            .then(resolve) // Succès
                            .catch(reject); // Échec
                    })
                    .catch(reject); // Cas d'échec de la requête Ajax
            } else {
                // Pas de réseau
                // On stocke la requète dans la base de données locale
                console.log('No network queuing DELETE REQUEST');
                var request = new Request(null, 'delete', _instance._slug(className) + "/" + id);
                requestQueue.put(request);
                localManager.delete(className, id)
                    .then(resolve) // Succès
                    .catch(reject); // Échec
            }
        });
    };

    return this;
}

