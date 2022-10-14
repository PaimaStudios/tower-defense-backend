
import Prando from "prando";
import type { MatchConfig, MatchState, TurnAction, TickEvent, StructureEvent, GoldRewardEvent, Tile, AttackerBaseTile, DefenderBaseTile, UnitSpawnedEvent, AttackerUnitType, AttackerStructureTile, BuildStructureEvent, DefenderStructureTile, Faction, AttackerStructureType, DefenderStructureType, PathTile, DamageEvent, AttackerUnit, ActorDeletedEvent, AttackerStructure, DefenderStructure, StatusEffectAppliedEvent, UnitMovementEvent, Coordinates, StatusEffectRemovedEvent, TowerAttack, ActorID } from "./types.js";


function processTick(matchconf: MatchConfig, matchState: MatchState, moves: TurnAction[], currentTick: number, randomnessGenerator: Prando): TickEvent[] | null {
  let randomness = 0;
  for (let tick of Array(currentTick)) randomness = randomnessGenerator.next()
  // check if match is still active, i.e. if defender base still has health
  if (currentTick === 1) {
    const events = structuralTick(matchState, moves);
    applyEvents(matchState, events, currentTick, randomnessGenerator)
    return events
  }
  else {
    const events = ticksFromMatchState(matchState, currentTick, randomnessGenerator) || [];
    // applyEvents(matchState, events, currentTick, randomnessGenerator);
    return events
  }
}
function structuralTick(matchState: MatchState, moves: TurnAction[]): TickEvent[] {
  const unitCount = getUnitCount(matchState)
  const accumulator: [StructureEvent[], number] = [[], unitCount]
  const structuralTick: [StructureEvent[], number] = moves.reduce((acc, item) => {
    const newEvent = structureEvent(item, acc[1]);
    const newList = [...acc[0], newEvent];
    const newCount = acc[1] + 1;
    return [newList, newCount]
  }, accumulator);
  return structuralTick[0]
}
function structureEvent(m: TurnAction, count: number): StructureEvent {
  if (m.action === "build")
    return {
      event: "build",
      x: m.x,
      y: m.y,
      structure: m.structure,
      id: count
    }
  else if (m.action === "repair")
    return {
      event: "repair",
      x: m.x,
      y: m.y,
    }
  else if (m.action === "upgrade")
    return {
      event: "upgrade",
      x: m.x,
      y: m.y,
      path: 0, // ?
    }
  else if (m.action === "destroy")
    return {
      event: "destroy",
      x: m.x,
      y: m.y,
    }
  else return { // typescript should be better than this
    event: "destroy",
    x: 0,
    y: 0
  }
}

