import { LobbyDbQuery } from '@tower-defense/utils';

export const getLobbyById = {
  run: async function run({ lobby_id, wallet }: any, _pool: any): Promise<LobbyDbQuery[]> {
    return [
      {
        created_at: new Date(),
        creation_block_height: 0,
        current_round: 5,
        grid_size: 3,
        health: 3,
        hidden: true,
        lobby_creator: wallet ?? 'lobby_creator',
        lobby_creator_animal: 'lobby_creator_animal',
        lobby_id,
        lobby_state: 'active',
        map: 'map',
        num_of_rounds: 10,
        round_length: 12,
      },
    ];
  },
};

export const getOpenLobbyById = {
  run: async function run({ searchQuery, wallet }: any, pool: any): Promise<LobbyDbQuery[]> {
    return getLobbyById.run({ searchQuery, wallet }, pool);
  },
};
export const getRandomLobby = {
  run: async function run(_params: any, pool: any) {
    return getLobbyById.run('random_lobby', pool);
  },
};

export const getRandomActiveLobby = {
  run: async function run(_params: any, pool: any) {
    return getLobbyById.run('random_active_lobby', pool);
  },
};

export const getPaginatedOpenLobbies = {
  run: async function run({ wallet }: any, pool: any): Promise<LobbyDbQuery[]> {
    const [lobby] = await getLobbyById.run('random_active_lobby', pool);
    return [
      {
        ...lobby,
        lobby_creator: `NOT ${wallet}`,
        lobby_state: 'open',
      },
    ];
  },
};

export const getPaginatedUserLobbies = {
  run: async function run({ wallet }: any, pool: any): Promise<LobbyDbQuery[]> {
    const [lobby] = await getLobbyById.run('random_user_lobby', pool);
    return [
      {
        ...lobby,
        lobby_creator: wallet,
      },
    ];
  },
};

export const searchPaginatedOpenLobbies = {
  run: async function run({ searchQuery, wallet }: any, pool: any): Promise<LobbyDbQuery[]> {
    const [lobby] = await getPaginatedOpenLobbies.run('random_active_lobby', pool);
    return [
      {
        ...lobby,
        lobby_id: `SEARCH:${searchQuery}`,
        lobby_creator: `NOT ${wallet}`,
        lobby_state: 'open',
      },
    ];
  },
};

export const getFinalState = {
  run: async function run({ lobby_id }: any, _pool: any) {
    return [
      {
        lobby_id,
        player_one_health: 1,
        player_one_position: 1,
        player_one_result: 'win',
        player_one_wallet: 'player_one_wallet',
        player_two_health: 0,
        player_two_position: 1,
        player_two_result: 'loss',
        player_two_wallet: 'player_two_wallet',
      } as IGetFinalStateResult,
    ];
  },
};

//TODO: this is only used to check who already submitted moves so we should adjust it accordingly (eg. getRoundWallets)
export const getRoundMoves = {
  run: async function run({ lobby_id, round }: any, _pool: any) {
    return [
      {
        id: 0,
        lobby_id,
        move_type: 'move_type',
        position: 0,
        round,
        wallet: 'wallet',
      },
    ];
  },
};

export const getRoundData = {
  run: async function run({ lobby_id, round_number }: any, _pool: any) {
    return [
      {
        execution_block_height: 0,
        id: 0,
        lobby_id,
        round_within_match: round_number,
        starting_block_height: 0,
      },
    ];
  },
};

export const getUserStats = {
  run: async function run({ wallet }: any, _pool: any): Promise<IGetUserStatsResult[]> {
    return [
      {
        losses: 0,
        ties: 0,
        wallet,
        wins: 10,
      },
    ];
  },
};

export const getLatestUserNft = {
  run: async function run({ wallet }: any, _pool: any): Promise<IGetUserNfTsResult[]> {
    return [
      {
        address: 'address',
        block_height: 0,
        timestamp: new Date(),
        token_id: 0,
        wallet,
      },
    ];
  },
};

export const getLatestProcessedBlockHeight = {
  run: async function run(_params: any, _pool: any) {
    return [{ block_height: 9999 }];
  },
};

export const getNewLobbiesByUserAndBlockHeight = {
  run: async function run(_params: any, _pool: any) {
    return [{ lobby_id: 'lobby_id' }];
  },
};
export type IGetFinalStateResult = unknown & {
  player_one_result: 'win' | 'loss' | 'tie';
  player_one_wallet: string;
  player_two_wallet: string;
};

export interface IGetUserStatsResult {
  losses: number;
  ties: number;
  wallet: string;
  wins: number;
}

export interface IGetUserNfTsResult {
  address: string;
  block_height: number;
  timestamp: Date | null;
  token_id: number;
  wallet: string;
}

export interface IGetNewLobbiesByUserAndBlockHeightResult {
  lobby_id: string;
}

export type IGetRandomActiveLobbyResult = any;
export type IGetRandomLobbyResult = any;
export type IGetPaginatedUserLobbiesResult = any;
