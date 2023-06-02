import type {
  IGetLobbyByIdResult,
  IGetRoundDataResult,
  IGetBlockHeightResult,
  match_result,
} from './db.js';

type WalletAddress = string;
export type Hash = string;
export type URI = string;
export type EthAddress = Hash;
export type ContractAddress = EthAddress;

// Match Config
export interface MatchConfig {
  defenderBaseHealth: number;
  maxAttackerGold: number;
  maxDefenderGold: number;
  baseAttackerGoldRate: number;
  baseDefenderGoldRate: number;
  anacondaTower: TowerConfigGraph;
  piranhaTower: TowerConfigGraph;
  slothTower: TowerConfigGraph;
  macawCrypt: CryptConfigGraph;
  gorillaCrypt: CryptConfigGraph;
  jaguarCrypt: CryptConfigGraph;
  baseSpeed: number;
  towerRepairValue: number;
  repairCost: number;
  recoupPercentage: number; // cash we get on salvaging towers
  healthBuffAmount: number;
  speedBuffAmount: number;
}
export interface TowerConfig {
  price: number;
  health: number;
  cooldown: number;
  damage: number;
  range: number;
}
export type TowerConfigGraph = Record<UpgradeTier, TowerConfig>;
export type CryptConfigGraph = Record<UpgradeTier, CryptConfig>;

export interface CryptConfig {
  // crypt stats
  price: number;
  cryptHealth: number;
  buffRange: number;
  buffCooldown: number;
  spawnRate: number; // 2
  spawnCapacity: number; // 50
  // unit stats
  attackDamage: number; // 1
  attackWarmup: number;
  attackRange: number;
  attackCooldown: number;
  unitSpeed: number; //
  unitHealth: number; // 2
}

// Match State
export interface RawMap {
  name: string;
  width: number;
  height: number;
  contents: TileNumber[];
}
export type TileNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 0;
export interface AnnotatedMap {
  name: string;
  width: number;
  height: number;
  map: Tile[];
  pathMap: Array<0 | 1>[];
}

export interface MatchState extends AnnotatedMap {
  attacker: WalletAddress;
  attackerGold: number;
  attackerBase: AttackerBase;
  defender: WalletAddress;
  defenderGold: number;
  defenderBase: DefenderBase;
  actors: ActorsObject;
  actorCount: number;
  currentRound: number;
  finishedSpawning: ActorID[];
  roundEnded: boolean;
}

export type MapState = Pick<MatchState, 'width' | 'height' | 'map'>;

// ordered maps for stateful units
export interface ActorsObject {
  towers: Record<ActorID, DefenderStructure>;
  crypts: Record<ActorID, AttackerStructure>;
  units: Record<ActorID, AttackerUnit>;
}
export type ActorID = number;

export type Actor =
  | DefenderBase
  | AttackerBase
  | AttackerUnit
  | AttackerStructure
  | DefenderStructure;

export type AttackerUnitType = 'macaw' | 'jaguar' | 'gorilla';
export interface AttackerUnit {
  type: 'unit';
  faction: 'attacker';
  subType: AttackerUnitType;
  id: ActorID;
  coordinates: number;
  movementCompletion: number;
  path: number[];
  health: number;
  speed: number;
  damage: number;
  upgradeTier: UpgradeTier;
  status: StatusType[];
}
export interface Macaw extends AttackerUnit {
  subType: 'macaw';
  lastShot: number;
}

export interface Coordinates {
  x: number;
  y: number;
}
export type UpgradeTier = 1 | 2 | 3;
export interface AttackerStructure {
  type: 'structure';
  id: number;
  faction: 'attacker';
  structure: AttackerStructureType;
  upgrades: UpgradeTier;
  coordinates: number;
  builtOnRound: number; // + 3 it stops spawning, reset this on upgrade
  spawned: ActorID[];
}
export interface DefenderStructure {
  type: 'structure';
  faction: 'defender';
  id: number;
  structure: DefenderStructureType;
  health: number;
  coordinates: number;
  upgrades: UpgradeTier;
  lastShot: number;
}
interface DefenderBase {
  coordinates: number;
  health: number;
  level: UpgradeTier;
}
interface AttackerBase {
  level: UpgradeTier;
}

export type Tile =
  | PathTile
  | BlockedPathTile
  | BaseTile
  | OpenTile
  | StructureTile
  | UnbuildableTile;

export interface PathTile {
  type: 'path';
  faction: Faction;
}

export interface BlockedPathTile {
  type: 'blockedPath';
  faction: Faction;
}

export interface StructureTile {
  type: 'structure';
  id: number;
  faction: Faction;
}

export interface BaseTile {
  type: 'base';
  faction: Faction;
}
export interface OpenTile {
  type: 'open';
  faction: Faction;
}
export interface UnbuildableTile {
  type: 'unbuildable';
  faction: Faction;
}

export interface Coordinates {
  x: number;
  y: number;
}

