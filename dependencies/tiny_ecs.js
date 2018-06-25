/*
The MIT License (MIT)

Copyright (c) 2014 Brandon Valosek

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

var nextId = 0;

//Entity {
var Entity = function() {
    this.id = nextId++;
    this.manager = null;
    this.components = [];
    this.tags = [];
};

Entity.prototype.reinit = function() {
    this.id = nextId++;
    this.manager = null;
    this.components.length = 0;
    this.tags.length = 0;
};

Entity.prototype.addComponent = function(component) {
    this.manager.addComponentForEntity(this, component);
    return this;
};

Entity.prototype.removeComponent = function(component) {
    this.manager.removeComponentForEntity(this, component);
    return this;
};

Entity.prototype.hasComponent = function(component) {
    return this.components.includes(component);
};

Entity.prototype.removeAllComponents = function() {
    return this.manager.removeAllComponentsForEntity(this);
};

Entity.prototype.hasAllComponents = function(components) {
    var hasComponents = true;
    
    for(var i = 0; i < components.length; i++) {
        hasComponents &= this.components.includes(components[i]);
    }
    
    return hasComponents;
};

Entity.prototype.hasTag = function(tag) {
    return this.tags.includes(tag);
};

Entity.prototype.addTag = function(tag) {
    this.manager.addTagForEntity(this, tag);
    return this;
};

Entity.prototype.removeTag = function(tag) {
    this.manager.removeTagForEntity(this, tag);
    return this;
};

Entity.prototype.trigger = function(eventName, option) {
    this.manager.trigger(eventName, this, option);
};

Entity.prototype.remove = function() {
    return this.manager.removeEntity(this);
};
//}

//Event {
var Event = function(name, callback) {
    this.name = name || "name";
    this.callback = callback || null;
    
    // Additional filters
    this.components = [];
    this.entity = null;
};

/**
 * @param {String} eventName
 * @param {{hasAllComponents:Function}} entity
 * @param {Object=} option
 * @return {Boolean} True if fired.
 */
Event.prototype.fire = function(eventName, entity, option) {
    //Name check
    if(eventName !== this.name) {
        return false;
    }
    
    //Component filters
    var comps = this.components;
    
    if(entity && entity.hasAllComponents && comps.length > 0) {
        if(!entity || !entity.hasAllComponents(comps)) {
            return false;
        }
    }
    
    //Entity filter
    if(this.entity !== null && this.entity !== entity) {
        return false;
    }
    
    // Made it
    this.callback(entity, option);
    return true;
};

/**
 * @param {Entity} entity The entity that the event has to match.
 * @return {Event} This object.
 */
Event.prototype.whereEntityIs = function(entity) {
    if(this.entity) {
        throw new Error("Cannot call whereEntity twice");
    }
    
    this.entity = entity;
    return this;
};

/**
 * @param {Function} T
 * @return {Event} This object.
 */
Event.prototype.whereComponentIs = function(component) {
    this.components.push(component);
    return this;
};

/**
 * @param {Array.<Function>} Components
 * @return {Event} This object.
 */
Event.prototype.whereComponentsAre = function(components) {
    this.components = this.components.concat(components);
    return this;
};
//}

//Messenger {
var Messenger = function() {
    this.eventGroups = {};
    this.fired = 0;
    this.handled = 0;
};

/**
 * @param {String} eventName
 * @param {Function} callback
 * @return {Event}
 */
Messenger.prototype.listenTo = function(eventName, callback) {
    if(!this.eventGroups[eventName]) {
        this.eventGroups[eventName] = [];
    }
    
    var event = new Event(eventName, callback);
    
    //Dump and chump
    this.eventGroups[eventName].push(event);
    return event;
};

/**
 * @param {String} eventName
 * @param {Object=} entity
 * @param {Option=} option
 */
