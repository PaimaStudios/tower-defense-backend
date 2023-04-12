/**
 * these files deal with receiving blockchain data input and outputting SQL updates (imported from pgTyped output of our SQL files)
 * PGTyped SQL updates are a tuple of the function calling the database and the params sent to it.
 *
 * There are generic user inputs: CreateLobby, CloseLobby, JoinLobby, SetNFT. + TD specific ones
 * We deal with each in its own `persist` function.
 *
 * User Metadata are created inside the persistLobbyCreation and persistLobbyJoin functions @see {blankStats}.
 */
export * from './lobby.js';
export * from './match.js';
export * from './nft.js';
export * from './stats.js';
export * from './zombie.js';
export * from './config.js';