export type AttackerStructureType = 'macawCrypt' | 'gorillaCrypt' | 'jaguarCrypt';
export type DefenderStructureType = 'anacondaTower' | 'slothTower' | 'piranhaTower';

export type TurnAction =
  | BuildStructureAction
  | RepairStructureAction
  | SalvageStructureAction
  | UpgradeStructureAction;

export type Structure = DefenderStructureType | AttackerStructureType;

export interface BaseAction {
  round: number;
  faction: Faction;
}
export interface BuildStructureAction extends BaseAction {
  action: 'build';
  coordinates: number;
  structure: Structure;
}
export interface RepairStructureAction extends BaseAction {
  action: 'repair';
  id: number;
}
export interface SalvageStructureAction extends BaseAction {
  action: 'salvage';
  id: number;
}
export interface UpgradeStructureAction extends BaseAction {
  action: 'upgrade';
  id: number;
}
export type StructureEvent =
  | BuildStructureEvent
  | RepairStructureEvent
  | UpgradeStructureEvent
  | SalvageStructureEvent;
export interface BuildStructureEvent {
  eventType: 'build';
  coordinates: number;
  faction: Faction;
  id: number;
  structure: Structure;
}
export interface RepairStructureEvent {
  eventType: 'repair';
  faction: Faction;
  id: number;
}
export interface SalvageStructureEvent {
  eventType: 'salvage';
  faction: Faction;
  id: number;
}
export interface UpgradeStructureEvent {
  eventType: 'upgrade';
  faction: Faction;
  id: number;
}

export type TickEvent =
  | GoldRewardEvent
  | BuildStructureEvent
  | RepairStructureEvent
  | SalvageStructureEvent
  | UpgradeStructureEvent
  | UnitSpawnedEvent
  | UnitMovementEvent
  | DamageEvent
  | DefenderBaseUpdateEvent
  | ActorDeletedEvent
  | StatusEffectAppliedEvent;
export type Faction = 'attacker' | 'defender';
export interface GoldRewardEvent {
  eventType: 'goldUpdate';
  faction: Faction;
  amount: number;
}

export type UnitType = 'jaguar' | 'macaw' | 'gorilla';
export interface UnitSpawnedEvent {
  eventType: 'spawn';
  faction: 'attacker';
  cryptID: number;
  actorID: number;
  coordinates: number;
  unitType: UnitType;
  unitHealth: number;
  unitSpeed: number;
  unitAttack: number;
  tier: UpgradeTier;
}
export interface UnitMovementEvent {
  eventType: 'movement';
  faction: 'attacker';
  actorID: number;
  coordinates: number;
  nextCoordinates: number;
  completion: number;
  movementSpeed: number;
}
export type DamageType = 'neutral' | string;
export interface DamageEvent {
  eventType: 'damage';
  faction: Faction; // the one doing the damage
  sourceID: number;
  targetID: number;
  damageType: DamageType;
  damageAmount: number;
}
export interface DefenderBaseUpdateEvent {
  eventType: 'defenderBaseUpdate';
  faction: 'defender';
  health: number;
}
export interface ActorDeletedEvent {
  eventType: 'actorDeleted';
  faction: Faction; // which faction the unit to delete belongs to
  id: number;
}
export type StatusType = 'speedDebuff' | 'speedBuff' | 'healthBuff';
export interface StatusEffectAppliedEvent {
  eventType: 'statusApply';
  faction: 'attacker';
  sourceID: number;
  targetID: number;
  statusType: StatusType;
  statusAmount: number;
}
export type TowerAttack = DamageEvent | ActorDeletedEvent | StatusEffectAppliedEvent;
export type UnitAttack = DamageEvent | DefenderBaseUpdateEvent | ActorDeletedEvent;

export type LobbyStatus = 'open' | 'active' | 'finished' | 'closed';

export const maps = [
  'jungle',
  'backwards',
  'crossing',
  'narrow',
  'snake',
  'straight',
  'wavy',
  'fork',
  'islands',
  'line',
  'reflection',
] as const;
export type MapName = (typeof maps)[number];

export type RoleSetting = 'attacker' | 'defender' | 'random';
export type RoleSettingConcise = 'a' | 'd' | 'r';
export type StructureConcise = 'at' | 'pt' | 'st' | 'gc' | 'jc' | 'mc';

export type Result = match_result;
export type ResultConcise = 'w' | 'l';

type MatchResult = {
  gold: number;
  wallet: WalletAddress;
  result: Result;
};
export type MatchResults = [MatchResult, MatchResult];

export interface RoundExecutorData {
  block_height: IGetBlockHeightResult;
  lobby: IGetLobbyByIdResult;
  configString: string;
  moves: TurnAction[];
  round_data: IGetRoundDataResult;
}

interface ExecutorDataSeed {
  seed: string;
  block_height: number;
  round: number;
}

export interface MatchExecutorData {
  lobby: IGetLobbyByIdResult;
  seeds: ExecutorDataSeed[];
  moves: TurnAction[];
  initialState: MatchState;
  configString: string;
}
