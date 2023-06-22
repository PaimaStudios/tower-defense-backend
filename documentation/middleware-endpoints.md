# Middleware Endpoints (as of 2023-2-22)

## Wallet interaction endpoints:

These endpoints facilitate interaction with the user's wallet.

---

### Endpoint `userWalletLogin`:

```ts
async function userWalletLogin(loginType: string, preferBatchedMode: boolean = false): Promise<Wallet | FailedResult>;
```

Attempts to log into the specified wallet. If the user’s wallet has previously authorized connecting to the game, the endpoint will instantly return the wallet information. If not, the connection is attempted, which may result in a pop-up window which the user will have to confirm authorizing connecting their wallet to the game before the data is returned.

The first parameter, `loginType`, is a string specifying which wallet should be used. Case is ignored (the string is converted to lowercase before processing). Only the following values are currently supported:

- `"metamask"`
- `"evm-flint"`
- `"flint"`
- `"nufi"`
- `"nami"`
- `"eternl"`
- `"polkadot"`

The first parameter, `preferBatchedMode`, can be ommitted. If truthy value is provided, then even EVM wallets (`metamask` & `evm-flint` currently) will use `BATCHED` posting mode.

#### Example Output:

```json
{
  "success": true,
  "result": {
    "walletAddress": "0x186...a40"
  }
}
```

---

## Read endpoints:

---

### Endpoint `getLatestProcessedBlockHeight`:

```ts
async function getLatestProcessedBlockHeight(): Promise<SuccessfulResult<number> | FailedResult>;
```

Returns the latest block height that the game state machine has processed.

#### Example Output:

```json
{
  "success": true,
  "result": 5708628
}
```

---

### Endpoint `getUserLobbiesMatches`:

```ts
async function getUserLobbiesMatches(
  walletAddress: string,
  page: number,
  count?: number
): Promise<LobbyStates | FailedResult>;
```

Returns a list of lobbies the specified user is in.

This endpoint is paginated, meaning that the `page` argument can be used to request different pages, and the optional `count` argument can specify the number of lobbies returned in each call.

#### Example Output:

```json
{
  "success": true,
  "lobbies": [
    {
      "lobby_id": "zisC9B75VPZ4",    // 12 characters
      "config_id": "abcdefabcdefab", // 14 characters
      "created_at": "2022-07-28T10:42:34.961Z",
      "creation_block_height": 5684941,
      "creator_faction": "attacker",
      "lobby_creator": "0xdda...f2e",
      "player_two": "0x186...a40",
      "num_of_rounds": 20,
      "current_round": 20,
      "round_length": 40,
      "map": "jungle",
      "hidden": false,
      "practice": true,
      "lobby_state": "active",
      "current_match_state": {
        "attacker": "0xdda...f2e",
        "attackerGold": 430,
        "attackerBase": {
          "level": 1,
        },
        "defender": "0x186...a40",
        "defenderGold": 320,
        "defenderBase": {
          "health": 93,
          "level": 2
        },
        "actors": {
          "crypts": [3, 5, 6],
          "towers": [1, 2, 4],
          "units": [9, 10, 11, 12]
        },
        "actorCount": 10,
        "currentRound": 20,
        "finishedSpawning": [3, 6],
        "roundEnded": false,
        // map related attributes
        "name": "jungle", // or whatever the map is"
        "width": 22,
        "height": 13,
        "mapState": [
          {"type": "path", "faction": "defender"},
          {"type": "open", "faction": "defender"},
          // ...
        ]
      }
    }
    // ...
  ]
}
```

---

### Endpoint `getUserFinishedLobbies`:

```ts
async function getUserFinishedLobbies(
  wallet: string,
  page: number,
  count?: number
): Promise<LobbyStates | FailedResult>;
```

Returns a list of lobbies the specified user played in.

This endpoint is paginated, meaning that the `page` argument can be used to request different pages, and the optional `count` argument can specify the number of lobbies returned in each call.

#### Example Output:

