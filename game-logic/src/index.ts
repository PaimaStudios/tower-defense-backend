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
  ActorID,
  Actor,
  UnitType,
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
  let randomness = 0;
  // We generate new randomness for every tick. Seeds vary every round.
  for (const tick of Array(currentTick)) randomness = randomnessGenerator.next();
  // First tick is reserved to processing the user actions, i.e. events related to structures.
  if (currentTick === 1) {
    const events = [
      ...computeGoldRewards(matchConfig, matchState, currentTick, randomnessGenerator),
      ...structureEvents(matchState, moves),
    ];
    // Structure events are processed in a batch as they don't affect each other
    applyEvents(matchConfig, matchState, events, currentTick, randomnessGenerator);
    return events;
  } else {
    // subsequent ticks follow deterministically from a given match state after the structure updates have been processed.
    const events =
      eventsFromMatchState(matchConfig, matchState, currentTick, randomnessGenerator) || [];
    // Other events are processed one by one, as they affect global match state
    if (events.length === 0) return null;
    else return events;
  }
}

function structureEvents(m: MatchState, moves: TurnAction[]): TickEvent[] {
  // We need to keep a global account of all actors in the match.
  // We iterate over user actions and reduce to a tuple of events produced and actor count,
  // then return the event array.
  const accumulator: [StructureEvent[], number] = [[], m.actorCount + 1];
  const structuralTick: [StructureEvent[], number] = moves.reduce((acc, item) => {
    const newEvent = structureEvent(item, acc[1]);
    const newList = [...acc[0], newEvent];
    const newCount = acc[1] + 1;
    return [newList, newCount];
  }, accumulator);
  return structuralTick[0];
}

function structureEvent(m: TurnAction, count: number): StructureEvent {
  if (m.action === 'build')
    return {
      eventType: 'build',
      x: m.x,
      y: m.y,
      structure: m.structure,
      id: count,
    };
  else if (m.action === 'repair')
    return {
      eventType: 'repair',
      id: m.id,
    };
  else if (m.action === 'upgrade')
    return {
      eventType: 'upgrade',
      id: m.id,
    };
  else if (m.action === 'destroy')
    return {
      eventType: 'destroy',
      id: m.id,
    };
  else console.log("this shouldn't happen");
  return {
    // so typescript shuts up
    eventType: 'destroy',
    id: 2,
  };
}
// Events produced from Tick 2 forward, follow deterministically from match state.
function eventsFromMatchState(
  config: MatchConfig,
  m: MatchState,
  currentTick: number,
  rng: Prando
): TickEvent[] | null {
  // compute all spawn, movement, damage, statusDamage events for a tick given a certain map state
  // check if base is alive
  if (m.defenderBase.health <= 0) return null;
  else {
    const spawn = spawnEvents(config, m, currentTick, rng);
    const movement = movementEvents(config, m, currentTick, rng);
    const towerAttacks = towerAttackEvents(config, m, currentTick, rng);
    const unitAttacks = unitAttackEvents(config, m, currentTick, rng);
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
    cryptID: crypt.id,
    actorID: m.actorCount + 1, // increment
    unitX: path.x,
    unitY: path.y,
    unitType: crypt.structure.replace('Crypt', '') as UnitType,
    unitHealth: config[crypt.structure][crypt.upgrades].unitHealth,
    unitSpeed: config[crypt.structure][crypt.upgrades].unitSpeed,
    unitAttack: config[crypt.structure][crypt.upgrades].attackDamage,
    tier: crypt.upgrades,
  };
}
// Function to find an available path next to a crypt to place a newly spawned unit.
// If there is more than one candidate then randomness is used to select one.
function findClosebyPath(m: MatchState, coords: Coordinates, rng: Prando, range = 1): Coordinates {
  const c: Coordinates[] = [];
  // Find all 8 adjacent cells to the crypt.
  const [up, upright, right, downright, down, downleft, left, upleft] = findCloseByTiles(
    m,
    coords,
    range
  );
  // Of these, push to the array if they are a path.
  if (up?.type === 'path') c.push({ y: coords.y - range, x: coords.x });
  if (upleft?.type === 'path') c.push({ y: coords.y - range, x: coords.x - range });
  if (upright?.type === 'path') c.push({ y: coords.y - range, x: coords.x + range });
  if (down?.type === 'path') c.push({ y: coords.y + range, x: coords.x });
  if (downleft?.type === 'path') c.push({ y: coords.y + range, x: coords.x - range });
  if (downright?.type === 'path') c.push({ y: coords.y + range, x: coords.x + range });
  if (left?.type === 'path') c.push({ y: coords.y, x: coords.x - range });
  if (right?.type === 'path') c.push({ y: coords.y, x: coords.x + range });
  // If no cell is a path, i.e. the array is empty, call this function again with an incremented range, so cells further away are searched
  if (c.length === 0) return findClosebyPath(m, coords, rng, range + 1);
  else if (c.length > 1) {
    // if more than one candidate, get any random one using the randomness generator.
    const randomness = rng.next();
    return c[Math.floor(randomness * c.length)];
  } else return c[0];
}

