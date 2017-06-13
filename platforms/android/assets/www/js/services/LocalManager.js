/**
 * Created by gaelph on 24/05/2017.
 */

/**
 *
 * @param {$dexie} $dexie
 * @constructor
 */
function LocalManager ($dexie) {
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

    /**
     *
     * @param {string} className
     * @param {number} id
     * @returns {Promise}
     */
    this.get = function (className, id) {
        return $dexie[this._slug(className)].get(id);
    };

    /**
     *
     * @param {string} className
     * @return {Promise}
     */
    this.all = function (className) {
        return new Promise(function (resolve, reject) {
            resolve($dexie[_instance._slug(className)].toCollection());
        });
    };

    /**
     *
     * @param {string} className
     * @param {object} object
     * @return {Promise}
     */
    this.save = function (className, object) {
        return new Promise(function (resolve, reject) {
            var id = object.key || object.id;
            if (id !== null) {
                _instance.get(className, id)
                    .then(function (currentObject) {
                        if (typeof currentObject !== 'undefined') {
                            object.modifications = currentObject.modifications;

                            for (var prop in object) {
                                if (object.hasOwnProperty(prop) && currentObject.hasOwnProperty(prop)) {
                                    if (object[prop] !== currentObject[prop]) {
                                        object.modifications[prop] = +new Date();
                                    }
                                }
                            }
                        } else {

                            for (var prop in object) {
                                if (object.hasOwnProperty(prop)) {
                                    object.modifications[prop] = +new Date();
                                }
                            }
                        }

                        $dexie[_instance._slug(className)].put(object)
                            .then(resolve)
                            .catch(reject);
                    });
            } else {
                if (typeof object.modifications !== 'undefined') {
                    for (var prop in object) {
                        if (object.hasOwnProperty(prop)) {
                            object.modifications[prop] = +new Date();
                        }
                    }
                }

                object.id = 0;

                $dexie[_instance._slug(className)].put(object)
                    .then(resolve)
                    .catch(reject);
            }
        });
    };

    this.bulkSave = function (className, data) {
        return $dexie[_instance._slug(className)].bulkPut(data);
    };

    /**
     *
     * @param {string} className
     * @param {number} id
     * @returns {Promise}
     */
    this.delete = function (className, id) {
        return $dexie[_instance._slug(className)].delete(id);
    };

    this.clearStore = function (className) {
        return $dexie[_instance._slug(className)].clear();
    };

    return this;
}