window.addEventListener("resize", function() {
	console.log("resize");

	width = document.documentElement.clientWidth;
	height = document.documentElement.clientHeight;
	
	cnv.width = width;
	cnv.height = height;
});

