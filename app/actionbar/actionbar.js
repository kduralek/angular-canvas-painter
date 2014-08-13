'use strict';
/* global app */
app.directive('actionbar', function (drawableService, shapeStack) {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'app/actionbar/actionbar.html',
        link: function (scope) {
            scope.$on('export:init', function (e, files) {
                if (files.length !== 1) {
                    return;
                }
                scope.importShapes(files[0]);
            });

            scope.exportShapes = function () {
                console.time('actionbar:exportShapes');
                var shapes = shapeStack.getAll();
                if (shapes.length < 1) {
                    return;
                }

                var blob = new Blob([angular.toJson(shapes)], {type: 'text/plain;charset=utf-8'});
                saveAs(blob, 'canvas-painter-export-' + new Date().getTime() + '.json');
                console.timeEnd('actionbar:exportShapes');
            };

            scope.importShapes = function (file) {
                console.time('actionbar:importShapes');

                var reader = new FileReader();
                reader.onload = (function () {
                    return function (e) {
                        shapeStack.setAll(angular.fromJson(e.target.result));
                        drawableService.redrawAll();
                    };
                })(file);

                reader.readAsText(file);

                console.timeEnd('actionbar:importShapes');
            };

            scope.clearCanvas = function () {
                drawableService.clearAll();
            };
        }
    };
});