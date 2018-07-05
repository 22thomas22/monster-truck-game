function render(entities, ctx) {
    entities.queryComponents([Renderable]).forEach(renderable => {
        renderable.renderable.draw(ctx, renderable.renderable.drawParams);
    });
}