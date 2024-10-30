#!/usr/bin/env node
import { config } from "dotenv";

config({ path: process.argv.splice(2) });

const keys = [
  // Paima ENV
  'CHAIN_URI',
  'CONTRACT_ADDRESS',
  'BACKEND_URI',
  'BATCHER_URI',
  'BLOCK_TIME',
  // TD GameENV
  'SHORT_CONFIG',
  'MEDIUM_CONFIG',
  'LONG_CONFIG',
];

console.log('export default', JSON.stringify(Object.fromEntries(keys.map(k => [k, process.env[k]]))));
