/**
 * Created by gaelph on 24/05/2017.
 */

/**
 * Created by gaelph on 05/05/2017.
 */

/**
 * Objet repéresentant une requête en attente
 * @param {('get'|'post'|'put'|'delete'|'GET'|'POST'|'PUT'|'DELETE')} method    Méthode HTTP
 * @param {string} url  URL de la requète
 * @param {object} [body=null]    Corps de la requète (pour PUT et POST)
 * @constructor
 * @implements Model
 * @requires LocalManager
 */
function Request (id, method, url, body) {
    this.id = id;
    this.method = method.toLowerCase(); // On ne garde que le bas de casse pour appeler les fonctions de REST
    this.url = url;
    this.timestamp = Date.now();

    // On affiche un warning dans la console si on crée une requête POST ou PUT sans body
    if ((method === 'post' || method === 'put') && typeof body === 'undefined') {
        console.warn("Declaring a " + method.toUpperCase() + " request without a body");
    }

    this.body = body || null;
}