# TD Game Tick Events

Each unit and structure has a deterministic id generated for it when it is created. Every game tick, processing happens as such inside of the round executor:

1. All currently spawned units process movement logic (aka. move from square A to B, or are 1 tick closer to moving squares).
2. After moving, any units which have moved onto the defender’s base cause the defender's base to lose 1 health and the unit gets deleted. (If the defender's base ever hits 0 health, the round, and the match, instantly end)
3. All towers/crypts perform their action if they are not on cooldown (ie. attack a unit if it’s in range, or spawn a new unit).
4. If all units have been spawned and killed, both the attacker/defender are awarded gold, and the round concludes.

As each action is processed during a game tick, it generates a game tick event. The round executor returns a list of game tick events based on all of the actions which took place in said tick. It is up to the frontend to process all of these events visually.

Below we will specify the different types of game tick events which will be supported.
## Structure Events

Users in both factions submit actions in every turn concerning the structures they can place of the map. Each action produces an event.

### Build Structure Event

Note `coordinates` here and in any other event are a single integer, referring to the index of the given cell in the map, which is a simple 1D array of cells.

```json
{
  "eventType": "build",
  "coordinates": number,
  "faction": "attacker" | "defender",
  "id": number,
  "structure": "anacondaTower" | "gorillaCrypt" ...
}
```

### Repair Structure Event
```json
{
  "eventType": "repair",
  "faction": "attacker" | "defender",
  "id": number
}
```
### Upgrade Structure Event
```json
{
  "eventType": "upgrade",
  "faction": "attacker" | "defender",
  "id": number
}
```
### Salvage Structure Event
```json
{
  "eventType": "salvage",
  "faction": "attacker" | "defender",
  "id": number,
  "gold": number
}
```
## Other Events

Once the structure events are processed, the round's "battle phase" starts. The battle phase is a list of events which derive deterministically from the state of the map, i.e. the kind of structures that are placed in the map.

## Unit Spawned Event

When a crypt spawns a unit, this event specifies all of the relevant details about the unit.
`tier` refers to the level of the crypt structure that spawned. That affects how a unit responds to status buffs.

```json
{
  "eventType": "spawn",
  "faction": "attacker" | "defender",
  "cryptID": number,
  "actorID": number,
  "coordinates": number,
  "unitType": "jaguar" | "gorilla" | "macaw",
  "unitHealth": number,
  "unitSpeed": number,
  "unitAttack": number,
  "tier": number
}
```

## Unit Movement Event

An event which specifies the current position of the unit on the map and how fast/where it is moving to. Movement events are emitted on every tick after a unit is spawned, as long as it's alive.


This event includes:

- Unit ID
- Completion (an integer between 0-100 that represents how much of the square has been completed)
- Movement Speed (an integer between 0-100 that represents how much completion of a square a unit makes per tick)
- Coordinates: The index where the unit currently is.
- nextCoordinates: The index where the unit is headed to, and will move to once movement completion is 100. This will be null once the unit has reached it's final destination, the defender's base.

```json
{
  "eventType": "movement",
  "faction": "attacker" | "defender",
  "actorID": number,
  "coordinates": number,
  "nextCoordinates": number | null,
  "completion": number,
  "movement-speed": number
}
```

## Damage Event

Both units and defender towers can take damage. When they do take damage we emit an event.
`faction` here means the faction causing the damage, not receiving it.

```json
{
  "eventType": "damage",
  "faction": "attacker" | "defender",
  "sourceID": number,
  "targetID": number,
  "damageType": "neutral",
  "damageAmount": number
}
```

## Defender Base Update Event

When the attacker’s units walk onto the square of the defender’s base, the base takes damage and emits an event (and the unit is deleted).
Returns the defender's base remaining health (if == 0, then the match is over and the defender lost).

```json
{
  "event": "defenderBaseUpdate",
  "faction": "defender",
  "health": number
}
```

## Actor Deleted Event

When an attacker’s unit or a defender’s tower hit 0 hp, then they are deleted and must be visually removed from the game (tower falls apart, unit dies at current position).

```json
{
  "event": "actorDeleted",
  "faction": 
  "id": 2593
}
```

## Status Effect Applied Event

Some structures target units to apply status to them (attacker applies buffs, defender applies debuffs). The status effect game tick event is emitted when a status effect is applied to a unit, and it carries with that unit forever. Of note, besides visually displaying the status effect being applied to the unit, the frontend doesn't need to calculate anything based off of this event. The round executor will take into account all changes this applies to the state/stats internally.

The tick event includes:

- Source Structure ID
- Target Unit ID
- Status type
```json
{
  "eventType": "statusApply",
  "faction": "attacker" | "defender",
  "sourceID": number,
  "targetID": number,
  "statusType": "speedDebuff" | "speedBuff" | "healthBuff"
}
```

### Gold Reward Events

At the end of a round/combat phase after all units are destroyed, both the attacker and defender are rewarded gold as a result. The amount of gold is modulated based on the current round number, the level of each faction's base and the chosen match configuration. Two gold rewards events are emitted at the end of every round, thereby defining exactly how much each player receives. The `amount` of gold is the total gold that the player has after the event, not the amount to be added.

```json
{
  "event": "goldUpdate",
  "faction": "attacker",
  "amount": 50
}
```