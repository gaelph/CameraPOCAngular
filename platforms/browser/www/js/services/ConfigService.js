/**
 * Created by gaelph on 26/05/2017.
 */

function ConfigService ($cookies) {

    this._defaults = {
        'server' : 'localhost'
    };

    this.get = function (key) {
        return $cookies.get(key) || this._defaults[key];
    };

    this.put = function (key, value) {
        $cookies.put(key, value);
    };

    this.setDefaults = function (key) {
        $cookies.put(key, this._defaults[key]);
    };

    return this;
}