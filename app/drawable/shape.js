'use strict';
/* global app */
app.factory('shape', function (settings) {

    // Shape - parent constructor
    function Shape(type, x, y) {
        this.type = type;
        this.x1 = x;
        this.y1 = y;
    }

    Shape.prototype.isDrawable = function () {
        return Math.abs(this.x2 - this.x1) > 10 || Math.abs(this.y2 - this.y1) > 10;
    };

    Shape.prototype.setEndPoint = function (x, y) {
        this.x2 = x;
        this.y2 = y;
    };

    // check mouse move direction
    // and setup bounding points
    Shape.prototype.setBoundingRectangle = function () {

        var diffX = this.x2 - this.x1,
            diffY = this.y2 - this.y1;

        this.bX1 = Math.min(this.x1, this.x2);
        this.bX2 = Math.max(this.x1, this.x2);

        if (diffX < 0 && diffY < 0) {
            this.bY1 = this.y2;
            this.bY2 = this.y1;
        } else if (diffX > 0 && diffY < 0) {
            this.bY1 = this.y1 - Math.abs(diffY);
            this.bY2 = this.y2 + Math.abs(diffY);
        } else if (diffX < 0 && diffY > 0) {
            this.bY1 = this.y2 - Math.abs(diffY);
            this.bY2 = this.y1 + Math.abs(diffY);
        } else {
            this.bY1 = this.y1;
            this.bY2 = this.y2;
        }
    };

    // rewrite - settings out
    Shape.prototype.drawSelection = function(ctx) {
        var x = this.bX1 - 4 * settings.selectionLineWidth,
            y = this.bY1 - 4 * settings.selectionLineWidth,
            w = this.bX2 - this.bX1 + 8 * settings.selectionLineWidth,
            h = this.bY2 - this.bY1 + 8 * settings.selectionLineWidth,
            hSize = settings.selectionHadleSize,
            handles;

        // draw selection bounding box
        ctx.strokeStyle = settings.selectionStrokeColor;
        ctx.lineWidth = settings.selectionLineWidth;
        ctx.setLineDash([2, 2]);
        ctx.fillStyle = settings.selectionFillColor;
        ctx.strokeRect(x, y, w, h);
        ctx.fillRect(x, y, w, h);

        // draw selection handles
        handles = [
            { x: x - hSize / 2, y: y - hSize / 2    },
            { x: x + w - hSize / 2, y: y - hSize / 2 },
            { x: x + w - hSize / 2, y: y + h - hSize / 2 },
            { x: x - hSize / 2, y: y + h - hSize / 2 }
        ];
        ctx.fillStyle = settings.selectionHandleColor;
        handles.forEach(function (handle) {
            ctx.fillRect(handle.x, handle.y, hSize, hSize);
        });

        // reset to the previous state
        ctx.fillStyle = 'none';
        ctx.setLineDash([]);
        ctx.lineWidth = settings.lineWidth;
        ctx.strokeStyle = settings.strokeColor;
    };


    // Line - Shape implementation
    function Line(x, y) {
        Shape.call(this, 'line', x, y);
    }

    Line.prototype = new Shape();
    Line.prototype.draw = function (ctx) {
        ctx.beginPath();
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(this.x2, this.y2);
        ctx.closePath();
        ctx.stroke();
    };

    // Rectangle - Shape implementation
    function Rectangle(x, y) {
        Shape.call(this, 'rectangle', x, y);
    }

    Rectangle.prototype = new Shape();
    Rectangle.prototype.draw = function (ctx) {
        var width = this.x2 - this.x1,
            height = this.y2 - this.y1,
            sign = height ? height < 0 ? -1 : 1 : 0;
        ctx.strokeRect(this.x1, this.y1, width, Math.abs(height) * sign);
    };

    function Circle(x, y) {
        Shape.call(this, 'circle', x, y);
    }

    Circle.prototype = new Shape();
    Circle.prototype.draw = function (ctx) {
        var radius = Math.round(Math.sqrt(Math.pow(this.x2 - this.x1, 2) + Math.pow(this.y2 - this.y1, 2)));

        ctx.beginPath();
        ctx.arc(this.x1, this.y1, radius, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.stroke();
    };
    Circle.prototype.setBoundingRectangle = function () {
        var radius = Math.round(Math.sqrt(Math.pow(this.x2 - this.x1, 2) + Math.pow(this.y2 - this.y1, 2)));

        this.bX1 = this.x1 - radius;
        this.bX2 = this.x1 + radius;
        this.bY1 = this.y1 - radius;
        this.bY2 = this.y1 + radius;
    };


    return {
        line: Line,
        rectangle: Rectangle,
        circle: Circle
    };
});