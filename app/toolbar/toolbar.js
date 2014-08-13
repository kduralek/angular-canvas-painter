'use strict';
/* global app */
app.directive('toolbar', function (settings) {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'app/toolbar/toolbar.html',
        link: function (scope) {
            scope.tools = settings.tools;
            scope.setTool = function (tool) {
                if (scope.tool === tool) {
                    return;
                }

                if (settings.tools.indexOf(tool) === -1){
                    throw('main: Invalid tool selected! [' + tool + ']. Allowed only: ' + settings.tools);
                }
                console.debug('main: setTool( ' + tool + ' )');
                scope.tool = tool;
            };
            scope.setTool(settings.defaultTool);
        }
    };
});