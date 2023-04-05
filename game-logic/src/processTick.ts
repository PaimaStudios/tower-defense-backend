import type Prando from 'paima-engine/paima-prando';
import type {
  MatchConfig,
  MatchState,
  TurnAction,
  TickEvent,
  StructureEvent,
  GoldRewardEvent,
  Tile,
  UnitSpawnedEvent,
  BuildStructureEvent,
  DamageEvent,
  DefenderBaseUpdateEvent,
  AttackerUnit,
  ActorDeletedEvent,
  AttackerStructure,
  DefenderStructure,
  StatusEffectAppliedEvent,
  UnitMovementEvent,
  Coordinates,
  TowerAttack,
  UnitAttack,
  BuildStructureAction,
  UpgradeTier,
} from '@tower-defense/utils';
import applyEvent from './apply';
import { baseGoldProduction, attackerUnitMap } from './config';

// Main function, exported as default. Mostly pure functions, outputting events
// given moves and a match state. The few exceptions are there to ensure
// rounds end when they must.

function processTick(
  matchConfig: MatchConfig,
  matchState: MatchState,
  moves: TurnAction[],
  currentTick: number,
  randomnessGenerator: Prando
): TickEvent[] | null {
  // Return null, i.e. move to next round iff the matchState shows the round has ended
  if (matchState.roundEnded) return incrementRound(matchState);
  // End round if the base health is 0
  if (matchState.defenderBase.health === 0) return endRound(matchConfig, matchState);
  // Else let's play
  // We generate new randomness for every tick. Seeds vary every round.
  for (const tick of Array(currentTick)) randomnessGenerator.next();
  // First tick is reserved to processing the user actions, i.e. events related to structures.
  // Gold is also rewarded at the first tick of the round
  if (currentTick === 1) {
    return structureEvents(matchConfig, matchState, moves);
  } else {
    // ticks 2+
    // if Rounds 1 and 2; we do not have a battle phase, hence round executor ends here
    if (matchState.currentRound === 1 || matchState.currentRound === 2)
      return endRound(matchConfig, matchState);
    // Else we do start a battle phase
    // subsequent ticks follow deterministically from a given match state after the structure updates have been processed.
    const events =
      eventsFromMatchState(matchConfig, matchState, currentTick, randomnessGenerator) || [];
    // Other events are processed one by one, as they affect global match state
    // End round if defender base health is 0
    if (matchState.defenderBase.health === 0) return endRound(matchConfig, matchState);
    // We check if all crypts have finished spawning by checking the key on the match state tracking that
    const allSpawned = Object.keys(matchState.actors.crypts).every(c =>
      matchState.finishedSpawning.includes(parseInt(c))
    );
    // We check if there are no more units running around
    const remainingUnits = Object.values(matchState.actors.units);
    // End the round when no events and all crypts stopped spawning
    if (events.length === 0 && allSpawned && remainingUnits.length === 0)
      return endRound(matchConfig, matchState);
    else {
      return events;
    }
  }
}
// We increment the round and mutate the few keys of the match state
// so the next round is saved clean to the database.
// Then we return null which signals the end of the round executor
function incrementRound(matchState: MatchState): null {
  // reset the list of spawned units of every crypt
  for (const crypt of Object.keys(matchState.actors.crypts)) {
    // annoying that Object.values stripes the types
    const c = matchState.actors.crypts[parseInt(crypt)];
    c.spawned = [];
  }
  matchState.finishedSpawning = [];
  // increment round
  matchState.currentRound++;
  // reset matchState so it starts processing on next tick
  matchState.roundEnded = false;
  return null;
}
// Function triggered as the final tick of the round .
// We send the last events, the gold rewards, and mark mutate the match state round as ended
// This then triggers the calling of incrementRound().
function endRound(
  matchConfig: MatchConfig,
  matchState: MatchState
): [GoldRewardEvent, GoldRewardEvent] {
  matchState.roundEnded = true;
  const gold = computeGoldRewards(matchConfig, matchState);
  for (const event of gold) applyEvent(matchConfig, matchState, event);
  return gold;
}
// Output the gold rewards for each side, according to the match config.
function computeGoldRewards(
  matchConfig: MatchConfig,
  matchState: MatchState
): [GoldRewardEvent, GoldRewardEvent] {
  const defenderBaseGold = baseGoldProduction[matchState.defenderBase.level] ?? 0;
  const attackerBaseGold = baseGoldProduction[matchState.attackerBase.level] ?? 0;
  const attackerReward = attackerBaseGold + matchConfig.baseAttackerGoldRate;
  const defenderReward = defenderBaseGold + matchConfig.baseDefenderGoldRate;
  const events: [GoldRewardEvent, GoldRewardEvent] = [
    {
      eventType: 'goldUpdate',
      faction: 'attacker',
      amount: attackerReward + matchState.attackerGold,
    },
    {
      eventType: 'goldUpdate',
      faction: 'defender',
      amount: defenderReward + matchState.defenderGold,
    },
  ];
  return events;
}