```json
{
  "success": true,
  "lobbies": [
    {
      "lobby_id": "zisC9B75VPZ4",    // 12 characters
      "config_id": "abcdefabcdefab", // 14 characters
      "created_at": "2022-07-28T10:42:34.961Z",
      "creation_block_height": 5684941,
      "creator_faction": "attacker",
      "lobby_creator": "0xdda...f2e",
      "player_two": "0x186...a40",
      "num_of_rounds": 20,
      "current_round": 20,
      "round_length": 40,
      "map": "jungle",
      "hidden": false,
      "practice": true,
      "lobby_state": "finished",
      "current_match_state": {
        "attacker": "0xdda...f2e",
        "attackerGold": 430,
        "attackerBase": {
          "level": 1,
        },
        "defender": "0x186...a40",
        "defenderGold": 320,
        "defenderBase": {
          "health": 93,
          "level": 2
        },
        "actors": {
          "crypts": [3, 5, 6],
          "towers": [1, 2, 4],
          "units": [9, 10, 11, 12]
        },
        "actorCount": 10,
        "currentRound": 20,
        "finishedSpawning": [3, 6],
        "roundEnded": true,
        // map related attributes
        "name": "jungle", // or whatever the map is"
        "width": 22,
        "height": 13,
        "mapState": [
          {"type": "path", "faction": "defender"},
          {"type": "open", "faction": "defender"},
          // ...
        ]
      }
    }
    // ...
  ]
}
```

---

### Endpoint `getOpenLobbies`:

```ts
async function getOpenLobbies(
  wallet: string,
  page: number,
  count?: number
): Promise<LobbyStates | FailedResult>;
```

Returns a list of open lobbies, that the user can join. Lobbies created by `wallet` are filtered out.

This endpoint is paginated, meaning that the `page` argument can be used to request different pages, and the optional `count` argument can specify the number of lobbies returned in each call.

As requested this endpoint adds a query for the user stats of the lobby creator.

#### Example Output:

```ts
{
  "success": true,
  "lobbies": [
    {
    // ... lobby data, see above
    "wallet": string, // lobby creator wallet
    "wins": number,
    "losses": number
    }
  ]
}
```

---

### Endpoint `getRandomOpenLobby`:

```ts
async function getRandomOpenLobby(): Promise<PackedLobbyState | FailedResult>;
```

Returns a random open lobby.

#### Example Output:

```json
{
  "success": true,
  "lobby": {
    // ...
  }
}
```

---

### Endpoint `getUserStats`:

```ts
async function getUserStats(walletAddress: string): Promise<UserStats | FailedResult>;
```

Returns the stats of all of the specified user’s previous matches that they have played.

#### Example Output:

```json
{
  "success": true,
  "stats": {
    "wallet": "0x186...a40",
    "wins": 0,
    "losses": 0
  }
}
```

---

### Endpoint `getNewLobbies`:

```ts
async function getNewLobbies(
  wallet: string,
  blockHeight: number
): Promise<NewLobbies | FailedResult>;
```

Returns a (potentially empty) list of lobbies created by the specified user at the specified block height.

#### Example Output:

```json
{
  "success": true,
  "lobbies": [
    {
      "lobby_id": "tvvsxo3sDSAr"
    }
  ]
}
```

---

### Endpoint `getLobbyState`:

```ts
async function getLobbyState(lobbyID: string): Promise<PackedLobbyState | FailedResult>;
```

Returns the current state of the lobby specified by `lobbyID`.

#### Example Output:

```json
{
  "success": true,
  "lobby": {
    // ...
  }
}
```

---

### 🚧 Endpoint `getRoundExecutionState`:
*Not implemented*
```ts
async function getRoundExecutionState(
  lobbyID: string,
  round: number
): Promise<PackedRoundExecutionState | FailedResult>;
```

Returns the execution state of the specified round of the specified match -- contains information about whether the round has been executed yet, a list of user addresses who already submitted their moves, and information about the planned timeout of the round.

#### Example Output:

