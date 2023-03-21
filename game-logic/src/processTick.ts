import Prando from 'paima-engine/paima-prando';
import type {
  MatchConfig,
  MatchState,
  TurnAction,
  TickEvent,
  StructureEvent,
  GoldRewardEvent,
  Tile,
  UnitSpawnedEvent,
  AttackerStructureTile,
  BuildStructureEvent,
  DefenderStructureTile,
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
  UnitType,
  BuildStructureAction,
} from '@tower-defense/utils';
import applyEvents from './apply';

// Main function, exported as default.

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
  if (matchState.defenderBase.health === 0)
    return endRound(matchConfig, matchState, currentTick, randomnessGenerator);
  // Else let's play
  // We generate new randomness for every tick. Seeds vary every round.
  for (const tick of Array(currentTick)) randomnessGenerator.next();
  // First tick is reserved to processing the user actions, i.e. events related to structures.
  // Gold is also rewarded at the first tick of the round
  if (currentTick === 1) {
    const events = structureEvents(matchConfig, matchState, moves);
    // Structure events are processed in a batch as they don't affect each other
    applyEvents(matchConfig, matchState, events, currentTick, randomnessGenerator);
    return events;
  } else {
    // ticks 2+
    // if Rounds 1 and 2; we do not have a battle phase, hence round executor ends here
    if (matchState.currentRound === 1 || matchState.currentRound === 2)
      return endRound(matchConfig, matchState, currentTick, randomnessGenerator);
    // Else we do start a battle phase
    // subsequent ticks follow deterministically from a given match state after the structure updates have been processed.
    const events =
      eventsFromMatchState(matchConfig, matchState, currentTick, randomnessGenerator) || [];
    // Other events are processed one by one, as they affect global match state
    // End round if defender base health is 0
    if (matchState.defenderBase.health === 0)
      return endRound(matchConfig, matchState, currentTick, randomnessGenerator);
    const allSpawned = Object.keys(matchState.actors.crypts).every(c =>
      matchState.finishedSpawning.includes(parseInt(c))
    );
    const remainingUnits = Object.values(matchState.actors.units);
    // End the round when no events and all crypts stopped spawning
    if (events.length === 0 && allSpawned && remainingUnits.length === 0)
      return endRound(matchConfig, matchState, currentTick, randomnessGenerator);
    else {
      return events;
    }
  }
}
function incrementRound(matchState: MatchState): null {
  console.log(matchState.currentRound, 'incrementing round');
  // reset the list of spawned units of every crypt
  for (let crypt of Object.keys(matchState.actors.crypts)) {
    // annoying that Object.values stripes the types
    const c = matchState.actors.crypts[parseInt(crypt)];
    c.spawned = [];
  }
  // increment round
  matchState.currentRound++;
  // reset matchState so it starts processing on next tick
  matchState.roundEnded = false;
  return null;
}
function endRound(
  matchConfig: MatchConfig,
  matchState: MatchState,
  currentTick: number,
  randomnessGenerator: Prando
): [GoldRewardEvent, GoldRewardEvent] {
  console.log(matchState.currentRound, 'ending round');
  console.log(matchState.defenderBase.health, 'base health');
  matchState.roundEnded = true;
  const gold = computeGoldRewards(matchConfig, matchState);
  applyEvents(matchConfig, matchState, gold, currentTick, randomnessGenerator);
  return gold;
}

