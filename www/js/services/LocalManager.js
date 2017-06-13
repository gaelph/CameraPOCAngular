/**
 * Created by gaelph on 24/05/2017.
 */

/**
 * Manager pour la base de données locale (Dexie)
 * @param {$dexie} $dexie
 * @constructor
 */
function LocalManager ($dexie) {
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
     * Récupère un élément
     * @param {string} className    Le nom de la classe
     * @param {number} id           L'identifiant de l'élément à récupérer
     * @returns {Promise}           Une promise qui résout à l'instance de l'objet récupéré
     */
    this.get = function (className, id) {
        return $dexie[this._slug(className)].get(id);
    };

    /**
     * Récupère tous les éléments de la table
     * @param {string} className    Le nom de la classe des objets à récupérer
     * @return {Promise}            Une promise qui résout à une collection d'objets
     */
    this.all = function (className) {
        return new Promise(function (resolve, reject) {
            resolve($dexie[_instance._slug(className)].toCollection());
        });
    };

    /**
     * Persiste un enregistrement dans la base
     * @param {string} className    Le nom de la classe de l'objet à persister
     * @param {object} object       L'objet à persisiter
     * @return {Promise}            Une promise qui résout à l'objet enregistré
     */
    this.save = function (className, object) {
        return new Promise(function (resolve, reject) {
            // On détermine la clé primaire de l'objet
            var id = object.key || object.id;
            // Si l'objet a une clé primaire
            if (id !== null) {
                // On vérifie l'exitence de l'objet dans la base
                _instance.get(className, id)
                    .then(function (currentObject) {
                        // Si l'objet exite, currentObject est la versio en base (obsolète)
                        // Sinon, c'est "undefined"
                        if (typeof currentObject !== 'undefined') {
                            // On prend les modifications (timestamps) de la base
                            object.modifications = currentObject.modifications;

                            // On regarde qu'est-ce qui a changé et on actualise le timestamp
                            for (var prop in object) {
                                if (object.hasOwnProperty(prop) && currentObject.hasOwnProperty(prop)) {
                                    if (object[prop] !== currentObject[prop]) {
                                        object.modifications[prop] = +new Date();
                                    }
                                }
                            }
                        } else { // Pas d'objet existant
                            // On crée la valeur initiale des timestamp de modification
                            for (var prop in object) {
                                if (object.hasOwnProperty(prop)) {
                                    object.modifications[prop] = +new Date();
                                }
                            }
                        }

                        // Insertion / Mise à jour dans la base
                        $dexie[_instance._slug(className)].put(object)
                            .then(resolve)
                            .catch(reject);
                    });
            } else {
                // Si l'objet utilise le log 'modifiations', on initialise celui-ci
                if (typeof object.modifications !== 'undefined') {
                    for (var prop in object) {
                        if (object.hasOwnProperty(prop)) {
                            object.modifications[prop] = +new Date();
                        }
                    }
                }
                // On donne une valeur à id pour statisfaire Dexie
                object.id = 0;

                // Insertion dans la base
                $dexie[_instance._slug(className)].put(object)
                    .then(resolve)
                    .catch(reject);
            }
        });
    };

    /**
     * Persite une collection d'objets
     * @param {string} className    nom de la classe d'objets
     * @param {Array} data          Tableau contenant les objets à insérer
     * @return {Promise<Key>|*}
     */
    this.bulkSave = function (className, data) {
        return $dexie[_instance._slug(className)].bulkPut(data);
    };

    /**
     * Supprime un enregistrement de la base de données
     * @param {string} className    Le nom de la classe concernée
     * @param {number} id           L'identifiant de l'enregistrement à supprimer
     * @returns {Promise}           Un promise qui résout à l'id de l'objet supprimé
     */
    this.delete = function (className, id) {
        return $dexie[_instance._slug(className)].delete(id);
    };

    /**
     * Efface toute la base
     * @param className
     * @return {Promise<void>|boolean|*}
     */
    this.clearStore = function (className) {
        return $dexie[_instance._slug(className)].clear();
    };

    return this;
}