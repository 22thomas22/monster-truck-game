var width = document.documentElement.clientWidth;
var height = document.documentElement.clientHeight;

var cnv = document.getElementById("Canvas");

cnv.width = width;
cnv.height = height;

var ctx = cnv.getContext("2d");

ctx.fillStyle = "rgb(0, 0, 255)";
ctx.strokeStyle = "#FF0000";
ctx.lineWidth = 5;

ctx.beginPath();
ctx.rect(70, 80, 20, 20);
ctx.stroke();
ctx.fill();
ctx.closePath();

ctx.font = "20px Arial";
ctx.fillText("test", 100, 100);





mousePressed = function() {
    console.log("mousePressed");


    if(mouseX > 70 && mouseY > 80 && mouseX < 90 && mouseY < 100) {
        if(cnv.mozRequestFullScreen) {
			cnv.mozRequestFullScreen();
		} else {
			cnv.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
		}
    }
};