```json
{
  "success": true,
  "round": {
    "executed": false,
    "usersWhoSubmittedMoves": ["0x186...a40"],
    "roundEndsInBlocks": 21593,
    "roundEndsInSeconds": 86372
  }
}
```

---

### Endpoint `getLobbySearch`:

```ts
async function getLobbySearch(
  wallet: string,
  searchQuery: string,
  page: number,
  count?: number
): Promise<LobbyStates | FailedResult>;
```

Search for lobbies with `searchQuery` within their `lobbyID`. The length of `searchQuery` must be at least 3, or it returns an empty list. Hidden lobbies are omitted, unless `searchQuery` is an exact match with the `lobbyID`. Lobbies created by `wallet` are omitted.

This endpoint is paginated, meaning that the `page` argument can be used to request different pages, and the optional `count` argument can specify the number of lobbies returned in each call.

#### Example Output:

```json
{
  "success": true,
  "lobbies": [
    {
      // ...
    }
  ]
}
```

---

### Endpoint `getMatchWinner`:

```ts
async function getMatchWinner(
  lobbyId: string
): Promise<SuccessfulResult<MatchWinnerResponse> | FailedResult>;
```

If the lobby exists, returns the lobby state and a winner address string; if the lobby is `finished`, the winner address is valid, being either the address of the winner of the lobby, or if the match ended in a draw, the address will be an empty string.

#### Example Outputs:

```json
{
  "success": true,
  "result": {
    "match_status": "finished",
    "winner_address": "0x186...a40"
  }
}
```

```json
{
  "success": true,
  "result": {
    "match_status": "open",
    "winner_address": ""
  }
}
```

---

### Endpoint `getUserWalletNfts`:

Returns a list of NFTs owned by the specified wallet.

```ts
async function getUserWalletNfts(address: string): Promise<SuccessfulResult<NFT[]> | FailedResult>;
```

#### Example Output:

```json
{
    "success": true,
    "result": [
        {
            "title": "Paima Volcaneer #15",
            "imageUrl": "https://.../15.jpg",
            "nftAddress": "0xb8c...5B1",
            "tokenId": 15
        },
        ...
    ]
}
```

---

### Endpoint `getUserSetNFT`:

Returns the title and image url of the NFT previously registered by the specified address using the `setNft` write endpoint. The ownership of this NFT by this address is also verified at this point.

```ts
async function getUserSetNFT(wallet: string): Promise<SuccessfulResult<NFT> | FailedResult>;
```

#### Example Output:

```json
{
  "success": true,
  "result": {
    "title": "Paima Volcaneer #25",
    "imageUrl": "https://.../25.jpg",
    "nftAddress": "0x28d...4DB",
    "tokenId": 25
  }
}
```

---

### Endpoint `getNftStats`:

Returns

```ts
async function getNftStats(
  nftContract: string,
  tokenId: number
): Promise<SuccessfulResult<NftScore> | FailedResult>;
```

#### Example Output:

```json
{
  "success": true,
  "result": {
    "nftContract": "0x28d7430845044EB1A9Fc50aD7A605686CFb784DB",
    "tokenId": 54,
    "totalGames": 1,
    "wins": 0,
    "losses": 0,
    "score": -1
  }
}
```

---

### Endpoint `getRoundExecutor`:

```ts
async function getRoundExecutor(
  lobbyId: string,
  roundNumber: number
): Promise<SuccessfulResult<RoundExecutor> | FailedResult>;
```

#### Example Calling

```js
// Get the RoundExecutor for round 3 of a given match
res = await getRoundExecutor("023kasfd9asfasdf", 3)
// The following code is only valid if res.success is true
executor = res.result

loop {
    // Progress the round one round tick forward
    // and receive a list of tick events
    tickEvents = executor.tick()

    // Process the returned tick events
    ...
}
```

For examples of Round Executor events please see the Game Tick Events document.

---

## Write endpoints:

These endpoints are used to post data to the blockchain. Each of them triggers a transaction which the user must confirm. As a result, all of these require the user to be logged in using the `userWalletLogin` endpoint.

---

