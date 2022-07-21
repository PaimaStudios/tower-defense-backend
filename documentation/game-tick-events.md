# TD Game Tick Events

Each unit and structure has a deterministic id generated for it when it is created. Every game tick, processing happens as such:

1. All spawned units process movement logic (aka. move from square A to B, or are 1 tick closer to moving squares).
2. After moving, any units which have moved onto the defender’s base cause the defender's base to lose 1 health and the unit gets deleted. (If the defender's base ever hits 0 health, the round, and the match, instantly end)
3. All towers/crypts perform their action if they are not on cooldown (ie. attack a unit if it’s in range, or spawn a new unit).
4. If all units are killed, both the attacker/defender are awarded gold, and the round concludes.

As each action is processed during a game tick, it generates a game tick event. Below we will specify the different types of game tick events which will be supported.

## Gold Reward Events

At the end of a round/combat phase after all units are destroyed, both the attacker and defender are rewarded gold as a result. The amount of gold is modulated based on the current round number, and how many gold mine structures each player respectively has (which increase gold rewards). Two gold rewards events are emitted at the end of every round, thereby defining exactly how much each player receives.

```json
{
  "event": "gold-reward",
  "faction": "attacker",
  "amount": 1500
}
```

OR

```json
{
  "event": "gold-reward",
  "faction": "defender",
  "amount": 1700
}
```

## Unit Movement Event

An event which specifies the current state of each unit on the map after processing movement logic for the current tick. This event includes:

- Unit ID
- Current X/Y Position (what square on the map)
- Next X/Y Position (square the unit is moving towards)
- Ticks to move (number of ticks left before they finish moving to the upcoming position)

By knowing what the upcoming x/y position will be, and how many ticks until the unit moves to said next position, it will be possible to visualize their speed across their current square properly.

```json
{
  "event": "movement",
  "id": 5262,
  "x": 10,
  "y": 5,
  "next-x": 11,
  "next-y": 5,
  "ticks-to-move": 3
}
```

## Status Effect Applied Event

Some structures target units to apply status to them (attacker applies buffs, defender applies debuffs). The status effect game tick event is emitted when a status effect is applied to a unit, and it carries with that unit for the duration specified (ex. increase movement speed by 100% for 10 ticks). Of note, besides visually displaying the status effect being applied to the unit, the frontend doesn't need to calculate anything based off of this event. The round executor will take into account all changes this applies to the state/stats internally.

The tick event includes:

- Source Structure ID
- Target Unit ID
- Status type
- Status amount
- Status duration (in game ticks)

```json
{
  "event": "status-apply",
  "source-id": 923,
  "target-id": 362,
  "status-type": "speed-debuff",
  "status-amount": 20,
  "status-duration": 30
}
```

## Status Effect Removed Event

When a status effect is removed due to expiring or otherwise, an event is emitted.

```json
{
  "event": "status-remove",
  "id": 362,
  "status-type": "speed-debuff"
}
```

## Damage Event

Both units and defender towers can take damage. When they do take damage we emit an event.

```json
{
  "event": "damage",
  "source-id": 923,
  "target-id": 362,
  "damage-type": "neutral",
  "damage-amount": 20
}
```

## Defender Base Event

When the attacker’s units walk onto the square of the defender’s base, the base takes damage and emits an event (and the unit is deleted).
Defender Base Remaining Health (if == 0, then the match is over and the defender lost)

```json
{
  "event": "defender-base-update",
  "health": 25
}
```

## Actor Deleted Event

When an attacker’s unit or a defender’s tower hit 0 hp, then they are deleted and must be visually removed from the game (tower falls apart, unit dies at current position).

```json
{
  "event": "actor-deleted",
  "id": 2593
}
```
