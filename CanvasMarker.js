'use strict';

L.CanvasMarker = L.Marker.extend({
    options: {
        color: 'grey'
    },

    onAdd: function(map) {
        this._map = map;
        this.createCanvas(map);
        this.catchEvents();
        this.startAnimation();
    },

    createCanvas: function(map) {
        var canvas = L.DomUtil.create('canvas', 'leaflet-marker-icon');
        
        //append the canvas to the leaflet-marker-pane, which means that the panning transformation is automatically applied
        map._container.getElementsByClassName('leaflet-marker-pane')[0].appendChild(canvas);
        
        canvas.style.position = 'absolute';
        canvas.height = map._container.clientHeight;
        canvas.width = map._container.clientWidth;

        //Create new canvas elements with the transformaton in mind (panning!)
        var mapTransforms = this.getTransform(map._container.getElementsByClassName('leaflet-map-pane')[0]);
        canvas.style.left = (mapTransforms[0] * -1) + 'px';
        canvas.style.top = (mapTransforms[1] * -1) + 'px';

        this._canvas = canvas;
    },

    getTransform: function(el) {
    	//retrieve the transform attribute of a given element and returns the values in an array
        var transform = window.getComputedStyle(el, null).getPropertyValue('-webkit-transform');
        var results = transform.match(/matrix(?:(3d)\(-{0,1}\d+(?:, -{0,1}\d+)*(?:, (-{0,1}\d+))(?:, (-{0,1}\d+))(?:, (-{0,1}\d+)), -{0,1}\d+\)|\(-{0,1}\d+(?:, -{0,1}\d+)*(?:, (-{0,1}\d+))(?:, (-{0,1}\d+))\))/);

        if (!results) return [0, 0, 0];
        if (results[1] == '3d') return results.slice(2, 5);

        results.push(0);
        return results.slice(5, 8); // returns the [X,Y,Z,1] values
    },

    startAnimation: function() {
        this.options.displayPos = this._map.latLngToContainerPoint(this._latlng);
        var context = this._canvas.getContext('2d');

        this.animate(context, this._canvas, 500, 0);
    },

    drawArc: function(context, x, y, radius, startAngle, endAngle) {
        context.beginPath();
        context.arc(x, y, radius, startAngle, endAngle, false);
        context.lineWidth = 5;
        context.strokeStyle = this.options.color;
        context.stroke();
    },

    drawCircle: function(context, x, y, radius) {
        context.beginPath();
        context.arc(x, y, radius, 0, 2 * Math.PI, false);
        context.fillStyle = 'green';
        context.lineWidth = 3;
        context.strokeStyle = this.options.color;
        context.stroke();
    },

    animate: function(context, canvas, radius, i) {
    	var x = this.options.displayPos.x;
    	var y = this.options.displayPos.y;
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        //i is the counter which is responsible for the rotation
        i += 0.05;
        if (radius > 30) radius -= 20;
        else {
            this.drawCircle(context, x, y, 10);
        }
        var startAngle = 0 + i;
        var endAngle = 0.85 * Math.PI + i;

        this.drawArc(context, x, y, radius, startAngle, endAngle);
        this.drawArc(context, x, y, radius, startAngle + Math.PI, endAngle + Math.PI);
        this.drawCircle(context, x, y, radius + 2);
        
        var that = this;
        window.requestAnimFrame(function() {
            that.animate(context, canvas, radius, i);
        });
    },

    catchEvents: function() {
        //display positions have to be recalculated if the map is zoomed
        var that = this;
        this._map.on('zoomend', function() {
            that.options.displayPos = that._map.latLngToContainerPoint(that._latlng);
        });
    },

    onRemove: function(map) {
        map._container.getElementsByClassName('leaflet-marker-pane')[0].removeChild(this._canvas);
    }
});

L.canvasMarker = function(latlng, options) {
    return new L.CanvasMarker(latlng, options);
};

window.requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();
