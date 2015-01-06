var Grid = function(config) {

	this.defaults = {
		width : config && config.width ? config.width : 10,
		height : config && config.height ? config.height : 10,
		cellWidth : config && config.cellWidth ? config.cellWidth : 30,
		cellHeight : config && config.cellHeight ? config.cellHeight : 30,
		lineColour : config && config.lineColour ? config.lineColour : "#333333",
		lineWidth : config && config.lineWidth ? config.lineWidth : "0.5",
		x : config && config.x ? config.x : 50.5,
		y : config && config.y ? config.y : 50.5
	};

	this.points = [];

	this.canvas = document.getElementById("gridCanvas").getContext("2d");
	this.setup = function() {
		this.points = [];
		var counter = 1;
		for (var i=0; i<this.defaults.height; i++) {
			var row = [];
			for (var j=0; j<this.defaults.width; j++) {
				row.push({
					id : counter,
					x : j*this.defaults.cellWidth,
					y : i*this.defaults.cellHeight,
					log : function() {
						console.log("x: "+this.x+", y: "+this.y);
					}
				});
				counter++;
			}
			this.points.push(row);
		}

	};
	this.draw = function() {
		document.getElementById("gridCanvas").width = document.getElementById("gridCanvas").width;
		this.canvas.lineWidth = this.defaults.lineWidth;
		this.canvas.strokeStyle = this.defaults.lineColour;
		for (var i=0; i<this.defaults.height; i++) {
			for (var j=0; j<this.defaults.width; j++) {
				this.canvas.moveTo(this.defaults.x+this.points[j][i].x, this.defaults.y+this.points[j][i].y);
				if ((j+1)<this.defaults.width) {
					this.canvas.lineTo(this.defaults.x+this.points[j+1][i].x, this.defaults.y+this.points[j+1][i].y);
					
				}	
				if ((i+1)<this.defaults.height) {
					this.canvas.moveTo(this.defaults.x+this.points[j][i].x, this.defaults.y+this.points[j][i].y);
					this.canvas.lineTo(this.defaults.x+this.points[j][i+1].x, this.defaults.y+this.points[j][i+1].y);
				}	
			}
		}	
		this.canvas.stroke();
	}
	this.interact = function() {
		var myGrid = this;
		var closestPoint = undefined;
		var closestDistance = Number.POSITIVE_INFINITY;
		var pointCoords = [];
		var click = undefined;
		document.getElementById("gridCanvas").addEventListener("mousedown", function(e) {
			click = {
				x : (e.pageX - this.offsetLeft)-myGrid.defaults.x,
				y : (e.pageY - this.offsetTop)-myGrid.defaults.y
			}	
			for (var i = 0; i<myGrid.defaults.width; i++) {
				for (var j=0; j<myGrid.defaults.height; j++) {
					var clickDist = distance(click, myGrid.points[i][j]);
					if (clickDist<closestDistance) {
						closestDistance = clickDist;
						closestPoint = myGrid.points[i][j];
						pointCoords = [i,j];
					}
				}
			}		
		});
		document.getElementById("gridCanvas").addEventListener("mousemove", function(f) {
			if (!click) return false;
			click = {
				x : (f.pageX - this.offsetLeft)-myGrid.defaults.x,
				y : (f.pageY - this.offsetTop)-myGrid.defaults.y
			}	
			myGrid.points[pointCoords[0]][pointCoords[1]].x = click.x;
			myGrid.points[pointCoords[0]][pointCoords[1]].y = click.y;
			myGrid.draw();
		});
		document.getElementById("gridCanvas").addEventListener("mouseup", function() {
			closestPoint = undefined;
			closestDistance = Number.POSITIVE_INFINITY;
			pointCoords = [];
			click = null;

		});
	}

	this.transform = function(iterator, normalizer) {
		for (var q=0; q<this.points.length; q++) {
			for (var p=0; p<this.points[q].length; p++) {
				if ( (this.points[q][p].id+iterator)%normalizer==0) {
					this.points[q][p].x -= this.defaults.cellWidth/2;
					this.points[q][p].y -= this.defaults.cellHeight/2;

				}
			}	
		}
		this.draw();
	}
}
function distance(from, to) {
	return Math.abs(Math.sqrt(Math.pow(to.x-from.x, 2)+Math.pow(to.y-from.y,2)));
}

window.addEventListener("load", function() {
	var g = new Grid({width:20, height:20});
	g.setup();
	g.draw();
	g.interact();
	var iterator = 0;
	var upsetter = 2;
	window.repeat = setInterval(function() {
			g.setup();
			g.transform(iterator,upsetter);
			iterator++;
		}, 100);
	var change = setInterval(function() {
		upsetter++;
		clearInterval(window.repeat);
		window.repeat = setInterval(function() {
			g.setup();
			g.transform(iterator,upsetter);
			iterator++;
		}, 100);
	}, 5000);	
});