// Function to check if the user has enough money to spend in structures. Mutates state if true, returns the boolean result of the check.
function canSpend(matchConfig: MatchConfig, matchState: MatchState, action: TurnAction): boolean {
  if (action.action === 'salvage') return true;
  else {
    let cost = 0;
    if (action.action === 'build') cost = matchConfig[action.structure][1].price;
    else if (action.action === 'repair') cost = matchConfig.repairCost;
    else {
      const toUpgrade =
        action.faction === 'attacker'
          ? matchState.actors.crypts[action.id]
          : matchState.actors.towers[action.id];
      if (!toUpgrade) return false;
      const currentTier = toUpgrade.upgrades;
      if (currentTier >= 3) return false;
      cost = matchConfig[toUpgrade.structure][(currentTier + 1) as UpgradeTier].price;
    }
    if (action.faction === 'attacker' && matchState.attackerGold - cost >= 0) {
      // matchState.attackerGold -= amount;
      return true;
    } else if (action.faction === 'defender' && matchState.defenderGold - cost >= 0) {
      // matchState.defenderGold -= amount;
      return true;
    } else return false;
  }
}
// Outputs the events from the first tick, a function of the moves sent by the players.
function structureEvents(
  matchConfig: MatchConfig,
  matchState: MatchState,
  moves: TurnAction[]
): TickEvent[] {
  // We need to keep a global account of all actors in the match.
  // We iterate over user actions and reduce to a tuple of events produced and actor count,
  // then return the event array.
  const accumulator: [StructureEvent[], number] = [[], matchState.actorCount + 1];
  const structuralTick: typeof accumulator = moves.reduce((acc, item) => {
    if (!canSpend(matchConfig, matchState, item)) return acc;
    if (item.action === 'build') {
      const events = [...acc[0], buildEvent(matchConfig, matchState, item, acc[1])];
      const newCount = acc[1] + 1;
      return [events, newCount];
    } else {
      const events = [...acc[0], structureEvent(matchConfig, matchState, item)];
      return [events, acc[1]];
    }
  }, accumulator);
  return structuralTick[0];
}
function buildEvent(
  matchConfig: MatchConfig,
  matchState: MatchState,
  a: BuildStructureAction,
  count: number
): BuildStructureEvent {
  const event: BuildStructureEvent = {
    eventType: 'build',
    coordinates: a.coordinates,
    faction: a.faction,
    structure: a.structure,
    id: count,
  };
  applyEvent(matchConfig, matchState, event);
  return event;
}

function structureEvent(
  matchConfig: MatchConfig,
  matchState: MatchState,
  a: TurnAction
): StructureEvent {
  let event: StructureEvent;
  if (a.action === 'repair')
    event = {
      eventType: 'repair',
      faction: a.faction,
      id: a.id,
    };
  else if (a.action === 'upgrade')
    event = {
      eventType: 'upgrade',
      faction: a.faction,
      id: a.id,
    };
  else if (a.action === 'salvage')
    event = {
      eventType: 'salvage',
      faction: a.faction,
      id: a.id,
      gold: matchConfig.recoupAmount,
    };
  else event = { eventType: 'repair', faction: a.faction, id: 0 };
  applyEvent(matchConfig, matchState, event);
  return event;
}
// Events produced from Tick 2 forward, follow deterministically from match state.
function eventsFromMatchState(
  matchConfig: MatchConfig,
  matchState: MatchState,
  currentTick: number,
  rng: Prando
): TickEvent[] | null {
  // compute all spawn, movement, damage, statusDamage events for a tick given a certain map state
  // check if base is alive
  if (matchState.defenderBase.health <= 0) return null;
  else {
    const spawn = spawnEvents(matchConfig, matchState, currentTick);
    const movement = movementEvents(matchConfig, matchState);
    const towerAttacks = towerAttackEvents(matchConfig, matchState, currentTick, rng);
    const unitAttacks = unitAttackEvents(matchConfig, matchState, currentTick);
    return [...spawn, ...movement, ...towerAttacks, ...unitAttacks];
  }
}

