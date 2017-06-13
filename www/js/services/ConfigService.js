/**
 * Created by gaelph on 26/05/2017.
 */

/**
 * Service gérant les options de configuration
 * @param {$cookies} $cookies
 * @return {ConfigService}
 * @constructor
 * @todo Empêcher de créer des valeurs de config qui n'ont pas de valeur par défaut
 */
function ConfigService ($cookies) {

    /**
     * Valeur par des défaut des options de configuration
     * @type {{server: string}}
     * @private
     */
    this._defaults = {
        'server' : 'localhost'
    };

    /**
     * Renvoie la valeur de l'option 'key'
     * @param {string}  key Le nom de l'option
     * @return {*|string}
     */
    this.get = function (key) {
        return $cookies.get(key) || this._defaults[key];
    };

    /**
     * Associe la valeur 'value' pour l'option 'key"
     * @param {string}  key     Le nom de l'option
     * @param {string}  value   La valeur à associer à key
     */
    this.put = function (key, value) {
        $cookies.put(key, value);
    };

    /**
     * Réinitialise tous les réglages à leur valeur par défaut
     * @param key
     */
    this.setDefaults = function (key) {
        $cookies.put(key, this._defaults[key]);
    };

    return this;
}