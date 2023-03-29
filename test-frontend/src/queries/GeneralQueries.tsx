import mw from 'mw';

interface GeneralQueriesProps {
  lobby: string;
  lobby_to_count: number;
  round: number;
}

export const GeneralQueries: React.FC<GeneralQueriesProps> = ({ lobby, round, lobby_to_count }) => {
  //TODO: unavailable
  // const getRoundState = async () => {
  //   const result = await mw.getRoundExecutionState(lobby, round);
  //   console.log(result);
  // };

  const getOpenLobbies = async (page: number, count?: number) => {
    const result = await mw.getOpenLobbies('', page, count);
    console.log(result, 'getOpenLobbies');
  };

  const getRandomLobby = async () => {
    const result = await mw.getRandomOpenLobby();
    console.log(result, 'getRandomLobby');
  };

  const getLobbyState = async () => {
    const result = await mw.getLobbyState(lobby);
    console.log(result, 'getLobbyState');
  };

  const getLatestProcessedBlockHeight = async () => {
    const result = await mw.getLatestProcessedBlockHeight();
    console.log(result, 'getLatestProcessedBlockHeight');
  };

  const matchWinner = async (lobbyID: string) => {
    const result = await mw.getMatchWinner(lobbyID);
    console.log(`match winner of ${lobbyID}:`, result);
  };

  const nftStats = async (nftContract: string, tokenId: number) => {
    const result = await mw.getNftStats(nftContract, tokenId);
    console.log('NFT score:', result);
  };

  return (
    <div className="button-group">
      <p>General queries</p>
      <button onClick={getLatestProcessedBlockHeight}>Get Latest Processed Block Height</button>
      <button onClick={() => getOpenLobbies(1)}>Get Open Lobbies</button>
      <button onClick={() => getOpenLobbies(round, lobby_to_count)}>
        Get Open Lobbies page {round}
      </button>
      <button onClick={getRandomLobby}>Get Random Lobby</button>
      <button onClick={() => matchWinner(lobby)}>Get Match Winner</button>
      <button onClick={() => nftStats(lobby, round)}>Get NFT Stats</button>
      <button onClick={getLobbyState}>Get Lobby State</button>
      {/* <button onClick={getRoundState}>Get Round Execution State</button> */}
    </div>
  );
};