function computeGoldRewards(
  matchConfig: MatchConfig,
  matchState: MatchState
): [GoldRewardEvent, GoldRewardEvent] {
  const baseGoldProduction = (level: number) =>
    level === 1 ? 100 : level === 2 ? 200 : level === 3 ? 400 : 0; // ...
  const defenderBaseGold = baseGoldProduction(matchState.defenderBase.level);
  const attackerBaseGold = baseGoldProduction(matchState.attackerBase.level);
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
function structureEvents(c: MatchConfig, m: MatchState, moves: TurnAction[]): TickEvent[] {
  // We need to keep a global account of all actors in the match.
  // We iterate over user actions and reduce to a tuple of events produced and actor count,
  // then return the event array.
  const accumulator: [StructureEvent[], number] = [[], m.actorCount + 1];
  const structuralTick: typeof accumulator = moves.reduce((acc, item) => {
    if (item.action === 'build') {
      const events = [...acc[0], buildEvent(item, acc[1])];
      const newCount = acc[1] + 1;
      return [events, newCount];
    } else {
      const events = [...acc[0], structureEvent(c, item)];
      return [events, acc[1]];
    }
  }, accumulator);
  return structuralTick[0];
}
function buildEvent(a: BuildStructureAction, count: number): BuildStructureEvent {
  return {
    eventType: 'build',
    coordinates: a.coordinates,
    faction: a.faction,
    structure: a.structure,
    id: count,
  };
}

function structureEvent(c: MatchConfig, a: TurnAction): StructureEvent {
  if (a.action === 'repair')
    return {
      eventType: 'repair',
      faction: a.faction,
      id: a.id,
    };
  else if (a.action === 'upgrade')
    return {
      eventType: 'upgrade',
      faction: a.faction,
      id: a.id,
    };
  else if (a.action === 'salvage')
    return {
      eventType: 'salvage',
      faction: a.faction,
      id: a.id,
      gold: c.recoupAmount,
    };
  else return { eventType: 'repair', faction: a.faction, id: 0 };
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
    const spawn = spawnEvents(matchConfig, matchState, currentTick, rng);
    const movement = movementEvents(matchConfig, matchState, currentTick, rng);
    const towerAttacks = towerAttackEvents(matchConfig, matchState, currentTick, rng);
    const unitAttacks = unitAttackEvents(matchConfig, matchState, currentTick, rng);
    return [...spawn, ...movement, ...towerAttacks, ...unitAttacks];
  }
}

// Spawn events, derive from the Crypts present at the map.
function spawnEvents(
  config: MatchConfig,
  m: MatchState,
  currentTick: number,
  rng: Prando
): UnitSpawnedEvent[] {
  // Crypts are stored in an ordered map in the map state, we extract an array and iterate.
  const crypts: AttackerStructure[] = Object.values(m.actors.crypts);
  const events = crypts.map(ss => {
    // We get the crypt stats by looking up with the Match Config passed.
    const { spawnCapacity, spawnRate } = config[ss.structure][ss.upgrades];
    // Crypts spawn units if three conditions are met:
    // 1.- They have remaining spawn capacity
    const hasCapacity = ss.spawned.length < spawnCapacity;
    // 2.- The spawn rate fits the current tick.
    // tick 1 is reserved for structures. Spawning happens from tick 2.
    const aboutTime = (currentTick - 2) % spawnRate === 0;
    // 3.- The crypt is still active. They become inactive 3 rounds after being built. upgrades reset this
    const stillNew = m.currentRound - ss.builtOnRound < 3 * (ss.upgrades + 1);
    if (hasCapacity && aboutTime && stillNew) {
      const newUnit = spawn(config, m, ss, rng);
      applyEvents(config, m, [newUnit], currentTick, rng); // one by one now
      return newUnit;
    } else return null;
  });
  const eventTypeGuard = (e: UnitSpawnedEvent | null): e is UnitSpawnedEvent => !!e;
  return events.filter(eventTypeGuard);
}
// Function to generate a single spawn event.
function spawn(
  config: MatchConfig,
  m: MatchState,
  crypt: AttackerStructure,
  rng: Prando
): UnitSpawnedEvent {
  // First we look up the unit stats with the Match Config
  // Then we compute the path tile in the map where the units will spawn at.
  const path = findClosebyPath(m, crypt.coordinates, rng);
  return {
    eventType: 'spawn',
    faction: 'attacker',
    cryptID: crypt.id,
    actorID: m.actorCount + 1, // increment
    coordinates: path,
    unitType: crypt.structure.replace('Crypt', '') as UnitType,
    unitHealth: config[crypt.structure][crypt.upgrades].unitHealth,
    unitSpeed: config[crypt.structure][crypt.upgrades].unitSpeed,
    unitAttack: config[crypt.structure][crypt.upgrades].attackDamage,
    tier: crypt.upgrades,
  };
}
// Function to find an available path next to a crypt to place a newly spawned unit.
// If there is more than one candidate then randomness is used to select one.
function findClosebyPath(m: MatchState, coords: number, rng: Prando, range = 1): number {
  const c: number[] = [];
  // Find all 8 adjacent cells to the crypt.
  const [up, upRight, right, downRight, down, downLeft, left, upLeft] = closeByIndexes(
    coords,
    m.width,
    range
  );
  // Of these, push to the array if they are a path.
  if (m.mapState[up]?.type === 'path') c.push(up);
  if (m.mapState[upRight]?.type === 'path') c.push(upRight);
  if (m.mapState[right]?.type === 'path') c.push(right);
  if (m.mapState[downRight]?.type === 'path') c.push(downRight);
  if (m.mapState[down]?.type === 'path') c.push(down);
  if (m.mapState[downLeft]?.type === 'path') c.push(downLeft);
  if (m.mapState[left]?.type === 'path') c.push(left);
  if (m.mapState[upLeft]?.type === 'path') c.push(upLeft);
  // If no cell is a path, i.e. the array is empty, recurse this function with an incremented range, so cells further away are searched
  if (c.length === 0) return findClosebyPath(m, coords, rng, range + 1);
  else if (c.length > 1) {
    // if more than one candidate, get any random one using the randomness generator.
    const randomness = rng.next();
    return c[Math.floor(randomness * c.length)];
  } else return c[0];
}