// Spawn events, derive from the Crypts present at the map.
function spawnEvents(
  config: MatchConfig,
  matchState: MatchState,
  currentTick: number
): UnitSpawnedEvent[] {
  // Crypts are stored in an ordered map in the map state, we extract an array, filter active ones, and iterate.
  const crypts: AttackerStructure[] = Object.values(matchState.actors.crypts).filter(
    c => !matchState.finishedSpawning.includes(c.id)
  );
  // Old crypts can't spawn if old, i.e. 3 rounds after being build. Unless upgraded/repaired.
  // We disable them, once at the beginning of the round, by adding them to the finishedSpawned list. Else backend loops forever.
  // Only state mutation that happens in the event production flow.
  if (currentTick === 2) {
    for (const c of crypts) {
      const old = matchState.currentRound - c.builtOnRound >= 3 * (c.upgrades + 1);
      if (old) matchState.finishedSpawning.push(c.id);
    }
  }
  const events = crypts.map(ss => {
    // We get the crypt stats by looking up with the Match Config passed.
    const { spawnCapacity, spawnRate } = config[ss.structure][ss.upgrades];
    // Crypts spawn units if three conditions are met:
    // 1.- They're not old, see above
    // 2.- They have remaining spawn capacity
    const hasCapacity = ss.spawned.length < spawnCapacity;
    // 3.- The spawn rate fits the current tick.
    // tick 1 is reserved for structures. Spawning happens from tick 2.
    const aboutTime = (currentTick - 2) % spawnRate === 0;
    if (hasCapacity && aboutTime) {
      const newUnit = spawn(config, matchState, ss);
      applyEvent(config, matchState, newUnit); // one by one now
      return newUnit;
    } else return null;
  });
  const isNotNull = (e: UnitSpawnedEvent | null): e is UnitSpawnedEvent => !!e;
  return events.filter(isNotNull);
}
// Function to generate a single spawn event.
function spawn(
  config: MatchConfig,
  matchState: MatchState,
  crypt: AttackerStructure
): UnitSpawnedEvent {
  // First we look up the unit stats with the Match Config
  // Then we compute the path tile in the map where the units will spawn at.
  const path = findClosebyPath(matchState, crypt.coordinates);
  return {
    eventType: 'spawn',
    faction: 'attacker',
    cryptID: crypt.id,
    actorID: matchState.actorCount + 1, // increment
    coordinates: path,
    unitType: attackerUnitMap[crypt.structure],
    unitHealth: config[crypt.structure][crypt.upgrades].unitHealth,
    unitSpeed: config[crypt.structure][crypt.upgrades].unitSpeed,
    unitAttack: config[crypt.structure][crypt.upgrades].attackDamage,
    tier: crypt.upgrades,
  };
}
function closeByPaths(index: number, matchState: MatchState): number[] {
  const { x, y } = indexToCoords(index, matchState.width);
  return [
    { x, y: y - 1 },
    { x: x + 1, y },
    { x, y: y + 1 },
    { x: x - 1, y },
  ]
    .map(coordinates => validateCoords(coordinates, matchState))
    .filter((index): index is number => {
      if (index == null) return false;
      const tile = matchState.mapState[index];
      return tile.type === 'path' && tile.faction === 'attacker';
    });
}
function choosePath(paths: number[], mapWidth: number): number {
  const pick = paths.reduce((prev, curr) => {
    const a = indexToCoords(prev, mapWidth);
    const b = indexToCoords(curr, mapWidth);
    // whoever is further to the left
    if (a.x < b.x) return prev;
    else if (b.x < a.x) return curr;
    // else whoever is more centered in the y axis
    else return Math.abs(6 - a.y) < Math.abs(6 - b.y) ? prev : curr;
  });
  return pick;
}
// Function to find an available path next to a crypt to place a newly spawned unit.
// If there is more than one candidate then randomness is used to select one.
function findClosebyPath(matchState: MatchState, coords: number, range = 1): number {
  const adjacentPaths = closeByPaths(coords, matchState);
  if (adjacentPaths.length > 0) return choosePath(adjacentPaths, matchState.width);
  else {
    const morePaths = getSurroundingCells(coords, matchState, range + 1).filter(
      n => matchState.mapState[n].type === 'path'
    );
    if (morePaths.length > 0) return choosePath(morePaths, matchState.width);
    else return findClosebyPath(matchState, coords, range + 1);
  }
}

