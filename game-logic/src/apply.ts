import Prando from 'paima-engine/paima-prando';
import type {
  MatchConfig,
  MatchState,
  TickEvent,
  BuildStructureEvent,
  Faction,
  AttackerStructureType,
  DefenderStructureType,
  PathTile,
  DamageEvent,
  AttackerUnit,
  ActorDeletedEvent,
  AttackerStructure,
  DefenderStructure,
  UpgradeTier,
  Tile,
  Coordinates,
} from '@tower-defense/utils';
// Function to check if the user has enough money to spend in structures. Mutates state if true, returns the boolean result of the check.
function spendMoney(matchState: MatchState, faction: Faction | null, amount: number): boolean {
  if (faction === 'attacker' && matchState.attackerGold - amount >= 0) {
    matchState.attackerGold -= amount;
    return true;
  } else if (faction === 'defender' && matchState.defenderGold - amount >= 0) {
    matchState.defenderGold -= amount;
    return true;
  } else return false;
}
// function to mutate the match state after events are processed.
export default function applyEvents(
  config: MatchConfig,
  matchState: MatchState,
  events: TickEvent[],
  currentTick: number,
  randomnessGenerator: Prando
) {
  for (const event of events) {
    // let's find who's side is doing thing
    const faction = event.faction;
    switch (event.eventType) {
      case 'goldUpdate':
        if (faction === 'attacker') matchState.attackerGold = event.amount;
        else if (faction === 'defender') matchState.defenderGold = event.amount;
        break;
      case 'build':
        const cost = config[event.structure][1].price;
        const spendIfCan = spendMoney(matchState, faction, cost);
        if (spendIfCan) {
          // mutate map with new actor
          setStructureFromEvent(config, matchState, event, faction as Faction, event.id);
          matchState.actorCount++;
        }
        break;
      case 'repair':
        const toRepair =
          faction === 'attacker'
            ? matchState.actors.crypts[event.id]
            : matchState.actors.towers[event.id];
        // Frontend should disallow this but we don't want the backend to break either
        if (!toRepair) break;
        if (spendMoney(matchState, faction, config.repairCost)) {
          if (faction === 'attacker') applyCryptRepair(matchState.actors.crypts[event.id]);
          if (faction === 'defender') applyTowerRepair(config, matchState.actors.towers[event.id]);
        }
        break;
      case 'upgrade':
        const toUpgrade =
          faction === 'attacker'
            ? matchState.actors.crypts[event.id]
            : matchState.actors.towers[event.id];
        // Frontend should disallow this but we don't want the backend to break either
        if (!toUpgrade) break;
        const currentTier = toUpgrade.upgrades;
        if (currentTier < 3) {
          const newTier = (currentTier + 1) as UpgradeTier;
          const cost = config[toUpgrade.structure][newTier].price;
          if (spendMoney(matchState, faction, cost)) applyUpgrade(toUpgrade);
        }
        break;
      case 'salvage':
        // const coords = findActorCoords(m, event);
        if (faction === 'attacker') {
          // NEW made redundant by catastrophe's thing
          // m.mapState[coordsToIndex(coords, m.width)] = { type: 'open', faction: 'attacker' };
          // m.contents[coords.y][coords.x] = { type: 'open', faction: 'attacker' };
          matchState.attackerGold += event.gold;
          if (matchState.actors.crypts[event.id]) delete matchState.actors.crypts[event.id];
          // else if (m.actors.units[event.id]) delete m.actors.units[event.id];
        } else if (faction === 'defender') {
          // m.mapState[coordsToIndex(coords, m.width)] = { type: 'open', faction: 'defender' };
          // m.contents[coords.y][coords.x] = { type: 'open', faction: 'defender' };
          matchState.defenderGold += event.gold; // TODO get amount right
          delete matchState.actors.towers[event.id];
        }
        break;
      case 'spawn':
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
          coordinates: event.coordinates,
          nextCoordinates: findDestination(
            matchState,
            event.coordinates,
            null,
            randomnessGenerator
          ),
          movementCompletion: 0,
        };
        const crypt = matchState.actors.crypts[event.cryptID];
        // add unit to unit graph
        matchState.actors.units[event.actorID] = spawnedUnit;
        // add unit to spawned list of its crypt
        crypt.spawned = [...crypt.spawned, event.actorID];
        // add crypt to Finished Spawned List if it reached its spawn limit
        const spawned = crypt.spawned.length;
        const spawnLimit = config[crypt.structure][crypt.upgrades].spawnCapacity;
        if (spawned === spawnLimit)
          matchState.finishedSpawning = [...matchState.finishedSpawning, event.cryptID];
        // Increment actor count
        matchState.actorCount++;
        break;
      case 'movement':
        // change coordinates at the unit
        const unitMoving = matchState.actors.units[event.actorID];
        // if movement complete, switch coordinates
        if (event.completion >= 100) {
          unitMoving.previousCoordinates = unitMoving.coordinates;
          unitMoving.coordinates = event.nextCoordinates as number;
          unitMoving.nextCoordinates = findDestination(
            matchState,
            unitMoving.coordinates,
            unitMoving.previousCoordinates,
            randomnessGenerator
          );
          unitMoving.movementCompletion = 0;
        } else unitMoving.movementCompletion = event.completion;
        break;
      case 'damage':
        const damageEvent = event as DamageEvent;
        // find the affected unit
        const damagedUnit =
          faction === 'attacker'
            ? matchState.actors.towers[damageEvent.targetID]
            : matchState.actors.units[damageEvent.targetID];
        if (damagedUnit && damageEvent.damageType === 'neutral')
          damagedUnit.health = damagedUnit.health - event.damageAmount;
        break;
      case 'actorDeleted':
        // it may happen that several actorDeleted events are issued about one single unit
        // if e.g. several units attack her at the same tick
        const deleteEvent = event as ActorDeletedEvent;
        const unitToDelete =
          event.faction === 'attacker'
            ? matchState.actors.units[deleteEvent.id]
            : matchState.actors.towers[deleteEvent.id];
        if (!unitToDelete)
          // because already wiped out by a previous event
          break;
        else {
          // delete unit from unit list
          if (event.faction === 'attacker') delete matchState.actors.units[deleteEvent.id];
          else delete matchState.actors.towers[deleteEvent.id];
          // we do not decrement the MatchState unitCount as we don't want to recycle ids
          break;
        }
      case 'defenderBaseUpdate':
        matchState.defenderBase.health = event.health;
        break;
      case 'statusApply':
        matchState.actors.units[event.targetID].status = [
          ...matchState.actors.units[event.targetID].status,
          event.statusType,
        ];
        break;
    }
  }
}

