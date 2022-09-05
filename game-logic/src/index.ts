
import Prando from "prando";
import type { MatchConfig, MatchState, TurnAction, TickEvent, StructureEvent, GoldRewardEvent, Tile, AttackerBaseTile, DefenderBaseTile, UnitSpawnedEvent, AttackerUnitType, AttackerStructureTile, BuildStructureEvent, DefenderStructureTile, Faction, AttackerStructureType, DefenderStructureType, PathTile, DamageEvent, AttackerUnit, ActorDeletedEvent, AttackerStructure, DefenderStructure, StatusEffectAppliedEvent, UnitMovementEvent, Coordinates } from "./types.js";


function moveToTickEvent(matchconf: MatchConfig, matchState: MatchState, moves: TurnAction[], currentTick: number, randomnessGenerator: Prando): TickEvent[] | null {
  let randomness = 0;
  for (let tick of Array(currentTick)) randomness = randomnessGenerator.next()
  if (currentTick === 1) {
    const events = structuralTick(moves);
    applyEvents(matchState, events)
    return events
  }
  else {
    const events = ticksFromMatchState(matchState, currentTick, randomnessGenerator);
    applyEvents(matchState, events || [])
    return events
    return []
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

function applyEvents(m: MatchState, events: TickEvent[]) {
  for (let event of events) {
    // let's find who's side is doing thing
    const faction = determineFactionFromEvent(event);
    console.log(faction, "faction of event")
    switch (event.event) {
      case "build":
        // increment structure ID
        // create new tile object
        const tile = buildTileFromEvent(event, (faction as Faction), Object.keys(m.units).length + 1)
        // replace old tile with new tile 
        m.contents[event.x][event.y] = tile;
        break;
      case "repair":
        const repairStructureID = (m.contents[event.x][event.y] as AttackerStructureTile | DefenderStructureTile).id;
        if (faction === "attacker") m.attackerGold -= 10 // TODO get amount right
        if (faction === "defender") m.defenderGold -= 10 // TODO get amount right
        applyRepair((m.units[repairStructureID] as AttackerStructure | DefenderStructure), (faction as Faction));
        break;
      case "upgrade":
        const upgradeStructureID = (m.contents[event.x][event.y] as AttackerStructureTile | DefenderStructureTile).id;
        if (faction === "attacker") m.attackerGold -= 20 // TODO get amount right
        if (faction === "defender") m.defenderGold -= 20 // TODO get amount right
        applyUpgrade((m.units[upgradeStructureID] as AttackerStructure | DefenderStructure))
        break;
      case "destroy":
        // const tileToDestroy = m.contents[event.x][event.y];
        if (faction === "attacker") {
          m.contents[event.x][event.y] = { type: "attacker-open" }
          m.attackerGold += 20 // TODO get amount right
        }
        else if (faction === "defender") {
          m.contents[event.x][event.y] = { type: "defender-open" }
          m.defenderGold += 20 // TODO get amount right
        }
        break;
      case "spawn":
        // place the unit in a path
        (m.contents[event.unitX][event.unitY] as PathTile)["unit"] = event.unitID
        const spawnedUnit: AttackerUnit = {
          type: "attacker-unit",
          subType: event.unitType,
          id: event.unitID,
          health: event.unitHealth,
          status: null,
          coordinates: { x: event.unitX, y: event.unitY }
        }
        m.units[event.unitID] = spawnedUnit;
        break;
      case "movement":
        // clear the unit from the current path
        (m.contents[event.unitX][event.unitY] as PathTile)["unit"] = null;
        // add unit to next path
        (m.contents[event.nextX][event.nextY] as PathTile)["unit"] = event.unitID
        break;
      case "damage":
        const damageEvent = (event as DamageEvent)
        // find the affected unit
        const damagedUnit = m.units[damageEvent.targetID];
        if (damageEvent.damageType === "whatever") // TODO 
          (damagedUnit as AttackerUnit).health-- // TODO calculate
        break;
      case "actor-deleted":
        const deleteEvent = (event as ActorDeletedEvent);
        // delete unit from unit list
        delete m.units[deleteEvent.id];
        // return gold
        m.attackerGold += 20 // TODO get amount right
        break;
      case "defender-base-update":
        m.units[0].health += 25;
        break;
      case "status-apply":
        (m.units[event.targetID] as AttackerUnit).status = {
          statusType: event.statusType,
          statusAmount: event.statusAmount,
          statusDuration: event.statusDuration
        }
        break;
      case "status-remove":
        (m.units[event.id] as AttackerUnit).status = null;
        break;
    }
  }
}
function determineFactionFromEvent(event: TickEvent): Faction | null {
  if ("x" in event && event.x > 13) return "attacker"
  if ("x" in event && event.x <= 13) return "defender"
  if ("faction" in event) return event.faction
  else return null
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

function applyRepair(tile: AttackerStructure | DefenderStructure, faction: Faction): void {
  if (faction === "attacker") {
    const t = tile as AttackerStructure;
    t.spawned = t.spawned.slice(1) // add one more spawn slot
  }
  else {
    const t = tile as DefenderStructure;
    t.health++ // TODO should add 25%, switch by structure type and/or level
  }
}

function applyUpgrade(structure: AttackerStructure | DefenderStructure): void {
  structure["path-1-upgrades"]++
}


// // timers per unit!!

function ticksFromMatchState(m: MatchState, currentTick: number, randomnessGenerator: Prando): TickEvent[] | null {
  // compute all spawn, movement, damage, status-damage, unit-destroy events given a certain map state
  // in that order (?)
  // where to cache intermediate match state? e.g. a structure was updates, a bag of gold was found
  const spawn = spawnEvents(m, currentTick);
  const movement = movementEvents(m, currentTick, randomnessGenerator)
  const damage = damageEvents(m, randomnessGenerator)
  return [...spawn, ...movement, ...computeGoldRewards(m)]
}

function spawnEvents(m: MatchState, currentTick: number): UnitSpawnedEvent[] {
  const structures =
    Object.keys(m.units)
      .filter(index => m.units[parseInt(index)].type === "attacker-structure")
      .map(index => m.units[parseInt(index)]);
  const events = structures.map(s => {
    const unitCount = Object.keys(m.units).length;
    const ss = (s as AttackerStructure);
    const { spawnCapacity, spawnRate } = getCryptStats(ss.structure)
    const hasCapacity = ss.spawned.length < spawnCapacity;
    const aboutTime = currentTick % spawnRate === 0;
    const notSpawnedYet = Math.ceil(currentTick / spawnRate) < ss.spawned.length;
    if (hasCapacity && aboutTime && notSpawnedYet) {
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
  const attackers = Object.keys(m.units)
    .filter(index => m.units[parseInt(index)].type === "attacker-unit")
    .map(index => m.units[parseInt(index)]);
  const events = attackers.map(a => {
    const aa = (a as AttackerUnit);
    const currentSpeed = getCurrentSpeed(aa)
    const aboutTime = (currentTick - 1) % currentSpeed === 0;
    if (aboutTime) {
      const tile = m.contents[aa.coordinates.x][aa.coordinates.y];
      const t = (tile as PathTile);
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
    ticksToMove: 0
  }
}

function damageEvents(m: MatchState, randomnessGenerator: Prando): DamageEvent[]{
  const attackers = Object.keys(m.units)
  .filter(index => m.units[parseInt(index)].type === "attacker-unit")
  .map(index => m.units[parseInt(index)]);
  const events = attackers.map(a => {
    const aa = (a as AttackerUnit);
    if (aa.subType === "macaw"){
      const tilesAround = findNeighboringStructures(m, aa.coordinates);
    }
  })
  return events
}

function findNeighboringStructures(m: MatchState, coords: Coordinates): DefenderStructureTile[]{
  const up = m.contents[coords.x][coords.y - 1];
  const down = m.contents[coords.x][coords.y + 1];
  const left = m.contents[coords.x - 1][coords.y];
  const right = m.contents[coords.x + 1][coords.y];
  const structures = [up, down, left, right]
  .filter(s => s.type === "defender-structure")
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
  const defenderBaseGold = baseGoldProduction(m.units[0].level)
  const attackerBaseGold = baseGoldProduction(m.units[1].level)
  const attackerReward = attackerBaseGold + BASE_GOLD_RATE;
  const defenderReward = defenderBaseGold + BASE_GOLD_RATE
  return [
    { event: "gold-reward", faction: "attacker", amount: attackerReward },
    { event: "gold-reward", faction: "defender", amount: defenderReward },
  ]
}


// export default moveToTickEvent;