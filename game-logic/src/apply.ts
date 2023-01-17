import Prando from 'paima-engine/paima-prando';
import type {
  MatchConfig,
  MatchState,
  TurnAction,
  TickEvent,
  StructureEvent,
  GoldRewardEvent,
  Tile,
  AttackerBaseTile,
  DefenderBaseTile,
  UnitSpawnedEvent,
  AttackerUnitType,
  AttackerStructureTile,
  BuildStructureEvent,
  DefenderStructureTile,
  Faction,
  AttackerStructureType,
  DefenderStructureType,
  PathTile,
  DamageEvent,
  AttackerUnit,
  ActorDeletedEvent,
  AttackerStructure,
  DefenderStructure,
  StatusEffectAppliedEvent,
  UnitMovementEvent,
  Coordinates,
  TowerAttack,
  ActorID,
  DestroyStructureEvent,
  UpgradeTier,
} from '@tower-defense/utils';
import { coordsToIndex } from '.';

function gotTheMoney(m: MatchState, faction: Faction | null, amount: number): boolean {
  if (faction === 'attacker' && m.attackerGold - amount >= 0) {
    m.attackerGold -= amount;
    return true;
  } else if (faction === 'defender' && m.defenderGold - amount >= 0) {
    m.defenderGold -= amount;
    return true;
  } else return false;
}
// function to mutate the match state after events are processed.
export default function applyEvents(
  config: MatchConfig,
  m: MatchState,
  events: TickEvent[],
  currentTick: number,
  rng: Prando
) {
  for (let event of events) {
    // let's find who's side is doing thing
    const faction = determineFactionFromEvent(m, event);
    switch (event.eventType) {
      case 'build':
        const cost = config[event.structure][1].price;
        if (gotTheMoney(m, faction, cost)) {
          // Validate that tile to build on is open
          if (m.mapState[coordsToIndex({x: event.x, y: event.y}, m.width)].type === "open"){
          // mutate map with new actor
          setStructureFromEvent(config, m, event, faction as Faction, event.id);
          // create new tile object
          const tile = buildTileFromEvent(event, faction as Faction, event.id);
          // replace old tile with new tile
          m.mapState[coordsToIndex({x: event.x, y: event.y}, m.width)] = tile;
          // m.contents[event.y][event.x] = tile;
          m.actorCount++;
          // // drain gold
        }
        }
        break;
      case 'repair':
        if (gotTheMoney(m, faction, config.repairCost)) {
          if (faction === 'attacker') applyCryptRepair(m.actors.crypts[event.id]);
          if (faction === 'defender') applyTowerRepair(config, m.actors.towers[event.id]);
        }
        break;
      case 'upgrade':
        const structure =
          faction === 'attacker' ? m.actors.crypts[event.id] : m.actors.towers[event.id];
        const currentTier = structure.upgrades;
        if (currentTier < 3) {
          const newTier = (currentTier + 1) as UpgradeTier;
          const cost = config[structure.structure][newTier].price;
          if (gotTheMoney(m, faction, cost)) applyUpgrade(structure);
        }
        break;
      case 'destroy':
        const coords = findActorCoords(m, event);
        if (faction === 'attacker') {
          m.mapState[coordsToIndex(coords, m.width)] = { type: 'open', faction: 'attacker' };
          // m.contents[coords.y][coords.x] = { type: 'open', faction: 'attacker' };
          m.attackerGold += config.recoupAmount;
          if (m.actors.crypts[event.id]) delete m.actors.crypts[event.id];
          // else if (m.actors.units[event.id]) delete m.actors.units[event.id];
        } else if (faction === 'defender') {
          m.mapState[coordsToIndex(coords, m.width)] = { type: 'open', faction: 'defender' };
          // m.contents[coords.y][coords.x] = { type: 'open', faction: 'defender' };
          m.defenderGold += config.recoupAmount; // TODO get amount right
          delete m.actors.towers[event.id];
        }
        break;
      case 'spawn':
        // place the unit in a path
        const spawnPath: PathTile = m.mapState[coordsToIndex({x: event.unitX, y: event.unitY},m.width)] as PathTile;
        // const spawnPath: PathTile = m.contents[event.unitY][event.unitX] as PathTile;
        spawnPath.units = [...spawnPath.units, event.actorID];
        const spawnedUnit: AttackerUnit = {
          type: 'unit',
          faction: 'attacker',
          subType: event.unitType,
          id: event.actorID,
          health: event.unitHealth,
          speed: event.unitSpeed,
          damage: event.unitAttack,
          upgradeTier: event.tier,
          status: [],
          previousCoordinates: null,
          coordinates: { x: event.unitX, y: event.unitY },
          nextCoordinates: null,
          moving: false,
          movementCompletion: 0,
        };
        // add unit to unit graph
        m.actors.units[event.actorID] = spawnedUnit;
        // add unit to spawned list of its crypt
        m.actors.crypts[event.cryptID].spawned = [
          ...m.actors.crypts[event.cryptID].spawned,
          event.actorID,
        ];
        m.actorCount++;
        break;
      case 'movement':
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
        const movementPath: PathTile = m.mapState[coordsToIndex({x: event.unitX, y: event.unitY},m.width)] as PathTile;
          // const movementPath = m.contents[event.unitY][event.unitX] as PathTile;
          movementPath.units = movementPath.units.filter(u => u !== unitMoving.id);
          // add unit to next path if path
          const newpath = m.mapState[coordsToIndex({x: event.nextX, y: event.nextY}, m.width)]
          // const newpath = m.contents[event.nextY][event.nextX];
          if (newpath.type === 'path') {
            newpath.units = [...newpath.units, event.actorID];
          }
        } else unitMoving.movementCompletion = event.completion;
        break;
      case 'damage':
        const damageEvent = event as DamageEvent;
        if (event.targetID === 0) {
          m.defenderBase.health--; // TODO calculate base damage
        } else {
          // find the affected unit
          const damagedUnit =
            faction === 'attacker'
              ? m.actors.towers[damageEvent.targetID]
              : m.actors.units[damageEvent.targetID];
          if (damagedUnit && damageEvent.damageType === 'neutral')
            // TODO
            damagedUnit.health = damagedUnit.health - event.damageAmount; // TODO this bugs out if the unit has been killed already
        }
        break;
      case 'actorDeleted':
        // it may happen that several actorDeleted events are issued about one single unit
        // if e.g. several units attack her at the same tick
        // TODO let's ignore them?
        const deleteEvent = event as ActorDeletedEvent;
        const unitToDelete =
          event.faction === 'attacker'
            ? m.actors.units[deleteEvent.id]
            : m.actors.towers[deleteEvent.id];
        if (!unitToDelete)
          // because already wiped out by a previous event
          break;
        else {
          // remove from map
          const tileToWipe = m.mapState[coordsToIndex(unitToDelete.coordinates, m.width)]
          // const tileToWipe = m.contents[unitToDelete.coordinates.y][unitToDelete.coordinates.x];
          if (tileToWipe.type === 'path')
            tileToWipe.units = tileToWipe.units.filter(u => u !== deleteEvent.id);
          else if (tileToWipe.type === 'structure' && tileToWipe.faction === 'defender')
            m.mapState[(coordsToIndex(unitToDelete.coordinates, m.width))] = {
              type: 'open',
              faction: 'defender',
            };
          // delete unit from unit list
          if (event.faction === 'attacker') delete m.actors.units[deleteEvent.id];
          else delete m.actors.towers[deleteEvent.id];
          // we do not decrement the MatchState unitCount as we don't want to recycle ids
          // return gold
          // m.attackerGold += 20 // TODO get amount right
          break;
        }
      case 'defenderBaseUpdate':
        m.defenderBase.health = event.health;
        break;
      case 'statusApply':
        m.actors.units[event.targetID].status = [
          ...m.actors.units[event.targetID].status,
          event.statusType,
        ];
        break;
    }
  }
}

