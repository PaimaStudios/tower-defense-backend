export type Hash = string;
export type URI = string;
export type ISO8601Date = string;
export type CardanoAddress = Hash;
export type EthAddress = Hash;
export type Address = CardanoAddress | EthAddress;
export type UserAddress = Address;
export type ContractAddress = EthAddress;
export type UserSignature = Hash;
export type GameInput = string;

export interface RawMap {
  name: string;
  width: number;
  height: number;
  contents: TileNumber[];
}
type TileNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export interface AnnotatedMap {
  name: string;
  width: number;
  height: number;
  mapState: Tile[]
}

export interface MatchConfig {
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
  recoupAmount: number; // cash we get on destroying towers
}
export interface TowerConfig {
  price: number;
  health: number;
  cooldown: number;
  damage: number;
  range: number;
}
export type StructureUpgradetier = 1 | 2 | 3;
export interface TowerConfigGraph{
  1: TowerConfig;
  2: TowerConfig;
  3: TowerConfig;
};
export interface CryptConfigGraph{
  1: CryptConfig,
  2: CryptConfig,
  3: CryptConfig
}
export interface CryptConfig{
  // crypt stats
  price: number;
  cryptHealth: number;
  buffRange: number;
  buffCooldown: number;
  spawnRate: number; // 2
  spawnCapacity: number; // 50
  // unit stats
  attackDamage: number; // 1
  attackWarmup: number,
  attackRange: number;
  attackCooldown: number;
  unitSpeed: number; // 
  unitHealth: number; // 2
}
export interface MatchState extends AnnotatedMap {
  attacker: Wallet;
  attackerGold: number;
  attackerBase: AttackerBase;
  defender: Wallet;
  defenderGold: number;
  defenderBase: DefenderBase;
  actors: ActorsObject;
  actorCount: number;
  currentRound: number;
}
// ordered maps for stateful units
export interface ActorsObject {
  towers: ActorGraph<DefenderStructure>
  crypts: ActorGraph<AttackerStructure>
  units: ActorGraph<AttackerUnit>
}
export type ActorID = number;
export interface ActorGraph<ActorType> {
  [actorID: ActorID]: ActorType
}

export type Actor = DefenderBase
  | AttackerBase
  | AttackerUnit
  | AttackerStructure
  | DefenderStructure

export type AttackerUnitType = "macaw" | "jaguar" | "gorilla"
export interface AttackerUnit {
  type: "unit";
  faction: "attacker";
  subType: AttackerUnitType;
  id: ActorID;
  previousCoordinates: Coordinates | null;
  coordinates: Coordinates;
  nextCoordinates: Coordinates | null;
  moving: boolean;
  movementCompletion: number;
  health: number;
  speed: number;
  damage: number;
  upgradeTier: UpgradeTier;
  status: StatusType[];
}


export interface Coordinates {
  x: number;
  y: number;
}
export type UpgradeTier = 1 | 2 | 3;
export interface AttackerStructure {
  type: "structure";
  id: number;
  faction: "attacker";
  structure: AttackerStructureType
  upgrades: UpgradeTier;
  coordinates: Coordinates;
  builtOnRound: number; // + 3 it stops spawning, reset this on upgrade
  spawned: ActorID[]
}
export interface DefenderStructure {
  type: "structure";
  faction: "defender";
  id: number;
  structure: DefenderStructureType;
  health: number;
  coordinates: Coordinates;
  upgrades: UpgradeTier;
}
interface DefenderBase {
  // coordinates: Coordinates;
  health: number;
  level: number;
}
interface AttackerBase {
  level: number;
}


export type Tile = PathTile
  | DefenderBaseTile
  | AttackerBaseTile
  | DefenderOpenTile
  | AttackerOpenTile
  | DefenderStructureTile
  | AttackerStructureTile
  | DefenderUnbuildableTile
  | AttackerUnbuildableTile

export interface PathTile {
  type: "path";
  faction: Faction;
  "leadsTo": Coordinates[]
  units: ActorID[];
}
export interface Coordinates {
  x: number;
  y: number;
}

export type AttackerStructureType = "macawCrypt"
  | "gorillaCrypt"
  | "jaguarCrypt"

export interface AttackerStructureTile {
  "type": "structure",
  "id": number;
  faction: "attacker";
}
export type DefenderStructureType = "anacondaTower"
  | "slothTower"
  | "piranhaTower"

