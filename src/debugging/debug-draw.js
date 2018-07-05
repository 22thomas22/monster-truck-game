/**
 * Renders a planck world with certain colors representing states.
 * @param {*} world the planck world to render
 * @param {*} SCALE the scale to render at (set to 1 if not using)
 * @param {*} drawJoints draw joints?
 */

var debugDraw = function(ctx, world, SCALE, drawJoints) {
    //based on b2World.cpp
    for(var b = world.getBodyList(); b !== null; b = b.getNext()) {
        var data = b.getUserData();
		
		if(data && data.noDraw) {
			continue;
		}
        
        ctx.save();
        ctx.translate(b.getPosition().x * SCALE, b.getPosition().y * SCALE);

        ctx.rotate(b.getAngle());
        
        ctx.beginPath();
        if(!b.isActive()) {
            ctx.fillStyle = "rgba(130, 130, 75, 0.5)";
            ctx.strokeStyle = "rgba(130, 130, 75, 0.25)";
        } else if(b.getType() === "static") {
            ctx.fillStyle = "rgba(130, 230, 130, 0.5)";
            ctx.strokeStyle = "rgba(130, 230, 0.25)";
        } else if(b.getType() === "kinematic") {
            ctx.fillStyle = "rgba(130, 130, 230, 0.5)";
            ctx.strokeStyle = "rgba(130, 130, 230, 0.25)";
        } else if(!b.isAwake()) {
            ctx.fillStyle = "rgba(150, 150, 150, 0.5)";
            ctx.strokeStyle = "rgba(150, 150, 150, 0.25)";
        } else {
            ctx.fillStyle = "rgba(230, 180, 180, 0.5)";
            ctx.strokeStyle = "rgba(230, 180, 180, 0.25)";
        }
        
        for(var f = b.getFixtureList(); f !== null; f = f.getNext()) {
            var shape = f.m_shape;
            
            switch(shape.m_type) {
                case "polygon":
					ctx.moveTo(shape.m_vertices[0].x * SCALE, shape.m_vertices[0].y * SCALE);
                    
                    for(var i = 1; i < shape.m_vertices.length; i++) {
                        ctx.lineTo(shape.m_vertices[i].x * SCALE, shape.m_vertices[i].y * SCALE);
                    }
                    
					ctx.fill();
					ctx.stroke();
					
                    ctx.closePath();
                break;
                case "circle":
                    ctx.save();
                    ctx.translate(shape.m_p.x * SCALE, shape.m_p.y * SCALE);
                    ctx.arc(0, 0, shape.m_radius * SCALE, 0, Math.PI * 2);
                    ctx.moveTo(0, 0);
					ctx.lineTo(shape.m_radius * SCALE, 0);
					
					ctx.fill();
					ctx.stroke();
					
                    ctx.restore();
					ctx.closePath();
                break;
                case "edge":
                    ctx.moveTo(shape.m_vertex1.x * SCALE, shape.m_vertex1.y * SCALE);
					ctx.lineTo(shape.m_vertex2.x * SCALE, shape.m_vertex2.y * SCALE);
					
					ctx.fill();
					ctx.stroke();
					
					ctx.closePath();
                break;
            }
        }
        
        ctx.restore();
    }
    
    if(drawJoints) {
        ctx.strokeStyle = "rgb(120, 200, 200)";
		
        for(var j = world.getJointList(); j !== null; j = j.getNext()) {
            var xf1 = j.getBodyA().getTransform();
            var xf2 = j.getBodyB().getTransform();
            
            var x1 = xf1.p;
            var x2 = xf2.p;
            
            var p1 = j.getAnchorA();
            var p2 = j.getAnchorB();
            
            //debug(j.getType());
            switch(j.getType()) {
                case "distance-joint":
                    ctx.moveTo(p1.x * SCALE, p1.y * SCALE);
					ctx.lineTo(p2.x * SCALE, p2.y * SCALE);
                break;
                case "pulley-joint":
                    var s1 = j.getGroundAnchorA();
                    var s2 = j.getGroundAnchorB();
                    
                    ctx.moveTo(s1.x * SCALE, s1.y * SCALE);
					ctx.lineTo(p1.x * SCALE, p1.y * SCALE);
					
                    ctx.moveTo(s2.x * SCALE, s2.y * SCALE);
					ctx.lineTo(p2.x * SCALE, p2.y * SCALE);
					
                    ctx.moveTo(s1.x * SCALE, s1.y * SCALE);
					ctx.lineTo(s2.x * SCALE, s2.y * SCALE);
                break;
                case "mouse-joint":
                    //do nothing
                break;
                default:
                    ctx.moveTo(x1.x * SCALE, x1.y * SCALE);
					ctx.lineTo(p1.x * SCALE, p1.y * SCALE);
					
                    ctx.moveTo(p1.x * SCALE, p1.y * SCALE);
					ctx.lineTo(p2.x * SCALE, p2.y * SCALE);
					
                    ctx.moveTo(x2.x * SCALE, x2.y * SCALE);
					ctx.lineTo(p2.x * SCALE, p2.y * SCALE); 
                break;
            }
        }
    }
};