Messenger.prototype.trigger = function(eventName, entity, option) {
    this.fired++;
    
    var events = this.eventGroups[eventName];
    
    if(!this.events) {
        return;
    }

    //Try all events
    for(var i = 0; i < events.length; i++) {
        var event = events[i];
        
        if(event.fire(eventName, entity, option)) {
            this.handled++;
        }
    }
};

/**
 * Reset stats (should be done in the primary loop).
 */
Messenger.prototype.resetCounters = function() {
    this.fired = 0;
    this.handled = 0;
};
//}

//ObjectPool {
/**
 * Minimize garbage collector thrashing by re-using existing objects instead of
 * creating new ones. Requires manually lifecycle management.
 * @constructor
 * @param {Function} T
 */
var ObjectPool = function(objectConstructor) {
    this.freeList = [];
    this.count = 0;
    this.objectConstructor = objectConstructor;
};

/**
 * Get a pooled object
 */
ObjectPool.prototype.aquire = function() {
    //Grow the list by 20%ish if we're out
    if(this.freeList.length <= 0) {
        this.expand(round(this.count * 0.2) + 1);
    }
    
    var item = this.freeList.pop();
    
    //We can provide explicit initing, otherwise re-call constructor (hackish)
    if(item.reinit) {
        item.reinit();
    } else {
        this.objectConstructor.call(item);
    }
    
    return item;
};

/**
 * Return an object back to the pool.
 */
ObjectPool.prototype.release = function(item) {
  this.freeList.push(item);
};

/**
 * @param {Number} Amount of new objects to allocate for this pool.
 */
ObjectPool.prototype.expand = function(count) {
    for(var i = 0; i < count; i++) {
        this.freeList.push(new this.objectConstructor());
    }
    
    this.count += count;
};

/**
 * @return {Number} Total amount of allocated objects (available and in-use).
 */
ObjectPool.prototype.totalSize = function() {
    return this.count;
};

/**
 * @return {Number} Total number of objects currently available.
 */
ObjectPool.prototype.totalFree = function(){
    return this.freeList.length;
};

/**
 * @return {Number} Total number of objects currently in-use.
 */
ObjectPool.prototype.totalUsed = function() {
    return this.count - this.freeList.length;
};

//}

//EntityManager {
var funcClass = (function(what) { return this[what]; })("Function");

var getName = function(func) {
    return func.componentName;
};

/**
 * Manage, create, and destroy entities. Can use methods to mutate entities
 * (tags, components) directly or via the facade on the Entity.
 * @param {Messenger} messenger
 * @constructor
 */
var EntityManager = function(messenger) {
    /**
    * Event messenger, injected
    * @type {Messenger}
    * @private
    */
    this.messenger = messenger;
    
    /**
    * Map of tags to the list of their entities.
    * @private
    */
    this.tags = {};
    
    /**
    * @type {Array.<Entity>}
    * @private
    */
    this.entities = [];
    
    /**
    * @type {Array.<Group>}
    * @private
    */
    this.groups = {};
    
    /**
    * Pool entities.
    * @private
    */
    this.entityPool = new ObjectPool(Entity);
    
    /**
    * Map of component names to their respective object pools.
    * @private
    */
    this.componentPools = {};
};

/**
 * Fired AFTER an entity has be created.
 * @event
 */
EntityManager.ENTITY_CREATED = "EntityManager#ENTITY_CREATED";

/**
 * Fired BEFORE an entity has been removed.
 * @event
 */
EntityManager.ENTITY_REMOVE = "EntityManager#ENTITY_REMOVE";

/**
 * Fired AFTER a component has been removed.
 * @event
 */
EntityManager.COMPONENT_ADDED = "EntityManager#COMPONENT_ADDED";

/**
 * Fired BEFORE a component has been removed.
 * @event
 */
EntityManager.COMPONENT_REMOVE = "EntityManager#COMPONENT_REMOVE";

/**
 * @param {Function} Component
 * @return {String} Component Name
 * @private
 */
var getComponentPropertyName = function(component) {
    var name = getName(component);
    return name.toLowerCase();
};

/**
 * @param {Array.<Function>} Components
 * @return {String}
 * @private
 */
