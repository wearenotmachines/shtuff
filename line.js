/**
 * Line - js lines on canvas
 */
var wearenotmachines = {}
wearenotmachines.Line = function() {
	this.canvas = null;
	this.context = null;
	this.canvasDims = {};
	this.segments = [];
	this.animation = null;
	this.animFunc = null;
	this.framerate = null;
	this.init = function() {
		console.log({width : document.body.offsetWidth*0.8, height : document.body.offsetHeight*0.8});
		this.canvas = document.getElementById("area");
		this.canvas.width = document.body.offsetWidth*0.8;
		this.canvas.height = document.body.offsetHeight*0.8;

		this.context = this.canvas.getContext("2d");
		this.canvasDims = {
			"width" : this.canvas.width,
			"height" : this.canvas.height,
			"x" : this.canvas.offsetLeft,
			"y" : this.canvas.offsetTop
		};
	};
	this.resetCanvas = function() {
		this.canvas.width = this.canvasDims.width;
		this.canvas.height = this.canvasDims.height;
	};
	this.getCentre = function(dim) {
		var dims = { 
					"x" : (this.canvasDims.width/2)+this.canvasDims.x,
					"y" : (this.canvasDims.height/2)+this.canvasDims.y
				};
		return dim ? dims[dim] : dims;
	};
	this.clothesLine = function(points, terminators) {
		this.resetCanvas();

		var segmentWidth = this.canvas.width/parseInt(points);
		var xPos = 0;
		for (var i=0; i<points; i++) {
			var yPos = 10+(Math.random()*15);
			this.segments.push({
				x1 : xPos + (i*segmentWidth),
				x2 : xPos + (i*segmentWidth)+segmentWidth,
				y1 : yPos,
				y2 : yPos}
			);
		}
		this.draw(this.segments, true, {colour : '#900', width : 1});
		

	};
	this.draw = function(plots, strokeStyle) {
		if (undefined==strokeStyle) {
			strokeStyle = {
				colour : "#900",
				width : 1
			}
		}
		this.context.strokeStyle = strokeStyle.colour
		this.context.fillStyle = strokeStyle.colour;
		this.context.moveTo(plots[0].x1, plots[0].y1);
		this.context.lineWidth = strokeStyle.width;
		var extent =0 ;
		for (var i = 0; i<plots.length; i++) {
			var plot = plots[i];
			this.context.lineTo(plot.x2, plot.y2);
			if (plot.y2>extent) extent = plot.y2;
			//if (i<plots.length-1)
				//this.context.arc(plot.x2, plot.y2, 3, Math.PI*2, false);
			// console.log("{ "+plot.x1+", "+plot.y1+" } => { "+plot.x2+", "+plot.y2+" }");
		}
		var gradient = this.context.createLinearGradient(0,0,0, extent-20);
		gradient.addColorStop(0, '#900');
		gradient.addColorStop(1, '#200');
		this.context.lineTo(this.canvas.width, 0);
		this.context.lineTo(0,0);
		this.context.stroke();
		this.context.fillStyle=gradient;
		this.context.fill();

	};
	this.drip = function(distance, framerate) {
		if (undefined==framerate) framerate = 24;
		this.framerate = framerate;
		for (var i=0; i<this.segments.length; i++) {
			if (this.segments[i].target==undefined) {
				var started = false;
				this.segments[i].target = {
					x : this.segments[i].x2,
					y : this.segments[i].y2 + Math.random()*distance
				}
				this.segments[i].viscosity = Math.random()*.01;
			} else {
				var viscosity = this.segments[i].viscosity*1.1;
				this.segments[i].x2 = this.segments[i].x2;
				this.segments[i].y2 = this.segments[i].y2 + (this.segments[i].target.y*viscosity);
				var started = true;
			}
		}
		this.draw(this.segments);
		var that = this;
		// console.log(this.segments);
		 if (!started) {
		 	console.log("not started");
		 	this.animFunc = function() {
		 		that.resetCanvas();
				that.drip(distance, framerate);
		 	};
		 	this.animation = setInterval(this.animFunc, framerate);
		 }	
	}


	this.init();
	return this;
}
window.addEventListener("load",function() {
	var line = new wearenotmachines.Line();
	window.counter = 1;
	line.clothesLine(200, true);
	line.drip(100, 20);	
	var button = document.getElementsByTagName("button");
	button[0].addEventListener("click", function() {
		if (line.animation) {
			clearInterval(line.animation);
			console.log(line.animFunc);
		} else {
			line.animation = setInterval(line.animFunc, line.framerate);
		}	
	});
}, false);