
import Prando from "prando";
import type { MatchState, TurnAction, TickEvent, StructureEvent, GoldRewardEvent, Tile, AttackerBaseTile, DefenderBaseTile } from "./types.js";
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
  if (currentTick === 1)  return structuralTick(moves)
  else return ticksFromMatchState(matchState, currentTick)
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

function ticksFromMatchState(m: MatchState, currentTick: number): TickEvent[] | null {
  // compute all spawn, movement, damage, status-damage, structure-upgrade and unit-destroy events given a certain map state
  // in that order (?)
  // where to cache intermediate match state? e.g. a structure was updates, a bag of gold was found
  const moves: TickEvent[] = []
  return [...moves, ...computeGoldRewards(m)]
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

  const mines = m.contents.filter(tile => tile.structure === "gold-mine");
  const attackers = mines.filter(tile => tile.type.includes("attacker"));
  const defenders = mines.filter(tile => tile.type.includes("defender"));
  const attackerReward = (attackers.length * REWARD_BOOST) + attackerBaseGold + BASE_GOLD_RATE;
  const defenderReward = defenders.length * REWARD_BOOST + defenderBaseGold + BASE_GOLD_RATE
  return [
    { event: "gold-reward", faction: "attacker", amount: attackerReward },
    { event: "gold-reward", faction: "defender", amount: defenderReward },
  ]
}


export default moveToTickEvent;