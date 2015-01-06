var wearenotmachines = {};
wearenotmachines.audio = {
	
	context : undefined,
	request : new XMLHttpRequest(),
	buffer : undefined,
	position : 0,
	counting : false,
	gain : undefined,

	init : function(audiofile) {
		try {
			window.AudioContext = window.AudioContext||window.webkitAudioContext;
    		this.context = new AudioContext();
    		this.loadSource(audiofile);
    	} catch(e) {
    		alert("Could not start an AudioContext");
    	}
	},

	loadSource : function(audiofile) {
		$('.status').text("Loading "+audiofile);
		this.request.open('GET', audiofile, true);
		this.request.responseType = 'arraybuffer';
		this.request.onload = wearenotmachines.audio.setupSound;
		this.request.send();
	},

	setupSound : function(e) {
		$('.status').text("Audiofile loaded");
		var wanm = wearenotmachines.audio;
		wanm.context.decodeAudioData(wanm.request.response, function(buffer) {
			wanm.buffer = buffer;
			wanm.createSource();
			$('#play,#stop,#vol').removeAttr("disabled");
			$('#play').on("click", function() {
				$('.status').text("playing");
				wanm.source.start(0,wanm.position);
				clearInterval(wanm.counting);
				wanm.counting = setInterval(function() {
					$('.status').text(parseInt(wanm.context.currentTime));
					wanm.position = wanm.context.currentTime;
				}, 500);
			});

			$('#vol').on("mouseup", wanm.setVol);
			wanm.setupFritz();

			$('#stop').on("click", function() {
				$('.status').text("stopped at "+wanm.context.currentTime);
				wanm.source.stop(0);
				wanm.position = wanm.context.currentTime;
				wanm.createSource();
				clearInterval(wanm.counting);
			})
		});
	},

	createSource : function() {
		var wanm = wearenotmachines.audio;
		wanm.source = wanm.context.createBufferSource();
		wanm.source.buffer = wanm.buffer;
		wanm.gain = wanm.context.createGain();
		wanm.source.connect(wanm.gain);
		wanm.quad = wanm.context.createBiquadFilter();
		wanm.quad.Q.value = 15;
		wanm.gain.connect(wanm.quad);
		wanm.quad.connect(wanm.context.destination);
	},

	setVol : function(e) {
		var wanm = wearenotmachines.audio;
		var control = $(e.target);
		wanm.gain.gain.linearRampToValueAtTime(control.val(), wanm.context.currentTime);	
	},

	setupFritz : function() {
		var wanm = wearenotmachines.audio;
		$('#fritz').removeAttr("disabled");
		$('#fritz').on("input", wanm.setFritz);

	},

	setFritz : function(e) {
		var wanm = wearenotmachines.audio;
		var control = $(e.target);
		var val = control.val();
		var min=40;
		var max = wanm.context.sampleRate/2;
		var octaves = Math.log(max/min)/Math.LN2;
		var multiplier = Math.pow(2, octaves * (val-1.0));
		wanm.quad.frequency.value = max*multiplier;
		console.log(wanm.quad.frequency.value);
	}

}
$(document).ready(function() {
	wearenotmachines.audio.init("/sounds/sarabande.mp3");
});