function applyEvents(m: MatchState, events: TickEvent[], currentTick: number, rng: Prando) {
  for (let event of events) {
    // let's find who's side is doing thing
    const faction = determineFactionFromEvent(event);
    switch (event.event) {
      case "build":
        // mutate map with new unit
        setStructureFromEvent(m, event, (faction as Faction), event.id);
        // create new tile object
        const tile = buildTileFromEvent(event, (faction as Faction), event.id)
        // replace old tile with new tile 
        m.contents[event.y][event.x] = tile;
        break;
      case "repair":
        const repairStructureID = (m.contents[event.y][event.x] as AttackerStructureTile | DefenderStructureTile).id;
        if (faction === "attacker") {
          m.attackerGold -= 10 // TODO get amount right
          applyCryptRepair(m.actors.crypts[repairStructureID])
        }
        if (faction === "defender") {
          m.defenderGold -= 10 // TODO get amount right
          applyTowerRepair(m.actors.towers[repairStructureID])
        }
        break;
      case "upgrade":
        const upgradeStructureID = (m.contents[event.y][event.x] as AttackerStructureTile | DefenderStructureTile).id;
        if (faction === "attacker") {
          m.attackerGold -= 20;
          applyUpgrade(m.actors.crypts[upgradeStructureID])
        } // TODO get amount right
        if (faction === "defender") {
          m.defenderGold -= 20 // TODO get amount right
          applyUpgrade(m.actors.towers[upgradeStructureID])
        }
        break;
      case "destroy":
        // const tileToDestroy = m.contents[event.y][event.x];
        if (faction === "attacker") {
          m.contents[event.y][event.x] = { type: "attacker-open" }
          m.attackerGold += 20 // TODO get amount right
        }
        else if (faction === "defender") {
          m.contents[event.y][event.x] = { type: "defender-open" }
          m.defenderGold += 20 // TODO get amount right
        }
        break;
      case "spawn":
        // place the unit in a path
        const spawnPath: PathTile = m.contents[event.unitY][event.unitX] as PathTile;
        spawnPath.units = [...spawnPath.units, event.actorID];
        const spawnedUnit: AttackerUnit = {
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
        }
        // add unit to unit list
        m.actors.units[event.actorID] = spawnedUnit;
        // add unit to spawned list of its crypt
        m.actors.crypts[event.cryptID].spawned = [...m.actors.crypts[event.cryptID].spawned, event.actorID]

        break;
      case "movement":
        // change coordinates at the unit
        const unitMoving = m.actors.units[event.actorID];
        // if movement complete, switch coordinates
        if (event.completion >= 100) {
          unitMoving.previousCoordinates = unitMoving.coordinates;
          unitMoving.coordinates = { x: event.nextX, y: event.nextY };
          unitMoving.nextCoordinates = findDestination(m, unitMoving, rng) || { x: 0, y: 0 }; // TODO mmm
          unitMoving.movementCompletion = 0;
          unitMoving.moving = true;
          // clear the unit from the current path
          const movementPath = m.contents[event.unitY][event.unitX] as PathTile;
          movementPath.units = movementPath.units.filter(u => u !== unitMoving.id);
          // add unit to next path if path
          const newpath = m.contents[event.nextY][event.nextX];
          if (newpath.type === "path") newpath.units = [...newpath.units, event.actorID]
        } else
          unitMoving.movementCompletion = event.completion;
        break;
      case "damage":
        const damageEvent = (event as DamageEvent)
        if (event.targetID === 0) {
          m.defenderBase.health-- // TODO calculate base damage
        }
        else {
          // find the affected unit
          const damagedUnit = faction === "attacker" ? m.actors.towers[damageEvent.targetID] : m.actors.units[damageEvent.targetID]
          if (damagedUnit && damageEvent.damageType === "neutral") // TODO 
            damagedUnit.health = damagedUnit.health - event.damageAmount // TODO this bugs out if the unit has been killed already
        }
        break;
      case "actor-deleted":
        // it may happen that several actor-deleted events are issued about one single unit
        // if e.g. several units attack her at the same tick
        // TODO let's ignore them?
        console.log(event, "deletion event")
        const deleteEvent = (event as ActorDeletedEvent);
        const unitToDelete = event.faction === "attacker" ? m.actors.units[deleteEvent.id] : m.actors.towers[deleteEvent.id];
        if (!unitToDelete) // because already wiped out by a previous event
          break;
        else {
          // remove from map
          const tileToWipe = m.contents[unitToDelete.coordinates.y][unitToDelete.coordinates.x];
          console.log(tileToWipe, "tile to wipe")
          if (tileToWipe.type === "path") tileToWipe.units = tileToWipe.units.filter(u => u !== deleteEvent.id);
          else if (tileToWipe.type === "defender-structure")
            m.contents[unitToDelete.coordinates.y][unitToDelete.coordinates.x] = { type: "defender-open" };
          // delete unit from unit list
          if (event.faction === "attacker")
            delete m.actors.units[deleteEvent.id];
          else delete m.actors.towers[deleteEvent.id];
          // return gold
          // m.attackerGold += 20 // TODO get amount right
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
        }
        break;
      case "status-remove":
        m.actors.units[event.id].status = null;
        break;
    }
  }
}
function determineFactionFromEvent(event: TickEvent): Faction | null {
  if ("x" in event && event.x > 12) return "attacker"
  if ("x" in event && event.x <= 12) return "defender"
  if ("faction" in event) return event.faction
  else return null
}
function setStructureFromEvent(m: MatchState, event: BuildStructureEvent, faction: Faction, id: number): void {
  if (faction === "attacker") {
    const unit: AttackerStructure = {
      type: "attacker-structure",
      "id": id,
      "structure": (event.structure as AttackerStructureType),
      "health": 100, // TODO
      "path-1-upgrades": 0,
      "path-2-upgrades": 0,
      coordinates: { x: event.x, y: event.y },
      builtOnRound: m.currentRound, // + 3 it stops spawning
      spawned: []
    }
    m.actors.crypts[unit.id] = unit;
  }
  else {
    const unit: DefenderStructure = {
      type: "defender-structure",
      "id": id,
      "structure": (event.structure as DefenderStructureType),
      "health": 100, // TODO
      "path-1-upgrades": 0,
      "path-2-upgrades": 0,
      coordinates: { x: event.x, y: event.y }
    }
    m.actors.towers[unit.id] = unit;
  }
}
function buildTileFromEvent(event: BuildStructureEvent, faction: Faction, id: number): AttackerStructureTile | DefenderStructureTile {
  if (faction === "attacker")
    return {
      type: "attacker-structure",
      id: id,
    }
  else return {
    type: "defender-structure",
    id: id,
  }
}

