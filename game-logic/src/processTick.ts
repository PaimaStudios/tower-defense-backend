import type Prando from '@paima/prando';
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
  TowerAttack,
  UnitAttack,
  BuildStructureAction,
  UpgradeTier,
  RepairStructureEvent,
  UpgradeStructureEvent,
  SalvageStructureEvent,
  RepairStructureAction,
  SalvageStructureAction,
  UpgradeStructureAction,
  Macaw,
  MapState,
} from '@tower-defense/utils';
import applyEvent from './apply.js';
import { attackerUnitMap } from './config.js';
import { findCloseBySpawnTile, getSurroundingCells } from './utils.js';

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
  if (currentTick === 1) {
    // First tick is reserved to processing the user actions, i.e. events related to structures.
    const structures = structureEvents(matchConfig, matchState, moves);
    const goldUpdate: GoldRewardEvent[] = [
      {
        eventType: 'goldUpdate',
        faction: 'defender',
        amount: matchState.defenderGold,
      },
      {
        eventType: 'goldUpdate',
        faction: 'attacker',
        amount: matchState.attackerGold,
      },
    ];
    return [...structures, ...goldUpdate];
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
  for (const crypt of Object.values(matchState.actors.crypts)) {
    (crypt as AttackerStructure).spawned = [];
  }
  // reset the last shot of every tower
  for (const tower of Object.values(matchState.actors.towers)) {
    (tower as DefenderStructure).lastShot = 0;
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
  const attackerGold =
    matchConfig.baseAttackerGoldRate + matchState.attackerGold > matchConfig.maxAttackerGold
      ? matchConfig.maxAttackerGold
      : matchConfig.baseAttackerGoldRate + matchState.attackerGold;
  const defenderGold =
    matchConfig.baseDefenderGoldRate + matchState.defenderGold > matchConfig.maxDefenderGold
      ? matchConfig.maxDefenderGold
      : matchConfig.baseDefenderGoldRate + matchState.defenderGold;

  const events: [GoldRewardEvent, GoldRewardEvent] = [
    {
      eventType: 'goldUpdate',
      faction: 'attacker',
      amount: attackerGold,
    },
    {
      eventType: 'goldUpdate',
      faction: 'defender',
      amount: defenderGold,
    },
  ];
  return events;
}

// Function to check if the user has enough money to spend in structures. Mutates state if true, returns the boolean result of the check.
function canSpend(matchConfig: MatchConfig, matchState: MatchState, action: TurnAction): boolean {
  if (action.action === 'salvage') return true;

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
    return true;
  }
  if (action.faction === 'defender' && matchState.defenderGold - cost >= 0) {
    return true;
  }
  return false;
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
      const newEvent = getStructureEvent(item);
      applyEvent(matchConfig, matchState, newEvent);
      acc[0].push(newEvent);
      return acc;
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

function getStructureEvent(
  action: RepairStructureAction | SalvageStructureAction | UpgradeStructureAction
): StructureEvent {
  const structureEvent: RepairStructureEvent | UpgradeStructureEvent | SalvageStructureEvent = {
    eventType: action.action,
    faction: action.faction,
    id: action.id,
  };
  return structureEvent;
}

// Events produced from Tick 2 forward, follow deterministically from match state.
function eventsFromMatchState(
  matchConfig: MatchConfig,
  matchState: MatchState,
  currentTick: number,
  rng: Prando
): TickEvent[] {
  // compute all spawn, movement, damage, statusDamage events for a tick given a certain map state
  // check if base is alive
  const spawn = spawnEvents(matchConfig, matchState, currentTick);
  const movement = movementEvents(matchConfig, matchState, currentTick);
  const towerAttacks = towerAttackEvents(matchConfig, matchState, currentTick, rng);
  const unitAttacks = unitAttackEvents(matchConfig, matchState, currentTick);
  return [...spawn, ...movement, ...towerAttacks, ...unitAttacks];
}

// Spawn events, derive from the Crypts present at the map.
function spawnEvents(
  config: MatchConfig,
  matchState: MatchState,
  currentTick: number
): UnitSpawnedEvent[] {
  // Crypts are stored in an ordered map in the map state, we extract an array, filter active ones, and iterate.
  const crypts: AttackerStructure[] = Object.values(matchState.actors.crypts).filter(
    (c: AttackerStructure) => !matchState.finishedSpawning.includes(c.id)
  );
  const events = crypts.map(ss => {
    // We get the crypt stats by looking up with the Match Config passed.
    const { spawnCapacity, spawnRate } = config[ss.structure][ss.upgrades];
    // Crypts spawn units if two conditions are met:
    // 1.- They have remaining spawn capacity
    const hasCapacity = ss.spawned.length < spawnCapacity;
    // 2.- The spawn rate fits the current tick.
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
  const { height, map, width } = matchState;
  const mapState: MapState = { height, width, map };
  const spawnTile = findCloseBySpawnTile(mapState, crypt.coordinates);
  return {
    eventType: 'spawn',
    faction: 'attacker',
    cryptID: crypt.id,
    actorID: matchState.actorCount + 1, // increment
    coordinates: spawnTile,
    unitType: attackerUnitMap[crypt.structure],
    unitHealth: config[crypt.structure][crypt.upgrades].unitHealth,
    unitSpeed: config[crypt.structure][crypt.upgrades].unitSpeed,
    unitAttack: config[crypt.structure][crypt.upgrades].attackDamage,
    tier: crypt.upgrades,
  };
}

// Movement events, derive from the units already on the match sate.
function movementEvents(
  matchConfig: MatchConfig,
  matchState: MatchState,
  currentTick: number
): Array<UnitMovementEvent | StatusEffectAppliedEvent> {
  const attackers = Object.values(matchState.actors.units);
  const events = attackers.map((attacker: AttackerUnit) => {
    // Units will always emit movement events unless they are macaws and they are busy attacking a nearby tower.
    let busyAttacking = false;
    if (attacker.subType === 'macaw') {
      const a = attacker as Macaw;
      const cooldown = matchConfig.macawCrypt[attacker.upgradeTier].attackCooldown;
      const cool = a.lastShot === 0 || currentTick - a.lastShot > cooldown;
      busyAttacking = cool && findClosebyTowers(matchState, a.coordinates, 1).length > 0;
    }
    if (busyAttacking) return null;
    else {
      // Generate movement events
      const moveEvent = move(attacker);
      return [moveEvent];
    }
  });
  const isNotNull = (e: UnitMovementEvent | null): e is UnitMovementEvent => !!e;
  const ret = events.flat().filter(isNotNull);
  for (const event of ret) applyEvent(matchConfig, matchState, event);
  return ret;
  // .filter(e => e.completion === 100);
  // We had agreed with cat-astrophe that we'd only send movement events when the movement
  // was complete and they'd run the logic on the frontend, but they haven't yet so as of now
  // we still send them every single movement event. Once they fix that we can just uncomment that line.
}

// Function to generate individual movement events
function move(attacker: AttackerUnit): UnitMovementEvent {
  const completion = (attacker.movementCompletion += attacker.speed);
  const nextIndex = attacker.path.indexOf(attacker.coordinates) + 1;
  const nextCoordinates = attacker.path[nextIndex];
  return {
    eventType: 'movement',
    faction: 'attacker',
    actorID: attacker.id,
    coordinates: attacker.coordinates,
    nextCoordinates,
    // if movement reaches 100% then movement is finalized
    completion: completion > 100 ? 100 : completion,
    movementSpeed: attacker.speed,
  };
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
  const cool = tower.lastShot === 0 || currentTick - tower.lastShot > cooldown;
  if (!cool) return [];
  //  Check the attack range of the tower with the Match Config
  const range = matchConfig[tower.structure][tower.upgrades].range;
  // Given the computed rate, scan for all units that can be attacked
  const unitsNearby = findCloseByUnits(matchState, tower.coordinates, range);
  if (unitsNearby.length === 0) return [];
  // If there are units to attack, choose one, the weakest one to finish it off
  const events = damageByTower(matchConfig, matchState, tower, unitsNearby, randomnessGenerator);
  for (const event of events) applyEvent(matchConfig, matchState, event, currentTick);
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
  matchState: MatchState,
  tower: DefenderStructure,
  units: AttackerUnit[],
  randomnessGenerator: Prando
): TowerAttack[] {
  if (tower.structure === 'slothTower')
    return slothDamage(matchConfig, matchState, tower, units, randomnessGenerator);
  else {
    const pickedOne = units.reduce(pickOne);
    return towerShot(matchConfig, matchState, tower, pickedOne, randomnessGenerator);
  }
}

function towerShot(
  matchConfig: MatchConfig,
  matchState: MatchState,
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
  return events;
}

// Calculate the damage caused by a tower attack. Upgraded Anaconda Towers have a 50% instakill chance.
function computeDamageByTowerAmount(
  matchConfig: MatchConfig,
  tower: DefenderStructure,
  unit: AttackerUnit,
  randomnessGenerator: Prando
): number {
  return matchConfig[tower.structure][tower.upgrades].damage;
}

// Function to calculate damage done by Sloth Towers
function slothDamage(
  matchConfig: MatchConfig,
  matchState: MatchState,
  tower: DefenderStructure,
  units: AttackerUnit[],
  randomnessGenerator: Prando
): TowerAttack[] {
  const damageEvents = units.reduce((acc, unit) => {
    if (unit.subType === 'jaguar') return acc;
    const events = towerShot(matchConfig, matchState, tower, unit, randomnessGenerator);
    return [...acc, ...events];
  }, [] as TowerAttack[]);
  return damageEvents;
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
    const damageToTower =
      a.subType === 'macaw'
        ? computeDamageToTower(matchConfig, matchState, a as Macaw, currentTick)
        : [];
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
  attacker: Macaw,
  currentTick: number
): (DamageEvent | ActorDeletedEvent)[] {
  const cooldown = matchConfig.macawCrypt[attacker.upgradeTier].attackCooldown;
  const cool = attacker.lastShot === 0 || currentTick - attacker.lastShot > cooldown;
  if (!cool) return [];
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
  for (const event of events) applyEvent(matchConfig, matchState, event, currentTick);
  return events;
}

// Damage of units to defender base
function computeDamageToBase(
  matchConfig: MatchConfig,
  matchState: MatchState,
  attackerUnit: AttackerUnit
): [DefenderBaseUpdateEvent, ActorDeletedEvent] | [] {
  // Check the tile the unit is at;
  const t: Tile = matchState.map[attackerUnit.coordinates];
  // If unit is not at the defender's base, return empty event list
  if (!(t.type === 'base' && t.faction === 'defender')) return [];
  // If unit is at the defender's base, emit events for base damage and death of unit
  else {
    const remainingHealth = matchState.defenderBase.health - 1; // we hardcode 1 here, reserve attack spec to macaw-on-tower attacks
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
  const surrounding = getSurroundingCells(coords, matchState.width, matchState.height, range);
  // Get all units present on the map
  const units: AttackerUnit[] = Object.values(matchState.actors.units).filter((u: AttackerUnit) =>
    surrounding.includes(u.coordinates)
  );
  return units;
}

function findClosebyTowers(
  matchState: MatchState,
  coords: number,
  range: number,
  radius = 1
): DefenderStructure[] {
  if (radius > range) return [];
  const inRange = getSurroundingCells(coords, matchState.width, matchState.height, radius);
  const structures = Object.values(matchState.actors.towers).filter((tw: DefenderStructure) =>
    inRange.includes(tw.coordinates)
  );
  if (structures.length) {
    return structures;
  }
  return findClosebyTowers(matchState, coords, range, radius + 1);
}

export default processTick;
