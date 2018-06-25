function draw() {
    var toDraw = entities.queryComponent(Renderable);

    for(var i = 0; i < toDraw.length; i++) {
        
    }

    window.requestAnimationFrame(draw);
}

window.requestAnimationFrame(draw);