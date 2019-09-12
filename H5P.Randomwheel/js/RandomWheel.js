var H5P = H5P || {};

/**
 * Constructor.
 */
H5P.Randomwheel = (function($, JoubelUI) {

    function Randomwheel(options) {
        if (!(this instanceof H5P.Randomwheel)) {
            return new H5P.Randomwheel(options);
        }
        var self = this;
        this.options = options;
        this.theWheel = undefined;
        this.wheelSpinning = false;
        this.canvasId = "canvas" + Math.round(new Date().getTime() + (Math.random() * 100));
        this.slices = this.options.words.length;
        H5P.EventDispatcher.call(this);
        //this.on('resize', self.resize, self);

    }

    Randomwheel.prototype = Object.create(H5P.EventDispatcher.prototype);
    Randomwheel.prototype.constructor = Randomwheel;

    /**
     * Append field to wrapper.
     *
     * @param {jQuery} $container
     */
    Randomwheel.prototype.attach = function($container) {
        var that = this;
        $left = $('<div>', {
            'class': 'g2 Randomwheel-content-left'
        });
        $right = $('<div>', {
            'class': 'g2 Randomwheel-content-right'
        });
        this.$container = $container
            .addClass('h5p-Randomwheel');


        $instructions = $('<div id="instructions" class="h5p-instructions">&nbsp;</div>');
        this.$container.append($instructions);
        $canvas = $('<canvas>', {
            'class': 'Randomwheel-content',
            'id': that.canvasId,
            text: "Canvas not supported, use another browser."
        });
        $right.append($canvas);
        $spinBtn = JoubelUI.createButton({
            'class': 'spin',
            'title': that.options.spinLabel,
            text: that.options.spinLabel
        }).click(function() {
            $("#instructions").html("&nbsp;");
            that.startSpin();
        }).appendTo($left);


        this.$container.append($left);
        this.$container.append($right);
        this.resizeCanvas(that.canvasId);
        //$("#instructions").hide();
        this.buildWheel();
    };

    Randomwheel.prototype.startSpin = function() {
        var that = this;
        // Ensure that spinning can't be clicked again while already running.
        if (that.wheelSpinning == false) {
            that.theWheel.rotationAngle = 0;
            // Begin the spin animation by calling startAnimation on the wheel object.
            that.theWheel.startAnimation();
            that.wheelSpinning = true;
        }
    }

    Randomwheel.prototype.drawTriangle = function() {
        var that = this;
        // Get the canvas context the wheel uses.
        var ctx = that.theWheel.ctx;
        var size = 10;
        //var center = 150;
        var center = $('#' + that.canvasId).width() / 2;
        ctx.strokeStyle = 'black';  // Set line colour.
        ctx.fillStyle = 'white';    // Set fill colour.
        ctx.lineWidth = 2;
        ctx.beginPath();           // Begin path.
        ctx.moveTo(center - size, 0);        // Move to initial position.
        ctx.lineTo(center, 20);        // Draw lines to make the shape.
        ctx.lineTo(center + size, 0);
        //ctx.lineTo(center + size, center - size);
        ctx.stroke();              // Complete the path by stroking (draw lines).
        ctx.fill();                // Then fill.
    }

    Randomwheel.prototype.buildWheel = function(width) {
        var that = this;

        if (that.slices === undefined || that.slices === 0) {
            return;
        }

        var callbackFinished = (function() {
            var winningSegment = this.theWheel.getIndicatedSegment();
            this.theWheel.stopAnimation(false);  // Stop the animation
            this.theWheel.draw();
            this.drawTriangle();
            this.wheelSpinning = false;
            $("#instructions").html(this.options.instructions + " <a href='" + winningSegment.text.worditem + "'>" + winningSegment.text.worditem + "</a>");
            $("#instructions").show();
        }).bind(this);

        var callbackAfter = (function() {
            this.drawTriangle();
        }).bind(this);

        that.theWheel = new Winwheel({
            'canvasId': that.canvasId,
            'numSegments': 0,

            'animation':               // Definition of the animation
                {
                    'type': 'spinToStop',
                    'duration': 3,
                    'repeat': 2,
                    'spins': 2 * that.slices, // The number of complete 360 degree rotations the wheel is to do.
                    'stopAngle': null,
                    'direction': 'clockwise',
                    'easing': 'Power4.easeOut',
                    'repeat': 0,
                    'yoyo': true,
                    'lineWidth': 1,
                    'callbackFinished': callbackFinished,
                    'callbackAfter': callbackAfter
                }
        });

        for (var index = 0; index < that.slices; index++) {
            that.theWheel.addSegment({'fillStyle': this.options.words[index].wordcolor, 'text': this.options.words[index]});
        }
        that.theWheel.draw();
        that.drawTriangle();
    }

    /**
     * Resize function for responsiveness.
     */
    Randomwheel.prototype.resizeCanvas = function(id) {
        var canvasWidth = $('.h5p-Randomwheel').width();
        var canvasHeight = canvasWidth / 16 * 8;
        var c = $("#" + id);
        ctx = c[0].getContext('2d');
        ctx.canvas.height = canvasHeight;
        ctx.canvas.width = canvasWidth;
    };

    return Randomwheel;

})(H5P.jQuery, H5P.JoubelUI);