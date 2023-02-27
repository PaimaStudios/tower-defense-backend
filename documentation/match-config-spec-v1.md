# TD Match Config V1 Specification

In this doc we will specify the exact V1 encoding for a match config which encompasses all units/structures/gold numbers. Of note, in this document will specify both the concise encoding, and the expanded encoding. The concise encoding is used to submit match configuration

## Match Config Register Game Input (Concise Encoding)

```
r|
matchConfigVersion|
definition|
definition|
...
```

In practice:

```
r|1|definition|definition|...
```

## Match Config Json Encoding

Match configs have two encodings, a concise encoding and a json encoding. The concise encoding is used when registering the match config on-chain. When it is read by the the game SM and validated, it is converted into json encoding and saved into the `match_config_registry` table. Of note, when the match config is submitted concisely encoded, it has no ID included. Only after all of the definitions are parsed, validated, and converted into JSON encoding (and sorted to guarantee a deterministic ordering), then is an ID generated for the match config by using the blake2b hashing function on the whole set of ordered definitions (output hash shortened to the first 12 characters).

Both the round executor, and the frontend will expect to receive the json encoding. As such, we will be saving the JSON directly to the `match_config_registry` table (with the config id as key), as it will be pre-processed and ready to serve without needing to do any extra work.

A match config json will follow this schema:

```json
{
    "configVersion": "1",
    "configId": "8a3akasfdn21",
    "definitions": [
        {...},
        {...},
        {...}
    ]
}
```

## Definitions

A `definition` is the specification of a single piece of the match config. Like match configs, definitions also have a concise encoding and a json encoding (as definitions are part of a match config).

In this section we will list out all of the supported definitions part of this version of the configuration.

### Base Speed

How many ticks are processed per second.

```
bs;5
```

Json Encoding:

```json
{
  "name": "baseSpeed",
  "value": 5
}
```

### Base Health

Health of the defender's base.

Concise Encoding:

```
bh;100
```

Json Encoding:

```json
{
  "name": "baseHealth",
  "value": 100
}
```

### Base Gold Rate

Gold received by each faction at the end of each round.

Concise Encoding:

```
gr;a;100
```

or

```
gr;d;105
```

Json Encoding:

```json
{
  "name": "base-gold-rate",
  "faction": "attacker",
  "value": 100
}
```

### Repair Value

How much health does a repair action increase

Concise Encoding:

```
rv;25
```

Json Encoding:

```json
{
  "name": "repairValue",
  "value": 25
}
```

### Repair Cost

Cost to repair a Structure.

Concise Encoding:

```
rc;10
```

Json Encoding:

```json
{
  "name": "repairCost",
  "value": 10
}
```

### Defender Towers

The following attributes from defender towers are configurable:

`price`: The price of building the tower.
`health`: the HP of the tower.
`cooldown`: How long it takes for the tower to overheat and stop attacking.
`damage`: How much damage a tower hit does to an attacker unit.
`range`: The hit range of a tower's attack.

### Anaconda Tower

Concise Encoding:

```
at;p50;h16;c10;d5;r2
```

Json Encoding:

```json
{
  "name": "anacondaTower",
  "price": 50,
  "health": 16,
  "cooldown": 6,
  "damage": 2,
  "range": 3
}
```

### Piranha Tower

Concise Encoding:

```
pt;p55;h20;c4;d1;r4
```

Json Encoding:

```json
{
  "name": "piranhaTower",
  "price": 55,
  "health": 20,
  "cooldown": 4,
  "damage": 1,
  "range": 4
}
```

### Sloth Tower

Concise Encoding:

```
st;p60;h10;c10;d3;r2
```

Json Encoding:

```json
{
  "name": "slothTower",
  "price": 60,
  "health": 10,
  "cooldown": 10,
  "damage": 3,
  "range": 2
}
```

### Crypts

The following attributes from defender towers are configurable:

`price`: The price of building the crypt.
`unitHealth`: The health of the individual units spawned by the crypt.
`spawnRate`: The speed at which crypts spawn units. e.g. `2` = One unit spawned every game 2 ticks. `spawnDelay` in cat-astrophe's docs.
`spawnCapacity`: How many units a crypt can spawn before stopping.
`attackDamage`: The damage done by units spawned by a crypt.
`unitSpeed`: The movement speed of units spawned by a crypt.

### Gorilla Crypt

Concise Encoding:

```
gc;p50;h5;r9;c10;d5;s2
```

Json Encoding:

```json
{
  "name": "gorillaCrypt",
  "price": 50,
  "unitHealth": 5,
  "spawnRate": 9,
  "spawnCapacity": 10,
  "damage": 1,
  "unitSpeed": 11
}
```

### Jaguar Crypt

Concise Encoding:

```
jc;p60;h1;r6;c8;d1;s25
```

Json Encoding:

```json
{
  "name": "jaguarCrypt",
  "price": 60,
  "unitHealth": 1,
  "spawnRate": 6,
  "spawnCapacity": 8,
  "damage": 1,
  "unitSpeed": 25
}
```

### Macaw Crypt

Concise Encoding:

```
mc;p70;h2;r2;c7;d1;s17
```

Json Encoding:

```json
{
  "name": "macawCrypt",
  "unitHealth": 2,
  "spawnRate": 2,
  "spawnCapacity": 7,
  "damage": 1,
  "unitSpeed": 17
}
```