function applyTowerRepair(tower: DefenderStructure) {
  tower.health++ // TODO
}
function applyCryptRepair(crypt: AttackerStructure) {
  crypt.spawned = crypt.spawned.slice(1)// add one more spawn slot
}


function applyUpgrade(structure: AttackerStructure | DefenderStructure): void {
  structure["path-1-upgrades"]++
}


// // timers per unit!!

function ticksFromMatchState(m: MatchState, currentTick: number, rng: Prando): TickEvent[] | null {
  // compute all spawn, movement, damage, status-damage events given a certain map state
  // in that order (?)
  // check if base is alive
  if (m.defenderBase.health <= 0) return null
  else {
    const spawn = spawnEvents(m, currentTick, rng);
    const movement = movementEvents(m, currentTick, rng);
    const towerAttacks = towerAttackEvents(m, currentTick, rng)
    const status = statusEvents(m, currentTick, rng);
    const unitAttacks = unitAttackEvents(m, currentTick, rng);

    return [...spawn, ...movement, ...towerAttacks, ...status, ...unitAttacks, ]
  }
}

function spawnEvents(m: MatchState, currentTick: number, rng: Prando): UnitSpawnedEvent[] {
  const crypts =
    Object.keys(m.actors.crypts)
      .map(index => m.actors.crypts[parseInt(index)]);
  let unitCount = getUnitCount(m);
  const events = crypts.map(s => {
    const ss = (s as AttackerStructure);
    const { spawnCapacity, spawnRate } = getCryptStats(ss.structure)
    const hasCapacity = ss.spawned.length < spawnCapacity;
    const aboutTime = (currentTick - 2) % spawnRate === 0;
    const stillNew = (ss.builtOnRound + 3) > m.currentRound;
    // const notSpawnedYet = Math.ceil(currentTick / spawnRate) < ss.spawned.length;
    if (hasCapacity && aboutTime && stillNew) {
      unitCount++
      const unitType = ss.structure.replace("-crypt", "") as AttackerUnitType;
      const newUnit = spawn(m, ss.id, unitCount, ss.coordinates, unitType, rng);
      applyEvents(m, [newUnit], currentTick, rng) // one by one now
      return newUnit
    }
    else return null;
  });
  const eventTypeGuard = (e: UnitSpawnedEvent | null): e is UnitSpawnedEvent => !!e;
  return events.filter(eventTypeGuard);
}

function getUnitCount(m: MatchState): number {
  const towerCount = Object.keys(m.actors.towers).length;
  const cryptCount = Object.keys(m.actors.crypts).length;
  const attackerCount = Object.keys(m.actors.units).length;
  return 2 + towerCount + cryptCount + attackerCount; // defender base is 0, attacker base is 1
}

