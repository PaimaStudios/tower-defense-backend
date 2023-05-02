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
  Macaw,
} from '@tower-defense/utils';
import { calculatePath, calculateRecoupGold, isDefenderStructure } from './utils';

// function to mutate the match state after events are processed.
export default function applyEvent(
  config: MatchConfig,
  matchState: MatchState,
  event: TickEvent,
  currentTick = 0
) {
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
      const destination = matchState.defenderBase.coordinates;
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
        path: calculatePath(event.coordinates, destination, matchState.pathMap),
      };
      const crypt = matchState.actors.crypts[event.cryptID];
      // add unit to unit graph
      const finalUnit =
        event.unitType === 'macaw' ? ({ ...spawnedUnit, lastShot: 0 } as Macaw) : spawnedUnit;
      matchState.actors.units[event.actorID] = finalUnit;
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
      const [damagedUnit, attacker] =
        faction === 'attacker'
          ? [
              matchState.actors.towers[event.targetID],
              matchState.actors.units[event.sourceID] as Macaw,
            ]
          : [matchState.actors.units[event.targetID], matchState.actors.towers[event.sourceID]];
      // if affected unit exists (which it should) reduce its health
      if (damagedUnit && event.damageType === 'neutral')
        damagedUnit.health = damagedUnit.health - event.damageAmount;
      // set last shot
      attacker.lastShot = currentTick;
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
      lastShot: 0,
    };
    matchState.actors.towers[unit.id] = unit;
    matchState.defenderGold -= cost;
  }
}

function applyTowerRepair(config: MatchConfig, matchState: MatchState, tower: DefenderStructure) {
  const max = config[tower.structure][tower.upgrades].health;
  const repaired = tower.health + config.towerRepairValue;
  tower.health = repaired > max ? max : repaired;
  matchState.defenderGold -= config.repairCost;
}

function applyCryptRepair(config: MatchConfig, matchState: MatchState, crypt: AttackerStructure) {
  // crypt.spawned = crypt.spawned.slice(1); // deprecated since we don't age crypts anymore
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
  const cost = matchConfig[toUpgrade.structure][(toUpgrade.upgrades + 1) as UpgradeTier].price;

  if (isDefenderStructure(toUpgrade)) {
    const currentConfig = matchConfig[toUpgrade.structure][toUpgrade.upgrades as UpgradeTier];
    const upgradeConfig = matchConfig[toUpgrade.structure][(toUpgrade.upgrades + 1) as UpgradeTier];
    // tower gains upgraded health while keeping the current damages (if present)
    toUpgrade.health += upgradeConfig.health - currentConfig.health;
  }
  toUpgrade.upgrades++;
  matchState[`${faction}Gold`] -= cost;
}
