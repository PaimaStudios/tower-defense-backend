
import Prando from "prando";
import type { MatchConfig, MatchState, TurnAction, TickEvent, StructureEvent, GoldRewardEvent, Tile, AttackerBaseTile, DefenderBaseTile, UnitSpawnedEvent, AttackerUnitType, AttackerStructureTile, BuildStructureEvent, DefenderStructureTile, Faction, AttackerStructureType, DefenderStructureType, PathTile, DamageEvent, AttackerUnit, ActorDeletedEvent, AttackerStructure, DefenderStructure, StatusEffectAppliedEvent, UnitMovementEvent, Coordinates, StatusEffectRemovedEvent, TowerAttack } from "./types.js";


function moveToTickEvent(matchconf: MatchConfig, matchState: MatchState, moves: TurnAction[], currentTick: number, randomnessGenerator: Prando): TickEvent[] | null {
  let randomness = 0;
  console.log(currentTick, "current tick")
  for (let tick of Array(currentTick)) randomness = randomnessGenerator.next()
  // check if match is still active, i.e. if defender base still has health
  if (currentTick === 1) {
    const events = structuralTick(moves);
    applyEvents(matchState, events, currentTick)
    return events
  }
  else {
    const events = ticksFromMatchState(matchState, currentTick, randomnessGenerator) || [];
    applyEvents(matchState, events, currentTick);
    return events
  }
}
function structuralTick(moves: TurnAction[]): TickEvent[] {
  const accumulator: [StructureEvent[], number] = [[], 0]
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

function applyEvents(m: MatchState, events: TickEvent[], currentTick: number) {
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
          applyCryptRepair(m.units.crypts[repairStructureID])
        }
        if (faction === "defender") {
          m.defenderGold -= 10 // TODO get amount right
          applyTowerRepair(m.units.towers[repairStructureID])
        }
        break;
      case "upgrade":
        const upgradeStructureID = (m.contents[event.y][event.x] as AttackerStructureTile | DefenderStructureTile).id;
        if (faction === "attacker") {
          m.attackerGold -= 20;
          applyUpgrade(m.units.crypts[upgradeStructureID])
        } // TODO get amount right
        if (faction === "defender") {
          m.defenderGold -= 20 // TODO get amount right
          applyUpgrade(m.units.towers[upgradeStructureID])
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
        (m.contents[event.unitY][event.unitX] as PathTile)["unit"] = event.unitID
        const spawnedUnit: AttackerUnit = {
          type: "attacker-unit",
          subType: event.unitType,
          id: event.unitID,
          health: event.unitHealth,
          status: null,
          coordinates: { x: event.unitX, y: event.unitY }
        }
        m.units.attackers[event.unitID] = spawnedUnit;
        break;
      case "movement":
        // clear the unit from the current path
        (m.contents[event.unitY][event.unitX] as PathTile)["unit"] = null;
        // add unit to next path
        (m.contents[event.nextY][event.nextX] as PathTile)["unit"] = event.unitID
        break;
      case "damage":
        const damageEvent = (event as DamageEvent)
        if (event.targetID === 0) {
          m.units.defenderBase.health-- // TODO calculate base damage
        }
        else {
          // find the affected unit
          const damagedUnit = faction === "attacker" ? m.units.towers[damageEvent.targetID] : m.units.attackers[damageEvent.targetID]
          if (damageEvent.damageType === "neutral") // TODO 
            damagedUnit.health = damagedUnit.health - event.damageAmount
        }
        break;
      case "actor-deleted":
        const deleteEvent = (event as ActorDeletedEvent);
        const unitToDelete = event.faction === "attacker" ? m.units.attackers[deleteEvent.id] : m.units.towers[deleteEvent.id];
        // remove from map
        const tileToWipe = m.contents[unitToDelete.coordinates.y][unitToDelete.coordinates.x];
        if (tileToWipe.type === "path") tileToWipe.unit = null;
        else if (tileToWipe.type === "defender-structure")
          m.contents[unitToDelete.coordinates.y][unitToDelete.coordinates.x] = { type: "defender-open" };
        // delete unit from unit list
        if (event.faction === "attacker")
          delete m.units.attackers[deleteEvent.id];
        else delete m.units.towers[deleteEvent.id];
        // return gold
        // m.attackerGold += 20 // TODO get amount right
        break;
      case "defender-base-update":
        m.units.defenderBase.health += 25;
        break;
      case "status-apply":
        m.units.attackers[event.targetID].status = {
          statusType: event.statusType,
          statusCaughtAt: currentTick,
          statusAmount: event.statusAmount,
          statusDuration: event.statusDuration
        }
        break;
      case "status-remove":
        m.units.attackers[event.id].status = null;
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
function setStructureFromEvent(m: MatchState, event: BuildStructureEvent, faction: Faction, id: number): void{
  if (faction === "attacker"){
    const unit: AttackerStructure= {
      type: "attacker-structure",
      "id": id,
      "structure": (event.structure as AttackerStructureType),
      "health": 100, // TODO
      "path-1-upgrades": 0,
      "path-2-upgrades": 0,
      coordinates: {x: event.x, y: event.y},
      builtOnRound: m.currentRound, // + 3 it stops spawning
      spawned: []
    }
    m.units.crypts[unit.id] = unit;
  }
  else{
    const unit: DefenderStructure= {
      type: "defender-structure",
      "id": id,
      "structure": (event.structure as DefenderStructureType),
      "health": 100, // TODO
      "path-1-upgrades": 0,
      "path-2-upgrades": 0,
      coordinates: {x: event.x, y: event.y}
    }
    m.units.towers[unit.id] = unit;
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

function ticksFromMatchState(m: MatchState, currentTick: number, randomnessGenerator: Prando): TickEvent[] | null {
  // compute all spawn, movement, damage, status-damage events given a certain map state
  // in that order (?)
  // where to cache intermediate match state? e.g. a structure was updates, a bag of gold was found
  const spawn = spawnEvents(m, currentTick);
  const movement = movementEvents(m, currentTick, randomnessGenerator);
  const damage = damageEvents(m, randomnessGenerator);
  const status = statusEvents(m, currentTick);

  return [...spawn, ...movement, ...damage, ...computeGoldRewards(m)]
}

function spawnEvents(m: MatchState, currentTick: number): UnitSpawnedEvent[] {
  const crypts =
    Object.keys(m.units.crypts)
      .map(index => m.units.crypts[parseInt(index)]);
  const events = crypts.map(s => {
    const unitCount = Object.keys(m.units).length;
    const ss = (s as AttackerStructure);
    const { spawnCapacity, spawnRate } = getCryptStats(ss.structure)
    const hasCapacity = ss.spawned.length < spawnCapacity;
    const aboutTime = (currentTick -2) % spawnRate === 0;
    // const notSpawnedYet = Math.ceil(currentTick / spawnRate) < ss.spawned.length;
    if (hasCapacity && aboutTime) {
      const unitType = ss.structure.replace("-crypt", "") as AttackerUnitType;
      const newUnit = spawn(ss.id, unitCount + 1, ss.coordinates.x, ss.coordinates.y, unitType);
      return newUnit
    }
    else return null;
  });
  const eventTypeGuard = (e: UnitSpawnedEvent | null): e is UnitSpawnedEvent => !!e;
  return events.filter(eventTypeGuard);
}

function movementEvents(m: MatchState, currentTick: number, randomnessGenerator: Prando): UnitMovementEvent[] {
  // macaws stay in place if they're attacking a tower, the other units keep running
  const attackers = Object.keys(m.units.attackers)
    .map(index => m.units.attackers[parseInt(index)]);
  const events = attackers.map(a => {
    const aa = (a as AttackerUnit);
    const currentSpeed = getCurrentSpeed(aa)
    const aboutTime = (currentTick - 1) % currentSpeed === 0;
    const busyAttacking = aa.subType === "macaw" && findClosebyTowers(m, aa.coordinates, 1).length > 0
    if (aboutTime && !busyAttacking) {
      const tile = m.contents[aa.coordinates.y][aa.coordinates.x];
      const t = (tile as PathTile);
      console.log(t, "t")
      // if there is more than one available path (i.e. go left or go up/down) determine according to randomness.
      // TODO revise this a few times, make sure randomness is deterministic
      const nextCoords = t["leads-to"].length > 1
        ? t["leads-to"][randomizePath(t["leads-to"].length, randomnessGenerator)]
        : t["leads-to"][0]
      return move(aa.id, aa.coordinates, nextCoords)
    } else return null
  })
  const eventTypeGuard = (e: UnitMovementEvent | null): e is UnitMovementEvent => !!e;
  return events.filter(eventTypeGuard);
}

function getCurrentSpeed(a: AttackerUnit): number {
  const baseSpeed = getStats(a.subType).unitSpeed;
  if (a.status?.statusType === "speed-debuff")
    return baseSpeed - a.status.statusAmount
  else return baseSpeed
}


function randomizePath(paths: number, randomnessGenerator: Prando): number {
  const randomness = randomnessGenerator.next();
  console.log(randomnessGenerator.iteration, "randomizing path")
  return Math.floor(randomness * paths)

}

function move(unitID: number, coords: Coordinates, newcoords: Coordinates): UnitMovementEvent {
  return {
    event: "movement",
    unitID: unitID,
    unitX: coords.x,
    unitY: coords.y,
    nextX: newcoords.x,
    nextY: newcoords.y,
    ticksToMove: 3 // TODO
  }
}

function damageEvents(m: MatchState, randomnessGenerator: Prando): TowerAttack[] {
  const attackers = Object.keys(m.units.attackers)
    .map(index => m.units.attackers[parseInt(index)]);
  const events = attackers.map(a => {
    const aa = (a as AttackerUnit);
    const towerDamage = aa.subType === "macaw" ? computerTowerDamage(m, aa) : [];
    const unitDamage = computeUnitDamage(m, aa, randomnessGenerator)
    const baseDamage = computeBaseDamage(m, aa);
    const eventTypeGuard = (e: TowerAttack | null): e is DamageEvent => !!e;
    return [...towerDamage, ...unitDamage, baseDamage].filter(eventTypeGuard)
  });
  return events.flat()
}
function computerTowerDamage(m: MatchState, a: AttackerUnit): (DamageEvent | ActorDeletedEvent)[] {
  const nearbyStructures = findClosebyTowers(m, a.coordinates, 1);
  const pickedOne = nearbyStructures.reduce(pickOne);
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
  return dead ? [] : dying ? [damageEvent, {
    event: "actor-deleted",
    faction: "defender",
    id: pickedOne.id
  }] : [damageEvent]
}
function computeUnitDamage(m: MatchState, a: AttackerUnit, rng: Prando): (TowerAttack | null)[] {
  const nearbyStructures = findClosebyTowers(m, a.coordinates, 4); // maximum possible range
  const events: TowerAttack[][] = nearbyStructures.map(tower => {
    const inRange = isInRange(tower, a);
    if (inRange) {
      if (tower.structure === "piranha-tower") return piranhaDamage(tower, a);
      else if (tower.structure === "sloth-tower") return slothDamage(tower, a);
      else if (tower.structure === "anaconda-tower") return anacondaDamage(tower, a, rng);
      else return []
    } else return []
  })
  return events.flat()
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
function piranhaDamage(tower: DefenderStructure, a: AttackerUnit): TowerAttack[] {
  const damageEvent: DamageEvent = {
    event: "damage",
    faction: "defender",
    sourceID: tower.id,
    targetID: a.id,
    damageType: "neutral",
    damageAmount: tower["path-2-upgrades"] === 2 ? 1 : 2
  };
  const killEvent: ActorDeletedEvent = { event: "actor-deleted", faction: "attacker", id: a.id };
  const dying = a.health === 1;
  const dead = a.health < 1; // TODO
  return dead ? [] : dying ? [damageEvent, killEvent] : [damageEvent]
}
function slothDamage(tower: DefenderStructure, a: AttackerUnit): TowerAttack[] {
  const statusEvent: StatusEffectAppliedEvent = {
    event: "status-apply",
    sourceID: tower.id,
    targetID: a.id,
    statusType: "speed-debuff",
    statusAmount: tower["path-1-upgrades"], // TODO
    statusDuration: 10 // TODO
  }
  const damageEvent: DamageEvent = {
    event: "damage",
    faction: "defender",
    sourceID: tower.id,
    targetID: a.id,
    damageType: "neutral",
    damageAmount: tower["path-2-upgrades"] === 2 ? 1 : 2
  };
  const killEvent: ActorDeletedEvent = { event: "actor-deleted", faction: "attacker", id: a.id };
  const dying = a.health === 1;
  const dead = a.health < 1; // TODO
  return dead ? [] : dying ? [statusEvent, damageEvent, killEvent] : [statusEvent, damageEvent]
}
function anacondaDamage(tower: DefenderStructure, a: AttackerUnit, rng: Prando): TowerAttack[] {
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
  const dead = a.health < 1; // TODO
  return dead ? [] : dying ? [damageEvent, killEvent] : [damageEvent]
}

function pickOne(acc: DefenderStructure, item: DefenderStructure) {
  if (item.id < acc.id) return item
  else return acc
}

function computeBaseDamage(m: MatchState, a: AttackerUnit): DamageEvent | null {
  if (m.contents[a.coordinates.y][a.coordinates.x].type === "defender-base")
    return {
      event: "damage",
      faction: "attacker",
      sourceID: a.id,
      targetID: 0,
      damageType: "neutral",
      damageAmount: 1 // TODO 
    }
  else return null
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

function findClosebyTowers(m: MatchState, coords: Coordinates, range: number): DefenderStructure[] {
  const up = m.contents[coords.y]?.[coords.x - range];
  const upright = m.contents[coords.y + range]?.[coords.x - range];
  const right = m.contents[coords.y + range]?.[coords.x]; // 
  const downright = m.contents[coords.y + range]?.[coords.x + range]; // 
  const down = m.contents[coords.y]?.[coords.x + range];
  const downleft = m.contents[coords.y - range]?.[coords.x + range];
  const left = m.contents[coords.y - range]?.[coords.x];
  const upleft = m.contents[coords.y - range]?.[coords.x - range];
  const tiles = [up, upright, right, downright, down, downleft, left, upleft]
    .filter(s => s && s.type === "defender-structure")
  const structures = tiles.map(t => m.units.towers[(t as DefenderStructureTile).id]);
  return (structures as DefenderStructure[]);
}



function getCryptStats(type: AttackerStructureType) {
  const spawnCapacity = 10; // TODO discuss this
  const spawnRate = 3; // TODO this too
  return { spawnCapacity, spawnRate }
}

function spawn(structureID: number, unitID: number, x: number, y: number, type: AttackerUnitType): UnitSpawnedEvent {
  const { unitHealth, unitSpeed, unitAttack } = getStats(type);
  return {
    event: "spawn",
    cryptID: structureID,
    unitID: unitID,
    unitX: x,
    unitY: y,
    unitType: type,
    unitHealth,
    unitSpeed,
    unitAttack
  }
}
function getStats(type: AttackerUnitType) {
  if (type === "gorilla") return { unitSpeed: 3, unitHealth: 5, unitAttack: 3 }
  else if (type === "macaw") return { unitSpeed: 4, unitHealth: 3, unitAttack: 3 }
  else if (type === "jaguar") return { unitSpeed: 5, unitHealth: 3, unitAttack: 3 }
  else return { unitSpeed: 3, unitHealth: 3, unitAttack: 3 }
};

function statusEvents(m: MatchState, currentTick: number): StatusEffectRemovedEvent[] {
  const attackers = Object.keys(m.units.attackers)
  .map(index => m.units.attackers[parseInt(index)]);
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
  const defenderBaseGold = baseGoldProduction(m.units.defenderBase.level)
  const attackerBaseGold = baseGoldProduction(m.units.attackerBase.level)
  const attackerReward = attackerBaseGold + BASE_GOLD_RATE;
  const defenderReward = defenderBaseGold + BASE_GOLD_RATE
  return [
    { event: "gold-reward", faction: "attacker", amount: attackerReward },
    { event: "gold-reward", faction: "defender", amount: defenderReward },
  ]
}


export default moveToTickEvent;