function movementEvents(m: MatchState, currentTick: number, randomnessGenerator: Prando): UnitMovementEvent[] {
  // macaws stay in place if they're attacking a tower, the other units keep running
  const attackers = Object.keys(m.actors.units)
    .map(index => m.actors.units[parseInt(index)]);
  const events = attackers.map(a => {
    // const aboutTime = true; // TODO remove this
    const busyAttacking = a.subType === "macaw" && findClosebyTowers(m, a.coordinates, 1).length > 0;
    // const aboutTime = (currentTick - 1) % currentSpeed === 0;
    if (!busyAttacking) {
      const nextCoords = findDestination(m, a, randomnessGenerator);
      if (!nextCoords) return null
      else {
        const event = move(a, nextCoords);
        applyEvents(m, [event], currentTick, randomnessGenerator)
        return event
      }
    } else return null
  })
  const eventTypeGuard = (e: UnitMovementEvent | null): e is UnitMovementEvent => !!e;
  return events.filter(eventTypeGuard);
}

function findDestination(m: MatchState, a: AttackerUnit, randomnessGenerator: Prando): Coordinates | null {
  const tile = m.contents[a.coordinates.y][a.coordinates.x];
  // if the unit is at the defender base, they don't move anymore, time to die
  if (tile.type === "defender-base") return null
  else {
    const t = (tile as PathTile);
    // check available paths and delete the previous one, i.e. don't go backwards
    const leadsTo = t["leads-to"].filter(p => !(p.x === a.previousCoordinates?.x && p.y === a.previousCoordinates?.y));
    // if there is more than one available path (i.e. go left or go up/down) determine according to randomness.
    // TODO revise this a few times, make sure randomness is deterministic
    const nextCoords = leadsTo.length > 1
      ? leadsTo[randomizePath(leadsTo.length, randomnessGenerator)]
      : leadsTo[0]
    return nextCoords
  }
}
function getCurrentSpeed(a: AttackerUnit): number {
  const baseSpeed = getStats(a.subType).unitSpeed;
  if (a.status?.statusType === "speed-debuff")
    return baseSpeed - a.status.statusAmount
  else return baseSpeed
}


function randomizePath(paths: number, randomnessGenerator: Prando): number {
  const randomness = randomnessGenerator.next();
  // console.log(randomnessGenerator.iteration, "randomizing path")
  return Math.floor(randomness * paths)

}

function move(a: AttackerUnit, newcoords: Coordinates): UnitMovementEvent {
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
  }
}

function unitAttackEvents(m: MatchState, currentTick: number, rng: Prando): TowerAttack[] {
  const attackers = Object.keys(m.actors.units)
    .map(index => m.actors.units[parseInt(index)]);
  const events = attackers.map(a => {
    const towerDamage = a.subType === "macaw" ? computerTowerDamage(m, a, currentTick, rng) : [];
    const baseDamage = computeBaseDamage(m, a, currentTick, rng);
    const eventTypeGuard = (e: TowerAttack | null): e is DamageEvent => !!e;
    return [...towerDamage, ...baseDamage].filter(eventTypeGuard)
  });
  return events.flat()
}
function computerTowerDamage(m: MatchState, a: AttackerUnit, currentTick: number, rng: Prando): (DamageEvent | ActorDeletedEvent)[] {
  const nearbyStructures = findClosebyTowers(m, a.coordinates, 1);
  if (nearbyStructures.length === 0) return []
  const pickedOne = nearbyStructures.reduce(pickOne)
  const damageEvent: DamageEvent = {
    event: "damage",
    faction: "attacker",
    sourceID: a.id,
    targetID: pickedOne.id,
    damageType: "neutral",
    damageAmount: 1 // TODO 
  };
  const dying = pickedOne.health === 1;
  const dead = pickedOne.health < 1;
  const events: (DamageEvent | ActorDeletedEvent)[] = dead ? [] : dying ? [damageEvent, {
    event: "actor-deleted",
    faction: "defender",
    id: pickedOne.id
  }] : [damageEvent]
  applyEvents(m, events, currentTick, rng)
  return events
}

