import { ChainData } from 'paima-engine/paima-utils';
import * as c from 'crypto';
import {
  creds,
  getActiveLobbies,
  getPaginatedOpenLobbies,
  getRandomLobby,
  p,
} from '@tower-defense/db';
import { Coordinates, MatchState } from '@tower-defense/utils';
interface MockFunnel {
  readData: (blockHeight: number) => Promise<ChainData[] | undefined>;
}
// export interface SubmittedChainData {
//   userAddress: ETHAddress;
//   inputData: EncodedGameDataString;
//   inputNonce: NonceString;
//   suppliedValue: string;
// }
// export interface ChainData {
//   timestamp: number | string;
//   blockHash: string;
//   blockNumber: number;
//   submittedData: SubmittedChainData[];
//   extensionDatums?: ChainDataExtensionDatum[];
// }
// pool
// randomizing helpers
const pool = p;
export function randomString(size = 21) {
  return c.randomBytes(size).toString('base64url').slice(0, size);
}
function randomHex() {
  return '0x' + c.randomBytes(32).toString('hex');
}

function randomNum(n: number) {
  return Math.floor(Math.random() * n) + 1;
}
function randomFromArray<T>(array: T[]): T {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

function isDefined<Value>(value: Value | undefined | null): value is Value {
  return value !== null && value !== undefined;
}

// random input generators
export function randomCreate() {
  const data = [
    'c',
    'default00', // match config
    randomFromArray(['d', 'a', 'r']), // role
    '50', // num of rounds
    randomFromArray(['20', '30', '40']), // round length
    'F',
    'jungle',
    'F',
  ].join('|');
  return {
    userAddress: `${randomHex()}`,
    inputData: data,
    inputNonce: randomString(),
    suppliedValue: '',
  };
}
export async function randomClose() {
  const [lobby] = await getRandomLobby.run(undefined, pool);
  const data = ['cs', '*' + lobby.lobby_id].join('|');
  return {
    userAddress: lobby.lobby_creator,
    inputData: data,
    inputNonce: randomString(),
    suppliedValue: '',
  };
}
export async function randomJoin() {
  const [lobby] = await getRandomLobby.run(undefined, pool);
  console.log(lobby, "lobby")
  const data = ['j', '*' + lobby.lobby_id].join('|');
  return {
    userAddress: `${randomHex()}`,
    inputData: data,
    inputNonce: randomString(),
    suppliedValue: '',
  };
}
export async function randomMoves() {
  const lobbies = await getActiveLobbies.run(undefined, pool);
  const lobby = randomFromArray(lobbies);
  const matchState = lobby.current_match_state as unknown as MatchState;
  const defenders = randomDefenderMoves(matchState);
  const attackers = randomAttackerMoves(matchState);
  const [user, inputs] = lobby.current_round % 2 === 1 
  ?  [matchState.defender, defenders]
  :  [matchState.attacker, attackers]
  console.log(matchState)
  const data = ['s', '*' + lobby.lobby_id, lobby.current_round, inputs].join('|');
  return {
    userAddress: user,
    inputData: data,
    inputNonce: randomString(),
    suppliedValue: '',
  };
}
function randomDefenderMoves(m: MatchState): string {
  const build = randomBuildTowers(m);
  const existingTowers = Object.keys(m.actors.towers);
  if (existingTowers.length) {
    const repair = `r,${randomFromArray(existingTowers)}`;
    const upgrade = `u,${randomFromArray(existingTowers)}`;
    const salvage = `s,${randomFromArray(existingTowers)}`;
    return [...build, repair, upgrade, ''].join('|');
  } else return [...build, ''].join('|');
}
function randomAttackerMoves(m: MatchState): string {
  const build = randomBuildCrypts(m);
  const existingCrypts = Object.keys(m.actors.crypts);
  if (existingCrypts.length) {
    const repair = `r,${randomFromArray(existingCrypts)}`;
    const upgrade = `u,${randomFromArray(existingCrypts)}`;
    const salvage = `s,${randomFromArray(existingCrypts)}`;
    return [...build, repair, upgrade, ''].join('|');
  } else return [...build, ''].join('|');
}
function randomBuildTowers(m: MatchState): [string, string] {
  const indexes = m.mapState.reduce((acc: number[], tile, index) => {
    if (tile.type === 'open' && tile.faction === 'defender')
      return [...acc, index];
    else return acc;
  }, []);
  const towers = ['at', 'pt', 'st'];
  const random1 = randomFromArray(indexes);
  const random2 = randomFromArray(indexes);
  const build1 = `b,${random1},${randomFromArray(towers)}`;
  const build2 = `b,${random2},${randomFromArray(towers)}`;
  return [build1, build2];
}
function randomBuildCrypts(m: MatchState): [string, string] {
  const indexes = m.mapState.reduce((acc: number[], tile, index) => {
    // TODO check if path is next to tile
    if (tile.type === 'open' && tile.faction === 'attacker')
      return [...acc, index];
    else return acc;
  }, []);
  const towers = ['gc', 'jc', 'mc'];
  const random1 = randomFromArray(indexes);
  const random2 = randomFromArray(indexes);
  const build1 = `b,${random1},${randomFromArray(towers)}`;
  const build2 = `b,${random2},${randomFromArray(towers)}`;
  return [build1, build2];
}
function indexToCoords(i: number, width: number): Coordinates {
  const y = Math.floor(i / width);
  const x = i - y * width;
  return { x, y };
}
async function randomInput() {
  // const matches = await getActiveLobbies.run(undefined, pool);
  // const moves = Array.from(Array(100)).map(i => randomMove(matches))
  return randomFromArray([
    // randomCreate()
    // randomJoin(),
    // randomClose(),
    randomMoves(),
  ]);
}

async function readData(blockHeight: number, blockCount = 1) {
  const data = await Promise.all([...Array(1)].map(async a => await randomInput()));
  const cleanData = data.filter(isDefined);
  return [
    {
      timestamp: Date.now(),
      blockHash: randomString(),
      blockNumber: blockHeight,
      submittedData: cleanData,
    },
  ];
}

export default {
  initialize(nodeUrl: string, storageAddress: string): MockFunnel {
    return {
      readData,
    };
  },
};
