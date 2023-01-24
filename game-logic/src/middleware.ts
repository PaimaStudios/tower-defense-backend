// import Prando from "paima-engine/paima-prando";
// import { MatchExecutor, RoundExecutor } from "paima-engine/paima-executors";
// import processTick from "./index.js";
// import { build, testmap } from "./test.js";
// import { annotateMap, setPath } from "./map-processor.js";
// import { MatchConfig } from "./types.js";

// export async function getRoundExecutor(): Promise<any>{
//   const seed = "td";
//   const rng = new Prando(seed);
//   const matchConfig: MatchConfig = { something: "something" };
//   const am = annotateMap(testmap, 22);
//   const withPath = setPath(am);
//   const matchState = {
//     width: 22,
//     height: 13,
//     defender: "0x0",
//     attacker: "0x1",
//     defenderGold: 100,
//     attackerGold: 100,
//     defenderBase: { health: 100, level: 1 },
//     attackerBase: { level: 1 },
//     actors: {
//       towers: {},
//       crypts: {},
//       units: {}
//     },
//     contents: withPath,
//     name: "jungle",
//     currentRound: 1
//   };
//   const moves = build(20, 10);
//   const executor = RoundExecutor.initialize(matchConfig, matchState, moves, rng, processTick);
//   return {
//     success: true,
//     result: executor
//   };
// }
// export async function getCustomRoundExecutor(map: number[], towerCount: number, cryptCount: number): Promise<any> {
//   const seed = "td";
//   const rng = new Prando(seed);
//   const matchConfig: MatchConfig = { something: "something" };
//   const am = annotateMap(map, 22);
//   const withPath = setPath(am);
//   const matchState = {
//     width: 22,
//     height: 13,
//     defender: "0x0",
//     attacker: "0x1",
//     defenderGold: 100,
//     attackerGold: 100,
//     defenderBase: { health: 100, level: 1 },
//     attackerBase: { level: 1 },
//     actors: {
//       towers: {},
//       crypts: {},
//       units: {}
//     },
//     contents: withPath,
//     name: "jungle",
//     currentRound: 1
//   };
//   const moves = build(towerCount, cryptCount);
//   const executor = RoundExecutor.initialize(matchConfig, matchState, moves, rng, processTick);
//   return {
//     success: true,
//     result: executor
//   };
// }
