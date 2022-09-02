
import Prando from "prando";
import type { MatchState, TurnAction, TickEvent, StructureEvent, GoldRewardEvent, Tile, AttackerBaseTile, DefenderBaseTile, UnitSpawnedEvent, AttackerUnitType, AttackerStructureTile, BuildStructureEvent, DefenderStructureTile, Faction, AttackerStructureType, DefenderStructureType } from "./types.js";
interface PlayersState {
  defender: {
    health: number;
  },
  attacker: {
    health: number;
  }
}

function moveToTickEvent(matchState: MatchState, userStates: PlayersState, moves: TurnAction[], currentTick: number, randomnessGenerator: Prando): TickEvent[] | null {
  // let randomness = 0;
  // for (let tick of Array(currentTick)) randomness = randomnessGenerator.next()
  if (currentTick === 1) {
    const events = structuralTick(moves);
    applyEvents(matchState, events)
    return events
  }
  else {
    const events = ticksFromMatchState(matchState, currentTick);
    applyEvents(matchState, events || [])
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

function applyEvents(m: MatchState, events: TickEvent[]) {
  for (let event of events) {
    // let's find who's side is doing thing
    const faction = determineFactionFromEvent(event);
    console.log(faction, "faction of event")
    switch (event.event) {
      case "build":
        // increment structure ID
        m.unitSum++
        // create new tile object
        const tile = buildTileFromEvent(event, (faction as Faction), m.unitSum)
        // replace old tile with new tile 
        m.contents[event.x][event.y] = tile;
        break;
      case "repair":
        const tileToRepair = m.contents[event.x][event.y];
        if (faction === "attacker") m.attackerGold -= 10 // TODO get amount right
        if (faction === "defender") m.defenderGold -= 10 // TODO get amount right
        applyRepair((tileToRepair as AttackerStructureTile | DefenderStructureTile), (faction as Faction));
        break;
      case "upgrade":
        const tileToUpgrade = m.contents[event.x][event.y];
        if (faction === "attacker") m.attackerGold -= 20 // TODO get amount right
        if (faction === "defender") m.defenderGold -= 20 // TODO get amount right
        applyUpgrade((tileToUpgrade as AttackerStructureTile | DefenderStructureTile))
        break;
      case "destroy":
        const tileToDestroy = m.contents[event.x][event.y];
        if (faction === "attacker") {
          m.contents[event.x][event.y] = {type: "attacker-open"}
          m.attackerGold += 20 // TODO get amount right
        }
        else if (faction === "defender"){
          m.contents[event.x][event.y] = {type: "defender-open"}
          m.defenderGold += 20 // TODO get amount right
        }
        break;
      case "spawn":
        break;
      case "movement":
        break;
      case "damage":
        break;
      case "actor-deleted":
        break;
      case "defender-base-update":
        break;
      case "status-apply":
        break;
      case "status-remove":
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
      structure: event.structure as AttackerStructureType,
      health: 5, // TODO
      "path-1-upgrades": 0,
      "path-2-upgrades": 0,
      spawned: []
    }
  else return {
    type: "defender-structure",
    id: id,
    structure: event.structure as DefenderStructureType,
    health: 5, // TODO
    "path-1-upgrades": 0,
    "path-2-upgrades": 0,
  }
}

function applyRepair(tile: AttackerStructureTile | DefenderStructureTile, faction: Faction): void {
  if (faction === "attacker") {
    const t = tile as AttackerStructureTile;
    t.spawned = t.spawned.slice(1) // add one more spawn slot
  }
  else {
    const t = tile as DefenderStructureTile;
    t.health++ // TODO should add 25%
  }
}

function applyUpgrade(tile: AttackerStructureTile | DefenderStructureTile): void {
  tile["path-1-upgrades"] ++
}
function applyDestroy(tile: AttackerStructureTile | DefenderStructureTile, faction: Faction): void {
  if (faction === "attacker") {
    const t = tile as AttackerStructureTile;
    t.spawned = t.spawned.slice(1) // add one more spawn slot
  }
  else {
    const t = tile as DefenderStructureTile;
    t.health++ // TODO should add 25%
  }
}

// timers per unit!!

function ticksFromMatchState(m: MatchState, currentTick: number): TickEvent[] | null {
  // compute all spawn, movement, damage, status-damage, structure-upgrade and unit-destroy events given a certain map state
  // in that order (?)
  // where to cache intermediate match state? e.g. a structure was updates, a bag of gold was found
  const moves: TickEvent[] = []
  return [...moves, ...computeGoldRewards(m)]
}

function spawnEvents(m: MatchState): UnitSpawnedEvent[] {
  const accBunt: UnitSpawnedEvent[] = [];
  const events = m.contents.reduce((acc, row, xIndex) => {
    const events = row.reduce((acc, tile, yIndex) => {
      if (tile.type === "attacker-structure") {
        const unitType = tile.structure.replace("-crypt", "") as AttackerUnitType;
        m.unitSum++ // how to keep this state without mutating?
        return [...acc, spawn(tile.id, m.unitSum, xIndex, yIndex, unitType)]
      }
      else return acc
    }, accBunt)
    return [...acc, ...events]
  }, accBunt)
  return events
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
  const attackerBase = m.contents.flat().find(tile => tile.type === "attacker-base");
  const defenderBase = m.contents.flat().find(tile => tile.type === "defender-base");
  const baseGoldProduction = (level: number) => level === 1
    ? 100
    : level === 2
      ? 200
      : level === 3
        ? 400
        : 0 // shouldn't happen
  const attackerBaseGold = baseGoldProduction((attackerBase as AttackerBaseTile).level)
  const defenderBaseGold = baseGoldProduction((defenderBase as DefenderBaseTile).level)
  const attackerReward = attackerBaseGold + BASE_GOLD_RATE;
  const defenderReward = defenderBaseGold + BASE_GOLD_RATE
  return [
    { event: "gold-reward", faction: "attacker", amount: attackerReward },
    { event: "gold-reward", faction: "defender", amount: defenderReward },
  ]
}


export default moveToTickEvent;