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
type TileNumber = 1 | 2 | 3 | 4 | 5 | 6;
export interface AnnotatedMap {
  name: string;
  width: number;
  height: number;
  contents: Tile[][];
}

export interface MatchConfig {
  something: "something"
}
export interface MatchState extends AnnotatedMap {
  attacker: Wallet;
  attackerGold: number;
  attackerBase: AttackerBase;
  defender: Wallet;
  defenderGold: number;
  defenderBase: DefenderBase;
  actors: ActorsObject;
  currentRound: number;
}
// ordered maps for stateful units
export interface ActorsObject {
  towers: ActorGraph<DefenderStructure>
  crypts: ActorGraph<AttackerStructure>
  units: ActorGraph<AttackerUnit>
}
export type ActorID = number;
export interface ActorGraph<UnitType> {
  [actorID: ActorID]: UnitType
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
  status: Status | null;
}

export type StatusType = "speedDebuff" | string // TODO;
export interface Status {
  statusType: StatusType
  statusCaughtAt: number;
  statusAmount: number;
  statusDuration: number;
}

export interface Coordinates {
  x: number;
  y: number;
}
export interface AttackerStructure {
  type: "structure";
  "id": number;
  faction: "attacker";
  "structure": AttackerStructureType
  "health": number;
  "path1Upgrades": number;
  "path2Upgrades": number;
  coordinates: Coordinates;
  builtOnRound: number; // + 3 it stops spawning, reset this on upgrade
  spawned: ActorID[]
}
export interface DefenderStructure {
  type: "structure";
  faction: "defender";
  "id": number;
  "structure": DefenderStructureType;
  "health": number;
  coordinates: Coordinates;
  "path1Upgrades": number;
  "path2Upgrades": number;
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
  | AttackerStructureTile
  | DefenderStructureTile
  | ImmovableObjectTile

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
export interface ImmovableObjectTile {
  type: "immovableObject"
}
export type Wallet = string;

export type TurnAction = BuildStructure
  | RepairStructure
  | DestroyStructure
  | UpgradeStructure

export type Structure = Tower | Crypt;
export type Tower = "piranhaTower" | "slothTower" | "anacondaTower";
export type Crypt = "macawCrypt" | "jaguarCrypt" | "gorillaCrypt";

export interface BuildStructure {
  round: number;
  action: "build";
  x: number;
  y: number;
  structure: Structure;
}
export interface RepairStructure {
  round: number;
  action: "repair";
  x: number;
  y: number;
}
export interface DestroyStructure {
  round: number;
  action: "destroy";
  x: number;
  y: number;
}
export interface UpgradeStructure {
  round: number;
  action: "upgrade",
  x: number;
  y: number;
  path: number;
}
export type StructureEvent = BuildStructureEvent
  | RepairStructureEvent
  | UpgradeStructureEvent
  | DestroyStructureEvent
  export interface BuildStructureEvent {
    eventType: "build";
    x: number;
    y: number;
    structure: Structure;
    id: number;
  }
  export interface RepairStructureEvent {
    eventType: "repair";
    x: number;
    y: number;
  }
  export interface DestroyStructureEvent {
    eventType: "destroy";
    x: number;
    y: number;
  }
  export interface UpgradeStructureEvent {
    eventType: "upgrade",
    x: number;
    y: number;
    path: number;
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
  | StatusEffectRemovedEvent

export type Faction = "attacker" | "defender";
export interface GoldRewardEvent {
  eventType: "goldReward";
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
  health: 25;
}
export interface ActorDeletedEvent {
  eventType: "actorDeleted";
  faction: Faction; // which faction the unit to delete belongs to
  id: number;
}
export interface StatusEffectAppliedEvent {
  eventType: "statusApply";
  sourceID: number;
  targetID: number;
  statusType: "speedDebuff";
  statusAmount: number;
  statusDuration: number;
}
export interface StatusEffectRemovedEvent {
  eventType: "statusRemove";
  id: number;
  statusType: StatusType;
}
export type TowerAttack = DamageEvent | StatusEffectAppliedEvent | ActorDeletedEvent;

interface PlayersState {
  user1: PlayerState;
  user2: PlayerState;
}
interface PlayerState {
  wallet: string;
  health: number;
  position: number;
}