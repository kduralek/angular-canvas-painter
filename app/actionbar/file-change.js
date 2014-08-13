'use strict';
/* global app */
app.directive('fileChange', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var eventName = attrs.fileChange.length > 0 ? attrs.fileChange : 'fileChange:init';
            element.bind('change', function (event) {
                console.log('emit: ' + eventName);
                scope.$emit(eventName, event.target.files);
                element.val('');
            });
        }
    };
});