const isBase = (t: Tile) => t.type === 'base' && t.faction === 'defender';
// Function to find the path which a unit will move towards.
function findDestination(
  matchState: MatchState,
  coordinates: number,
  previousCoordinates: number | null,
  randomnessGenerator: Prando
): number | null {
  const tile = matchState.mapState[coordinates];
  // if the unit is already at the defender base, they don't move anymore, time to die
  if (isBase(tile)) return null;
  else {
    const t = tile as PathTile;
    const baseIndex = matchState.mapState.findIndex(
      t => t.type === 'base' && t.faction === 'defender'
    );
    const baseCoords = indexToCoords(baseIndex, matchState.width);
    // filter available paths for distance to base, make sure you're not going the wrong path
    // If only one available path just go right there
    if (t['leadsTo'].length === 1) return t['leadsTo'][0];
    // If more than one path available, find the fastest path to the base
    const ret = t['leadsTo']
      // Filter out the previous coordinates so the unit doesn't go backwards
      .filter(p => p !== previousCoordinates)
      // Then compare distance to base of the second next tile, not the immediately next one.
      .reduce((prev, curr) => {
        const a = distanceToBase(prev, baseCoords, matchState.width);
        const b = distanceToBase(curr, baseCoords, matchState.width);
        const closest = a < b ? prev : curr;
        const nextA = naiveNext(prev, previousCoordinates || coordinates, baseCoords, matchState);
        const nextB = naiveNext(curr, previousCoordinates || coordinates, baseCoords, matchState);
        // Mostly just a type check, shouldn't happen
        if (!nextA || !nextB) return closest;
        else {
          const distA = distanceToBase(nextA, baseCoords, matchState.width);
          const distB = distanceToBase(nextB, baseCoords, matchState.width);
          const ret = distA < distB ? prev : distA === distB ? closest : curr;
          return ret;
        }
      });
    return ret;
  }
}
// Function to find the next tile a unit will move to according to a simple distance calculation
function naiveNext(
  coord: number,
  previousCoords: number,
  baseCoords: Coordinates,
  matchState: MatchState
): number | null {
  const tile = matchState.mapState[coord];
  if (isBase(tile)) return coord;
  if (tile.type !== 'path') return null;
  else
    return tile.leadsTo
      .filter(p => p !== previousCoords)
      .reduce((prev, curr) => {
        const a = distanceToBase(prev, baseCoords, matchState.width);
        const b = distanceToBase(curr, baseCoords, matchState.width);
        return a < b ? prev : curr;
      });
}
function indexToCoords(i: number, width: number): Coordinates {
  const y = Math.floor(i / width);
  const x = i - y * width;
  return { x, y };
}
function distanceToBase(path: number, baseCoords: Coordinates, mapWidth: number) {
  const myCoords = indexToCoords(path, mapWidth);
  const distanceToBase = Math.abs(baseCoords.x - myCoords.x) + Math.abs(baseCoords.y - myCoords.y);
  return distanceToBase;
}
// Simple helper function to select a random path with the randomness generator.
function randomizePath(
  paths: number[],
  randomnessGenerator: Prando,
  presentCoordinates: number,
  fresh: boolean
): number {
  const randomness = randomnessGenerator.next();
  let forwardPaths = paths;
  // If freshly spawned, make sure the unit moves preferrable towards the left
  if (fresh) forwardPaths = paths.filter(p => p < presentCoordinates);
  const index = Math.floor(randomness * forwardPaths.length);
  return forwardPaths[index] || Math.min(...paths);
}

function setStructureFromEvent(
  config: MatchConfig,
  matchState: MatchState,
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
      coordinates: eventType.coordinates,
      builtOnRound: matchState.currentRound, // + 3 it stops spawning
      spawned: [],
    };
    matchState.actors.crypts[unit.id] = unit;
  } else {
    const unit: DefenderStructure = {
      type: 'structure',
      faction: 'defender',
      id: id,
      structure: eventType.structure as DefenderStructureType,
      health: config[eventType.structure as DefenderStructureType][1].health,
      upgrades: 1,
      coordinates: eventType.coordinates,
    };
    matchState.actors.towers[unit.id] = unit;
  }
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