function towerAttackEvents(m: MatchState, currentTick: number, rng: Prando): TowerAttack[] {
  const towers = Object.keys(m.actors.towers)
    .map(index => m.actors.towers[parseInt(index)]);
  const events = towers.map(t => computeUnitDamage(t, m, currentTick, rng))
  return events.flat()
}
function computeUnitDamage(t: DefenderStructure, m: MatchState, currentTick: number, rng: Prando): TowerAttack[] {
  const range = computeRange(t);
  const unitsNearby = scanForUnits(m, t.coordinates, range);
  if (unitsNearby.length === 0) return []
  // else 
  const pickedOne = unitsNearby.reduce(pickOne);
  if (t.structure === "piranha-tower") return piranhaDamage(t, pickedOne, m, currentTick, rng);
  else if (t.structure === "sloth-tower") return slothDamage(t, pickedOne, m, currentTick, rng);
  else if (t.structure === "anaconda-tower") return anacondaDamage(t, pickedOne, m, currentTick, rng);
  else return []
}
function isInRange(t: DefenderStructure, a: AttackerUnit): boolean {
  const range = computeRange(t);
  return canReach(a.coordinates, t.coordinates, range);
}
function computeRange(t: DefenderStructure): number {
  if (t.structure === "piranha-tower" && t["path-1-upgrades"] > 1) return 4
  else if (t.structure === "piranha-tower") return 3
  else if (t.structure === "sloth-tower" && t["path-2-upgrades"] > 0) return 2
  else if (t.structure === "anaconda-tower" && t["path-2-upgrades"] > 1) return 2
  else return 1
}
function piranhaDamage(tower: DefenderStructure, a: AttackerUnit, m: MatchState, currentTick: number, rng: Prando): TowerAttack[] {
  const damageAmount = tower["path-2-upgrades"] === 2 ? 1 : 2;
  const damageEvent: DamageEvent = {
    event: "damage",
    faction: "defender",
    sourceID: tower.id,
    targetID: a.id,
    damageType: "neutral",
    damageAmount: damageAmount
  };
  const killEvent: ActorDeletedEvent = { event: "actor-deleted", faction: "attacker", id: a.id };
  const dying = a.health === damageAmount;
  const dead = a.health < damageAmount; // TODO
  const events = dead ? [] : dying ? [damageEvent, killEvent] : [damageEvent]
  applyEvents(m, events, currentTick, rng);
  return events
}
function slothDamage(tower: DefenderStructure, a: AttackerUnit, m: MatchState, currentTick: number, rng: Prando): TowerAttack[] {
  const statusEvent: StatusEffectAppliedEvent = {
    event: "status-apply",
    sourceID: tower.id,
    targetID: a.id,
    statusType: "speed-debuff",
    statusAmount: tower["path-1-upgrades"], // TODO
    statusDuration: 10 // TODO
  }
  const damageAmount = tower["path-2-upgrades"] === 2 ? 1 : 2;
  const damageEvent: DamageEvent = {
    event: "damage",
    faction: "defender",
    sourceID: tower.id,
    targetID: a.id,
    damageType: "neutral",
    damageAmount: damageAmount
  };
  const killEvent: ActorDeletedEvent = { event: "actor-deleted", faction: "attacker", id: a.id };
  const dying = a.health === damageAmount;
  const dead = a.health < damageAmount; // TODO
  const events = dead ? [] : dying ? [statusEvent, damageEvent, killEvent] : [statusEvent, damageEvent];
  applyEvents(m, events, currentTick, rng);
  return events
}
function anacondaDamage(tower: DefenderStructure, a: AttackerUnit, m: MatchState, currentTick: number, rng: Prando): TowerAttack[] {
  const killChance = tower["path-1-upgrades"] === 0 ? 0.1
    : tower["path-1-upgrades"] === 1 ? 0.15
      : tower["path-1-upgrades"] === 2 ? 0.2 : 0;
  const damageAmount = rng.next() < killChance ? a.health : 1;
  const damageEvent: DamageEvent = {
    event: "damage",
    faction: "defender",
    sourceID: tower.id,
    targetID: a.id,
    damageType: "neutral",
    damageAmount: damageAmount
  };
  const killEvent: ActorDeletedEvent = { event: "actor-deleted", faction: "attacker", id: a.id };
  const dying = a.health === damageAmount;
  const dead = a.health < damageAmount; // TODO
  const events = dead ? [] : dying ? [damageEvent, killEvent] : [damageEvent];
  applyEvents(m, events, currentTick, rng);
  return events
}
function pickOne(acc: DefenderStructure, item: DefenderStructure): DefenderStructure
function pickOne(acc: AttackerUnit, item: AttackerUnit): AttackerUnit;

