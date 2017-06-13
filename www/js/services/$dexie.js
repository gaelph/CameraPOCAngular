/**
 * Created by gaelph on 24/05/2017.
 */

/**
 * Service pour le wrapper IndexedDB Dexie.js
 * @return {Dexie}
 */
function $dexie() {

    /**
     * Liste des stores
     * @type {{1: {photos: string}, 2: {photos: string, requests: string}, 3: {photos: string, requests: string}, 4: {photos: string, requests: string, testcases: string}, 5: {photos: string, requests: string, testcases: string}, 6: {photos: string, requests: string, testcases: string}, 7: {photos: string, requests: string, testcases: string}}}
     */
    var databaseDeclarations = {
        1: {
            "photos": "key, value",
        },
        2: {
            "photos":   "key, value",
            "requests": "++, method, url, body"
        },
        3: {
            "photos":   "key, value",
            "requests": "++, method, url, body, timestamp"
        },
        4: {
            "photos":    "key, value",
            "requests":  "++, method, url, body, timestamp",
            "testcases": "++, nom, description, numero, date, timestamp"
        },
        5: {
            "photos":    "key, value",
            "requests":  "++, method, url, body, timestamp",
            "testcases": "&id, nom, description, numero, date, timestamp"
        },
        6: {
            "photos":    "key, value, modifications",
            "requests":  "++, method, url, body, timestamp",
            "testcases": "&id, nom, description, numero, date, modifications"
        },
        7: {
            "photos":    "key, value, modifications",
            "requests":  "++id, method, url, body, timestamp",
            "testcases": "&id, nom, description, numero, date, modifications"
        }
    };

    // chargement de la base de données
    var db = new Dexie("photo_store");

    // Chargement itératif des stores
    db.version(1).stores(databaseDeclarations[1]);
    db.version(2).stores(databaseDeclarations[2]);
    db.version(3).stores(databaseDeclarations[3]);
    db.version(4).stores(databaseDeclarations[4]);
    db.version(5).stores(databaseDeclarations[5]);
    db.version(6).stores(databaseDeclarations[6]);
    db.version(7).stores(databaseDeclarations[7]);

    console.log("Loaded db version " + 7);

    // On renvoie l'instance de Dexie.
    return db;
}