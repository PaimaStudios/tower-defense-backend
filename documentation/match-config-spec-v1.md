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

### Base Gold Rate

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
  "rate": 100
}
```

### Anaconda Tower

Concise Encoding:

```
an;h100;c10;
```

Json Encoding:

```json
{
  "name": "anaconda-tower",
  "health": 100,
  "cooldown": 10
}
```

### ... Tower

...
