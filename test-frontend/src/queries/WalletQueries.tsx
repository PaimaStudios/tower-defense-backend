import mw from 'mw';

interface WalletQueriesProps {
  wallet: string;
  lobby: string;
  lobby_to_count: number;
  round: number;
}

export const WalletQueries: React.FC<WalletQueriesProps> = ({
  wallet,
  lobby,
  round,
  lobby_to_count,
}) => {
  const getOpenLobbies = async (page: number, count?: number) => {
    const result = await mw.getOpenLobbies(wallet, page, count);
    console.log(result, 'getOpenLobbies');
  };

  const searchLobby = async (query: string, page: number) => {
    const result = await mw.getLobbySearch(wallet, query, page);
    console.log(result, 'searchLobby');
  };

  const getUserLobbiesMatches = async (page: number, count?: number) => {
    const result = await mw.getUserLobbiesMatches(wallet, page, count);
    console.log(result, 'getUserLobbiesMatches');
  };

  const getLatestNewLobbies = async () => {
    const result = await mw.getLatestProcessedBlockHeight();
    if (result.success) {
      getNewLobbies(result.result);
    } else {
      console.log('[getnewLobbies] unable to get latest processed block height');
    }
  };

  const getNewLobbies = async (blockHeight: number) => {
    const result = await mw.getNewLobbies(wallet, blockHeight);
    console.log(result, 'getNewLobbies');
  };

  const getUserStats = async () => {
    const result = await mw.getUserStats(wallet);
    console.log(result, 'getUserStats');
  };

  async function getWalletNfts() {
    const result = await mw.getUserWalletNfts(wallet);
    console.log(result, 'getWalletNfts');
  }

  async function getSetNfts() {
    const result = await mw.getUserSetNFT(wallet);
    console.log(result, 'getSetNfts');
  }

  return (
    <div className="button-group">
      <p>Wallet queries</p>
      <button onClick={() => getOpenLobbies(1)}>Get Open Lobbies For User</button>
      <button onClick={() => searchLobby(lobby, round)}>Lobby Search page {round}</button>
      <button onClick={() => getUserLobbiesMatches(1)}>Get User Lobbies Matches</button>
      <button onClick={() => getUserLobbiesMatches(round, lobby_to_count)}>
        Get User Lobbies Matches page {round}
      </button>
      <button onClick={getLatestNewLobbies}>Get New Lobbies</button>
      <button onClick={() => getNewLobbies(lobby_to_count)}>
        Get New Lobbies @{lobby_to_count}
      </button>
      <button onClick={getUserStats}>Get User Stats</button>
      <button onClick={getWalletNfts}>Get Logged In Wallet NFTs</button>
      <button onClick={getSetNfts}>Get User Set NFT</button>
    </div>
  );
};