// Movement events, dervive from the units already on the match sate.
function movementEvents(
  matchConfig: MatchConfig,
  matchState: MatchState
): Array<UnitMovementEvent | StatusEffectAppliedEvent> {
  const attackers = Object.values(matchState.actors.units);
  const events = attackers.map(a => {
    // Units will always emit movement events unless they are macaws and they are busy attacking a nearby tower.
    const busyAttacking =
      a.subType === 'macaw' && findClosebyTowers(matchState, a.coordinates, 1).length > 0;
    if (busyAttacking) return null;
    else {
      // Generate movement events
      const moveEvent = move(matchConfig, a);
      // See if unit moved next to a friendly crypt and got a status buff from it
      const buffStatusEvents: StatusEffectAppliedEvent[] = buff(matchConfig, matchState, moveEvent);
      return [moveEvent, ...buffStatusEvents];
    }
  });
  const isNotNull = (
    e: UnitMovementEvent | StatusEffectAppliedEvent | null
  ): e is UnitMovementEvent | StatusEffectAppliedEvent => !!e;
  const ret = events.flat().filter(isNotNull);
  for (const event of ret) applyEvent(matchConfig, matchState, event);
  return ret;
  // .filter(e => e.completion === 100);dd
  // We had agreed with cat-astrophe that we'd only send movement events when the movement
  // was complete and they'd run the logic on the frontend, but they haven't yet so as of now
  // we still send them every single movement event. Once they fix that we can just uncomment that line.
}

// Function to generate individual movement events
function move(config: MatchConfig, a: AttackerUnit): UnitMovementEvent {
  // First we lookup the unit speed given the match config and possible status debuffs.
  const unitSpeed = getCurrentSpeed(config, a);
  const completion = (a.movementCompletion += unitSpeed);
  return {
    eventType: 'movement',
    faction: 'attacker',
    actorID: a.id,
    coordinates: a.coordinates,
    nextCoordinates: a.nextCoordinates,
    // if movement reaches 100% then movement is finalized
    completion: completion > 100 ? 100 : completion,
    movementSpeed: unitSpeed,
  };
}
// Simple function to lookup the unit speed on the match config and check for speed debuff status.
function getCurrentSpeed(config: MatchConfig, a: AttackerUnit): number {
  return a.status.reduce((acc, item) => {
    if (item === 'speedDebuff') return acc - Math.ceil(acc * 0.2); // TODO stack on the current speed or the base speed?
    if (item === 'speedBuff') return acc + Math.ceil(acc * 0.2); //  exponential sounds more fun
    else return acc;
  }, a.speed);
}

// Buff events, status events which happen as units pass next to friendly crypts.
function buff(
  matchConfig: MatchConfig,
  matchState: MatchState,
  event: UnitMovementEvent
): StatusEffectAppliedEvent[] {
  if (event.completion === 100) {
    const crypts = findClosebyCrypts(matchState, event.nextCoordinates, 1);
    const events = crypts.map(c => buffEvent(matchConfig, c, event.actorID));
    const isNotNull = (e: StatusEffectAppliedEvent | null): e is StatusEffectAppliedEvent => !!e;
    return events.filter(isNotNull);
  } else return [];
}