function pickOne(acc: DefenderStructure | AttackerUnit, item: DefenderStructure | AttackerUnit) {
  if (item.health < acc.health) return item
  else if (item.id < acc.id) return item
  else return acc
}

function computeBaseDamage(m: MatchState, a: AttackerUnit, currentTick: number, rng: Prando): (DamageEvent | ActorDeletedEvent)[] {
  const events: (DamageEvent | ActorDeletedEvent)[] =
    (m.contents[a.coordinates.y][a.coordinates.x].type === "defender-base") ?
      [{
        event: "damage",
        faction: "attacker",
        sourceID: a.id,
        targetID: 0,
        damageType: "neutral",
        damageAmount: 1 // TODO 
      }, {
        event: "actor-deleted",
        faction: "attacker",
        id: a.id
      }]
      : []
  applyEvents(m, events, currentTick, rng)
  return events
}
// Determines whether a macaw attacker unit should start attacking a tower.
// Macaws have a range of 1. Diagonals count as 1.
function canReach(attackerCoordinates: Coordinates, structureCoordinates: Coordinates, range: number): boolean {
  const ax = attackerCoordinates.x;
  const ay = attackerCoordinates.y;
  const sx = structureCoordinates.x;
  const sy = structureCoordinates.y;
  const sameX = ax === sx;
  const sameY = ay === sy;
  const nearX = (ax - range === sx || ax + range === sx);
  const nearY = (ay - range === sy || ay + range === sy);
  return (
    // (sameX && nearY) || (sameY && nearX) // diagonals dont count
    nearX && nearY // diagonals count
  )
}

function scanForUnits(m: MatchState, coords: Coordinates, range: number): AttackerUnit[] {
  // recurses and looks for units at range 1, then range 2, etc. depending on argument passed
  const ids: ActorID[] = Array.from(Array(range)).reduce((acc: ActorID[], r: any, i: number) => {
    return [...acc, ...findClosebyAttackers(m, coords, i + 1)]
  }, []);
  return ids.map(id => m.actors.units[id])
}
function findClosebyAttackers(m: MatchState, coords: Coordinates, range: number): ActorID[] {
  const up = m.contents[coords.y - range]?.[coords.x];
  const upright = m.contents[coords.y - range]?.[coords.x + range];
  const right = m.contents[coords.y]?.[coords.x + range]; // 
  const downright = m.contents[coords.y + range]?.[coords.x + range]; // 
  const down = m.contents[coords.y + range]?.[coords.x];
  const downleft = m.contents[coords.y + range]?.[coords.x - range];
  const left = m.contents[coords.y]?.[coords.x - range];
  const upleft = m.contents[coords.y - range]?.[coords.x - range];
  const tiles = [up, upright, right, downright, down, downleft, left, upleft]
    .filter(s => s && s.type === "path" && s.units.length);
  const units = tiles.map(t => {
    const tt = t as PathTile;
    return tt.units
  });
  return units.flat();
}

