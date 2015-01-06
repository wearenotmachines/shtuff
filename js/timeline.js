
var container = document.getElementById("timeline");

var itemContent = [
	"<h1>ZX Spectrum 16K/48K</h1><p>The original ZX Spectrum is remembered for its rubber keyboard, diminutive size and distinctive rainbow motif. It was originally released on 23 April 1982 with 16 KB of RAM for £125 or with 48 KB for £175;[22] these prices were later reduced to £99 and £129 respectively</p>",
	"<h1>ZX Spectrum+</h1><p>This 48 KB Spectrum (development code-name TB[26]) introduced a new QL-style case with an injection-moulded keyboard and a reset button that was basically a switch that shorted across the CPU reset capacitor</p>",
	"<h1>ZX Spectrum 128</h1><p>The appearance of the ZX Spectrum 128 was similar to the ZX Spectrum+, with the exception of a large external heatsink for the internal 7805 voltage regulator added to the right hand end of the case, replacing the internal heatsink in previous versions./p>",
	"<h1>ZX Spectrum +2</h1><p>The ZX Spectrum +2 was Amstrad's first Spectrum, coming shortly after their purchase of the Spectrum range and Sinclair brand in 1986</p>",
	"<h1>ZX Spectrum +3</h1><p>The ZX Spectrum +3 looked similar to the +2 but featured a built-in 3-inch floppy disk drive (like the Amstrad CPC 6128) instead of the tape drive, and was in a black case.</p>"
];


var items = [

	{id : 1, content : itemContent[0], start: "1982-04-23", group : 1, className : "timelineItem", type : "point" },
	{id : 2, content : itemContent[1], start: "1984-10-01", end : "1985-01-16", group : 1, className : "timelineItem", type : "range" },
	{id : 3, content : itemContent[2], start: "1986-01-10", group : 1, className : "timelineItem", type : "point" },
	{id : 4, content : itemContent[3], start: "1986-04-15", group : 2, className : "timelineItem", type : "point" },
	{id : 5, content : itemContent[4], start: "1987-03-22", group : 2, className : "timelineItem", type : "point" }	

];

var earliest = _.min(items, function(item) {
	return new Date(item.start);
});
var latest = _.max(items, function(item) {
	return new Date(item.start);
});

console.log(earliest, latest);
latest =  new Date(latest.start)*1;
latest += (1000*60*60*24*30);
console.log(new Date(latest).toGMTString());
var options = {
		editable : {
			add : true,
			remove : true
		},
		min : earliest.start,
		start : "1985-10-07",
		end : latest,
		align : "left"
}

var timeline = new vis.Timeline(container, items, options);