var groupKey = function(components) {
    var names = [];
    
    for(var i = 0; i < components.length; i++) {
        names.push(getName(components[i]));
    }

    return names.map(function(x) {
        return x.toLowerCase();
    }).sort().join('-');
};

/**
 * Used for indexing our component groups.
 * @constructor
 * @param {Array.<Function>} Components
 * @param {Array<Entity>} entities
 */
var Group = function(components, entities) {
    this.components = components || [];
    this.entities = entities || [];
};

/**
 * Get a new entity.
 * @return {Entity}
 */
EntityManager.prototype.createEntity = function() {
    var entity = this.entityPool.aquire();
    
    this.entities.push(entity);
    entity.manager = this;
    this.trigger(EntityManager.ENTITY_CREATED, entity);
    
    return entity;
};

/**
 * Cleanly remove entities based on tag. Avoids loop issues.
 * @param {String} tag
 */
EntityManager.prototype.removeEntitiesByTag = function(tag) {
    var entities = this.tags[tag];
    
    if(!entities) {
        return;
    }
    
    for(var x = entities.length - 1; x >= 0; x--) {
        var entity = entities[x];
        entity.remove();
    }
};

/**
 * Dump all entities out of the manager. Avoids loop issues.
 */
EntityManager.prototype.removeAllEntities = function() {
    for(var x = this.entities.length - 1; x >= 0; x--) {
        this.entities[x].remove();
    }
};

/**
 * Drop an entity. Returns it to the pool and fires all events for removing
 * components as well.
 * @param {Entity} entity
 */
EntityManager.prototype.removeEntity = function(entity) {
    var index = this.entities.indexOf(entity);
    
    if(index < 0) {
        throw new Error("Tried to remove entity not in list");
    }
    
    this.removeAllComponentsForEntity(entity);
    
    //Remove from entity list
    this.trigger(EntityManager.ENTITY_REMOVE, entity);
    this.entities.splice(index, 1);
    
    //Remove entity from any tag groups and clear the on-entity ref
    entity.tags.length = 0;
    
    for(var tag in this.tags) {
        var entities = this.tags[tag];
        var i = entities.indexOf(entity);
        
        if(i >= 0) {
            entities.splice(i, 1);
            break;
        }
    }
    
    //Prevent any acecss and free
    entity.manager = null;
    this.entityPool.release(entity);
};

/**
 * @param {Entity} entity
 * @param {String} tag
 */
EntityManager.prototype.addTagForEntity = function(entity, tag) {
    var entities = this.tags[tag];
    
    if(!entities) {
        entities = [];
        this.tags[tag] = [];
    }
    
    //Don't add if already there
    if(entities.includes(entity)) {
        return;
    }
    
    //Add to our tag index AND the list on the entity
    entities.push(entity);
    entity.tags.push(tag);
};

/**
 * @param {Entity} entity
 * @param {String} tag
 */
EntityManager.prototype.removeTagForEntity = function(entity, tag) {
    var entities = this.tags[tag];
    
    if(!entities) {
        return;
    }
    
    var index = entities.indexOf(entity);
    
    if(index < 0) {
        return;
    }
    
    //Remove from our index AND the list on the entity
    entities.splice(index, 1);
    entity.tags.splice(entity.tags.indexOf(tag), 1);
};

/**
 * @param {Entity} entity
 * @param {Function} Component
 */
EntityManager.prototype.addComponentForEntity = function(entity, component) {
    if(entity.components.includes(component)) {
        return;
    }
    
    entity.components.push(component);
    
    //Create the reference on the entity to this (aquired) component
    var cName = getComponentPropertyName(component);
    var cPool = this.componentPools[cName];
    
    if(!cPool) {
        cPool = this.componentPools[cName] = new ObjectPool(component);
    }
    
    var component = cPool.aquire();
    entity[cName] = component;

    // Check each indexed group to see if we need to add this entity to the list
    for(var groupName in this.groups) {
        var group = this.groups[groupName];
        
        // Only add this entity to a group index if this component is in the group,
        // this entity has all the components of the group, and its not already in
        // the index.
        if(!group.components.includes(component)) {
            continue;
        } 
        
        if(!entity.hasAllComponents(group.components)) {
            continue;
        }
        
        if(group.entities.includes(entity)) {
            continue;
        }
    
        group.entities.push(entity);
    }

    this.trigger(EntityManager.COMPONENT_ADDED, entity, component);
};

