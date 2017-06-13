/**
 * Created by gaelph on 24/05/2017.
 */

/**
 * Classe modèle réprésentant un utilisateur
 * @param {{id: number, username: string, password: string}} userObject
 * @constructor
 */
function User (userObject) {
    if (typeof userObject !== 'undefined') {
        /**
         * Identifiant
         * @type {string|null}
         */
        this.id = userObject.id;

        /**
         * Nom d'utilisateur
         * @type {string}
         */
        this.username = userObject.username;

        /**
         * Mot de passe
         * @type {string}
         */
        this.password = userObject.password;
    } else {
        this.id = null;
        this.username = null;
        this.password = null;
    }
}