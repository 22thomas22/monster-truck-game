/**
 * Renderable component for tiny_ecs. draw paramater is a function to be drawn given the paramaters (ctx (a 2d drawing contex), drawParams (part of the component)), and drawParams which is passed into draw.
 */
var Renderable = function() {
    this.drawParams = null;
    this.draw = null;
};

Renderable.componentName = "Renderable";