/**
 * Drop all components on an entity. Avoids loop issues.
 * @param {Entity} entity
 */
EntityManager.prototype.removeAllComponentsForEntity = function(entity) {
    var components = entity.components;
    
    for(var i = components.length - 1; i >= 0; i--) {
        entity.removeComponent(components[i]);
    }
};

/**
 * @param {Entity} entity
 * @param {Function} Component
 */
EntityManager.prototype.removeComponentForEntity = function(entity, component) {
    var componentIndex = entity.components.indexOf(component);
  
    if(componentIndex < 0) {
        return;
    }
    
    this.trigger(EntityManager.COMPONENT_REMOVE, entity, component);
    
    //Check each indexed group to see if we need to remove it
    for(var groupName in this.groups) {
        var group = this.groups[groupName];
        
        if(!group.components.includes(component)) {
            continue;
        }
        
        if(!entity.hasAllComponents(group.components)) {
            continue;
        }

        var loc = group.entities.indexOf(entity);
        
        if(loc >= 0) {
            group.entities.splice(loc, 1);
        }
    }
    
    // Remove T listing on entity and property ref, then free the component.
    var propName = getComponentPropertyName(component);
    entity.components.splice(componentIndex, 1);
    
    var component = entity[propName];
    delete entity[propName];
    
    this.componentPools[propName].release(component);
};

/**
 * Get a list of entities that have a certain set of components.
 * @param {Array.<Function>} Components
 * @return {Array.<Entity>}
 */
EntityManager.prototype.queryComponents = function(components) {
    var group = this.groups[groupKey(components)];
    
    if(!group) {
        group = this.indexGroup(components);
    }
    
    return group.entities;
};

/**
 * Get a list of entities that all have a certain tag.
 * @param {String} tag
 * @return {Array.<Entity>}
 */
EntityManager.prototype.queryTag = function(tag) {
    var entities = this.tags[tag];
    
    if(entities === undefined) {
        entities = this.tags[tag] = [];
    }
    
    return entities;
};

/**
 * @return {Number} Total number of entities.
 */
EntityManager.prototype.count = function() {
    return this.entities.length;
};

/**
 * Get information about the object pools of the entities and the various
 * components. NOT optimized or garbage collector friendly.
 * @return {Object}
 */
EntityManager.prototype.poolStats = function() {
    var stats = {};
    var e = this.entityPool;
    
    stats.entity = {
        used: this.entityPool.totalUsed(),
        size: this.entityPool.count
    };
    
    for(var cName in this.componentPools) {
        var pool = this.componentPools[cName];
        
        stats[cName] = {
            used: pool.totalUsed(),
            size: pool.count
        };
    }
    
    return stats;
};

/**
 * Create an index of entities with a set of components.
 * @param {Array.<Function>} Components
 * @private
 */
EntityManager.prototype.indexGroup = function(components) {
    var key = groupKey(components);
    
    if(this.groups[key]) {
        return;
    }
    
    var group = this.groups[key] = new Group(components);

    for(var n = 0; n < this.entities.length; n++) {
        var entity = this.entities[n];
        
        if(entity.hasAllComponents(components)) {
            group.entities.push(entity);
        }
    }
    
    return group;
};

/**
 * Trigger the messenger if we have one.
 * @param {String} event
 * @param {Object=} a
 * @param {Object=} b
 */
EntityManager.prototype.trigger = function(event, a, b) {
    if(this.messenger) {
        this.messenger.trigger(event, a, b);
    }
};

//}