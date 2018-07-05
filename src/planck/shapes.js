/**
 * Creates a box body starting at the up-left corner (similar to the rect function). Accounts for box2dscale. Set bodyDef and fixtureDef for changing behavior.
 * 
 * @param {*} world a planck world to create it in
 * @param {*} x up-left corner x
 * @param {*} y up-left corner y
 * @param {*} w total width
 * @param {*} h total height
 * @returns {*} the planck body
 */
function createBoxRect(world, x, y, w, h) {
    var body = world.createBody(bodyDef);
    var fixture = body.createFixture(planck.Box(w / 2 / box2dscale, h / 2 / box2dscale), fixtureDef);

    body.setPosition(planck.Vec2((x + w / 2) / box2dscale, (y + h / 2) / box2dscale));

    return body;
}

/**
 * Creates a box body starting at the middle. Accounts for box2dscale. Set bodyDef and fixtureDef for changing behavior.
 * 
 * @param {*} world a planck world to create it in
 * @param {*} x middle x
 * @param {*} y middle y
 * @param {*} w total width
 * @param {*} h total height
 * @returns {*} the planck body
 */
function createBox(world, x, y, w, h) {
    var body = world.createBody(bodyDef);
    var fixture = body.createFixture(planck.Box(w / 2 / box2dscale, h / 2 / box2dscale), fixtureDef);

    body.setPosition(planck.Vec2(x / box2dscale, y / box2dscale));

    return body;
}

/**
 * Creates a circle planck body for a circle, starting at the middle, with radius r. Accounts for box2dscale. Set bodyDef and fixtureDef for changing behavior.
 * 
 * @param {*} world a planck world to create it in
 * @param {*} x middle x
 * @param {*} y middle y
 * @param {*} r radius
 * @returns {*} the planck body
 */
function createCircle(world, x, y, r) {
    var body = world.createBody(bodyDef);
    var fixture = body.createFixture(planck.Circle(r / box2dscale), fixtureDef);

    body.setPosition(planck.Vec2(x / box2dscale, y / box2dscale));

    return body;
}

/**
 * Creates a polygon planck body. uses array points for points ([[x1, y1], [x2, y2], ...]). Set bodyDef and fixtureDef for changing behavior. Accounts for box2dscale.
 * 
 * @param {*} world a planck world to create it in
 * @param {*} x shape x
 * @param {*} y shape y
 * @param {*} points polygon points [[x1, y1], [x2, y2], ...]
 * @returns {*} the planck polygon body
 */
function createPolygon(world, x, y, points) {
    var body = world.createBody(bodyDef);
    var vectors = points.map(point => {
        return planck.Vec2(point[0] / box2dscale, point[1] / box2dscale);
    });

    var fixture = body.createFixture(planck.Polygon(vectors), fixtureDef);

    body.setPosition(planck.Vec2(x / box2dscale, y / box2dscale));

    return body;
}

/**
 * Creates a edge in planck. Accounts for box2dscale.
 * 
 * @param {*} world a planck world to create it in
 * @param {*} x1 first coordinate pair x
 * @param {*} y1 first coordinate pair y
 * @param {*} x2 second coordinate pair x
 * @param {*} y2 second coordinate pair y
 * @returns {*} the planck edge body
 */
function createLine(world, x1, y1, x2, y2) {
    var body = world.createBody(bodyDef);
    var fixture = body.createFixture(planck.Edge(planck.Vec2(x1 / box2dscale, y1 / box2dscale), planck.Vec2(x2 / box2dscale, y2 / box2dscale)), fixtureDef);

    return body;
}