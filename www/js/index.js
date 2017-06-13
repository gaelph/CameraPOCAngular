/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function () {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function () {
        this.receivedEvent('deviceready');
    },

    // Insère les scripts de l'application angular
    makeScriptTag: function (scripts, startIndex, next) {
        if (typeof next === 'undefined') {
            next = this.makeScriptTag;
        }

        var script = document.createElement('script');
        script.type = 'application/javascript';
        script.src = scripts[startIndex];
        script.onreadystatechange = function () {
            if (this.readyState === 'complete') {
                if (startIndex + 1 < scripts.length) {
                    next(scripts, startIndex + 1, next);
                } else {
                    document.querySelector('#camera-poc-app').setAttribute("ng-app", "cameraPOC");
                    angular.bootstrap(document.querySelector('#camera-poc-app'), ["cameraPOC"]);
                }
            }
        };
        script.onload = function () {
            if (startIndex + 1 < scripts.length) {
                next(scripts, startIndex + 1, next);
            } else {
                document.querySelector('#camera-poc-app').setAttribute("ng-app", "cameraPOC");
                angular.bootstrap(document.querySelector('#camera-poc-app'), ["cameraPOC"]);
            }
        };

        document.body.appendChild(script);
    },

    // Update DOM on a Received Event
    receivedEvent: function (id) {
        var scripts = [
            "bower_components/angular/angular.js",
            "bower_components/angular-http/angular-http.js",
            "bower_components/angular-route/angular-route.js",
            "bower_components/angular-cookies/angular-cookies.js",
            "bower_components/dexie/dist/dexie.js",

            "js/models/Request.js",
            "js/models/User.js",
            "js/models/TestCase.js",
            "js/models/Photo.js",

            "js/services/ConfigService.js",
            "js/services/RestService.js",
            "js/services/UserService.js",
            "js/services/$dexie.js",
            "js/services/RequestQueue.js",
            "js/services/LocalManager.js",
            "js/services/RemoteManager.js",

            "js/controllers/ServeurController.js",
            "js/controllers/UserController.js",
            "js/controllers/PhotoController.js",
            "js/controllers/TestCaseController.js",

            "js/app.js"
        ];

        this.makeScriptTag(scripts, 0);
    }
};

app.initialize();