# Tower Defense Concise Input Encoding v0.1

## Game Input Types

There are three types of game input a user can submit:

1. Create Lobby
2. Join Lobby
   ...

### Create Lobby

Middleware endpoint:

```js
createLobby(numberOfLives: Num, numberOfRounds: number, roundLength: number, map: string, gridSize: Num, selectedAnimal: string, matchConfigId: string, avatarNFT)
```

Encoding:

```
c|
numberOfLives|
gridSize|
numOfRounds|
roundLength|
map|
matchConfigId
n<avatarNftAddress|avatarNftId>
```

Encoding Example:

```
c|3|8|Piranha|5oa92ndgam2|n<0x83ae1i38a9...|925>|
```
