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
### Defender Towers

The following attributes from defender towers are configurable:

`health`: the HP of the Tower.
`cooldown`: How long it takes for the Tower to overheat and stop attacking. 
`damage`: How much damage a tower hit does to an attacker unit.
`range`: The hit range of a tower's attack.
### Anaconda Tower

Concise Encoding:

```
at;h100;c10;d5;r2
```

Json Encoding:

```json
{
  "name": "anacondaTower",
  "health": 100,
  "cooldown": 10,
  "damage": 5,
  "range": 2
}
```

### Sloth Tower

Concise Encoding:

```
st;h100;c10;d5;r2
```

Json Encoding:

```json
{
  "name": "slothTower",
  "health": 100,
  "cooldown": 10,
  "range": 2
}
```

### Piranha Tower

Concise Encoding:

```
pt;h100;c10;d5;r2
```

Json Encoding:

```json
{
  "name": "piranhaTower",
  "health": 100,
  "cooldown": 10,
  "damage": 5,
  "range": 2
}
```

### Crypts
The following attributes from defender towers are configurable:

`unitHealth`: The health of the individual units spawned by the crypt.
`spawnRate`: The speed at which crypts spawn units. e.g. `2` = One unit spawned every game 2 ticks.
`capacity`: How many units can a crypt spawn before stopping.
`damage`: The damage done by units spawned by a crypt.
`unitSpeed`: The movement speed of units spawned by a crypt.

### Macaw Crypt

Concise Encoding:

```
mc;h100;r2;c10;d5;s2
```

Json Encoding:

```json
{
  "name": "macawCrypt",
  "unitHealth": 100,
  "spawnRate": 2,
  "capacity": 10,
  "damage": 5,
  "unitSpeed": 2
}
```

### Jaguar Crypt

Concise Encoding:

```
jc;h100;r2;c10;d5;s2
```

Json Encoding:

```json
{
  "name": "jaguarCrypt",
  "unitHealth": 100,
  "spawnRate": 2,
  "capacity": 10,
  "damage": 5,
  "unitSpeed": 2
}
```

### Gorilla Crypt

Concise Encoding:

```
gc;h100;c10;d5;s2
```

Json Encoding:

```json
{
  "name": "gorillaCrypt",
  "unitHealth": 100,
  "spawnRate": 2,
  "capacity": 10,
  "damage": 5,
  "unitSpeed": 2
}
```