### Endpoint `createLobby`:

Asks the user to sign a transaction which allows them to create a new lobby, requiring the specification of various match settings.

```ts
async function createLobby(arg: string): Promise<LobbyResponse | FailedResult>;
```

The argument of this function is a JSON string, which when unpacked looks like:

```ts
{
  "configName": string,         // 14 character string. Default is "defaultdefault"
  "creatorRole": "attacker" | "defender" | "random",  // role of the lobby creator
  "numberOfRounds": number,     // must be a positive whole number
  "roundLength": number,        // must be a positive whole number
  "mapName": string,
  "isHidden" = false: boolean   // false by default
  "isPractice" = false: boolean // false by default
  "hasAutoplay" = true: boolean // true by default
}
```

#### Example Output:

```json
{
  "lobbyID": "WWBV9FWI3LS4",
  "lobbyStatus": "open",
  "success": true
}
```

---

### Endpoint `joinLobby`:

Asks the user to sign a transaction which allows them to join the given lobby.

```ts
async function joinLobby(lobbyID: string): Promise<Result>;
```

#### Example Output:

```json
{
  "success": true,
  "message": ""
}
```

---

### Endpoint `closeLobby`:

Asks the user to sign a transaction which allows them to close the given lobby.

```ts
async function closeLobby(lobbyID: string): Promise<Result>;
```

#### Example Output:

```json
{
  "success": true,
  "message": ""
}
```

---

### Endpoint `submitMoves`:

Asks the user to sign a transaction which submits 3 moves in the latest round of a actively running match. The user can only submit their moves once per round, and cannot revert their actions once submitted. The parameter `moves` has to be an array of exactly 3 objects.

```ts
async function submitMoves(arg: string): Promise<Result>;
```

The argument to this function is a JSON string which when unpacked looks like:

```ts
{
  "lobbyID": string,
  "roundNumber": number,   // must be a positive whole number; round 0 means the match has not started yet so moves with round number 0 are invalid
  "moves": TurnAction[]
}
```

The `moves` list must be a list of objects of one of the following four forms:

```ts
{
    "action": "build",
    "round": number,
    "coordinates": number,      // index of the map array
    "faction": "attacker" | "defender",
    "structure": "anacondaTower" | "gorillaCrypt" | ... // name of the structure
}
```

```ts
{
    "action": "repair",
    "round": number,
    "faction": "attacker" | "defender",
    "id": number // number of the structure ID
}
```

```ts
{
    "action": "upgrade",
    "round": number,
    "faction": "attacker" | "defender",
    "id": number // number of the structure ID
}
```

```ts
{
    "action": "salvage",
    "round": number,
    "faction": "attacker" | "defender",
    "id": number // number of the structure ID
}
```

#### Example Output:

```json
{
  "success": true,
  "message": ""
}
```

---

### Endpoint `setNft`:

Asks the user to sign a transaction which registers the specified NFT to their address as the one they want to use in matches. Their ownership of the NFT is not verified at this stage. The registered NFT can later be retrieved using the `getUserSetNFT` endpoint.

```ts
async function setNft(nftAddress: string, nftId: number): Promise<Result>;
```

#### Example Output:

```json
{
  "success": true,
  "message": ""
}
```

---

## Utility endpoints:

These are regular functions that don't need any external calls or async treatment. They can be utilized from Unity as unified access to some of the middleware's own functionality. The initial purpose is a custom logger.

---

### Endpoint `log`:

A wrapper around `console.log` function with the same interface. Converts arrays, objects, JS errors and primitive values to strings and appends them to in memory logs buffer. Formatting includes timestamp before the message. Currently limited to 1000 entries (the oldest are automatically deleted).

```ts
function log(message: any, ...optionalParams: any[]): void;
```

---

### Endpoint `exportLogs`:

Concatenates the log buffer into a single string meant for further export. File with this string as a content is created in `paimaBridge.jslib` on Unity's side where all of our endpoints are consumed.

```ts
function exportLogs(nftAddress: string, nftId: number): string;
```

---
