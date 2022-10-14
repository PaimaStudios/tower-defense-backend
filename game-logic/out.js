"use strict";
(() => {
  // ../../paima-engine/paima-prando/lib/index.js
  var Prando = class {
    _seed;
    _value;
    seed;
    iteration;
    MIN = -2147483648;
    MAX = 2147483647;
    constructor(seed) {
      this._value = NaN;
      this._seed = seed;
      this.iteration = 0;
      if (typeof seed === "string")
        this.seed = this.hashCode(seed);
      else if (typeof seed === "number")
        this.seed = this.getSafeSeed(seed);
      else
        this.seed = this.getSafeSeed(this.MIN + Math.floor((this.MAX - this.MIN) * Math.random()));
      this.reset();
    }
    next(min = 0, pseudoMax = 1) {
      this.recalculate();
      return this.map(this._value, this.MIN, this.MAX, min, pseudoMax);
    }
    nextInt(min = 10, max = 100) {
      this.recalculate();
      return Math.floor(this.map(this._value, this.MIN, this.MAX, min, max + 1));
    }
    nextString(length = 16, chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789") {
      var str = "";
      while (str.length < length) {
        str += this.nextChar(chars);
      }
      return str;
    }
    nextChar(chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789") {
      return chars.substr(this.nextInt(0, chars.length - 1), 1);
    }
    nextArrayItem(array) {
      return array[this.nextInt(0, array.length - 1)];
    }
    nextBoolean() {
      this.recalculate();
      return this._value > 0.5;
    }
    skip(iterations = 1) {
      while (iterations-- > 0) {
        this.recalculate();
      }
    }
    reset() {
      this.iteration = 0;
      this._value = this.seed;
    }
    recalculate() {
      this.iteration++;
      this._value = this.xorshift(this._value);
    }
    xorshift(value) {
      value ^= value << 13;
      value ^= value >> 17;
      value ^= value << 5;
      return value;
    }
    map(val, minFrom, maxFrom, minTo, maxTo) {
      return (val - minFrom) / (maxFrom - minFrom) * (maxTo - minTo) + minTo;
    }
    hashCode(str) {
      var hash = 0;
      if (str) {
        var l = str.length;
        for (var i = 0; i < l; i++) {
          hash = (hash << 5) - hash + str.charCodeAt(i);
          hash |= 0;
          hash = this.xorshift(hash);
        }
      }
      return this.getSafeSeed(hash);
    }
    getSafeSeed(seed) {
      if (seed === 0)
        return 1;
      return seed;
    }
  };
  var lib_default = Prando;

  // ../../paima-engine/executors/lib/round_executor.js
  var roundExecutor = {
    initialize: (matchEnvironment, userStates, userInputs, randomnessGenerator, processTick2) => {
      return {
        currentTick: 1,
        currentState: userStates,
        tick() {
          const event = processTick2(matchEnvironment, this.currentState, userInputs, this.currentTick, randomnessGenerator);
          this.currentTick++;
          return event;
        },
        endState() {
          for (let move2 of userInputs)
            this.tick();
          return this.currentState;
        }
      };
    }
  };
  var round_executor_default = roundExecutor;

  // src/index.ts
  function processTick(matchconf, matchState, moves, currentTick, randomnessGenerator) {
    let randomness = 0;
    for (let tick of Array(currentTick))
      randomness = randomnessGenerator.next();
    if (currentTick === 1) {
      const events = structuralTick(matchState, moves);
      applyEvents(matchState, events, currentTick, randomnessGenerator);
      return events;
    } else {
      const events = ticksFromMatchState(matchState, currentTick, randomnessGenerator) || [];
      return events;
    }
  }
  function structuralTick(matchState, moves) {
    const unitCount = getUnitCount(matchState);
    const accumulator = [[], unitCount];
    const structuralTick2 = moves.reduce((acc, item) => {
      const newEvent = structureEvent(item, acc[1]);
      const newList = [...acc[0], newEvent];
      const newCount = acc[1] + 1;
      return [newList, newCount];
    }, accumulator);
    return structuralTick2[0];
  }
  function structureEvent(m, count) {
    if (m.action === "build")
      return {
        event: "build",
        x: m.x,
        y: m.y,
        structure: m.structure,
        id: count
      };
    else if (m.action === "repair")
      return {
        event: "repair",
        x: m.x,
        y: m.y
      };
    else if (m.action === "upgrade")
      return {
        event: "upgrade",
        x: m.x,
        y: m.y,
        path: 0
      };
    else if (m.action === "destroy")
      return {
        event: "destroy",
        x: m.x,
        y: m.y
      };
    else
      return {
        event: "destroy",
        x: 0,
        y: 0
      };
  }
  function applyEvents(m, events, currentTick, rng) {
    for (let event of events) {
      const faction = determineFactionFromEvent(event);
      switch (event.event) {
        case "build":
          setStructureFromEvent(m, event, faction, event.id);
          const tile = buildTileFromEvent(event, faction, event.id);
          m.contents[event.y][event.x] = tile;
          break;
        case "repair":
          const repairStructureID = m.contents[event.y][event.x].id;
          if (faction === "attacker") {
            m.attackerGold -= 10;
            applyCryptRepair(m.actors.crypts[repairStructureID]);
          }
          if (faction === "defender") {
            m.defenderGold -= 10;
            applyTowerRepair(m.actors.towers[repairStructureID]);
          }
          break;
        case "upgrade":
          const upgradeStructureID = m.contents[event.y][event.x].id;
          if (faction === "attacker") {
            m.attackerGold -= 20;
            applyUpgrade(m.actors.crypts[upgradeStructureID]);
          }
          if (faction === "defender") {
            m.defenderGold -= 20;
            applyUpgrade(m.actors.towers[upgradeStructureID]);
          }
          break;
        case "destroy":
          if (faction === "attacker") {
            m.contents[event.y][event.x] = { type: "attacker-open" };
            m.attackerGold += 20;
          } else if (faction === "defender") {
            m.contents[event.y][event.x] = { type: "defender-open" };
            m.defenderGold += 20;
          }
          break;
        case "spawn":
          const spawnPath = m.contents[event.unitY][event.unitX];
          spawnPath.units = [...spawnPath.units, event.actorID];
          const spawnedUnit = {
            type: "attacker-unit",
            subType: event.unitType,
            id: event.actorID,
            health: event.unitHealth,
            status: null,
            previousCoordinates: null,
            coordinates: { x: event.unitX, y: event.unitY },
            nextCoordinates: null,
            moving: false,
            movementCompletion: 0
          };
          m.actors.units[event.actorID] = spawnedUnit;
          m.actors.crypts[event.cryptID].spawned = [...m.actors.crypts[event.cryptID].spawned, event.actorID];
          break;
        case "movement":
          const unitMoving = m.actors.units[event.actorID];
          if (event.completion >= 100) {
            unitMoving.previousCoordinates = unitMoving.coordinates;
            unitMoving.coordinates = { x: event.nextX, y: event.nextY };
            unitMoving.nextCoordinates = findDestination(m, unitMoving, rng) || { x: 0, y: 0 };
            unitMoving.movementCompletion = 0;
            unitMoving.moving = true;
            const movementPath = m.contents[event.unitY][event.unitX];
            movementPath.units = movementPath.units.filter((u) => u !== unitMoving.id);
            const newpath = m.contents[event.nextY][event.nextX];
            if (newpath.type === "path")
              newpath.units = [...newpath.units, event.actorID];
          } else
            unitMoving.movementCompletion = event.completion;
          break;
        case "damage":
          const damageEvent = event;
          if (event.targetID === 0) {
            m.defenderBase.health--;
          } else {
            const damagedUnit = faction === "attacker" ? m.actors.towers[damageEvent.targetID] : m.actors.units[damageEvent.targetID];
            if (damagedUnit && damageEvent.damageType === "neutral")
              damagedUnit.health = damagedUnit.health - event.damageAmount;
          }
          break;
        case "actor-deleted":
          console.log(event, "deletion event");
          const deleteEvent = event;
          const unitToDelete = event.faction === "attacker" ? m.actors.units[deleteEvent.id] : m.actors.towers[deleteEvent.id];
          if (!unitToDelete)
            break;
          else {
            const tileToWipe = m.contents[unitToDelete.coordinates.y][unitToDelete.coordinates.x];
            console.log(tileToWipe, "tile to wipe");
            if (tileToWipe.type === "path")
              tileToWipe.units = tileToWipe.units.filter((u) => u !== deleteEvent.id);
            else if (tileToWipe.type === "defender-structure")
              m.contents[unitToDelete.coordinates.y][unitToDelete.coordinates.x] = { type: "defender-open" };
            if (event.faction === "attacker")
              delete m.actors.units[deleteEvent.id];
            else
              delete m.actors.towers[deleteEvent.id];
            break;
          }
        case "defender-base-update":
          m.defenderBase.health += 25;
          break;
        case "status-apply":
          m.actors.units[event.targetID].status = {
            statusType: event.statusType,
            statusCaughtAt: currentTick,
            statusAmount: event.statusAmount,
            statusDuration: event.statusDuration
          };
          break;
        case "status-remove":
          m.actors.units[event.id].status = null;
          break;
      }
    }
  }
  function determineFactionFromEvent(event) {
    if ("x" in event && event.x > 12)
      return "attacker";
    if ("x" in event && event.x <= 12)
      return "defender";
    if ("faction" in event)
      return event.faction;
    else
      return null;
  }
  function setStructureFromEvent(m, event, faction, id) {
    if (faction === "attacker") {
      const unit = {
        type: "attacker-structure",
        "id": id,
        "structure": event.structure,
        "health": 100,
        "path-1-upgrades": 0,
        "path-2-upgrades": 0,
        coordinates: { x: event.x, y: event.y },
        builtOnRound: m.currentRound,
        spawned: []
      };
      m.actors.crypts[unit.id] = unit;
    } else {
      const unit = {
        type: "defender-structure",
        "id": id,
        "structure": event.structure,
        "health": 100,
        "path-1-upgrades": 0,
        "path-2-upgrades": 0,
        coordinates: { x: event.x, y: event.y }
      };
      m.actors.towers[unit.id] = unit;
    }
  }
  function buildTileFromEvent(event, faction, id) {
    if (faction === "attacker")
      return {
        type: "attacker-structure",
        id
      };
    else
      return {
        type: "defender-structure",
        id
      };
  }
  function applyTowerRepair(tower) {
    tower.health++;
  }
  function applyCryptRepair(crypt) {
    crypt.spawned = crypt.spawned.slice(1);
  }
  function applyUpgrade(structure) {
    structure["path-1-upgrades"]++;
  }
  function ticksFromMatchState(m, currentTick, rng) {
    if (m.defenderBase.health <= 0)
      return null;
    else {
      const spawn2 = spawnEvents(m, currentTick, rng);
      const movement = movementEvents(m, currentTick, rng);
      const towerAttacks = towerAttackEvents(m, currentTick, rng);
      const status = statusEvents(m, currentTick, rng);
      const unitAttacks = unitAttackEvents(m, currentTick, rng);
      return [...spawn2, ...movement, ...towerAttacks, ...unitAttacks, ...status, ...computeGoldRewards(m)];
    }
  }
  function spawnEvents(m, currentTick, rng) {
    const crypts = Object.keys(m.actors.crypts).map((index) => m.actors.crypts[parseInt(index)]);
    let unitCount = getUnitCount(m);
    const events = crypts.map((s) => {
      const ss = s;
      const { spawnCapacity, spawnRate } = getCryptStats(ss.structure);
      const hasCapacity = ss.spawned.length < spawnCapacity;
      const aboutTime = (currentTick - 2) % spawnRate === 0;
      const stillNew = ss.builtOnRound + 3 > m.currentRound;
      if (hasCapacity && aboutTime && stillNew) {
        unitCount++;
        const unitType = ss.structure.replace("-crypt", "");
        const newUnit = spawn(m, ss.id, unitCount, ss.coordinates, unitType, rng);
        applyEvents(m, [newUnit], currentTick, rng);
        return newUnit;
      } else
        return null;
    });
    const eventTypeGuard = (e) => !!e;
    return events.filter(eventTypeGuard);
  }
  function getUnitCount(m) {
    const towerCount = Object.keys(m.actors.towers).length;
    const cryptCount = Object.keys(m.actors.crypts).length;
    const attackerCount = Object.keys(m.actors.units).length;
    return 2 + towerCount + cryptCount + attackerCount;
  }
  function movementEvents(m, currentTick, randomnessGenerator) {
    const attackers = Object.keys(m.actors.units).map((index) => m.actors.units[parseInt(index)]);
    const events = attackers.map((a) => {
      const busyAttacking = a.subType === "macaw" && findClosebyTowers(m, a.coordinates, 1).length > 0;
      if (!busyAttacking) {
        const nextCoords = findDestination(m, a, randomnessGenerator);
        if (!nextCoords)
          return null;
        else {
          const event = move(a, nextCoords);
          applyEvents(m, [event], currentTick, randomnessGenerator);
          return event;
        }
      } else
        return null;
    });
    const eventTypeGuard = (e) => !!e;
    return events.filter(eventTypeGuard);
  }
  function findDestination(m, a, randomnessGenerator) {
    const tile = m.contents[a.coordinates.y][a.coordinates.x];
    if (tile.type === "defender-base")
      return null;
    else {
      const t = tile;
      const leadsTo = t["leads-to"].filter((p) => !(p.x === a.previousCoordinates?.x && p.y === a.previousCoordinates?.y));
      const nextCoords = leadsTo.length > 1 ? leadsTo[randomizePath(leadsTo.length, randomnessGenerator)] : leadsTo[0];
      return nextCoords;
    }
  }
  function getCurrentSpeed(a) {
    const baseSpeed = getStats(a.subType).unitSpeed;
    if (a.status?.statusType === "speed-debuff")
      return baseSpeed - a.status.statusAmount;
    else
      return baseSpeed;
  }
  function randomizePath(paths, randomnessGenerator) {
    const randomness = randomnessGenerator.next();
    return Math.floor(randomness * paths);
  }
  function move(a, newcoords) {
    const unitSpeed = getCurrentSpeed(a);
    return {
      event: "movement",
      actorID: a.id,
      unitX: a.coordinates.x,
      unitY: a.coordinates.y,
      nextX: newcoords.x,
      nextY: newcoords.y,
      completion: a.movementCompletion += unitSpeed,
      movementSpeed: unitSpeed
    };
  }
  function unitAttackEvents(m, currentTick, rng) {
    const attackers = Object.keys(m.actors.units).map((index) => m.actors.units[parseInt(index)]);
    const events = attackers.map((a) => {
      const towerDamage = a.subType === "macaw" ? computerTowerDamage(m, a, currentTick, rng) : [];
      const baseDamage = computeBaseDamage(m, a, currentTick, rng);
      const eventTypeGuard = (e) => !!e;
      return [...towerDamage, ...baseDamage].filter(eventTypeGuard);
    });
    return events.flat();
  }
  function computerTowerDamage(m, a, currentTick, rng) {
    const nearbyStructures = findClosebyTowers(m, a.coordinates, 1);
    if (nearbyStructures.length === 0)
      return [];
    const pickedOne = nearbyStructures.reduce(pickOne);
    const damageEvent = {
      event: "damage",
      faction: "attacker",
      sourceID: a.id,
      targetID: pickedOne.id,
      damageType: "neutral",
      damageAmount: 1
    };
    console.log(pickedOne, "tower being attacked");
    const dying = pickedOne.health === 1;
    const dead = pickedOne.health < 1;
    const events = dead ? [] : dying ? [damageEvent, {
      event: "actor-deleted",
      faction: "defender",
      id: pickedOne.id
    }] : [damageEvent];
    applyEvents(m, events, currentTick, rng);
    return events;
  }
  function towerAttackEvents(m, currentTick, rng) {
    const towers = Object.keys(m.actors.towers).map((index) => m.actors.towers[parseInt(index)]);
    const events = towers.map((t) => computeUnitDamage(t, m, currentTick, rng));
    return events.flat();
  }
  function computeUnitDamage(t, m, currentTick, rng) {
    const range = computeRange(t);
    const unitsNearby = scanForUnits(m, t.coordinates, range);
    if (unitsNearby.length === 0)
      return [];
    else
      console.log(unitsNearby.length, "tower attacking units");
    const pickedOne = unitsNearby.reduce(pickOne);
    if (t.structure === "piranha-tower")
      return piranhaDamage(t, pickedOne, m, currentTick, rng);
    else if (t.structure === "sloth-tower")
      return slothDamage(t, pickedOne, m, currentTick, rng);
    else if (t.structure === "anaconda-tower")
      return anacondaDamage(t, pickedOne, m, currentTick, rng);
    else
      return [];
  }
  function computeRange(t) {
    if (t.structure === "piranha-tower" && t["path-1-upgrades"] > 1)
      return 4;
    else if (t.structure === "piranha-tower")
      return 3;
    else if (t.structure === "sloth-tower" && t["path-2-upgrades"] > 0)
      return 2;
    else if (t.structure === "anaconda-tower" && t["path-2-upgrades"] > 1)
      return 2;
    else
      return 1;
  }
  function piranhaDamage(tower, a, m, currentTick, rng) {
    const damageEvent = {
      event: "damage",
      faction: "defender",
      sourceID: tower.id,
      targetID: a.id,
      damageType: "neutral",
      damageAmount: tower["path-2-upgrades"] === 2 ? 1 : 2
    };
    const killEvent = { event: "actor-deleted", faction: "attacker", id: a.id };
    const dying = a.health === 1;
    const dead = a.health < 1;
    const events = dead ? [] : dying ? [damageEvent, killEvent] : [damageEvent];
    applyEvents(m, events, currentTick, rng);
    return events;
  }
  function slothDamage(tower, a, m, currentTick, rng) {
    const statusEvent = {
      event: "status-apply",
      sourceID: tower.id,
      targetID: a.id,
      statusType: "speed-debuff",
      statusAmount: tower["path-1-upgrades"],
      statusDuration: 10
    };
    const damageEvent = {
      event: "damage",
      faction: "defender",
      sourceID: tower.id,
      targetID: a.id,
      damageType: "neutral",
      damageAmount: tower["path-2-upgrades"] === 2 ? 1 : 2
    };
    const killEvent = { event: "actor-deleted", faction: "attacker", id: a.id };
    const dying = a.health === 1;
    const dead = a.health < 1;
    const events = dead ? [] : dying ? [statusEvent, damageEvent, killEvent] : [statusEvent, damageEvent];
    applyEvents(m, events, currentTick, rng);
    return events;
  }
  function anacondaDamage(tower, a, m, currentTick, rng) {
    const killChance = tower["path-1-upgrades"] === 0 ? 0.1 : tower["path-1-upgrades"] === 1 ? 0.15 : tower["path-1-upgrades"] === 2 ? 0.2 : 0;
    const damageAmount = rng.next() < killChance ? a.health : 1;
    const damageEvent = {
      event: "damage",
      faction: "defender",
      sourceID: tower.id,
      targetID: a.id,
      damageType: "neutral",
      damageAmount
    };
    const killEvent = { event: "actor-deleted", faction: "attacker", id: a.id };
    const dying = a.health === damageAmount;
    const dead = a.health < 1;
    const events = dead ? [] : dying ? [damageEvent, killEvent] : [damageEvent];
    applyEvents(m, events, currentTick, rng);
    return events;
  }
  function pickOne(acc, item) {
    if (item.health < acc.health)
      return item;
    else if (item.id < acc.id)
      return item;
    else
      return acc;
  }
  function computeBaseDamage(m, a, currentTick, rng) {
    const events = m.contents[a.coordinates.y][a.coordinates.x].type === "defender-base" ? [{
      event: "damage",
      faction: "attacker",
      sourceID: a.id,
      targetID: 0,
      damageType: "neutral",
      damageAmount: 1
    }, {
      event: "actor-deleted",
      faction: "attacker",
      id: a.id
    }] : [];
    applyEvents(m, events, currentTick, rng);
    return events;
  }
  function scanForUnits(m, coords, range) {
    const ids = Array.from(Array(range)).reduce((acc, r, i) => {
      return [...acc, ...findClosebyAttackers(m, coords, i + 1)];
    }, []);
    return ids.map((id) => m.actors.units[id]);
  }
  function findClosebyAttackers(m, coords, range) {
    const up = m.contents[coords.y - range]?.[coords.x];
    const upright = m.contents[coords.y - range]?.[coords.x + range];
    const right = m.contents[coords.y]?.[coords.x + range];
    const downright = m.contents[coords.y + range]?.[coords.x + range];
    const down = m.contents[coords.y + range]?.[coords.x];
    const downleft = m.contents[coords.y + range]?.[coords.x - range];
    const left = m.contents[coords.y]?.[coords.x - range];
    const upleft = m.contents[coords.y - range]?.[coords.x - range];
    const tiles = [up, upright, right, downright, down, downleft, left, upleft].filter((s) => s && s.type === "path" && s.units.length);
    const units = tiles.map((t) => {
      const tt = t;
      return tt.units;
    });
    return units.flat();
  }
  function findClosebyTowers(m, coords, range) {
    const up = m.contents[coords.y - range]?.[coords.x];
    const upright = m.contents[coords.y - range]?.[coords.x + range];
    const right = m.contents[coords.y]?.[coords.x + range];
    const downright = m.contents[coords.y + range]?.[coords.x + range];
    const down = m.contents[coords.y + range]?.[coords.x];
    const downleft = m.contents[coords.y + range]?.[coords.x - range];
    const left = m.contents[coords.y]?.[coords.x - range];
    const upleft = m.contents[coords.y - range]?.[coords.x - range];
    const tiles = [up, upright, right, downright, down, downleft, left, upleft].filter((s) => s && s.type === "defender-structure");
    const structures = tiles.map((t) => m.actors.towers[t.id]);
    return structures;
  }
  function findClosebyPath(m, coords, rng, range = 1) {
    const c = [];
    const up = m.contents[coords.y - range]?.[coords.x];
    const upright = m.contents[coords.y - range]?.[coords.x + range];
    const right = m.contents[coords.y]?.[coords.x + range];
    const downright = m.contents[coords.y + range]?.[coords.x + range];
    const down = m.contents[coords.y + range]?.[coords.x];
    const downleft = m.contents[coords.y + range]?.[coords.x - range];
    const left = m.contents[coords.y]?.[coords.x - range];
    const upleft = m.contents[coords.y - range]?.[coords.x - range];
    if (up?.type === "path")
      c.push({ y: coords.y - range, x: coords.x });
    if (upleft?.type === "path")
      c.push({ y: coords.y - range, x: coords.x - range });
    if (upright?.type === "path")
      c.push({ y: coords.y - range, x: coords.x + range });
    if (down?.type === "path")
      c.push({ y: coords.y + range, x: coords.x });
    if (downleft?.type === "path")
      c.push({ y: coords.y + range, x: coords.x - range });
    if (downright?.type === "path")
      c.push({ y: coords.y + range, x: coords.x + range });
    if (left?.type === "path")
      c.push({ y: coords.y, x: coords.x - range });
    if (right?.type === "path")
      c.push({ y: coords.y, x: coords.x + range });
    if (c.length === 0) {
      console.log("no path??");
      console.log(coords);
      console.log(up);
      console.log(down);
      console.log(left);
      console.log(right);
      return findClosebyPath(m, coords, rng, range + 1);
    } else if (c.length > 1) {
      const randomness = rng.next();
      return c[Math.floor(randomness * c.length)];
    } else
      return c[0];
  }
  function getCryptStats(type) {
    const spawnCapacity = 10;
    const spawnRate = 10;
    return { spawnCapacity, spawnRate };
  }
  function spawn(m, structureID, actorID, coords, type, rng) {
    const { unitHealth, unitSpeed, unitAttack } = getStats(type);
    const path = findClosebyPath(m, coords, rng);
    console.log(actorID, "spawning unit");
    return {
      event: "spawn",
      cryptID: structureID,
      actorID,
      unitX: path.x,
      unitY: path.y,
      unitType: type,
      unitHealth,
      unitSpeed,
      unitAttack
    };
  }
  function getStats(type) {
    if (type === "gorilla")
      return { unitSpeed: 3, unitHealth: 50, unitAttack: 3 };
    else if (type === "macaw")
      return { unitSpeed: 4, unitHealth: 30, unitAttack: 3 };
    else if (type === "jaguar")
      return { unitSpeed: 5, unitHealth: 30, unitAttack: 3 };
    else
      return { unitSpeed: 3, unitHealth: 30, unitAttack: 3 };
  }
  function statusEvents(m, currentTick, rng) {
    const attackers = Object.keys(m.actors.units).map((index) => m.actors.units[parseInt(index)]);
    const events = attackers.map((a) => {
      if (a.status && a.status.statusCaughtAt === currentTick - a.status.statusDuration)
        return {
          event: "status-remove",
          id: a.id,
          statusType: a.status.statusType
        };
      else
        return null;
    });
    const eventTypeGuard = (e) => !!e;
    return events.filter(eventTypeGuard);
  }
  var BASE_GOLD_RATE = 25;
  function computeGoldRewards(m) {
    const baseGoldProduction = (level) => level === 1 ? 100 : level === 2 ? 200 : level === 3 ? 400 : 0;
    const defenderBaseGold = baseGoldProduction(m.defenderBase.level);
    const attackerBaseGold = baseGoldProduction(m.attackerBase.level);
    const attackerReward = attackerBaseGold + BASE_GOLD_RATE;
    const defenderReward = defenderBaseGold + BASE_GOLD_RATE;
    return [
      { event: "gold-reward", faction: "attacker", amount: attackerReward },
      { event: "gold-reward", faction: "defender", amount: defenderReward }
    ];
  }
  var src_default = processTick;

  // src/map-processor.ts
  function annotateMap(contents, width) {
    const tiles = contents.map((c) => findTile(c));
    const accBunt = [];
    const reduced = tiles.reduce((acc, tile, index) => {
      const row = Math.floor(index / width);
      const existing = acc[row] || [];
      acc[row] = [...existing, tile];
      return acc;
    }, accBunt);
    return reduced;
  }
  function isPath(tile) {
    return tile?.type === "path";
  }
  function isBase(tile) {
    return tile?.type === "defender-base";
  }
  function setPath(map) {
    for (let [rowidx, row] of map.entries()) {
      for (let [tileidx, tile] of row.entries()) {
        if (isPath(tile)) {
          const t = tile;
          const left = row?.[tileidx - 1];
          const right = row?.[tileidx + 1];
          const up = map[rowidx - 1]?.[tileidx];
          const down = map[rowidx + 1]?.[tileidx];
          if (isBase(left))
            t["leads-to"] = [...t["leads-to"], { x: tileidx - 1, y: rowidx }];
          else if (isBase(right))
            t["leads-to"] = [...t["leads-to"], { x: tileidx + 1, y: rowidx }];
          else if (isBase(up))
            t["leads-to"] = [...t["leads-to"], { x: tileidx, y: rowidx - 1 }];
          else if (isBase(down))
            t["leads-to"] = [...t["leads-to"], { x: tileidx, y: rowidx + 1 }];
          else {
            if (isPath(left))
              t["leads-to"] = [...t["leads-to"], { x: tileidx - 1, y: rowidx }];
            if (isPath(right))
              t["leads-to"] = [...t["leads-to"], { x: tileidx + 1, y: rowidx }];
            if (isPath(up))
              t["leads-to"] = [...t["leads-to"], { x: tileidx, y: rowidx - 1 }];
            if (isPath(down))
              t["leads-to"] = [...t["leads-to"], { x: tileidx, y: rowidx + 1 }];
          }
        }
      }
    }
    return map;
  }
  function findTile(c) {
    if (c === 0)
      return {
        type: "immovable-object"
      };
    else if (c === 1)
      return {
        "type": "defender-open"
      };
    else if (c === 2)
      return {
        "type": "attacker-open"
      };
    else if (c === 3)
      return {
        "type": "defender-base"
      };
    else if (c === 4)
      return {
        "type": "attacker-base"
      };
    else if (c === 5)
      return {
        "type": "path",
        "faction": "defender",
        "leads-to": [],
        units: []
      };
    else if (c === 6)
      return {
        "type": "path",
        "faction": "attacker",
        "leads-to": [],
        units: []
      };
    else
      return {
        type: "immovable-object"
      };
  }

  // src/test.ts
  var testmap = [
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    1,
    5,
    5,
    5,
    1,
    5,
    5,
    5,
    1,
    5,
    5,
    5,
    1,
    2,
    6,
    6,
    6,
    2,
    6,
    6,
    6,
    2,
    1,
    5,
    1,
    5,
    1,
    5,
    1,
    5,
    1,
    5,
    1,
    5,
    1,
    2,
    6,
    2,
    6,
    2,
    6,
    2,
    6,
    2,
    1,
    5,
    1,
    5,
    5,
    5,
    1,
    5,
    5,
    5,
    1,
    5,
    5,
    6,
    6,
    2,
    6,
    6,
    6,
    2,
    6,
    2,
    1,
    5,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    6,
    2,
    1,
    5,
    1,
    1,
    1,
    1,
    1,
    5,
    5,
    5,
    1,
    1,
    1,
    2,
    6,
    6,
    6,
    2,
    2,
    2,
    6,
    2,
    3,
    5,
    5,
    5,
    5,
    1,
    1,
    5,
    1,
    5,
    5,
    5,
    1,
    2,
    6,
    2,
    6,
    2,
    6,
    6,
    6,
    4,
    1,
    5,
    1,
    1,
    5,
    1,
    5,
    5,
    1,
    1,
    1,
    5,
    1,
    2,
    6,
    2,
    6,
    6,
    6,
    2,
    6,
    2,
    1,
    5,
    1,
    1,
    5,
    5,
    5,
    1,
    1,
    1,
    1,
    5,
    5,
    6,
    6,
    2,
    2,
    2,
    2,
    2,
    6,
    2,
    1,
    5,
    1,
    1,
    1,
    1,
    1,
    1,
    5,
    5,
    5,
    1,
    1,
    2,
    2,
    2,
    6,
    6,
    6,
    2,
    6,
    2,
    1,
    5,
    1,
    5,
    5,
    5,
    5,
    1,
    5,
    1,
    5,
    1,
    1,
    2,
    6,
    6,
    6,
    2,
    6,
    2,
    6,
    2,
    1,
    5,
    5,
    5,
    1,
    1,
    5,
    5,
    5,
    1,
    5,
    5,
    5,
    6,
    6,
    2,
    2,
    2,
    6,
    6,
    6,
    2,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2
  ];
  function availableForBuilding(map) {
    let towers = [];
    let crypts = [];
    for (let [i, cell] of map.entries()) {
      const row = Math.floor(i / 22);
      const col = i - row * 22;
      if (cell === 1)
        towers.push({ x: col, y: row });
      else if (cell === 2)
        crypts.push({ x: col, y: row });
    }
    return { towers, crypts };
  }
  var matchConfig = { something: "something" };
  var mapHeight = 13;
  var mapWidth = 22;
  var am = annotateMap(testmap, mapWidth);
  var withPath = setPath(am);
  var defaultUnits = {
    towers: {},
    crypts: {},
    units: {}
  };
  var ms = {
    width: mapWidth,
    height: mapHeight,
    defender: "0x0",
    attacker: "0x1",
    defenderGold: 100,
    attackerGold: 100,
    defenderBase: { health: 100, level: 1 },
    attackerBase: { level: 1 },
    actors: defaultUnits,
    contents: withPath,
    name: "jungle",
    currentRound: 1
  };
  function randomFromArray(array) {
    const index = Math.floor(Math.random() * array.length);
    return array[index];
  }
  function build(towerCount, cryptCount) {
    const available = availableForBuilding(testmap);
    const towers = available.towers.sort(() => 0.5 - Math.random()).slice(0, towerCount).map((coords) => {
      return {
        action: "build",
        x: coords.x,
        y: coords.y,
        structure: randomFromArray(["piranha-tower", "anaconda-tower", "sloth-tower"])
      };
    });
    const crypts = available.crypts.sort(() => 0.5 - Math.random()).slice(0, cryptCount).map((coords) => {
      return {
        action: "build",
        x: coords.x,
        y: coords.y,
        structure: randomFromArray(["macaw-crypt", "gorilla-crypt", "jaguar-crypt"])
      };
    });
    return [...towers, ...crypts];
  }
  function toEmoji(m, t) {
    if (t.type === "attacker-structure") {
      return `\u{1F54C}-${t.id}`;
    } else if (t.type === "attacker-base")
      return "\u{1F54B}";
    else if (t.type === "path") {
      const units = t.units;
      if (t.units.length === 0)
        return "=";
      else
        return t.units.reduce((acc, item) => {
          const unit = m.actors.units[item];
          if (!unit)
            return acc;
          else if (unit.subType === "gorilla") {
            if (acc === "")
              return acc + `${unit.health}\u{1F98D}${item}`;
            else
              return acc + "\u{1F98D}";
          } else if (unit.subType === "jaguar") {
            if (acc === "")
              return acc + `${unit.health}\u{1F406}${item}`;
            else
              return acc + "\u{1F406}";
          } else if (unit.subType === "macaw") {
            if (acc === "")
              return acc + `${unit.health}\u{1F986}${item}`;
            else
              return acc + "\u{1F986}";
          } else
            return acc;
        }, "");
    } else if (t.type === "defender-structure") {
      const unit = m.actors.towers[t.id];
      return `${unit.health}-\u{1F3DB}-${t.id}`;
    } else if (t.type === "defender-base")
      return "\u{1F3F0}";
    else if (t.type === "attacker-open")
      return "\u{1F333}";
    else if (t.type === "defender-open")
      return "\u{1F335}";
    else if (t.type === "immovable-object")
      return "\u{1F31A}";
    else
      return "";
  }
  function ppmap(m) {
    const c = m.contents;
    return c.map((row) => {
      return row.map((tile) => toEmoji(m, tile));
    });
  }
  function testRun() {
    const rng = new lib_default("oh hi");
    const moves = build(20, 10);
    for (let [tick, _] of Array(1500).entries()) {
      const events = src_default(matchConfig, ms, moves, tick + 1, rng);
      if (!events || ms.defenderBase.health < 1) {
      } else {
        console.log(tick, "current tick");
        console.table(ppmap(ms));
        console.log(ms.defenderBase);
      }
    }
  }
  testRun();

  // src/middleware.ts
  async function getRoundExecutor(lobbyId, roundNumber) {
    const seed = "td";
    const rng = new lib_default(seed);
    const matchConfig2 = { something: "something" };
    const am2 = annotateMap(testmap, 22);
    const withPath2 = setPath(am2);
    const matchState = {
      width: 22,
      height: 13,
      defender: "0x0",
      attacker: "0x1",
      defenderGold: 100,
      attackerGold: 100,
      defenderBase: { health: 100, level: 1 },
      attackerBase: { level: 1 },
      actors: {
        towers: {},
        crypts: {},
        units: {}
      },
      contents: withPath2,
      name: "jungle",
      currentRound: 1
    };
    const moves = build(20, 10);
    const executor = round_executor_default.initialize(matchConfig2, matchState, moves, rng, src_default);
    return {
      success: true,
      result: executor
    };
  }
})();
