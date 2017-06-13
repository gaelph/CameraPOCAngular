/**
 * Created by gaelph on 24/05/2017.
 */

function $dexie() {

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

    var db = new Dexie("photo_store");

    db.version(1).stores(databaseDeclarations[1]);
    db.version(2).stores(databaseDeclarations[2]);
    db.version(3).stores(databaseDeclarations[3]);
    db.version(4).stores(databaseDeclarations[4]);
    db.version(5).stores(databaseDeclarations[5]);
    db.version(6).stores(databaseDeclarations[6]);
    db.version(7).stores(databaseDeclarations[7]);

    console.log("Loaded db version " + 7);

    return db;
}