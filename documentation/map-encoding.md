# Map Encodings

Maps in our TD game will have two encodings; `raw encoding` and `annotated encoding`.

## Raw Encoding

Raw encoded maps are primarily for easily specifying maps manually (for game designers).

A raw encoded map is stored as json with the following fields:

- Name
- Width
- Height
- Contents

The contents of the map is a one dimensional array which defines all of the squares of the map. When parsing the raw encoding, one must simply split the contents every `width` amount of elements to thus separate out the rows of the map.

In raw encoding each element in contents can be one of the following values:


- `0`: An unbuildable tile (no one can build here, may have a statue/other graphics displayed on this tile for example)
- `1`: An open defender square (defender can place structures here)
- `2`: An open attacker square (attacker can place structures here)
- `3`: The defender base
- `4`: The attacker base
- `5`: A defender path/road square (neither player can place structures here, but units can walk on these squares)
- `6`: An attacker path/road square (neither player can place structures here, but units can walk on these squares)

An example map in raw encoding is constructed below:

```json
{
  "name": "Jungle-1",
  "width": 22,
  "height": 13,
  "contents": [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 1,
    1, 5, 5, 5, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 3, 5, 5, 5, 1,
    5, 5, 5, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 1, 1, 5, 1, 1, 1, 5,
    1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 5, 5, 5, 5, 5, 1, 1, 2,
    2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 5, 5, 5, 6, 6, 6, 6,
    6, 6, 6, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 6, 2, 2, 6,
    2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 6, 2, 2, 6, 2, 2, 2,
    2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 6, 6, 2, 6, 2, 2, 2, 2, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 6, 2, 6, 2, 2, 0, 0, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 6, 6, 6, 6, 6, 4, 0, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2
  ]
}
```

## Annotated Encoding

Annotated encoding converts the raw encoding into a more rich form which can much more easily be used by the round executor and adds map/structure state on top. Annotated encoding has the same metadata fields as raw encoding, however the contents are much more rich. Annotated encoding will be used to define the the current state of the map at the end of every round.

Contents are a 2d array (thus allowing to easily fetch a given tile by x/y index), where each element is a json object which describes what is on the given square/tile. Furthermore, path squares specifically define the direction(s) in which units move from the title to the next tile.

#### Path Tile

Path tiles define all of the directions that they can lead to (up to maximum of 3). We will have to implement a pre-processor that initially reads the raw encoded map, and converts every `3` tile, into a proper `path tile` in the annotated encoding format (by following all path branches from the `5` (attacker base) to the `4` (defender base)).

Pre-processing `leads-to` will make it easier for when a unit hits a fork in the path and must decide which direction they take (just use rng to choose from the list of `leads-to` elements).

```json
{
  "type": "path",
  "faction": "attacker",
  "leads-to": [
    {
      "x": 5,
      "y": 25
    },
    {
      "x": 5,
      "y": 23
    }
  ]
}
```

OR

```json
{
  "type": "path",
  "faction": "defender",
  "leads-to": [
    {
      "x": 8,
      "y": 12
    }
  ]
}
```

#### Defender Base Tile

```json
{
  "type": "defender-base"
}
```

#### Attacker Base Tile

```json
{
  "type": "attacker-base"
}
```

#### Open Defender Tile

```json
{
  "type": "defender-open"
}
```

#### Open Attacker Tile

```json
{
  "type": "attacker-open"
}
```

#### Attacker Structure Tile

A tile which specifies an attacker structure (crypt). Of note, all crypts will have a default 999 health, as they cannot be attacked by the defender (so just set a high number to make them seem powered by black magic/evil).

```json
{
  "type": "attacker-structure",
  "id": 13,
  "structure": "gorilla-crypt",
  "health": 999,
  "path-1-upgrades": 0,
  "path-2-upgrades": 2
}
```

#### Defender Structure Tile

```json
{
  "type": "defender-structure",
  "id": 25,
  "structure": "anaconda-tower",
  "health": 55,
  "path-1-upgrades": 3,
  "path-2-upgrades": 0
}
```

#### Immovable Object Tile

```json
{
  "type": "immovable-object"
}
```