// Movement events, dervive from the units already on the match sate.
function movementEvents(
  config: MatchConfig,
  m: MatchState,
  currentTick: number,
  randomnessGenerator: Prando
): Array<StatusEffectAppliedEvent | UnitMovementEvent | StatusEffectAppliedEvent> {
  const attackers: AttackerUnit[] = Object.values(m.actors.units);
  const events = attackers.map(a => {
    // Units will always emit movement events unless they are macaws and they are busy attacking a nearby tower.
    const busyAttacking =
      a.subType === 'macaw' && findClosebyTowers(m, a.coordinates, 1).length > 0;
    if (!busyAttacking) {
      //  Find coordinates to move towards.
      const nextCoords = findDestination(m, a, randomnessGenerator);
      // There will always be a place to move at unless the unit is already at the defender base. See next function.
      if (!nextCoords) return null;
      else {
        const event = move(config, a, nextCoords);
        // See if unit moved next to a friendly crypt and got a status buff from it
        const buffStatusEvents: StatusEffectAppliedEvent[] = buff(m, event);
        applyEvents(config, m, [event, ...buffStatusEvents], currentTick, randomnessGenerator);
        return [event, ...buffStatusEvents];
      }
    } else return null;
  });
  const eventTypeGuard = (
    e: UnitMovementEvent | StatusEffectAppliedEvent | null
  ): e is UnitMovementEvent => !!e;
  return events.flat().filter(eventTypeGuard);
}

// Function to find the path which a unit will move towards.
function findDestination(
  m: MatchState,
  a: AttackerUnit,
  randomnessGenerator: Prando
): Coordinates | null {
  const tile = m.mapState[coordsToIndex(a.coordinates, m.width)];
  // if the unit is at the defender base, they don't move anymore, time to die
  if (tile.type === 'base' && tile.faction === 'defender') return null;
  else {
    // Cast the tile as a Path tile, which it will always be.
    const t = tile as PathTile;
    // Check available paths and delete the previous one, i.e. don't go backwards
    const leadsTo = t['leadsTo'].filter(
      p => !(p.x === a.previousCoordinates?.x && p.y === a.previousCoordinates?.y)
    );
    // if there is more than one available path (i.e. go left or go up/down) determine according to randomness.
    const nextCoords =
      leadsTo.length > 1 ? leadsTo[randomizePath(leadsTo.length, randomnessGenerator)] : leadsTo[0];
    return nextCoords;
  }
}
// Simple helper function to select a random path with the randomness generator.
function randomizePath(paths: number, randomnessGenerator: Prando): number {
  const randomness = randomnessGenerator.next();
  return Math.floor(randomness * paths);
}