// helper function to emit buff events according to cryptType
function buffEvent(
  matchConfig: MatchConfig,
  crypt: AttackerStructure,
  unitId: number
): StatusEffectAppliedEvent | null {
  if (crypt.structure === 'gorillaCrypt' && crypt.upgrades === 2)
    return {
      eventType: 'statusApply',
      faction: 'attacker',
      sourceID: crypt.id,
      targetID: unitId,
      statusType: 'healthBuff',
      statusAmount: matchConfig.healthBuffAmount,
    };
  else if (crypt.structure === 'jaguarCrypt' && crypt.upgrades === 2)
    return {
      eventType: 'statusApply',
      faction: 'attacker',
      sourceID: crypt.id,
      targetID: unitId,
      statusType: 'speedBuff',
      statusAmount: matchConfig.speedBuffAmount,
    };
  else return null;
}
// Tower Attack Events, where defender towers try to destroy nearby units
function towerAttackEvents(
  config: MatchConfig,
  matchState: MatchState,
  currentTick: number,
  rng: Prando
): TowerAttack[] {
  const towers: DefenderStructure[] = Object.values(matchState.actors.towers);
  const events = towers.map(t => computeDamageToUnit(config, t, matchState, currentTick, rng));
  return events.flat();
}
// damage made by defender towers against units
function computeDamageToUnit(
  matchConfig: MatchConfig,
  tower: DefenderStructure,
  matchState: MatchState,
  currentTick: number,
  randomnessGenerator: Prando
): TowerAttack[] {
  //  Towers attack once every n ticks, the number being their "shot delay" or "cooldown" in this config.
  //  If not cooled down yet, return an empty array
  const cooldown = matchConfig[tower.structure][tower.upgrades].cooldown;
  const cool = (currentTick - 2) % cooldown === 0;
  if (!cool) return [];
  //  Check the attack range of the tower with the Match Config
  const range = matchConfig[tower.structure][tower.upgrades].range;
  // Given the computed rate, scan for all units that can be attacked
  const unitsNearby = findCloseByUnits(matchState, tower.coordinates, range);
  if (unitsNearby.length === 0) return [];
  // If there are units to attack, choose one, the weakest one to finish it off
  const events = damageByTower(matchConfig, tower, unitsNearby, randomnessGenerator);
  for (const event of events) applyEvent(matchConfig, matchState, event);
  return events;
}

// Reducer function to pass to computeUnitDamage() above. Selects the unit with the least health.
// if all equal selects the unit spawned earlier
function pickOne(acc: DefenderStructure, item: DefenderStructure): DefenderStructure;
function pickOne(acc: AttackerUnit, item: AttackerUnit): AttackerUnit;

