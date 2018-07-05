function updateWorlds(entities, stepSize) {
    entities.queryComponents([World]).forEach(world => {
        world.world.world.step(stepSize);
        world.world.world.clearForces();
    });
}