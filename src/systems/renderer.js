function draw(ctx) {
    var toDraw = entities.queryComponent(Renderable);

    for(var i = 0; i < toDraw.length; i++) {
        toDraw.renderable.draw(ctx, toDraw.renderable.drawParams);
    }
}