function pickOne(acc: DefenderStructure | AttackerUnit, item: DefenderStructure | AttackerUnit) {
  if (item.health < acc.health) return item;
  else if (item.id < acc.id) return item;
  else return acc;
}
// Calculates damage done by the tower according to the tower type
function damageByTower(
  matchConfig: MatchConfig,
  tower: DefenderStructure,
  units: AttackerUnit[],
  randomnessGenerator: Prando
): TowerAttack[] {
  if (tower.structure === 'slothTower')
    return slothDamage(matchConfig, tower, units, randomnessGenerator);
  else if (tower.structure === 'piranhaTower' && tower.upgrades === 2)
    return units.map(u => towerShot(matchConfig, tower, u, randomnessGenerator)).flat();
  else {
    const pickedOne = units.reduce(pickOne);
    return towerShot(matchConfig, tower, pickedOne, randomnessGenerator);
  }
}
function towerShot(
  matchConfig: MatchConfig,
  tower: DefenderStructure,
  unit: AttackerUnit,
  randomnessGenerator: Prando
): TowerAttack[] {
  const damageAmount = computeDamageByTowerAmount(matchConfig, tower, unit, randomnessGenerator);
  const damageEvent: DamageEvent = {
    eventType: 'damage',
    faction: 'defender',
    sourceID: tower.id,
    targetID: unit.id,
    damageType: 'neutral',
    damageAmount: damageAmount,
  };
  const events: TowerAttack[] = [damageEvent];
  // Check if unit was killed by this damage
  const dying = damageAmount >= unit.health;
  // Generate a death event
  const killEvent: ActorDeletedEvent = {
    eventType: 'actorDeleted',
    faction: 'attacker',
    id: unit.id,
  };
  // If the shot killed the unit, add the event.
  if (dying) events.push(killEvent);
  // Macaws if upgraded can deflect attacks.
  const superMacaw = unit.subType === 'macaw' && unit.upgradeTier === 2;
  const deflectingDamageEvent: DamageEvent = {
    eventType: 'damage',
    faction: 'attacker',
    sourceID: unit.id,
    targetID: tower.id,
    damageAmount,
    damageType: 'neutral',
  };
  if (superMacaw) events.push(deflectingDamageEvent);
  return events;
}
// Calculate the damage caused by a tower attack. Upgraded Anaconda Towers have a 50% instakill chance.
function computeDamageByTowerAmount(
  matchConfig: MatchConfig,
  tower: DefenderStructure,
  unit: AttackerUnit,
  randomnessGenerator: Prando
): number {
  if (tower.structure === 'anacondaTower') {
    const killChance = tower.upgrades === 2 ? 0.5 : 0; // 50/50 chance of instakill if upgraded twice
    return randomnessGenerator.next() < killChance
      ? unit.health
      : matchConfig.anacondaTower[tower.upgrades].damage;
  } else return matchConfig[tower.structure][tower.upgrades].damage;
}
// Function to calculate damage done by Sloth Towers
function slothDamage(
  matchConfig: MatchConfig,
  tower: DefenderStructure,
  units: AttackerUnit[],
  randomnessGenerator: Prando
): TowerAttack[] {
  // Sloth towers are special in that they impose speed debuff statuses on affected units, and attack the whole range.
  const damageEvents: TowerAttack[][] = units.map(unit => {
    const events = towerShot(matchConfig, tower, unit, randomnessGenerator);
    const statusEvent: StatusEffectAppliedEvent = {
      eventType: 'statusApply',
      faction: 'attacker',
      sourceID: tower.id,
      targetID: unit.id,
      statusType: 'speedDebuff',
      statusAmount: unit.speed / 2, // 50% speed reduction
    };
    const buffing = tower.upgrades === 2;
    if (buffing) events.push(statusEvent);
    return events;
  });
  return damageEvents.flat();
}
// Events where Units attack the defender.
// Either Macaws attacking Towers, or any unit attacking the Defender Base
function unitAttackEvents(
  matchConfig: MatchConfig,
  matchState: MatchState,
  currentTick: number
): UnitAttack[] {
  const attackers: AttackerUnit[] = Object.values(matchState.actors.units);
  const events = attackers.map(a => {
    const damageToTower = computeDamageToTower(matchConfig, matchState, a, currentTick);
    const damageToBase = computeDamageToBase(matchConfig, matchState, a);
    const isNotNull = (e: UnitAttack | null): e is UnitAttack => !!e;
    return [...damageToTower, ...damageToBase].filter(isNotNull);
  });
  return events.flat();
}
// Damage made by Macaws to Defender Tower
function computeDamageToTower(
  matchConfig: MatchConfig,
  matchState: MatchState,
  attacker: AttackerUnit,
  currentTick: number
): (DamageEvent | ActorDeletedEvent)[] {
  if (attacker.subType !== 'macaw') return [];

  const cooldown = 10;
  if ((currentTick - 2) % cooldown !== 0) return [];
  const range = matchConfig.macawCrypt[attacker.upgradeTier].attackRange;
  const nearbyStructures = findClosebyTowers(matchState, attacker.coordinates, range);
  if (nearbyStructures.length === 0) return [];
  // choose one Tower to attack on the same basis: weakest or oldest
  const pickedOne = nearbyStructures.reduce(pickOne);
  const damageEvent: DamageEvent = {
    eventType: 'damage',
    faction: 'attacker',
    sourceID: attacker.id,
    targetID: pickedOne.id,
    damageType: 'neutral',
    damageAmount: attacker.damage,
  };
  // If damage kills the tower, generate kill event
  const dying = attacker.damage >= pickedOne.health;
  const killEvent: ActorDeletedEvent = {
    eventType: 'actorDeleted',
    faction: 'defender',
    id: pickedOne.id,
  };
  const events: (DamageEvent | ActorDeletedEvent)[] = dying
    ? [damageEvent, killEvent]
    : [damageEvent];
  for (const event of events) applyEvent(matchConfig, matchState, event);
  return events;
}
// Damage of units to defender base
function computeDamageToBase(
  matchConfig: MatchConfig,
  matchState: MatchState,
  attackerUnit: AttackerUnit
): [DefenderBaseUpdateEvent, ActorDeletedEvent] | [] {
  // Check the tile the unit is at;
  const t: Tile = matchState.mapState[attackerUnit.coordinates];
  // If unit is not at the defender's base, return empty event list
  if (!(t.type === 'base' && t.faction === 'defender')) return [];
  // If unit is at the defender's base, emit events for base damage and death of unit
  else {
    const remainingHealth = matchState.defenderBase.health - attackerUnit.damage;
    const health = remainingHealth < 0 ? 0 : remainingHealth;
    const baseEvent: DefenderBaseUpdateEvent = {
      eventType: 'defenderBaseUpdate',
      faction: 'defender',
      health,
    };
    const deathEvent: ActorDeletedEvent = {
      eventType: 'actorDeleted',
      faction: 'attacker',
      id: attackerUnit.id,
    };
    const events: [DefenderBaseUpdateEvent, ActorDeletedEvent] = [baseEvent, deathEvent];
    for (const event of events) applyEvent(matchConfig, matchState, event);
    return events;
  }
}
//  Locate nearby units.
function findCloseByUnits(
  matchState: MatchState,
  coords: number,
  range: number,
  radius = 1
): AttackerUnit[] {
  if (radius > range) return [];
  // Get all surrounding tile indexes;
  const surrounding = getSurroundingCells(coords, matchState, radius);
  // Get all units present on the map
  const units: AttackerUnit[] = Object.values(matchState.actors.units).filter(u =>
    surrounding.includes(u.coordinates)
  );
  if (units.length > 0) return units;
  else return findCloseByUnits(matchState, coords, range, radius + 1);
}

