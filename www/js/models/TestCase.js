/**
 * Created by gaelph on 24/05/2017.
 */

/**
 * Classe modèle pour TestCase
 * @param {{id: number, nom: string, description: string, numero: number, date: number, modifications: string}}  testCaseObject
 * @constructor
 */
function TestCase (testCaseObject) {
    if (typeof testCaseObject !== 'undefined') {
        /**
         * Identifiant
         * @type {number|null}
         */
        this.id = testCaseObject.id || null;

        /**
         * Une valeur de type string
         * @type {string|null}
         */
        this.nom = testCaseObject.nom || null;

        /**
         * Une valeur de type string
         * @type {string|null}
         */
        this.description = testCaseObject.description || null;

        /**
         * Une valeur de type number
         * @type {number|null}
         */
        this.numero = testCaseObject.numero || null;

        var date = new Date();
        date.setTime(testCaseObject.date * 1000);

        /**
         * Un valeur de type Date
         * @type {Date|null}
         */
        this.date = date || null;

        /**
         * Un objet qui reprend les proprités de TestCase, chacune associé un timestamp de la dernière modification
         * dans le base de données
         * @type {*}
         */
        this.modifications = testCaseObject.modifications || {};
    } else {
        this.id = null;
        this.nom = null;
        this.description = null;
        this.numero = null;
        this.date = null;
        this.timestamp = null;
        this.modifications = null;
    }
}
