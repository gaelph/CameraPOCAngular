/**
 * Created by gaelph on 24/05/2017.
 */

function User (userObject) {
    if (typeof userObject !== 'undefined') {
        this.id = userObject.id;
        this.username = userObject.username;
        this.password = userObject.password;
    } else {
        this.id = null;
        this.username = null;
        this.password = null;
    }
}