// Movement events, dervive from the units already on the match sate.
function movementEvents(
  matchConfig: MatchConfig,
  matchState: MatchState,
  currentTick: number,
  randomnessGenerator: Prando
): Array<StatusEffectAppliedEvent | UnitMovementEvent | StatusEffectAppliedEvent> {
  const attackers = Object.values(matchState.actors.units);
  const events = attackers.map(a => {
    // Units will always emit movement events unless they are macaws and they are busy attacking a nearby tower.
    const busyAttacking =
      a.subType === 'macaw' && findClosebyTowers(matchState, a.coordinates, 1).length > 0;
    if (busyAttacking) return null;
    else {
      // Generate movement events
      const event = move(matchConfig, a);
      // See if unit moved next to a friendly crypt and got a status buff from it
      const buffStatusEvents: StatusEffectAppliedEvent[] = buff(matchConfig, matchState, event);
      applyEvents(
        matchConfig,
        matchState,
        [event, ...buffStatusEvents],
        currentTick,
        randomnessGenerator
      );
      return [event, ...buffStatusEvents];
    }
  });
  const eventTypeGuard = (
    e: UnitMovementEvent | StatusEffectAppliedEvent | null
  ): e is UnitMovementEvent => !!e;
  return events
    .flat()
    .filter(eventTypeGuard)
    .filter(e => e.completion === 100);
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
    const eventTypeGuard = (e: StatusEffectAppliedEvent | null): e is StatusEffectAppliedEvent =>
      !!e;
    return events.filter(eventTypeGuard);
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
  m: MatchState,
  currentTick: number,
  rng: Prando
): TowerAttack[] {
  const towers: DefenderStructure[] = Object.values(m.actors.towers);
  const events = towers.map(t => computeDamageToUnit(config, t, m, currentTick, rng));
  return events.flat();
}
// damage made by defender towers against units
function computeDamageToUnit(
  config: MatchConfig,
  t: DefenderStructure,
  m: MatchState,
  currentTick: number,
  rng: Prando
): TowerAttack[] {
  //  Towers attack once every n ticks, the number being their "shot delay" or "cooldown" in this config.
  //  If not cooled down yet, return an empty array
  const cooldown = config[t.structure][t.upgrades].cooldown;
  const cool = cooldown % (currentTick - 2);
  if (!cool) return [];
  //  Check the attack range of the tower with the Match Config
  const range = config[t.structure][t.upgrades].range;
  // Given the computed rate, scan for all units that can be attacked
  const unitsNearby = scanForUnits(m, t.coordinates, range);
  if (unitsNearby.length === 0) return [];
  // If there are units to attack, choose one, the weakest one to finish it off
  const pickedOne = unitsNearby.reduce(pickOne);
  // Sloth towers attack a whole range, so we pass the whole array of nearby units. Same for upgraded Piranha tower.
  // Else we pass the single unit chosen.
  if (t.structure === 'piranhaTower')
    return piranhaDamage(config, t, [pickedOne], m, currentTick, rng);
  else if (t.structure === 'slothTower')
    return slothDamage(config, t, unitsNearby, m, currentTick, rng);
  else if (t.structure === 'anacondaTower')
    return anacondaDamage(config, t, [pickedOne], m, currentTick, rng);
  else return [];
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
// Function to calculate damage done by Piranha Towers
function piranhaDamage(
  config: MatchConfig,
  tower: DefenderStructure,
  a: AttackerUnit[],
  m: MatchState,
  currentTick: number,
  rng: Prando
): TowerAttack[] {
  const damageAmount = config.piranhaTower[tower.upgrades].damage;
  // Generate damage events iterating on affected units
  const damageEvents: TowerAttack[][] = a.map(unit => {
    // Generate single damage event per unit
    const damageEvent: DamageEvent = {
      eventType: 'damage',
      faction: 'defender',
      sourceID: tower.id,
      targetID: unit.id,
      damageType: 'neutral',
      damageAmount: damageAmount,
    };
    // Check if unit was killed by this damage
    const dying = damageAmount >= unit.health;
    // Generate a death event
    const killEvent: ActorDeletedEvent = {
      eventType: 'actorDeleted',
      faction: 'attacker',
      id: unit.id,
    };
    // const dead = unit.health < damageAmount; // TODO
    // If the unit died, return a damage event and unit deletion event. Else only damage event
    // const events = dead ? [] : dying ? [damageEvent, killEvent] : [damageEvent];
    const events = dying ? [damageEvent, killEvent] : [damageEvent];
    // Apply events to update match state
    applyEvents(config, m, events, currentTick, rng);
    return events;
  });
  // return flattened array of events
  return damageEvents.flat();
}
// Function to calculate damage done by Anaconda Towers
function anacondaDamage(
  config: MatchConfig,
  tower: DefenderStructure,
  a: AttackerUnit[],
  m: MatchState,
  currentTick: number,
  rng: Prando
): TowerAttack[] {
  // AnacondaTowers are special in that they can insta kill if upgraded twice
  const killChance = tower.upgrades === 2 ? 0.5 : 0; // 50/50 chance of instakill if upgraded twice
  const damageEvents: TowerAttack[][] = a.map(unit => {
    // Damage amount equals to unit health if instakill
    const damageAmount =
      rng.next() < killChance ? unit.health : config.anacondaTower[tower.upgrades].damage;
    const damageEvent: DamageEvent = {
      eventType: 'damage',
      faction: 'defender',
      sourceID: tower.id,
      targetID: unit.id,
      damageType: 'neutral',
      damageAmount: damageAmount,
    };
    const killEvent: ActorDeletedEvent = {
      eventType: 'actorDeleted',
      faction: 'attacker',
      id: unit.id,
    };
    const dying = damageAmount >= unit.health;
    const events = dying ? [damageEvent, killEvent] : [damageEvent];
    applyEvents(config, m, events, currentTick, rng);
    return events;
  });
  return damageEvents.flat();
}
// Function to calculate damage done by Sloth Towers
function slothDamage(
  config: MatchConfig,
  tower: DefenderStructure,
  a: AttackerUnit[],
  m: MatchState,
  currentTick: number,
  rng: Prando
): TowerAttack[] {
  // Compute damage amount according to Match Config
  const damageAmount = config.slothTower[tower.upgrades].damage;
  // Sloth towers are special in that they impose speed debuff statuses on affected units.
  const damageEvents: TowerAttack[][] = a.map(unit => {
    const statusEvent: StatusEffectAppliedEvent = {
      eventType: 'statusApply',
      faction: 'attacker',
      sourceID: tower.id,
      targetID: unit.id,
      statusType: 'speedDebuff',
      statusAmount: unit.speed / 2, // 50% speed reduction
    };
    const damageEvent: DamageEvent = {
      eventType: 'damage',
      faction: 'defender',
      sourceID: tower.id,
      targetID: unit.id,
      damageType: 'neutral',
      damageAmount: damageAmount,
    };
    const killEvent: ActorDeletedEvent = {
      eventType: 'actorDeleted',
      faction: 'attacker',
      id: unit.id,
    };
    const deflectingDamageEvent: DamageEvent = {
      eventType: 'damage',
      faction: 'attacker',
      sourceID: unit.id,
      targetID: tower.id,
      damageAmount,
      damageType: 'neutral',
    };
    const dying = damageAmount >= unit.health;
    const buffing = tower.upgrades === 2;
    const events: TowerAttack[] = [damageEvent];
    const superMacaw = unit.subType === 'macaw' && unit.upgradeTier === 2;
    if (buffing) events.push(statusEvent);
    if (dying) events.push(killEvent);
    if (superMacaw) events.push(deflectingDamageEvent);
    applyEvents(config, m, events, currentTick, rng);
    return events;
  });
  return damageEvents.flat();
}
// Events where Units attack the defender.
// Either Macaws attacking Towers, or any unit attacking the Defender Base
function unitAttackEvents(
  config: MatchConfig,
  m: MatchState,
  currentTick: number,
  rng: Prando
): UnitAttack[] {
  const attackers: AttackerUnit[] = Object.values(m.actors.units);
  const events = attackers.map(a => {
    const damageToTower =
      a.subType === 'macaw' ? computeDamageToTower(config, m, a, currentTick, rng) : [];
    const damageToBase: UnitAttack[] = computeDamageToBase(config, m, a, currentTick, rng);
    const eventTypeGuard = (e: UnitAttack | null): e is DamageEvent => !!e;
    return [...damageToTower, ...damageToBase].filter(eventTypeGuard);
  });
  return events.flat();
}
// Damage made by Macaws to Defender Tower
function computeDamageToTower(
  config: MatchConfig,
  m: MatchState,
  a: AttackerUnit,
  currentTick: number,
  rng: Prando
): (DamageEvent | ActorDeletedEvent)[] {
  // Find all towers in range (range = 1) // TOO confirm
  const nearbyStructures = findClosebyTowers(m, a.coordinates, 1);
  if (nearbyStructures.length === 0) return [];
  // choose one Tower to attack on the same basis: weakest or oldest
  const pickedOne = nearbyStructures.reduce(pickOne);
  const damageEvent: DamageEvent = {
    eventType: 'damage',
    faction: 'attacker',
    sourceID: a.id,
    targetID: pickedOne.id,
    damageType: 'neutral',
    damageAmount: a.damage,
  };
  // If damage kills the tower, generate kill event
  const dying = a.damage >= pickedOne.health;
  const killEvent: ActorDeletedEvent = {
    eventType: 'actorDeleted',
    faction: 'defender',
    id: pickedOne.id,
  };
  const events: (DamageEvent | ActorDeletedEvent)[] = dying
    ? [damageEvent, killEvent]
    : [damageEvent];
  applyEvents(config, m, events, currentTick, rng);
  return events;
}
// Damage of units to defender base
function computeDamageToBase(
  matchConfig: MatchConfig,
  matchState: MatchState,
  attackerUnit: AttackerUnit,
  currentTick: number,
  randomnessGenerator: Prando
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
      health
    };
    const deathEvent: ActorDeletedEvent = {
      eventType: 'actorDeleted',
      faction: 'attacker',
      id: attackerUnit.id,
    };
    const events: [DefenderBaseUpdateEvent, ActorDeletedEvent] = [baseEvent, deathEvent];
    applyEvents(matchConfig, matchState, events, currentTick, randomnessGenerator);
    return events;
  }
}
// Determines whether a macaw attacker unit should start attacking a tower.
// Macaws have a range of 1. Diagonals count as 1.
function canReach(
  attackerCoordinates: Coordinates,
  structureCoordinates: Coordinates,
  range: number
): boolean {
  const ax = attackerCoordinates.x;
  const ay = attackerCoordinates.y;
  const sx = structureCoordinates.x;
  const sy = structureCoordinates.y;
  const sameX = ax === sx;
  const sameY = ay === sy;
  const nearX = ax - range === sx || ax + range === sx;
  const nearY = ay - range === sy || ay + range === sy;
  return (
    // (sameX && nearY) || (sameY && nearX) // diagonals dont count
    nearX && nearY // diagonals count
  );
}
//  Locate nearby structures, units etc.
//
function scanForUnits(m: MatchState, coords: number, range: number): AttackerUnit[] {
  // Get all surrounding tile indexes;
  const surrounding = closeByIndexes(coords, m.width, range);
  // Get all units present on the map
  const units: AttackerUnit[] = Object.values(m.actors.units);
  // Filter units which are on closeby indexes
  return units.filter(u => surrounding.includes(u.coordinates));
}

