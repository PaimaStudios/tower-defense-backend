import { consumer } from "paima-engine/paima-concise";
import { CryptConfig, parse, TowerConfig } from "@tower-defense/utils";
import type { MatchConfig } from "@tower-defense/utils";

export function parseConfig(s: string): MatchConfig {
  // "r|1|gr;d;105|st;h150;c6;d5;r2
  const c = consumer.initialize(s);
  const version = c.nextValue();
  const definitions = c.remainingValues();
  const parsed= definitions.map(d => parse(d.value))
  for (let p of parsed){
    if (!("error" in p)) 
    switch (p.name){
      case "baseGoldRate": 
        p.faction === "defender" 
        ? baseConfig.baseDefenderGoldRate = p.value 
        : baseConfig.baseAttackerGoldRate = p.value
        break;
      case "anacondaTower":
        baseConfig.anacondaTower.health = p.health;
        baseConfig.anacondaTower.cooldown = p.cooldown;
        baseConfig.anacondaTower.damage = p.damage;
        baseConfig.anacondaTower.range = p.range;
        break;
      case "slothTower":
        baseConfig.slothTower.health = p.health;
        baseConfig.slothTower.cooldown = p.cooldown;
        baseConfig.slothTower.damage = p.damage;
        baseConfig.slothTower.range = p.range;
        break;
      case "piranhaTower":
        baseConfig.piranhaTower.health = p.health;
        baseConfig.piranhaTower.cooldown = p.cooldown;
        baseConfig.piranhaTower.damage = p.damage;
        baseConfig.piranhaTower.range = p.range;
        break;
      case "gorillaCrypt":
        baseConfig.gorillaCrypt.unitHealth = p.unitHealth;
        baseConfig.gorillaCrypt.spawnRate = p.spawnRate;
        baseConfig.gorillaCrypt.capacity = p.capacity;
        baseConfig.gorillaCrypt.damage = p.damage;
        baseConfig.gorillaCrypt.unitSpeed = p.unitSpeed;
        break;
      case "jaguarCrypt":
        baseConfig.jaguarCrypt.unitHealth = p.unitHealth;
        baseConfig.jaguarCrypt.spawnRate = p.spawnRate;
        baseConfig.jaguarCrypt.capacity = p.capacity;
        baseConfig.jaguarCrypt.damage = p.damage;
        baseConfig.jaguarCrypt.unitSpeed = p.unitSpeed;
        break;
      case "macawCrypt":
        baseConfig.macawCrypt.unitHealth = p.unitHealth;
        baseConfig.macawCrypt.spawnRate = p.spawnRate;
        baseConfig.macawCrypt.capacity = p.capacity;
        baseConfig.macawCrypt.damage = p.damage;
        baseConfig.macawCrypt.unitSpeed = p.unitSpeed;
        break;
    }
  }

  return { ...baseConfig }
}

const basePiranhaTowerConfig: TowerConfig = {
  health: 10,
  cooldown: 4,
  damage: 1,
  range: 5,
}
const baseAnacondaTowerConfig: TowerConfig = {
  health: 8,
  cooldown: 7,
  damage: 1,
  range: 3
}
const baseSlothTowerConfig: TowerConfig = {
  health: 5,
  cooldown: 10,
  damage: 1,
  range: 3
}
const baseMacawCryptConfig: CryptConfig = {
  unitHealth: 2, // TODO seriously?
  spawnRate: 2,
  capacity: 9,
  damage: 1,
  unitSpeed:6
}
const baseJaguarCryptConfig: CryptConfig = {
  unitHealth: 1,
  spawnRate: 2,
  capacity: 7,
  damage: 1,
  unitSpeed: 4
}
const baseGorillaCryptConfig: CryptConfig = {
  unitHealth: 5,
  spawnRate: 2,
  capacity: 10,
  damage: 1,
  unitSpeed: 9
}
export const baseConfig: MatchConfig = {
  baseAttackerGoldRate: 25,
  baseDefenderGoldRate: 25,
  repairCost: 10,
  upgradeCost: 20,
  recoupAmount: 20,
  baseSpeed: 10,
  anacondaTower: baseAnacondaTowerConfig,
  piranhaTower: basePiranhaTowerConfig,
  slothTower: baseSlothTowerConfig,
  macawCrypt: baseMacawCryptConfig,
  gorillaCrypt: baseGorillaCryptConfig,
  jaguarCrypt: baseJaguarCryptConfig,
}