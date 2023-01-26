import { ChainData } from "paima-engine/paima-utils";
import * as c from "crypto";
interface FakeFunnel{
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

// randomizing helpers
export function randomString(size = 21) {
  return c.randomBytes(size).toString("base64url").slice(0, size);
}
function randomHex() {
  return "0x" + c.randomBytes(32).toString("hex");
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

async function randomInput() {
  // const matches = await getActiveLobbies.run(undefined, pool);
  // const moves = Array.from(Array(100)).map(i => randomMove(matches))
  return randomFromArray([
    // randomCreate()
    randomJoin(),
    // randomMoves(),
  ]);
}



async function readData(blockHeight: number, blockCount = 1){
  const data = await Promise.all(
    [...Array(10)].map(async (a) => await randomInput())
  );
  const cleanData = data.filter(isDefined);
  return [{
    timestamp: Date.now(),
    blockHash: randomString(),
    blockNumber: blockHeight,
    submittedData: cleanData
  }]
}

export default {
  initialize(nodeUrl: string, storageAddress: string): FakeFunnel{
    return {
      readData
    }
  }
}