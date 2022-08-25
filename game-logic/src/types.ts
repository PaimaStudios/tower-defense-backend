export interface MatchState {
  name: string;
  width: number;
  height: number;
  contents: [Tile[], Tile[]]; // 2d array x-y
  attacker: Wallet;
  defender: Wallet;
}

export type Tile = PathTile
| DefenderBaseTile
| AttackerBaseTile
| DefenderOpenTile
| AttackerOpenTile
| AttackerStructureTile
| DefenderStructureTile
| ImmovableObjectTile

export interface PathTile{
  type: "path";
  faction: Faction;
  "leads-to": Coordinates[]
}
export interface Coordinates{
  x: number;
  y: number;
}

export type AttackerStructureType = "macaw-crypt"
| "gorilla-crypt"
| "jaguar-crypt"

export interface AttackerStructureTile{
    "type": "attacker-structure",
    "id": number;
    "structure": AttackerStructureType
    "health": number;
    "path-1-upgrades": number;
    "path-2-upgrades": number;
}
export type DefenderStructureType = "anaconda-tower"
| "sloth-tower"
| "piranha-tower"

export interface DefenderStructureTile{
    "type": "defender-structure",
    "id": number;
    "structure": DefenderStructureType
    "health": number;
    "path-1-upgrades": number;
    "path-2-upgrades": number;
}
export type Level = 0 | 1 | 2
export interface DefenderBaseTile{
  type: "defender-base";
  level: Level;
}
export interface AttackerBaseTile{
  type: "attacker-base";
  level: Level;
}
export interface DefenderOpenTile{
  type: "defender-open"
}
export interface AttackerOpenTile{
  type: "attacker-open"
}
export interface ImmovableObjectTile{
  type: "immovable-object"
}
export interface GoldMineTile{
  type: "gold-mine"
};
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
export type UnitType = "jaguar" | string;
export interface UnitSpawnedEvent {
  event: "spawn"
  cryptID: number;
  unitID: number;
  unitX: number;
  unitY: number;
  unitType: UnitType;
  unitHealth: number;
  unitSpeed: number;
  unitAttack: number;
}
export interface UnitMovementEvent {
  event: "movement";
  unitID: number;
  unitX: number;
  unitY: number;
  nextX: number;
  nextY: number;
  ticksToMove: number;
}
export type DamageType = "neutral" | string;
export interface DamageEvent {
  event: "damager";
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
  statusType: "speed-debuff";
}

interface PlayersState {
  user1: PlayerState;
  user2: PlayerState;
}
interface PlayerState {
  wallet: string;
  health: number;
  position: number;
}