# TD Match Config V1 Specification

In this doc we will specify the exact V1 encoding for a match config which encompasses all units/structures/gold numbers. Of note, in this document will specify both the concise encoding, and the expanded encoding. The concise encoding is used to submit match configuration

## Match Config Register Game Input (Concise Encoding)

```
r|
matchConfigVersion|
configString```

In practice:

```
r|1|configString...
```

## Match Config Json Encoding

Match configs have two encodings, a concise encoding and a json encoding. The concise encoding is used when registering the match config on-chain. When it is read by the the game SM and validated, an ID is automatically generated using the blake2b hashing function on the concise encoding string and saved along the concise encoding string into the `configs` table.

The game's round executor will parse the concise encoding into a JSON data structure, which will be used by the game to do the necessary calculations during the game.

A match config json will follow this schema:

```json
{
    "version": number;
    "id": "string;
    "content: {
      baseSpeed: number;
      towerRepairValue: number;
      repairCost: number;
      recoupPercentage: number;
      healthBuffAmount: number;
      speedBuffAmount: number;
      defenderBaseHealth: number;
      baseAttackerGoldRate: number;
      baseDefenderGoldRate: number;
      anacondaTower: {
        1: {
          price: number;
          health: number;
          cooldown: number;
          damage: number;
          range: number;
        };
        2: ...;
        3: ...; 
      }
      piranhaTower: ...;
      slothTower: ...;
      macawCrypt: {
        1: {
          price: number;
          buffRange: number;
          buffCooldown: number;
          spawnRate: number;
          spawnCapacity: number;
          attackDamage: number;
          attackRange: number;
          attackCooldown?: number;
          unitSpeed: number;
          unitHealth: number;
        };
        2: ...;
        3: ...;
      }
      gorillaCrypt: ...;
      jaguarCrypt: ...;
    }
}
```
## Game configuration parameters

The following game parameters are configurable. The concise encoding scheme will be written in the order that follows.

### Game Speed

How many ticks are run per second.

Concise encoding:

```
gs10
```

### Base Health

Health of the defender's base.

Concise Encoding:

```
bh100
```

### Defender Gold Rate

Gold received by the defender at the end of each round.

Concise Encoding:

```
gd100
```

### Attacker Gold Rate

Gold received by the attacker at tht end of each round.

```
ga105
```

### Repair Value

How much health does a repair action increase

Concise Encoding:

```
rv25
```

### Repair Cost

Cost to repair a Structure.

Concise Encoding:

```
rc10
```

### Health Buff

Amount of health restored when Gorilla crypts give passing units a buff

Concise Encoding:

```
hb20
```

### Speed Buff

Amount of speed increased when Jaguar crypts give passing units a buff

Concise Encoding:

```
sb50
```
### Structures

There are two kinds of structures in Tower Defense; defender Towers and attacker Crypts. Both kinds of structures can be upgraded, twice.
It follows that all structures have three tiers of statistics. User submitted configurations must specify the three tiers.

The general syntax of the encoding will be:

```
structureType;1;...structureStats;2;...structureStats;3;...structureStats
```
Note that `price` for upgrade tiers `2` and `3` means the price of the upgrade, while for upgrade tier `1` it means the price of building the structure.



### Defender Towers

The following attributes from defender towers are configurable:

`price`: The price of building the tower.
`health`: the HP of the tower.
`cooldown`: How long it takes for the tower to overheat and stop attacking.
`damage`: How much damage a tower hit does to an attacker unit.
`range`: The hit range of a tower's attack.

Concise encoding must be written in that exact order, as seen below.

### Anaconda Tower

Concise Encoding:

```
at;1;p50;h20;c10;d5;r2;2;p30;h20;c9;d6;r3;3;p40;h25;c5;d7;r4
```

### Piranha Tower

Concise Encoding:

```
pt;1;p50;h20;c10;d5;r2;2;p30;h20;c9;d6;r3;3;p40;h25;c5;d7;r4
```

### Sloth Tower

Concise Encoding:

```
st;1;p50;h20;c10;d5;r2;2;p30;h20;c9;d6;r3;3;p40;h25;c5;d7;r4
```

### Crypts

The following attributes from defender towers are configurable:

`price`: The price of building the crypt.
`unitHealth`: The health of the individual units spawned by the crypt.
`spawnRate`: The speed at which crypts spawn units. e.g. `2` = One unit spawned every game 2 ticks. `spawnDelay` in cat-astrophe's docs.
`spawnCapacity`: How many units a crypt can spawn before stopping.
`attackDamage`: The damage done by units spawned by a crypt.
`unitSpeed`: The movement speed of units spawned by a crypt.

Macaws alone have an extra `attackCooldown` attribute, as they can attack towers. The lower the number the more frequent the attacks. Minimum is 1.

### Gorilla Crypt

Concise Encoding:

```
gc;1;p50;h5;r9;c10;d5;s2;2;p50;h5;r9;c10;d5;s2;3;p50;h5;r9;c10;d5;s2
```


### Jaguar Crypt

Concise Encoding:

```
jc;1;p50;h5;r9;c10;d5;s2;2;p50;h5;r9;c10;d5;s2;3;p50;h5;r9;c10;d5;s2
```


### Macaw Crypt

Concise Encoding:

```
mc;1;p50;h5;r9;c10;d5;s2;ac10;2;p50;h5;r9;c10;d5;s2;ac8;3;p50;h5;r9;c10;d5;s2;ac5
```
