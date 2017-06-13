/**
 * Created by gaelph on 24/05/2017.
 */

/**
 *
 * @param {$dexie} $dexie
 * @param {RestService} restService
 * @param {RequestQueue} requestQueue
 * @param {LocalManager} localManager
 * @constructor
 */
function RemoteManager ($dexie, restService, requestQueue, localManager) {
    var _instance = this;

    /**
     *
     * @param {string} className
     * @return {string}
     * @private
     */
    this._slug = function (className) {
        return className.toLowerCase() + 's';
    };

    this.all = function (className) {
        return new Promise(function (resolve, reject) {
            if (navigator.connection.type !== Connection.NONE) {
                restService.get(_instance._slug(className))
                    .then(function (objects) {
                        var modelArray = [];

                        objects.forEach(function (object) {
                            modelArray.push(new window[className](object));
                        });

                        localManager.clearStore(className);
                        localManager.bulkSave(className, modelArray)
                            .then(function () {
                                resolve(modelArray);
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

    this.get = function (className, id) {
        return new Promise(function (resolve, reject) {
            if (navigator.connection.type !== Connection.NONE) {
                // Envoie d'une requète GET
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

    this.update = function (className, object) {
        var pK = object.hasOwnProperty('id') ? object.id : object.key;
        return new Promise(function (resolve, reject) {
            if (navigator.connection.type !== Connection.NONE) {
                restService.merge(_instance._slug(className) + '/' + pK, object)
                    .then(function (mergedObject) {
                        restService.put(_instance._slug(className) + '/' + pK, mergedObject)
                            .then(function (updatedObject) {
                                localManager.save(className, updatedObject)
                                    .then(function (result) {
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
                var request = new Request(null, 'put', _instance._slug(className) + '/' + pK, object);
                requestQueue.put(request);
                localManager.save(className, object)
                    .then(function (result) {
                        resolve(object);
                    }) // Succès
                    .catch(reject); // Échec
            }
        });
    };

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

    this.save = function (className, object) {
        var modifications = {};
        var now = +new Date();

        for (var prop in object) {
            if (object.hasOwnProperty(prop) && prop !== 'modifications') {
                modifications[prop] = now;
            }
        }

        object.modifications = JSON.stringify(modifications);

        return new Promise(function (resolve, reject) {
            var pK = object.hasOwnProperty('id') ? object.id : object.key;

           localManager.get(className, pK)
               .then(function (existingObject) {
                    if (typeof existingObject !== 'undefined') {
                        _instance.update(className, object)
                            .then(resolve)
                            .catch(reject);
                    } else {
                        _instance.persist(className, object)
                            .then(resolve)
                            .catch(reject);
                    }
               })
               .catch(reject);
        });
    };

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

