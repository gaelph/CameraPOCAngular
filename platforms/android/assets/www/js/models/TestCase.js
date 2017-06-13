/**
 * Created by gaelph on 24/05/2017.
 */
function TestCase (testCaseObject) {
    if (typeof testCaseObject !== 'undefined') {
        this.id = testCaseObject.id || null;
        this.nom = testCaseObject.nom || null;
        this.description = testCaseObject.description || null;
        this.numero = testCaseObject.numero || null;
        var date = new Date();
        date.setTime(testCaseObject.date * 1000);
        this.date = date || null;
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
