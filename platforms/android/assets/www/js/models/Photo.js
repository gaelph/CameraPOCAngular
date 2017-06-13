/**
 * Created by gaelph on 24/05/2017.
 */

function Photo (photoObject) {
    /**
     * Une clé unique, un timestamp par défaut
     * @type {number}
     */
    this.key = photoObject.key || Date.now();
    /**
     * La chaîne encodée en base64 représentant l'image
     * @type {string}
     */
    this.value = photoObject.value || "";

    /**
     * Un objet représentant les modifications timestampées
     * @type {{key: number, value: number}}
     */
    this.modifications = photoObject.modifications || {};
}