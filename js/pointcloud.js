function PointCloud(canvasID) {

	this.canvas = document.getElementById(canvasID);
	this.c = this.canvas.getContext("2d");

	this.points = [];

	this.addPoint = function(point) {
		this.points[this.points.length] = point;
		point.render(this.c);
		if (this.points.length>1) {
			this.points[this.points.length-1].connect(this.c, this.points[this.points.length-2]);
		}

	}

	this.getCanvas = function() {
		return this.canvas;
	}


}

function Point(x,y,z, config) {
	this.x = x;
	this.y = y;
	this.z = z;
	this.connects = [];

	this.config = config ? config : {};
	this.config.fillStyle = config && config.fillStyle ? config.fillStyle : '#0F0';
	this.config.lineWidth = config && config.lineWidth ? config.lineWidth : 0.5;
	this.config.strokeStyle = config && config.strokeStyle ? config.strokeStyle : '#0F0';
	this.config.radius = config && config.radius ? config.radius : 4;

	this.render = function(c, config) {
		c.beginPath();
		c.fillStyle = config && config.fillStyle ? config.fillStyle : this.config.fillStyle;
		c.strokeStyle = c.fillStyle;
		c.arc(this.x, this.y, config && config.radius ? config.radius : this.config.radius, 0, Math.PI*2);
		c.fill();
	}

	this.connect = function(c, toPoint, config) {
		toPoint.connects.push(this);
		c.lineWidth = config && config.lineWidth ? config.lineWidth : 0.5;
		c.strokeStyle = config && config.strokeStyle ? config.strokeStyle : '#0F0';
		c.moveTo(this.x, this.y);
		c.lineTo(toPoint.x, toPoint.y);
		c.stroke();

	}
}

window.addEventListener("load", function() {
	var pc = new PointCloud("paper");
	for (var i=0; i<100; i++) {
		var randX = Math.random() * (pc.getCanvas().width-20) + 10;
		var randY = Math.random() * (pc.getCanvas().height-20) + 10;
		pc.addPoint(new Point(randX, randY, 1));
	}
});