export function coordsToIndex(coords: Coordinates, width: number): number {
  return width * coords.y + coords.x;
}
export function indexToCoords(i: number, width: number): Coordinates {
  const y = Math.floor(i / width);
  const x = i - y * width;
  return { x, y };
}
function closeByIndexes(coords: number, mapWidth: number, range: number) {
  const upIndex = coords - mapWidth;
  const upRightIndex = coords - mapWidth + range;
  const rightIndex = coords + range;
  const downRightIndex = coords + mapWidth + range;
  const downIndex = coords + mapWidth;
  const downLeftIndex = coords + mapWidth - range;
  const leftIndex = (coords = range);
  const upLeftIndex = coords - mapWidth - range;
  return [
    upIndex,
    upRightIndex,
    rightIndex,
    downRightIndex,
    downIndex,
    downLeftIndex,
    leftIndex,
    upLeftIndex,
  ];
}
function findCloseByTiles(m: MatchState, coords: number, range: number): Tile[] {
  const upIndex = coords - m.width;
  const upRightIndex = coords - m.width + 1;
  const rightIndex = coords + 1;
  const downRightIndex = coords + m.width + 1;
  const downIndex = coords + m.width;
  const downLeftIndex = coords + m.width - 1;
  const leftIndex = (coords = 1);
  const upLeftIndex = coords - m.width - 1;
  const up = m.mapState[upIndex];
  const upright = m.mapState[upRightIndex];
  const right = m.mapState[rightIndex];
  const downright = m.mapState[downRightIndex];
  const down = m.mapState[downIndex];
  const downleft = m.mapState[downLeftIndex];
  const left = m.mapState[leftIndex];
  const upleft = m.mapState[upLeftIndex];
  return [up, upright, right, downright, down, downleft, left, upleft];
}
// function findClosebyAttackers(m: MatchState, coords: number, range: number): ActorID[] {
//   const tiles = findCloseByTiles(m, coords, range).filter(
//     s => s && s.type === 'path' && s.units.length
//   );
//   const units = tiles.map(t => {
//     const tt = t as PathTile;
//     return tt.units;
//   });
//   return units.flat();
// }

function findClosebyTowers(m: MatchState, coords: number, range: number): DefenderStructure[] {
  const tiles = findCloseByTiles(m, coords, range).filter(
    s => s && s.type === 'structure' && s.faction === 'defender'
  );
  const structures = tiles.map(t => m.actors.towers[(t as DefenderStructureTile).id]);
  return structures as DefenderStructure[];
}
function findClosebyCrypts(
  m: MatchState,
  coords: number | null,
  range: number
): AttackerStructure[] {
  if (!coords) return [];
  const tiles = findCloseByTiles(m, coords, range).filter(
    s => s && s.type === 'structure' && s.faction === 'attacker'
  );
  const structures = tiles.map(t => m.actors.crypts[(t as AttackerStructureTile).id]);
  return structures as AttackerStructure[];
}

//

export function generateRandomMoves(randomnessGenerator: Prando): TurnAction[] {
  return [];
}

export default processTick;
