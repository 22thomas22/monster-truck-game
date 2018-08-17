var targetBody;
var mouseJoint;
var maxJointForce = 500;

function findBody(point) {
    var body;
    var aabb = planck.AABB(point, point);
    
    world.queryAABB(aabb, function(fixture) {
        if(body) {
            return;
        }
        
        if(!fixture.getBody().isDynamic() || !fixture.testPoint(point) || fixture.isSensor()) {
            return;
        }
        
        body = fixture.getBody();
        return true;
    });
    
    return body;
}

function debugMousePressed(world, mouseX, mouseY, tx, ty, box2dscale) {
    if(mouseJoint) {
        world.destroyJoint(mouseJoint);
        mouseJoint = null;
    }
    
    if(targetBody) {
        return;
    }
    
    var point = planck.Vec2((mouseX - tx) / box2dscale, (mouseY - ty) / box2dscale);
    var body = findBody(point);
    
    if(!body) {
        return;
    }
    
    var mouseGround = world.createBody();
    mouseJoint = planck.MouseJoint({maxForce: maxJointForce}, mouseGround, body, planck.Vec2(point));
    world.createJoint(mouseJoint);
    
}

function debugMouseDragged(world, mouseX, mouseY, tx, ty, box2dscale) {
    if(mouseJoint) {
        mouseJoint.setTarget(planck.Vec2((mouseX - tx) / box2dscale, (mouseY - ty) / box2dscale));
    }
}

function debugMouseReleased(world) {
    if(mouseJoint) {
        world.destroyJoint(mouseJoint);
        mouseJoint = null;
    }
};