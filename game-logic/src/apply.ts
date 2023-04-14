import type {
  MatchConfig,
  MatchState,
  TickEvent,
  BuildStructureEvent,
  Faction,
  AttackerStructureType,
  DefenderStructureType,
  AttackerUnit,
  AttackerStructure,
  DefenderStructure,
  UpgradeTier,
  Coordinates,
} from '@tower-defense/utils';
import { AStarFinder } from 'astar-typescript';
import { coordsToIndex } from './processTick';
import { calculateRecoupGold } from './utils';

// function to mutate the match state after events are processed.
export default function applyEvent(config: MatchConfig, matchState: MatchState, event: TickEvent) {
  // let's find who's side is doing thing
  const faction = event.faction;
  switch (event.eventType) {
    case 'goldUpdate':
      if (faction === 'attacker') matchState.attackerGold = event.amount;
      else if (faction === 'defender') matchState.defenderGold = event.amount;
      break;
    case 'build':
      // mutate map with new actor
      applyBuild(config, matchState, event, faction, event.id);
      matchState.actorCount++;
      break;
    case 'repair':
      if (faction === 'attacker')
        applyCryptRepair(config, matchState, matchState.actors.crypts[event.id]);
      if (faction === 'defender')
        applyTowerRepair(config, matchState, matchState.actors.towers[event.id]);
      break;
    case 'upgrade':
      applyUpgrade(config, matchState, faction, event.id);
      break;
    case 'salvage':
      if (faction === 'attacker') {
        const structure = matchState.actors.crypts[event.id];
        if (structure) {
          matchState.attackerGold += calculateRecoupGold(structure, config);
          delete matchState.actors.crypts[event.id];
        }
      } else if (faction === 'defender') {
        const structure = matchState.actors.towers[event.id];
        if (structure) {
          matchState.defenderGold += calculateRecoupGold(structure, config);
          delete matchState.actors.towers[event.id];
        }
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
        coordinates: event.coordinates,
        movementCompletion: 0,
        path: calculatePath(event.coordinates, matchState),
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
        unitMoving.coordinates = event.nextCoordinates;
        unitMoving.movementCompletion = 0;
      } else unitMoving.movementCompletion = event.completion;
      break;
    case 'damage':
      // find the affected unit
      const damagedUnit =
        faction === 'attacker'
          ? matchState.actors.towers[event.targetID]
          : matchState.actors.units[event.targetID];
      if (damagedUnit && event.damageType === 'neutral')
        damagedUnit.health = damagedUnit.health - event.damageAmount;
      break;
    case 'actorDeleted':
      // it may happen that several actorDeleted events are issued about one single unit
      // if e.g. several units attack her at the same tick
      const unitToDelete =
        event.faction === 'attacker'
          ? matchState.actors.units[event.id]
          : matchState.actors.towers[event.id];
      if (!unitToDelete)
        // because already wiped out by a previous event
        break;
      else {
        // delete unit from unit list
        if (event.faction === 'attacker') delete matchState.actors.units[event.id];
        else delete matchState.actors.towers[event.id];
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

function calculatePath(unitLocation: number, matchState: MatchState): number[] {
  const baseLocation = matchState.defenderBase.coordinates;
  const baseCoords = indexToCoords(baseLocation, matchState.width);
  const starting = indexToCoords(unitLocation, matchState.width);
  const pathFinder = new AStarFinder({
    grid: {
      matrix: matchState.pathMap,
    },
    diagonalAllowed: false,
  });
  const path = pathFinder.findPath(starting, baseCoords);
  return path.map(tuple => coordsToIndex({ x: tuple[0], y: tuple[1] }, matchState.width));
}

function indexToCoords(i: number, width: number): Coordinates {
  const y = Math.floor(i / width);
  const x = i - y * width;
  return { x, y };
}

function applyBuild(
  config: MatchConfig,
  matchState: MatchState,
  eventType: BuildStructureEvent,
  faction: Faction,
  id: number
): void {
  // read stats from passed matchConfig
  const cost = config[eventType.structure][1].price;
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
    matchState.attackerGold -= cost;
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
    matchState.defenderGold -= cost;
  }
}

function applyTowerRepair(config: MatchConfig, matchState: MatchState, tower: DefenderStructure) {
  tower.health += config.towerRepairValue;
  matchState.defenderGold -= config.repairCost;
}

function applyCryptRepair(config: MatchConfig, matchState: MatchState, crypt: AttackerStructure) {
  crypt.spawned = crypt.spawned.slice(1); // add one more spawn slot
  matchState.attackerGold -= config.repairCost;
}

function applyUpgrade(
  matchConfig: MatchConfig,
  matchState: MatchState,
  faction: Faction,
  structureID: number
): void {
  const toUpgrade =
    faction === 'attacker'
      ? matchState.actors.crypts[structureID]
      : matchState.actors.towers[structureID];
  // Frontend should disallow this but we don't want the backend to break either
  const side = faction === 'attacker' ? 'attackerGold' : 'defenderGold';
  const cost = matchConfig[toUpgrade.structure][(toUpgrade.upgrades + 1) as UpgradeTier].price;
  toUpgrade.upgrades++;
  matchState[side] -= cost;
}
