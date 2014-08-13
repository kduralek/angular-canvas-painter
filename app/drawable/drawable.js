'use strict';
/* global app, console */
app.directive('drawable', function ($window, drawableService) {
    return {
        restrict: 'E',
        scope: {
            tool: '='
        },
        replace: true,
        templateUrl: 'app/drawable/drawable.html',
        link: function (scope, element) {

            var resizeListener, onResizeCanvas,
                onMouseUp, onMouseDown, onMouseMove,
                getMousePosition,
                isSelectionMode,
                isDrawingMode,
                canvasBase = element.find('canvas')[0],
                canvasTemp = element.find('canvas')[1],
                state = {
                    isMouseDown: false,
                    isDrawing: false,
                    isDragging: false
                };


            isSelectionMode = function () {
                return scope.tool === 'selection';
            };

            isDrawingMode = function () {
                return scope.tool !== 'selection';
            };

            getMousePosition = function (e) {
                var pos = {};
                if (e.offsetX !== undefined) {
                    pos.x = e.offsetX;
                    pos.y = e.offsetY;
                } else {
                    pos.x = e.layerX - e.currentTarget.offsetLeft;
                    pos.y = e.layerY - e.currentTarget.offsetTop;
                }

                return pos;
            };

            onResizeCanvas = function () {
                var w = element[0].offsetWidth,
                    h = element[0].offsetHeight;

                canvasBase.width = w;
                canvasBase.height = h;
                canvasTemp.width = w;
                canvasTemp.height = h;

                drawableService.init(canvasBase, canvasTemp);
                drawableService.redrawAll();

                console.debug('drawable: canvas resized');
            };

            onMouseDown = function (e) {
                var pos;
                console.debug('mouse down');
                state.isMouseDown = true;
                if (isDrawingMode()) {
                    pos = getMousePosition(e);
                    drawableService.startDrawing(scope.tool, pos.x, pos.y);
                }
            };

            onMouseUp = function (e) {
                var pos = getMousePosition(e);
                state.isMouseDown = false;
                if (!(state.isDrawing || state.isDragging)) { // click event detected
                    console.debug('mouse click detected');
                    if (isSelectionMode()) {
                        drawableService.select(pos.x, pos.y);
                    }
                    return;
                }

                if (state.isDrawing) {
                    drawableService.stopDrawing(pos.x, pos.y);
                    state.isDrawing = false;
                }
            };

            onMouseMove = function (e) {
                var pos;

                if (!state.isMouseDown) { // normal mouse move event - do nothing
                    return;
                }

                pos = getMousePosition(e);
                if (!isSelectionMode()) {
                    console.debug('drawing...');
                    state.isDrawing = true;
                    drawableService.drawing(pos.x, pos.y);
                }
            };

            // bind events
            resizeListener = $window.addEventListener('resize', onResizeCanvas, false);
            element.bind('mouseup', onMouseUp);
            element.bind('mousedown', onMouseDown);
            element.bind('mousemove', onMouseMove);

            // unbind events - not really needed until there's no routing
            scope.$on('$destroy', function(){
                resizeListener();
                element.unbind('mouseup', onMouseUp);
                element.unbind('mousedown', onMouseDown);
                element.unbind('mousemove', onMouseMove);
            });

            onResizeCanvas();
        }
    };
}).factory('drawableService', function (shapeStack, shape, settings) {
    var ctxBase, ctxTemp,
        currentShape,
        redrawing = false,
        service = {};

    var clearCtxBase = function () {
        ctxBase.clearRect(0, 0, ctxBase.canvas.width, ctxBase.canvas.height);
    };

    var clearCtxTemp = function () {
        ctxTemp.clearRect(0, 0, ctxTemp.canvas.width, ctxTemp.canvas.height);
    };

    service.init = function (canvasBaseEl, canvasTempEl) {
        ctxBase = canvasBaseEl.getContext('2d');
        ctxTemp = canvasTempEl.getContext('2d');
        ctxBase.lineWidth = settings.lineWidth;
        ctxBase.strokeStyle = settings.strokeColor;
        ctxTemp.lineWidth = settings.lineWidth;
        ctxTemp.strokeStyle = settings.strokeColor;
    };

    service.clearAll = function () {
        clearCtxBase();
        clearCtxTemp();
        shapeStack.clear();
    };

    service.startDrawing = function (type, x, y) {
        currentShape = new shape[type](x, y);
    };

    service.drawing = function (x, y) {
        clearCtxTemp();
        currentShape.setEndPoint(x, y);
        currentShape.draw(ctxTemp);
    };

    service.stopDrawing = function (x, y) {
        if (redrawing || currentShape.isDrawable()) {
            currentShape.setEndPoint(x, y);
            currentShape.setBoundingRectangle();
            currentShape.draw(ctxBase);
            shapeStack.add(angular.copy(currentShape));
        }
        clearCtxTemp();
        if (currentShape.idx) {
            delete (currentShape.idx);
        }
        currentShape = undefined;
    };

    service.redrawAll = function () {
        redrawing = true;
        var shapes = angular.copy(shapeStack.getAll());
        shapeStack.clear();
        clearCtxBase();
        shapes.forEach(function (shape) {
            service.startDrawing(shape.type, shape.x1, shape.y1);
            service.stopDrawing(shape.x2, shape.y2);
        });
        redrawing = false;
    };

    service.select = function (x, y) {
        var idx = shapeStack.contains(x, y);
        if (idx > -1) {
            clearCtxTemp();
            currentShape = shapeStack.get(idx);
            currentShape.idx = idx;
            currentShape.drawSelection(ctxTemp);
        } else if (currentShape !== undefined) {
            clearCtxTemp();
        }
    };

    service.isOneSelected = function () {
        return currentShape && currentShape.idx !== undefined;
    };

    service.isCursorOverSelection = function (x, y) {
        var idx = shapeStack.contains(x, y);
        if (idx > -1 && currentShape !== undefined && currentShape.idx === idx) {
            ctxTemp.canvas.style.cursor = 'move';
        } else {
            ctxTemp.canvas.style.cursor = 'default';
        }
    };

    return service;
});