export interface DefenderStructureTile {
  "type": "structure",
  "id": number;
  faction: "defender"
  // "structure": DefenderStructureType
}
export type Level = 0 | 1 | 2
export interface DefenderBaseTile {
  type: "base";
  faction: "defender"
}
export interface AttackerBaseTile {
  type: "base";
  faction: "attacker";
}
export interface DefenderOpenTile {
  type: "open";
  faction: "defender";
}
export interface AttackerOpenTile {
  type: "open";
  faction: "attacker";
}
export interface DefenderUnbuildableTile {
  type: "unbuildable";
  faction: "defender";
}
export interface AttackerUnbuildableTile {
  type: "unbuildable";
  faction: "attacker";
}
export type Wallet = string;

export type TurnAction = BuildStructureAction
  | RepairStructureAction
  | DestroyStructureAction
  | UpgradeStructureAction

export type Structure = Tower | Crypt;
export type Tower = "piranhaTower" | "slothTower" | "anacondaTower";
export type Crypt = "macawCrypt" | "jaguarCrypt" | "gorillaCrypt";

export interface BuildStructureAction {
  round: number;
  action: "build";
  x: number;
  y: number;
  structure: Structure;
}
export interface RepairStructureAction {
  round: number;
  action: "repair";
  id: number;
}
export interface DestroyStructureAction {
  round: number;
  action: "destroy";
  id: number;
}
export interface UpgradeStructureAction {
  round: number;
  action: "upgrade",
  id: number;
}
export type StructureEvent = BuildStructureEvent
  | RepairStructureEvent
  | UpgradeStructureEvent
  | DestroyStructureEvent
  export interface BuildStructureEvent {
    eventType: "build";
    x: number;
    y: number;
    id: number;
    structure: Structure;
  }
  export interface RepairStructureEvent {
    eventType: "repair";
    id: number;
  }
  export interface DestroyStructureEvent {
    eventType: "destroy";
    id: number;
  }
  export interface UpgradeStructureEvent {
    eventType: "upgrade",
    id: number;
  }


export type TickEvent = GoldRewardEvent
  | BuildStructureEvent
  | RepairStructureEvent
  | DestroyStructureEvent
  | UpgradeStructureEvent
  | UnitSpawnedEvent
  | UnitMovementEvent
  | DamageEvent
  | DefenderBaseUpdateEvent
  | ActorDeletedEvent
  | StatusEffectAppliedEvent

export type Faction = "attacker" | "defender";
// export interface GoldRewardEvent {
//   eventType: "goldReward";
//   faction: Faction;
//   amount: number;
// }
// cat-astrophe complained about not wanting diffs, they want absolute numbers of gold
export interface GoldRewardEvent {
  eventType: "goldUpdate";
  faction: Faction;
  amount: number;
}

export type UnitType = "jaguar" | "macaw" | "gorilla";
export interface UnitSpawnedEvent {
  eventType: "spawn"
  cryptID: number;
  actorID: number;
  unitX: number;
  unitY: number;
  unitType: UnitType;
  unitHealth: number;
  unitSpeed: number;
  unitAttack: number;
  tier: UpgradeTier;
}
export interface UnitMovementEvent {
  eventType: "movement";
  actorID: number;
  unitX: number;
  unitY: number;
  nextX: number;
  nextY: number;
  completion: number;
  movementSpeed: number;
}
export type DamageType = "neutral" | string;
export interface DamageEvent {
  eventType: "damage";
  faction: Faction; // the one doing the damage
  sourceID: number;
  targetID: number;
  damageType: DamageType;
  damageAmount: number;
}
export interface DefenderBaseUpdateEvent {
  eventType: "defenderBaseUpdate";
  health: number;
}
export interface ActorDeletedEvent {
  eventType: "actorDeleted";
  faction: Faction; // which faction the unit to delete belongs to
  id: number;
}
export type StatusType = "speedDebuff" | "speedBuff" | "healthBuff"
export interface StatusEffectAppliedEvent {
  eventType: "statusApply";
  sourceID: number;
  targetID: number;
  statusType: StatusType
}
export type TowerAttack = DamageEvent
| ActorDeletedEvent
| StatusEffectAppliedEvent 
export type UnitAttack = DamageEvent 
| DefenderBaseUpdateEvent
| ActorDeletedEvent;

interface PlayersState {
  user1: PlayerState;
  user2: PlayerState;
}
interface PlayerState {
  wallet: string;
  health: number;
  position: number;
}