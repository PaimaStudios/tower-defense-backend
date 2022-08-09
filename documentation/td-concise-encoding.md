# Tower Defense Concise Input Encoding v0.1

## User Submitted Game Input Types

These are the types of game input a user can submit:

1. Create Lobby
2. Join Lobby
3. Register Match Config
4. Submit Turn
   ...

### Create Lobby

Middleware endpoint:

```js
createLobby(numberOfLives: Num, numberOfRounds: number, roundLength: number, map: string, selectedAnimal: string)
```

Encoding:

```
c|
numberOfLives|
numOfRounds|
roundLength|
allowedWallets|
map|
selectedAnimal|
matchConfigId
```

Encoding Example:

```
c|3|20|10|0x234a...,0x89a3...|map1|Piranha|9al2309a...
```

### Join Lobby

Middleware endpoint:

```js
joinLobby(lobbyID: String, selectedAnimal: String)
```

Encoding:

```
j|
*lobbyID|
selectedAnimal|
```

Encoding Example:

````
j|*92aomafiooao...|Piranha

### Register Match Config

Enables a user to register a new match config in the Match Config Registry. More details about definition concise encoding can be found in the [match config spec](match-config-spec-v1.md) document.

Middleware endpoint:

```js

````

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

### Submit Turn

Submitting a turn in the td game is quite a bit more complex than the catapult game. In this case rather than specifying 3 moves, a user can
choose to build/repair/upgrade/destroy any number of structures on their side of the map.

The frontend will be required to create some json based off of what the player submitted. The following four actions must be specified as such by the frontend:

Build Structure:

```json
{
  "action": "build",
  "x": 12,
  "y": 5,
  "structure": "anaconda-tower"
}
```

Repair Structure:

```json
{
  "action": "repair",
  "x": 12,
  "y": 5
}
```

Destroy Structure:

```json
{
  "action": "destroy",
  "x": 12,
  "y": 5
}
```

Upgrade Structure:

```json
{
  "action": "upgrade",
  "x": 12,
  "y": 5,
  "path": 1
}
```

And all of these actions become a `turnActions` json:

```json
{
   "actions": [
      action1,
      action2,
      action3,
      ...
   ]
}
```

Middleware endpoint:

```js
submitTurn(lobbyId: string, roundNumber: number, turnActions)
```

When the middleware receives the `turnActions`, it then must iterate through all of the actions and convert them into the concise encoding format. Of note, all destroy actions will be required to be processed first on the backend before any build actions.

Build Structure:

```json
|b,12,5,anaconda-tower|
```

Repair Structure:

```json
|r,12,5|
```

Destroy Structure:

```json
|d,12,5|
```

Upgrade Structure:

```json
|u,12,5,1|
```

Submit Turn Encoding:

```
s|
*lobbyId|
roundNumber|
action|
action|
action|
...
```

Encoding Example:

```
s|*5jo2op3a2...|7|d,5,7|b,5,7,anaconda-tower|b,9,14,sloth-tower|r,8,8|u,12,12,1|...
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

Specifies that the given user's stats need to be updated with the resulting win/loss:

```
u|*0x9akau3...|w
```

or

```
u|*0x9akau3...|l
```