function findClosebyTowers(m: MatchState, coords: Coordinates, range: number): DefenderStructure[] {
  const up = m.contents[coords.y - range]?.[coords.x];
  const upright = m.contents[coords.y - range]?.[coords.x + range];
  const right = m.contents[coords.y]?.[coords.x + range]; // 
  const downright = m.contents[coords.y + range]?.[coords.x + range]; // 
  const down = m.contents[coords.y + range]?.[coords.x];
  const downleft = m.contents[coords.y + range]?.[coords.x - range];
  const left = m.contents[coords.y]?.[coords.x - range];
  const upleft = m.contents[coords.y - range]?.[coords.x - range];
  const tiles = [up, upright, right, downright, down, downleft, left, upleft]
    .filter(s => s && s.type === "defender-structure")
  const structures = tiles.map(t => m.actors.towers[(t as DefenderStructureTile).id]);
  return (structures as DefenderStructure[]);
}
function findClosebyPath(m: MatchState, coords: Coordinates, rng: Prando, range = 1): Coordinates {
  const c: Coordinates[] = [];
  const up = m.contents[coords.y - range]?.[coords.x];
  const upright = m.contents[coords.y - range]?.[coords.x + range];
  const right = m.contents[coords.y]?.[coords.x + range]; // 
  const downright = m.contents[coords.y + range]?.[coords.x + range]; // 
  const down = m.contents[coords.y + range]?.[coords.x];
  const downleft = m.contents[coords.y + range]?.[coords.x - range];
  const left = m.contents[coords.y]?.[coords.x - range];
  const upleft = m.contents[coords.y - range]?.[coords.x - range];
  if (up?.type === "path") c.push({ y: coords.y - range, x: coords.x })
  if (upleft?.type === "path") c.push({ y: coords.y - range, x: coords.x - range })
  if (upright?.type === "path") c.push({ y: coords.y - range, x: coords.x + range })
  if (down?.type === "path") c.push({ y: coords.y + range, x: coords.x })
  if (downleft?.type === "path") c.push({ y: coords.y + range, x: coords.x - range })
  if (downright?.type === "path") c.push({ y: coords.y + range, x: coords.x + range })
  if (left?.type === "path") c.push({ y: coords.y, x: coords.x - range })
  if (right?.type === "path") c.push({ y: coords.y, x: coords.x + range })
  if (c.length === 0) {
    console.log("no path??")
    console.log(coords)
    console.log(up)
    console.log(down)
    console.log(left)
    console.log(right)
    return findClosebyPath(m, coords, rng, range + 1);
  }
  else if (c.length > 1) {
    const randomness = rng.next();
    // console.log(randomness, "rng output choosing spawning path")
    return c[Math.floor(randomness * c.length)]
  }
  else return c[0]
}



function getCryptStats(type: AttackerStructureType) {
  const spawnCapacity = 10; // TODO discuss this
  const spawnRate = 10; // TODO this too
  return { spawnCapacity, spawnRate }
}

function spawn(m: MatchState, structureID: number, actorID: number, coords: Coordinates, type: AttackerUnitType, rng: Prando): UnitSpawnedEvent {
  const { unitHealth, unitSpeed, unitAttack } = getStats(type);
  const path = findClosebyPath(m, coords, rng);
  return {
    event: "spawn",
    cryptID: structureID,
    actorID: actorID,
    unitX: path.x,
    unitY: path.y,
    unitType: type,
    unitHealth,
    unitSpeed,
    unitAttack
  }
}
function getStats(type: AttackerUnitType) {
  if (type === "gorilla") return { unitSpeed: 3, unitHealth: 50, unitAttack: 3 }
  else if (type === "macaw") return { unitSpeed: 4, unitHealth: 30, unitAttack: 3 }
  else if (type === "jaguar") return { unitSpeed: 5, unitHealth: 30, unitAttack: 3 }
  else return { unitSpeed: 3, unitHealth: 30, unitAttack: 3 }
};

function statusEvents(m: MatchState, currentTick: number, rng: Prando): StatusEffectRemovedEvent[] {
  const attackers = Object.keys(m.actors.units)
    .map(index => m.actors.units[parseInt(index)]);
  const events: (StatusEffectRemovedEvent | null)[] = attackers.map(a => {
    if (a.status && a.status.statusCaughtAt === currentTick - a.status.statusDuration)
      return {
        event: "status-remove",
        id: a.id,
        statusType: a.status.statusType
      }
    else return null
  });
  const eventTypeGuard = (e: StatusEffectRemovedEvent | null): e is StatusEffectRemovedEvent => !!e;
  return events.filter(eventTypeGuard);
}

const REWARD_BOOST = 5; // TODO FIGURE OUT
const BASE_GOLD_RATE = 25;
// TODO random gold bags
function computeGoldRewards(m: MatchState): [GoldRewardEvent, GoldRewardEvent] {
  const baseGoldProduction = (level: number) => level === 1
    ? 100
    : level === 2
      ? 200
      : level === 3
        ? 400
        : 0 // shouldn't happen
  const defenderBaseGold = baseGoldProduction(m.defenderBase.level)
  const attackerBaseGold = baseGoldProduction(m.attackerBase.level)
  const attackerReward = attackerBaseGold + BASE_GOLD_RATE;
  const defenderReward = defenderBaseGold + BASE_GOLD_RATE
  return [
    { event: "gold-reward", faction: "attacker", amount: attackerReward },
    { event: "gold-reward", faction: "defender", amount: defenderReward },
  ]
}


export default processTick;