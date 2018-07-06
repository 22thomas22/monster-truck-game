var width = document.documentElement.clientWidth;
var height = document.documentElement.clientHeight;

var cnv = document.getElementById("Canvas");

cnv.width = width;
cnv.height = height;

var ctx = cnv.getContext("2d");

var entities = new EntityManager();

var world = new planck.World(planck.Vec2(0, 15 / box2dscale));

var worldEntity = entities.createEntity();
worldEntity.addComponent(World);
worldEntity.world.world = world;

var frameCount = 0;

function createCar(x, y, world) {
    var car = entities.createEntity();
    var wheel1 = entities.createEntity();
    var wheel2 = entities.createEntity();

    car.addComponent(Renderable);
    car.addComponent(Physical);

    wheel1.addComponent(Physical);
    wheel2.addComponent(Physical);

    var fixtureDef = {
        density: 5,
        friction: 0.9
    };

    var body = createPolygon(world, x, y + 255, 
        [[-15, -80],
        [20, -80],
        [35, -50],
        [-20, -50]]);
    
    body.createFixture(planck.Box(90 / box2dscale, 9 / box2dscale, planck.Vec2(-9 / box2dscale, -42 / box2dscale)), fixtureDef);
    body.createFixture(planck.Box(32 / box2dscale, 9 / box2dscale, planck.Vec2(-67 / box2dscale, -24 / box2dscale)), fixtureDef);
    body.createFixture(planck.Box(23 / box2dscale, 9 / box2dscale, planck.Vec2(58 / box2dscale, -24 / box2dscale)), fixtureDef);

    fixtureDef = {
        density: 60,
        friction: 0.9
    };

    body.createFixture(planck.Box(35 / box2dscale, 9 / box2dscale, planck.Vec2(0, -24 / box2dscale)), fixtureDef);
    body.createFixture(planck.Box(6 / box2dscale, 6 / box2dscale, planck.Vec2(87 / box2dscale, -24 / box2dscale)), fixtureDef);
    
    body.setUserData({
        isCar: true
    });
    
    fixtureDef = {
        density: 1,
        friction: 0.6
    };
    
    bodyDef.type = "dynamic";

    var wheelBack = createCircle(world, x - 60, y + 270, 35);
    var wheelFront = createCircle(world, x + 60, y + 270, 35);

    wheel1.physical.body = wheelBack;
    wheel2.physical.body = wheelFront;

    var hertz = 4;
    var zeta = 0.7;
    var torque = 500;

    var springBack = world.createJoint(planck.WheelJoint({
        motorSpeed : 0.0,
        maxMotorTorque: torque,
        enableMotor: false,
        frequencyHz: hertz,
        dampingRatio: zeta
    }, body, wheelBack, wheelBack.getPosition(), planck.Vec2(0, 1)));
    
    var springFront = world.createJoint(planck.WheelJoint({
        motorSpeed : 0.0,
        maxMotorTorque : torque,
        enableMotor : false,
        frequencyHz : hertz,
        dampingRatio : zeta
    }, body, wheelFront, wheelFront.getPosition(), planck.Vec2(0, 1)));
    
    fixtureDef = {
        density: 1,
        friction: 5
    };

    car.physical.body = body;

    car.renderable.draw = function(ctx, params) {};

    car.renderable.drawParams = body;

    return [car, wheel1, wheel2];
}

var car = createCar(100, 100, world);

bodyDef.type = "static";
createLine(world, 10, 600, 1000, 600);

function draw() {
    ctx.save();
    ctx.resetTransform();
    ctx.beginPath();
    ctx.clearRect(0, 0, width, height);
    ctx.closePath();
    ctx.restore();

    ctx.lineCap = "round";
    ctx.lineWidth = 2;
    debugDraw(ctx, world, box2dscale, true);

    render(entities, ctx);
    window.requestAnimationFrame(draw);

    frameCount++;
}

window.requestAnimationFrame(draw);

var stepSpeed = 1 / 30;

setInterval(function() {
    updateWorlds(entities, stepSpeed);
}, 1 / 30);