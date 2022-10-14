// defender
type Config = {
  health: "low" | "mid" | "high"
  pace: "slow" | "normal" | "fast"
};
type Stat = "low" | "mid" | "high"
function towerSpeed(config: Config, stat: Stat): number {
  if (config.pace === "slow" && stat === "low") return 3
  else if (config.pace === "slow" && stat === "mid") return 4
  else if (config.pace === "slow" && stat === "high") return 5
  else if (config.pace === "normal" && stat === "low") return 4
  else if (config.pace === "normal" && stat === "mid") return 5
  else if (config.pace === "normal" && stat === "high") return 6
  else if (config.pace === "fast" && stat === "low") return 5
  else if (config.pace === "fast" && stat === "mid") return 6
  else if (config.pace === "fast" && stat === "high") return 7
  else return 0
}
function towerDamage(config: Config, stat: Stat): number {
  if (config.pace === "slow" && stat === "low") return 3
  else if (config.pace === "slow" && stat === "mid") return 4
  else if (config.pace === "slow" && stat === "high") return 5
  else if (config.pace === "normal" && stat === "low") return 4
  else if (config.pace === "normal" && stat === "mid") return 5
  else if (config.pace === "normal" && stat === "high") return 6
  else if (config.pace === "fast" && stat === "low") return 5
  else if (config.pace === "fast" && stat === "mid") return 6
  else if (config.pace === "fast" && stat === "high") return 7
  else return 0
}
function towerRange(config: Config, stat: Stat): number {
  if (config.pace === "slow" && stat === "low") return 3
  else if (config.pace === "slow" && stat === "mid") return 4
  else if (config.pace === "slow" && stat === "high") return 5
  else if (config.pace === "normal" && stat === "low") return 4
  else if (config.pace === "normal" && stat === "mid") return 5
  else if (config.pace === "normal" && stat === "high") return 6
  else if (config.pace === "fast" && stat === "low") return 5
  else if (config.pace === "fast" && stat === "mid") return 6
  else if (config.pace === "fast" && stat === "high") return 7
  else return 0
}
function attackerSpeed(config: Config, stat: Stat): number {
  if (config.pace === "slow" && stat === "low") return 3
  else if (config.pace === "slow" && stat === "mid") return 4
  else if (config.pace === "slow" && stat === "high") return 5
  else if (config.pace === "normal" && stat === "low") return 4
  else if (config.pace === "normal" && stat === "mid") return 5
  else if (config.pace === "normal" && stat === "high") return 6
  else if (config.pace === "fast" && stat === "low") return 5
  else if (config.pace === "fast" && stat === "mid") return 6
  else if (config.pace === "fast" && stat === "high") return 7
  else return 0
}

function attackerSpawnRate(config: Config, stat: Stat): number {
  if (config.pace === "slow" && stat === "low") return 3
  else if (config.pace === "slow" && stat === "mid") return 4
  else if (config.pace === "slow" && stat === "high") return 5
  else if (config.pace === "normal" && stat === "low") return 4
  else if (config.pace === "normal" && stat === "mid") return 5
  else if (config.pace === "normal" && stat === "high") return 6
  else if (config.pace === "fast" && stat === "low") return 5
  else if (config.pace === "fast" && stat === "mid") return 6
  else if (config.pace === "fast" && stat === "high") return 7
  else return 0
}
const piranha = (config: Config) => {
  return {
    speed: towerSpeed(config, "high"),
    damage: towerDamage(config, "low"),
    range: towerRange(config, "high")
  }
}
const sloth = (config: Config) => {
  return {
    speed: towerSpeed(config, "low"),
    damage: towerDamage(config, "low"),
    range: towerRange(config, "low")
  }
}
const anaconda = (config: Config) => {
  return {
    speed: towerSpeed(config, "low"),
    damage: towerDamage(config, "mid"),
    range: towerRange(config, "low")
  }
}


// attacker
const macaw = (config: Config) => {
  return {
    speed: attackerSpeed(config, "mid"),
    health: config.health === "low" ? 5 : 8,
    spawn: 10
  }
}
const jaguar = (config: Config) => {
  return {
    speed: attackerSpeed(config, "high"),
    health: config.health === "low" ? 5 : 8,
    spawn: 10
  }
}
const gorilla = (config: Config) => {
  return {
    speed: attackerSpeed(config, "low"),
    health: config.health === "low" ? 5 : 8,
    spawn: 10
  }
}