// Converts coord notation ({x: number, y: number}) to a single number, index of the flat map array.
export function coordsToIndex(coords: Coordinates, width: number): number {
  return width * coords.y + coords.x;
}
// Converts an index of the flat map to to coord notation
export function indexToCoords(i: number, width: number): Coordinates {
  const y = Math.floor(i / width);
  const x = i - y * width;
  return { x, y };
}
// Validate that coords don't overflow the map.
export function validateCoords(coords: Coordinates, matchState: MatchState): number | null {
  if (coords.x < 0 || coords.x >= matchState.width) return null;
  if (coords.y < 0 || coords.y >= matchState.height) return null;
  else return coordsToIndex(coords, matchState.width);
}
function getSurroundingCells(index: number, matchState: MatchState, range: number): number[] {
  const center = indexToCoords(index, matchState.width);
  const surroundingCells: Coordinates[] = [];
  for (let x = center.x - range; x <= center.x + range; x++) {
    for (let y = center.y - range; y <= center.y + range; y++) {
      // Exclude the center cell itself
      if (x === center.x && y === center.y) {
        continue;
      }
      // Calculate the distance from the center cell
      const dx = Math.abs(x - center.x);
      const dy = Math.abs(y - center.y);

      // Exclude diagonals for each range
      if (dx + dy <= range) {
        surroundingCells.push({ x, y });
      }
    }
  }
  return surroundingCells
    .map(coordinates => validateCoords(coordinates, matchState))
    .filter((index: number | null): index is number => index != null);
}

function findClosebyTowers(
  matchState: MatchState,
  coords: number,
  range: number,
  radius = 1
): DefenderStructure[] {
  if (radius > range) return [];
  const inRange = getSurroundingCells(coords, matchState, radius);
  const structures = Object.values(matchState.actors.towers).filter(tw =>
    inRange.includes(tw.coordinates)
  );
  if (structures.length) return structures;
  else return findClosebyTowers(matchState, coords, range, radius + 1);
}
function findClosebyCrypts(
  matchState: MatchState,
  coords: number | null,
  range: number,
  radius = 1
): AttackerStructure[] {
  if (coords == null) return [];
  if (radius > range) return [];
  const inRange = getSurroundingCells(coords, matchState, radius);
  const structures = Object.values(matchState.actors.crypts).filter(tw =>
    inRange.includes(tw.coordinates)
  );
  if (structures.length) return structures;
  else return findClosebyCrypts(matchState, coords, range, radius + 1);
}

export default processTick;
