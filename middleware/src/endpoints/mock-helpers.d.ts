import type { Tile, TurnAction } from "@tower-defense/utils";
export declare const testmap: number[];
export declare function annotateMap(contents: number[], width: number): Tile[][];
export declare function setPath(map: Tile[][]): Tile[][];
export declare function build(towerCount: number, cryptCount: number): TurnAction[];
