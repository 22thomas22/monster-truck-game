var mouseMoved = function() {};

var mouseDragged = function() {};

var mousePressed = function() {};

var mouseReleased = function() {};

var mouseX = 0;
var mouseY = 0;

var mouseIsPressed = false;

document.addEventListener("mousemove", function(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;

    if(mouseIsPressed) {
        mouseDragged();
    } else {
        mouseMoved();
    }
});

document.addEventListener("mousedown", function(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;

    mouseIsPressed = true;

    mousePressed();
});

document.addEventListener("mouseup", function(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;

    mouseIsPressed = false;

    mouseReleased();
});