// Function to generate individual movement events
function move(config: MatchConfig, a: AttackerUnit, newcoords: Coordinates): UnitMovementEvent {
  // First we lookup the unit speed given the match config and possible status debuffs.
  const unitSpeed = getCurrentSpeed(config, a);
  // unitSpeed as specced is a fraction, need to convert that to percentage for the completion key of the event.
  const speedPercentage = Math.ceil((1 / unitSpeed) * 100);
  const completion = (a.movementCompletion += speedPercentage);
  return {
    eventType: 'movement',
    actorID: a.id,
    unitX: a.coordinates.x,
    unitY: a.coordinates.y,
    nextX: newcoords.x,
    nextY: newcoords.y,
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
function buff(m: MatchState, e: UnitMovementEvent): StatusEffectAppliedEvent[] {
  if (e.completion === 100) {
    const crypts = findClosebyCrypts(m, { x: e.nextX, y: e.unitY }, 1);
    const events = crypts.map(c => buffEvent(c, e.actorID));
    const eventTypeGuard = (e: StatusEffectAppliedEvent | null): e is StatusEffectAppliedEvent =>
      !!e;
    return events.filter(eventTypeGuard);
  } else return [];
}

// helper function to emit buff events according to cryptType
function buffEvent(crypt: AttackerStructure, unitId: number): StatusEffectAppliedEvent | null {
  if (crypt.structure === 'gorillaCrypt' && crypt.upgrades === 2)
    return {
      eventType: 'statusApply',
      sourceID: crypt.id,
      targetID: unitId,
      statusType: 'healthBuff',
    };
  else if (crypt.structure === 'jaguarCrypt' && crypt.upgrades === 2)
    return {
      eventType: 'statusApply',
      sourceID: crypt.id,
      targetID: unitId,
      statusType: 'speedBuff',
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
  console.log(item);
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
      sourceID: tower.id,
      targetID: unit.id,
      statusType: 'speedDebuff',
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
    const dying = damageAmount >= unit.health;
    const events = dying
      ? [statusEvent, damageEvent, ...deflectingDamage(unit, tower.id, damageAmount), killEvent]
      : [statusEvent, damageEvent, ...deflectingDamage(unit, tower.id, damageAmount)];
    applyEvents(config, m, events, currentTick, rng);
    return events;
  });
  return damageEvents.flat();
}
function deflectingDamage(attacker: AttackerUnit, towerID: number, amount: number): DamageEvent[] {
  if (attacker.subType === 'macaw' && attacker.upgradeTier === 2)
    return [
      {
        eventType: 'damage',
        faction: 'attacker',
        sourceID: attacker.id,
        targetID: towerID,
        damageAmount: amount,
        damageType: 'neutral',
      },
    ];
  else return [];
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
  config: MatchConfig,
  m: MatchState,
  a: AttackerUnit,
  currentTick: number,
  rng: Prando
): [DefenderBaseUpdateEvent, ActorDeletedEvent] | [] {
  const t: Tile = m.mapState[coordsToIndex(a.coordinates, m.width)];
  const baseEvent: DefenderBaseUpdateEvent = {
    eventType: 'defenderBaseUpdate',
    health: m.defenderBase.health - a.damage, // TODO: Do Macaws do the same damage to the base as they do to towers?
  };
  const killEvent: ActorDeletedEvent = {
    eventType: 'actorDeleted',
    faction: 'attacker',
    id: a.id,
  };
  const events: [DefenderBaseUpdateEvent, ActorDeletedEvent] | [] =
    t.type === 'base' && t.faction === 'defender' ? [baseEvent, killEvent] : [];
  applyEvents(config, m, events, currentTick, rng);
  return events;
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

function scanForUnits(m: MatchState, coords: Coordinates, range: number): AttackerUnit[] {
  // recurses and looks for units at range 1, then range 2, etc. depending on argument passed
  const ids: ActorID[] = Array.from(Array(range)).reduce((acc: ActorID[], r: any, i: number) => {
    return [...acc, ...findClosebyAttackers(m, coords, i + 1)];
  }, []);
  return ids.map(id => m.actors.units[id]);
}

export function coordsToIndex(coords: Coordinates, width: number): number {
  return width * coords.y + coords.x;
}
function findCloseByTiles(m: MatchState, coords: Coordinates, range: number): Tile[] {
  const up = m.mapState[coordsToIndex({ y: coords.y - range, x: coords.x }, m.width)];
  const upright = m.mapState[coordsToIndex({ y: coords.y - range, x: coords.x + range }, m.width)];
  const right = m.mapState[coordsToIndex({ y: coords.y, x: coords.x + range }, m.width)];
  const downright =
    m.mapState[coordsToIndex({ y: coords.y + range, x: coords.x + range }, m.width)];
  const down = m.mapState[coordsToIndex({ y: coords.y + range, x: coords.x }, m.width)];
  const downleft = m.mapState[coordsToIndex({ y: coords.y + range, x: coords.x - range }, m.width)];
  const left = m.mapState[coordsToIndex({ y: coords.y, x: coords.x - range }, m.width)];
  const upleft = m.mapState[coordsToIndex({ y: coords.y - range, x: coords.x - range }, m.width)];
  return [up, upright, right, downright, down, downleft, left, upleft];
}
function findClosebyAttackers(m: MatchState, coords: Coordinates, range: number): ActorID[] {
  const tiles = findCloseByTiles(m, coords, range).filter(
    s => s && s.type === 'path' && s.units.length
  );
  const units = tiles.map(t => {
    const tt = t as PathTile;
    return tt.units;
  });
  return units.flat();
}

function findClosebyTowers(m: MatchState, coords: Coordinates, range: number): DefenderStructure[] {
  const tiles = findCloseByTiles(m, coords, range).filter(
    s => s && s.type === 'structure' && s.faction === 'defender'
  );
  const structures = tiles.map(t => m.actors.towers[(t as DefenderStructureTile).id]);
  return structures as DefenderStructure[];
}
function findClosebyCrypts(m: MatchState, coords: Coordinates, range: number): AttackerStructure[] {
  const tiles = findCloseByTiles(m, coords, range).filter(
    s => s && s.type === 'structure' && s.faction === 'attacker'
  );
  const structures = tiles.map(t => m.actors.crypts[(t as AttackerStructureTile).id]);
  return structures as AttackerStructure[];
}

function computeGoldRewards(
  config: MatchConfig,
  m: MatchState,
  currentTick: number,
  rng: Prando
): [GoldRewardEvent, GoldRewardEvent] {
  const baseGoldProduction = (level: number) =>
    level === 1 ? 100 : level === 2 ? 200 : level === 3 ? 400 : 0; // ...
  const defenderBaseGold = baseGoldProduction(m.defenderBase.level);
  const attackerBaseGold = baseGoldProduction(m.attackerBase.level);
  const attackerReward = attackerBaseGold + config.baseAttackerGoldRate;
  const defenderReward = defenderBaseGold + config.baseDefenderGoldRate;
  // const events: [GoldRewardEvent, GoldRewardEvent] = [
  //   { eventType: 'goldReward', faction: 'attacker', amount: attackerReward },
  //   { eventType: 'goldReward', faction: 'defender', amount: defenderReward },
  // ];
  // cat-astrophe doesn't want diffs for some reason
  const events: [GoldRewardEvent, GoldRewardEvent] = [
    { eventType: 'goldUpdate', faction: 'attacker', amount: attackerReward + m.attackerGold },
    { eventType: 'goldUpdate', faction: 'defender', amount: defenderReward + m.defenderGold },
  ];
  applyEvents(config, m, events, currentTick, rng);
  return events;
}

export default processTick;
export { parseConfig } from './config';