function findDestination(
  m: MatchState,
  a: AttackerUnit,
  randomnessGenerator: Prando
): Coordinates | null {
  const tile = m.mapState[(coordsToIndex(a.coordinates, m.width))]
  // if the unit is at the defender base, they don't move anymore, time to die
  if (tile.type === 'base' && tile.faction === 'defender') return null;
  else {
    const t = tile as PathTile;
    // check available paths and delete the previous one, i.e. don't go backwards
    const leadsTo = t['leadsTo'].filter(
      p => !(p.x === a.previousCoordinates?.x && p.y === a.previousCoordinates?.y)
    );
    // if there is more than one available path (i.e. go left or go up/down) determine according to randomness.
    // TODO revise this a few times, make sure randomness is deterministic
    const nextCoords =
      leadsTo.length > 1 ? leadsTo[randomizePath(leadsTo.length, randomnessGenerator)] : leadsTo[0];
    return nextCoords;
  }
}
function randomizePath(paths: number, randomnessGenerator: Prando): number {
  const randomness = randomnessGenerator.next();
  // console.log(randomnessGenerator.iteration, "randomizing path")
  return Math.floor(randomness * paths);
}

function determineFactionFromEvent(m: MatchState, eventType: TickEvent): Faction | null {
  if ('faction' in eventType) return eventType.faction;
  if ('x' in eventType && eventType.x > 12) return 'attacker';
  if ('x' in eventType && eventType.x <= 12) return 'defender';
  else if ('id' in eventType) {
    const crypt = m.actors.crypts[eventType.id];
    const tower = m.actors.towers[eventType.id];
    const unit = m.actors.units[eventType.id];
    if (tower) return 'defender';
    else if (crypt || unit) return 'attacker';
    else return null;
  } else return null;
}
function findActorCoords(m: MatchState, eventType: DestroyStructureEvent): Coordinates {
  const crypt = m.actors.crypts[eventType.id];
  const tower = m.actors.towers[eventType.id];
  const unit = m.actors.units[eventType.id];
  const actor = crypt || tower || unit;
  return actor.coordinates;
}

