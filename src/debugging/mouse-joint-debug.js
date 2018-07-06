var debugMousePressed = function(tx, ty) {
    if(mouseJoint) {
        world.destroyJoint(mouseJoint);
        mouseJoint = null;
    }
    
    if(targetBody) {
        return;
    }
    
    var point = Vector((mouseX - tx) / SCALE, (mouseY - ty) / SCALE);
    var body = findBody(point);
    
    if(!body) {
        return;
    }
    
    var mouseGround = world.createBody();
    mouseJoint = planck.MouseJoint({maxForce: maxJointForce}, mouseGround, body, Vector(point));
    world.createJoint(mouseJoint);
    
};

var debugMouseDragged = function(tx, ty) {
    if(mouseJoint) {
        mouseJoint.setTarget(Vector((mouseX - tx) / SCALE, (mouseY - ty) / SCALE));
    }
};

var debugMouseReleased = function() {
    if(mouseJoint) {
        world.destroyJoint(mouseJoint);
        mouseJoint = null;
    }
};