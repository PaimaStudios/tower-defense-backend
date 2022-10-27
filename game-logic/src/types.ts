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
  type: "attacker-unit";
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

export type StatusType = "speed-debuff" | string // TODO;
export interface Status {
  statusType: StatusType
  statusCaughtAt: number;
  statusAmount: number;
  statusDuration: number;
}

export interface Coordinates{
  x: number;
  y: number;
}
export interface AttackerStructure {
  type: "attacker-structure";
  "id": number;
  "structure": AttackerStructureType
  "health": number;
  "path-1-upgrades": number;
  "path-2-upgrades": number;
  coordinates: Coordinates;
  builtOnRound: number; // + 3 it stops spawning, reset this on upgrade
  spawned: ActorID[]
}
export interface DefenderStructure {
  type: "defender-structure";
  "id": number;
  "structure": DefenderStructureType;
  "health": number;
  coordinates: Coordinates;
  "path-1-upgrades": number;
  "path-2-upgrades": number;
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
  "leads-to": Coordinates[]
  units: ActorID[];
}
export interface Coordinates {
  x: number;
  y: number;
}

export type AttackerStructureType = "macaw-crypt"
  | "gorilla-crypt"
  | "jaguar-crypt"

export interface AttackerStructureTile {
  "type": "attacker-structure",
  "id": number;
}
export type DefenderStructureType = "anaconda-tower"
  | "sloth-tower"
  | "piranha-tower"

export interface DefenderStructureTile {
  "type": "defender-structure",
  "id": number;
  // "structure": DefenderStructureType
}
export type Level = 0 | 1 | 2
export interface DefenderBaseTile {
  type: "defender-base";
}
export interface AttackerBaseTile {
  type: "attacker-base";
}
export interface DefenderOpenTile {
  type: "defender-open"
}
export interface AttackerOpenTile {
  type: "attacker-open"
}
export interface ImmovableObjectTile {
  type: "immovable-object"
}
export type Wallet = string;

export type TurnAction = BuildStructure
  | RepairStructure
  | DestroyStructure
  | UpgradeStructure

export type Structure = Tower | Crypt;
export type Tower = "piranha-tower" | "sloth-tower" | "anaconda-tower";
export type Crypt = "macaw-crypt" | "jaguar-crypt" | "gorilla-crypt";

export interface BuildStructure {
  action: "build";
  x: number;
  y: number;
  structure: Structure;
}
export interface RepairStructure {
  action: "repair";
  x: number;
  y: number;
}
export interface DestroyStructure {
  action: "destroy";
  x: number;
  y: number;
}
export interface UpgradeStructure {
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
  event: "build";
  x: number;
  y: number;
  structure: Structure;
  id: number;
}
export interface RepairStructureEvent {
  event: "repair";
  x: number;
  y: number;
}
export interface DestroyStructureEvent {
  event: "destroy";
  x: number;
  y: number;
}
export interface UpgradeStructureEvent {
  event: "upgrade",
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
  event: "gold-reward";
  faction: Faction;
  amount: number;
}
export type UnitType = "jaguar" | "macaw" | "gorilla";
export interface UnitSpawnedEvent {
  event: "spawn"
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
  event: "movement";
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
  event: "damage";
  faction: Faction; // the one doing the damage
  sourceID: number;
  targetID: number;
  damageType: DamageType;
  damageAmount: number;
}
export interface DefenderBaseUpdateEvent {
  event: "defender-base-update";
  health: 25;
}
export interface ActorDeletedEvent {
  event: "actor-deleted";
  faction: Faction; // which faction the unit to delete belongs to
  id: number;
}
export interface StatusEffectAppliedEvent {
  event: "status-apply";
  sourceID: number;
  targetID: number;
  statusType: "speed-debuff";
  statusAmount: number;
  statusDuration: number;
}
export interface StatusEffectRemovedEvent {
  event: "status-remove";
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