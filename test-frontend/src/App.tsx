import { useState } from 'react';
import './App.css';
import mw, {
  MiddlewareConfig,
  PostingModeSwitchResult,
  getMiddlewareConfig,
  postConciselyEncodedData,
  getRemoteBackendVersion,
  userWalletLoginWithoutChecks,
  switchToUnbatchedMode,
  switchToBatchedEthMode,
  switchToBatchedCardanoMode,
  switchToBatchedPolkadotMode,
  retrievePostingInfo,
} from 'mw';
import { GeneralQueries } from './queries/GeneralQueries';
import { WalletQueries } from './queries/WalletQueries';

type PostingModeString =
  | 'unbatched'
  | 'batched-eth'
  | 'batched-cardano'
  | 'batched-polkadot'
  | 'automatic';

function App() {
  const [wallet, setWallet] = useState('');
  const [lobby, setLobby] = useState('');
  const [hiddenLobby, setHiddenLobby] = useState(false);
  const [practiceLobby, setPracticeLobby] = useState(false);
  const [round, setRound] = useState(1);
  const [gridSize, setGridSize] = useState(0);
  const [isLeft, setIsLeft] = useState(true);
  // executors
  const [me, setMe] = useState<any>();
  const [re, setRe] = useState<any>();
  const [postingModeStr, setPostingModeStr] = useState<PostingModeString>('unbatched');

  const logMiddleware = () => {
    console.log(mw, 'mw');
    console.log(lobby, 'lobby');
  };

  const {
    storageAddress,
    backendUri,
    indexerUri,
    statefulUri,
    batcherUri,
    localVersion,
  }: MiddlewareConfig = getMiddlewareConfig();

  const walletConnected = !!wallet;

  const updatePostingInfo = async () => {
    const res = await retrievePostingInfo();
    if (!res.success) {
      console.error('Unable to update posting info!');
      return;
    }

    setWallet(res.result.address);
    setPostingModeStr(res.result.postingModeString);
  };

  async function rExecutor() {
    const res = await mw.getRoundExecutor(lobby, round);
    console.log(res);
    if (res.success && res.result) {
      window.roundExecutor = res.result;
      setRe(res.result);
    }
  }
  async function mExecutor() {
    const res = await mw.getMatchExecutor(lobby);
    console.log(res);
    if (res.success && res.result) {
      window.matchExecutor = res.result;
      setMe(res.result);
    }
  }

  async function userWalletLoginWrapper() {
    const loginType = lobby ? lobby : 'metamask';
    await mw
      .userWalletLogin(loginType)
      .then(res => {
        if (res.success) {
          console.log('Successfully logged in address:', res.result.walletAddress);
        } else {
          console.log('Error while logging in address:', res.errorMessage, res.errorCode);
        }
        updatePostingInfo();
      })
      .catch(err => {
        console.log('Error while logging in eth address:', err);
      });
  }

  async function userWalletLoginWithoutChecksWrapper() {
    const loginType = lobby ? lobby : 'metamask';
    await userWalletLoginWithoutChecks(loginType)
      .then(res => {
        if (res.success) {
          console.log('Successfully logged in address:', res.result.walletAddress);
        } else {
          console.log('Error while logging in address:', res.errorMessage, res.errorCode);
        }
        updatePostingInfo();
      })
      .catch(err => {
        console.log('Error while logging in eth address:', err);
      });
  }

  const loginCheck = async () => {
    const result = await mw.checkWalletStatus();
    console.log(result, 'loginCheck');
  };

  //TODO: moves submit
  // async function submitMoves(moves: MatchMove[]) {
  //   console.log(`Submitting moves to round ${round} in lobby ${lobby}:`, moves);
  //   mw.submitMoves(/** JSON */).then(console.log).catch(console.error);
  // }

  // async function submitRandomMoves() {
  //   const randIndex = () => Math.floor(Math.random() * 3);
  //   const moves = Array.from(Array(3)).map(m => opt[randIndex()]());
  //   await submitMoves(moves);
  // }

  async function createSpecificLobby() {
    const lobby = {
      presetName: 'short',
      role: 'random',
      numberOfRounds: 10,
      roundLength: 100,
      isHidden: false,
      mapName: 'jungle',
      isPractice: false,
    };
    mw.createLobby(JSON.stringify(lobby)).then(console.log).catch(console.error);
  }

  async function joinSpecificLobby() {
    mw.joinLobby(lobby).then(console.log).catch(console.error);
  }

  async function closeSpecificLobby() {
    mw.closeLobby(lobby).then(console.log).catch(console.error);
  }

  async function setAnyNft() {
    mw.getUserWalletNfts(wallet).then(r => {
      if (r.success) {
        let nft;
        if (r.result.length > 0) {
          nft = r.result[0];
        } else {
          nft = {
            nftAddress: '0xadd3e55',
            tokenId: 42,
          };
        }
        console.log('[setAnyNft] setting the following NFT:', nft);
        mw.setNft(nft.nftAddress, nft.tokenId).then(console.log).catch(console.error);
      } else {
        console.log('[setAnyNft] unable to retrieve NFT');
      }
    });
  }

  async function postDataWrapper() {
    if (!walletConnected) {
      throw new Error('Wallet not connected!');
    }
    postConciselyEncodedData(lobby).then(console.log).catch(console.error);
  }

  async function testRemoteVersion() {
    getRemoteBackendVersion().then(console.log).catch(console.error);
  }

  function processPostingModeSwitchResult(result: PostingModeSwitchResult): boolean {
    if (result.success) {
      setPostingModeStr(result.postingModeString);
    }
    return result.success;
  }

  const walletNotConnectedLabel = <span className="warning-label">WALLET NOT CONNECTED!</span>;
  const lobby_to_count = /^\d+$/.test(lobby) ? parseInt(lobby) : 10;

  return (
    <div className="App">
      <header className="App-header">
        <p>Paima Tower Defense middleware test</p>
        <button onClick={logMiddleware}>i</button>
      </header>
      <div className="App-body connection-info">
        <label>Storage address: {storageAddress}</label>
        <label>Backend URI: {backendUri}</label>
        <label>Indexer URI: {indexerUri}</label>
        <label>Stateful URI: {statefulUri}</label>
        <label>Batcher URI: {batcherUri}</label>
        <label>Posting Mode: {postingModeStr}</label>
        <div>
          <button
            onClick={async () => {
              await switchToUnbatchedMode().then(processPostingModeSwitchResult);
              updatePostingInfo();
            }}
          >
            UNBATCHED
          </button>
          <button
            onClick={async () => {
              await switchToBatchedEthMode().then(processPostingModeSwitchResult);
              updatePostingInfo();
            }}
          >
            BATCHED ETH
          </button>
          <button
            onClick={async () => {
              await switchToBatchedCardanoMode().then(processPostingModeSwitchResult);
              updatePostingInfo();
            }}
          >
            BATCHED CARDANO
          </button>
          <button
            onClick={async () => {
              await switchToBatchedPolkadotMode().then(processPostingModeSwitchResult);
              updatePostingInfo();
            }}
          >
            BATCHED POLKADOT
          </button>
        </div>
        <label>Wallet: {wallet || walletNotConnectedLabel}</label>
        <label>Local version: {localVersion}</label>
      </div>
      <div className="App-body endpoint-inputs">
        <div>
          <label>
            Lobby
            <input type="text" onInput={e => setLobby(e.currentTarget.value)} />
          </label>
          <label>
            <input
              type="checkbox"
              checked={hiddenLobby}
              onChange={() => setHiddenLobby(value => !value)}
            />
            Hidden
          </label>
          <label>
            <input
              type="checkbox"
              checked={practiceLobby}
              onChange={() => setPracticeLobby(value => !value)}
            />
            Practice
          </label>
        </div>

        <label>
          Round/Page
          <input
            type="text"
            value={round}
            onChange={e => setRound(parseInt(e.currentTarget.value))}
          />
        </label>
        <label>
          Grid Size
          <input
            type="text"
            value={gridSize}
            onChange={e => setGridSize(parseInt(e.currentTarget.value))}
          />
        </label>
        <label>
          Left player
          <input type="checkbox" checked={isLeft} onChange={() => setIsLeft(value => !value)} />
        </label>
      </div>
      <div className="App-body endpoint-buttons">
        <div className="button-group">
          <p>Executors</p>
          <button onClick={rExecutor}>Get Round Executor</button>
          <button onClick={mExecutor}>Get Match Executor</button>
          {me && (
            <button
              onClick={() => {
                console.log('me tick:', me.tick());
              }}
            >
              Tick Match Executor
            </button>
          )}
          {re && (
            <button
              onClick={() => {
                console.log('re tick:', re.tick());
              }}
            >
              Tick Round Executor
            </button>
          )}
          <p>Internal "endpoints"</p>
          <button onClick={userWalletLoginWithoutChecksWrapper}>
            User Wallet Login w/o Checks
          </button>
          <button onClick={() => console.log(mw.exportLogs())}>Export logs</button>
          <button onClick={testRemoteVersion}>Get Remote Version</button>
          <button onClick={postDataWrapper}>Post String</button>
        </div>
        <GeneralQueries lobby={lobby} lobby_to_count={lobby_to_count} round={round || 0} />
        <div className="button-group">
          <p>Wallet actions</p>
          <button onClick={loginCheck}>Check Login</button>
          <button onClick={userWalletLoginWrapper}>User Wallet Login</button>
          <button onClick={createSpecificLobby}>Create Lobby hardcoded</button>
          <button onClick={joinSpecificLobby}>Join Lobby specified</button>
          <button onClick={closeSpecificLobby}>Close Lobby specified</button>
          {/* <button onClick={submitRandomMoves}>Submit Moves random</button> */}
          {/* <button onClick={submitMurderMoves}>Submit Moves murder</button> */}
          {/* <button onClick={submitInitRiskyMurderMoves}>Submit Moves init risky murder</button> */}
          <button onClick={setAnyNft}>setAnyNft</button>
        </div>
        <WalletQueries
          wallet={wallet}
          lobby={lobby}
          lobby_to_count={lobby_to_count}
          round={round || 0}
        />
      </div>
    </div>
  );
}

export default App;
