import { creds, requirePool } from './pool';
export { creds, requirePool };
import type Pool from 'pg';
export type { Pool };
export * from './insert.queries.js';
export * from './select.queries.js';
export * from './update.queries.js';
//to resolve clashing exports (contained in multiple queries.js files but identical)
export {
  Json,
  DateOrString,
  lobby_status,
  match_result,
  move_type,
  role_setting,
  bot_difficulty,
} from './select.queries.js';