function setStructureFromEvent(
  config: MatchConfig,
  m: MatchState,
  eventType: BuildStructureEvent,
  faction: Faction,
  id: number
): void {
  // read stats from passed matchConfig
  if (faction === 'attacker') {
    const unit: AttackerStructure = {
      type: 'structure',
      faction: 'attacker',
      id: id,
      structure: eventType.structure as AttackerStructureType,
      upgrades: 1,
      coordinates: { x: eventType.x, y: eventType.y },
      builtOnRound: m.currentRound, // + 3 it stops spawning
      spawned: [],
    };
    m.actors.crypts[unit.id] = unit;
  } else {
    const unit: DefenderStructure = {
      type: 'structure',
      faction: 'defender',
      id: id,
      structure: eventType.structure as DefenderStructureType,
      health: config[eventType.structure as DefenderStructureType][1].health,
      upgrades: 1,
      coordinates: { x: eventType.x, y: eventType.y },
    };
    m.actors.towers[unit.id] = unit;
  }
}

function buildTileFromEvent(
  eventType: BuildStructureEvent,
  faction: Faction,
  id: number
): AttackerStructureTile | DefenderStructureTile {
  if (faction === 'attacker')
    return {
      type: 'structure',
      faction: 'attacker',
      id: id,
    };
  else
    return {
      type: 'structure',
      faction: 'defender',
      id: id,
    };
}

function applyTowerRepair(config: MatchConfig, tower: DefenderStructure) {
  tower.health += config.towerRepairValue;
}

function applyCryptRepair(crypt: AttackerStructure) {
  crypt.spawned = crypt.spawned.slice(1); // add one more spawn slot
}

function applyUpgrade(structure: AttackerStructure | DefenderStructure): void {
  if (structure.upgrades < 3) structure.upgrades++;
}
