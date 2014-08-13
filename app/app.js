'use strict';
var app = angular.module('canvasPainterApp', []);

app.constant('settings', {
    tools: ['selection', 'line', 'rectangle', 'circle'],
    defaultTool: 'line',
    lineWidth: 4,
    strokeColor: '#1C8FA2',
    selectionCursorDefault: 'default',
    selectionCursor: ['nw-resize', 'ne-resize', 'se-resize', 'sw-resize'],
    selectionHadleSize: 10,
    selectionLineWidth: 2,
    selectionHandleColor: 'rgba(255, 93, 0, 1)',
    selectionStrokeColor: 'rgba(255, 93, 0, 0.5)',
    selectionFillColor: 'rgba(255, 93, 0, 0.1)'
});

app.run(function () {
    console.log('app: run');
});