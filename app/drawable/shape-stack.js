'use strict';
/* global app */
app.factory('shapeStack', function () {

    var stack = [],
        service = {};

    service.add = function (item) {
        stack.push(item);
    };

    service.clear = function () {
        stack = [];
    };

    service.getAll = function () {
        return stack;
    };

    service.setAll = function (newShapes) {
        stack = newShapes;
    };

    service.contains = function (x, y) {
        var i, shape;
        for (i = 0; i < stack.length; i++) {
            shape = stack[i];
            if (x >= shape.bX1 && x <= shape.bX2 && y >= shape.bY1 && y <= shape.bY2) {
                return i;
            }
        }
        return -1;
    };

    service.get = function (idx) {
        return stack[idx];
    };

    service.fetch = function (idx) {
        var shape = angular.copy(stack[idx]);
        stack.splice(idx, 1);
        return shape;
    };

    return service;
});