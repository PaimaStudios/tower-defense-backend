# Tower Defense Concise Input Encoding v0.1

## User Submitted Game Input Types

These are the types of game input a user can submit:

1. Create Lobby
2. Join Lobby
3. Register Match Config
   ...

### Create Lobby

Middleware endpoint:

```js

```

Encoding:

```
c|
numberOfLives|
gridSize|
numOfRounds|
roundLength|
allowedWallets|
map|
selectedAnimal|
```

Encoding Example:

```
c|3|8|20|10|0x234a...|map1|Piranha
```

### Join Lobby

### Register Match Config

Enables a user to register a new match config in the Match Config Registry. More details about definition concise encoding can be found in the [match config spec](match-config-spec-v1.md) document.

Middleware endpoint:

```js

```

Encoding:

```
r|
matchConfigVersion|
definition|
definition|
...
```

Encoding Example:

```
r|1|definition|definition|...
```

## Scheduled Game Input Types

There are two types of scheduled game inputs:

1. Zombie Round
2. User Stats Update

### Zombie Round

Specifies that a round has ended and must be executed.

```
z|*83aomafiooao...
```

### User Stats Update

Specifies that the given user's stats need to be updated with the resulting wind/tie/loss:

```
u|*0x9akau3...|w
```

or

```
u|*0x9akau3...|t
```

or

```
u|*0x9akau3...|l
```
