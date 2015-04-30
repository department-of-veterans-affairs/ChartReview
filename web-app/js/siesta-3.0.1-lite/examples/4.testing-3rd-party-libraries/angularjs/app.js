angular.module('myApp', []);

angular.module('myApp')
    .factory('Person', function () {
        return function Person(name) {
            this.name = name;
        };
    });