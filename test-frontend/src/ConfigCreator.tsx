import processTick, {
  baseConfig,
  generateMatchState,
  parseConfig,
} from '@tower-defense/game-logic';
import { useEffect, useState } from 'react';
import mw from 'mw';
import './ConfigCreator.css';
import Prando from 'paima-engine/paima-prando';
import Simulation from './Simulation';
import Balancing, { GamePlan } from './balancing/balancing';
import { configToConcise } from '@tower-defense/utils';
import GeneralConfig from './components/GeneralConfig';

const maps: Record<string, string> = {
  // backwards:
  //   '1111111111111222222222\\r\\n1555551155551266666662\\r\\n1511151151151262222262\\r\\n1511155551151266662262\\r\\n1511111111151222262262\\r\\n1511155551155666662262\\r\\n3555151151111222222264\\r\\n1515151155555226666662\\r\\n1515551111115666222262\\r\\n1511111555511222266662\\r\\n1511111511511222262222\\r\\n1555555511555666662222\\r\\n1111111111111222222222',
  // crossing:
  //   '1111111111111222222222\\r\\n1111155555111226666222\\r\\n1555551115111226226662\\r\\n1511111115155666222262\\r\\n1515555115151222222262\\r\\n1515115115551222222262\\r\\n3555115115151222266664\\r\\n1511115555155662262262\\r\\n1511111111111266662262\\r\\n1515555511111222222662\\r\\n1515111511555666222622\\r\\n1555111555511226666622\\r\\n1111111111111222222222',
  // narrow:
  //   '1111111111111222222222\\r\\n1111111555111266622222\\r\\n1115551515111262626662\\r\\n1115155515155662626262\\r\\n1555111115551222666262\\r\\n1511111111111222222262\\r\\n3555555555555666666664\\r\\n1511111111111222222262\\r\\n1511155515551226662262\\r\\n1555151515151226262262\\r\\n1115151555151266262262\\r\\n1115551111155662266662\\r\\n1111111111111222222222',
  // snale:
  //   '1111111111111222222222\\r\\n1111155555116666622222\\r\\n1111151115116222622222\\r\\n1111151115116222622222\\r\\n1111151115116222622222\\r\\n3511151115126222622264\\r\\n1511151115126222622262\\r\\n1511151115126222622262\\r\\n1511151115126222622262\\r\\n1511151115566222622262\\r\\n1511151111222222622262\\r\\n1555551112222222666662\\r\\n1111111122222222222222',
  // straight:
  //   '1111111111111222222222\\r\\n1155511111155662266622\\r\\n1151511555151262262962\\r\\n1551515515151266262262\\r\\n1511555115551226662262\\r\\n1511111111111222222262\\r\\n3555555555555666666664\\r\\n1511111111111222222262\\r\\n1511555115551226662262\\r\\n1551515515151266262262\\r\\n1151511555151262262962\\r\\n1155511111155662266622\\r\\n1111111111111222222222',
  // wavy: '1111111111111222222222\\r\\n1115551115551226662222\\r\\n1555155515151226266662\\r\\n1511111555155666222262\\r\\n1555111111111222222262\\r\\n1515111555111222666262\\r\\n3515155515155662626664\\r\\n1515151115151262622262\\r\\n1515551115551262626662\\r\\n1511111111111266626222\\r\\n1551155551555222226222\\r\\n1155551155515666666222\\r\\n1111111111111222222222',
  // fork: '1111111111111222222222\\r\\n1555555555555666666662\\r\\n1511111111111222222262\\r\\n1555555555555666666662\\r\\n1151111111111222222622\\r\\n1555555555555666666662\\r\\n3511111111111222222264\\r\\n1555555555555666666662\\r\\n1151111111111222222622\\r\\n1555555555555666666662\\r\\n1511111111111222222262\\r\\n1555555555555666666662\\r\\n1111111111111222222222',
  // islands:
  //   '7777777777777888888888\\r\\n7555557887555566666668\\r\\n7511758228571112222268\\r\\n7511768228671556666668\\r\\n7511768228671512222228\\r\\n3517866666687555666668\\r\\n7717822222287111222264\\r\\n3517866666687555666668\\r\\n7511768228671512222228\\r\\n7511768228671556666668\\r\\n7511758228571112222268\\r\\n7555557887555566666668\\r\\n7777777777777888888888',
  line: '1111111111111222222222\\r\\n1111111111111222222222\\r\\n1111111111111222222222\\r\\n1111111111111222222222\\r\\n1111111111111222222222\\r\\n1111111111111222222222\\r\\n3555555555555666666664\\r\\n1111111111111222222222\\r\\n1111111111111222222222\\r\\n1111111111111222222222\\r\\n1111111111111222222222\\r\\n1111111111111222222222\\r\\n1111111111111222222222',
  jungle:
    '1111111111111222222222\\r\\n1555155515551266626662\\r\\n1515151515151262626262\\r\\n1515551555155662666262\\r\\n1511111111111222222262\\r\\n1511111555111266622262\\r\\n3555511515551262626664\\r\\n1511515511151262666262\\r\\n1511555111155662222262\\r\\n1511111155511222666262\\r\\n1515555151511266626262\\r\\n1555115551555662226662\\r\\n1111111111111222222222',
};

const defaultConfigUnparsed =
  'gs10;bh25;gd100;ga100;md300;ma260;rv25;rc25;rp50;hb5;sb10;at;1;p50;h12;c21;d15;r2;2;p25;h15;c16;d18;r3;3;p25;h18;c16;d20;r4;pt;1;p50;h50;c12;d2;r4;2;p25;h65;c9;d3;r5;3;p25;h80;c8;d4;r6;st;1;p50;h50;c20;d3;r2;2;p25;h65;c26;d4;r3;3;p25;h80;c26;d5;r4;gc;1;p70;h15;r20;c10;d1;br3;bc1;s4;2;p35;h18;r16;c13;d1;br3;bc1;s6;3;p35;h20;r12;c16;d1;br3;bc1;s8;jc;1;p70;h2;r16;c13;d1;br3;bc1;s18;2;p35;h3;r16;c17;d2;br3;bc1;s22;3;p35;h4;r16;c20;d3;br2;bc30;s26;mc;1;p60;h6;r18;c7;d1;br1;bc5;s8;ac60;ar2;2;p40;h8;r16;c10;d2;br1;bc5;s10;ac60;ar1;3;p40;h10;r16;c13;d2;br3;bc30;s12;ac50;ar2';

export default function () {
  const [config, setConfig] = useState(baseConfig);
  const [mapName, setMapName] = useState('line');
  const [map, setMap] = useState(maps.line);
  const [configKey, setConfigKey] = useState('');
  const configEndpoint = 'https://td-backend-testnet-c1.paimastudios.com/user_configs';
  const creator = '0xf91266532e0559dd2e2a13d2b486edff09e3d3c3';
  const rng = new Prando('hai');
  const dummyState = generateMatchState('defender', '0x1', '0x2', mapName, map, config, rng);
  const [matchState, setMatchState] = useState(dummyState);
  const [matchStates, setMatchStates] = useState([dummyState]);

  useEffect(() => {
    parseLoadConfig({ content: defaultConfigUnparsed });
  }, []);

  async function submit() {
    console.log(config, 'config');
    const l = await mw.userWalletLogin('metamask');
    console.log(l, 'l');
    const r = await mw.registerConfig(config);
    console.log(r, 'r');
  }

  async function simulate() {
    console.log('Simulating...');
    const newMatchStates = [];

    const balancing = new Balancing(matchState, GamePlan.OneVSOne_All);
    const allMoves = balancing.getAllTowerActions();

    for (const moves of Object.values(allMoves)) {
      let running = true;
      let tick = 1;

      const updatedState = generateMatchState('defender', '0x1', '0x2', mapName, map, config, rng);
      const state = { ...updatedState, currentRound: 1 };
      while (running) {
        processTick(config, state, moves, tick, rng);
        tick++;
        if (state.currentRound === 3 && state.roundEnded == true) {
          running = false;
        }
      }
      newMatchStates.push(state);
      console.log(`State after simulation for moves ${moves}:`, state);
    }

    setMatchStates(newMatchStates);
    // TODO: remove the below line once the UI is updated to display multiple simulation results.
    setMatchState(newMatchStates[0]); // Update the matchState with the first simulation result.
  }

  async function logCurrentConfig() {
    console.log('Logging current config...');
    const configString = configToConcise(config);
    console.log(configString);
  }

  async function getLatest() {
    const response = await fetch(configEndpoint + '?' + new URLSearchParams({ creator }));
    const responseHashMap = await response.json();
    const configs: [any] = responseHashMap.configs;
    const latestConfig = configs[configs.length - 1];
    setConfigKey(latestConfig.id);
  }

  function parseLoadConfig(configObj: any) {
    const content = configObj.content;
    const parsedConfig = parseConfig(content);
    setConfig(parsedConfig);
  }

  async function updateConfig() {
    const response = await fetch(configEndpoint + '?' + new URLSearchParams({ creator }));
    const responseHashMap = await response.json();
    const configObj = responseHashMap.configs.find((config: any) => config.id === configKey);

    if (configObj) {
      parseLoadConfig(configObj);
    } else {
      console.error('Config not found for the given config key');
    }
  }

  return (
    <div id="config-creator">
      <h2>Configuration</h2>
      <div className="update-config">
        <input
          type="text"
          value={configKey}
          onChange={e => setConfigKey(e.target.value)}
          placeholder="Enter config key"
        />
        <button onClick={updateConfig}>Update UI</button>
        <button onClick={getLatest}>Get Latest</button>
      </div>
      <div className="separation-line"></div>
      <GeneralConfig config={config} setConfig={setConfig} />
      <div className="small-separation-line"></div>
      <div className="tower">
        <h1>Anaconda Tower Specs</h1>
        <div className="columns">
          <div className="tier">
            <h3>Base Specs</h3>
            <div className="input">
              <span>Price</span>
              <input
                type="number"
                value={config.anacondaTower[1].price}
                onChange={e =>
                  setConfig({
                    ...config,
                    anacondaTower: {
                      ...config.anacondaTower,
                      1: {
                        ...config.anacondaTower[1],
                        price: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Health</span>
              <input
                type="number"
                value={config.anacondaTower[1].health}
                onChange={e =>
                  setConfig({
                    ...config,
                    anacondaTower: {
                      ...config.anacondaTower,
                      1: {
                        ...config.anacondaTower[1],
                        health: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>
                Attack Cooldown ({(1 / config.baseSpeed) * config.anacondaTower[1].cooldown}[s])
              </span>
              <input
                type="number"
                value={config.anacondaTower[1].cooldown}
                onChange={e =>
                  setConfig({
                    ...config,
                    anacondaTower: {
                      ...config.anacondaTower,
                      1: {
                        ...config.anacondaTower[1],
                        cooldown: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Attack Damage</span>
              <input
                type="number"
                value={config.anacondaTower[1].damage}
                onChange={e =>
                  setConfig({
                    ...config,
                    anacondaTower: {
                      ...config.anacondaTower,
                      1: {
                        ...config.anacondaTower[1],
                        damage: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Attack Range</span>
              <input
                type="number"
                value={config.anacondaTower[1].range}
                onChange={e =>
                  setConfig({
                    ...config,
                    anacondaTower: {
                      ...config.anacondaTower,
                      1: {
                        ...config.anacondaTower[1],
                        range: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
          </div>
          <div className="tier">
            <h3>Level 2</h3>
            <div className="input">
              <span>Price</span>
              <input
                type="number"
                value={config.anacondaTower[2].price}
                onChange={e =>
                  setConfig({
                    ...config,
                    anacondaTower: {
                      ...config.anacondaTower,
                      2: {
                        ...config.anacondaTower[2],
                        price: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Health</span>
              <input
                type="number"
                value={config.anacondaTower[2].health}
                onChange={e =>
                  setConfig({
                    ...config,
                    anacondaTower: {
                      ...config.anacondaTower,
                      2: {
                        ...config.anacondaTower[2],
                        health: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Attack Cooldown</span>
              <input
                type="number"
                value={config.anacondaTower[2].cooldown}
                onChange={e =>
                  setConfig({
                    ...config,
                    anacondaTower: {
                      ...config.anacondaTower,
                      2: {
                        ...config.anacondaTower[2],
                        cooldown: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Attack Damage</span>
              <input
                type="number"
                value={config.anacondaTower[2].damage}
                onChange={e =>
                  setConfig({
                    ...config,
                    anacondaTower: {
                      ...config.anacondaTower,
                      2: {
                        ...config.anacondaTower[2],
                        damage: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Attack Range</span>
              <input
                type="number"
                value={config.anacondaTower[2].range}
                onChange={e =>
                  setConfig({
                    ...config,
                    anacondaTower: {
                      ...config.anacondaTower,
                      2: {
                        ...config.anacondaTower[2],
                        range: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
          </div>
          <div className="tier">
            <h3>Level 3</h3>
            <div className="input">
              <span>Price</span>
              <input
                type="number"
                value={config.anacondaTower[3].price}
                onChange={e =>
                  setConfig({
                    ...config,
                    anacondaTower: {
                      ...config.anacondaTower,
                      3: {
                        ...config.anacondaTower[3],
                        price: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Health</span>
              <input
                type="number"
                value={config.anacondaTower[3].health}
                onChange={e =>
                  setConfig({
                    ...config,
                    anacondaTower: {
                      ...config.anacondaTower,
                      3: {
                        ...config.anacondaTower[3],
                        health: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Attack Cooldown</span>
              <input
                type="number"
                value={config.anacondaTower[3].cooldown}
                onChange={e =>
                  setConfig({
                    ...config,
                    anacondaTower: {
                      ...config.anacondaTower,
                      3: {
                        ...config.anacondaTower[3],
                        cooldown: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Attack Damage</span>
              <input
                type="number"
                value={config.anacondaTower[3].damage}
                onChange={e =>
                  setConfig({
                    ...config,
                    anacondaTower: {
                      ...config.anacondaTower,
                      3: {
                        ...config.anacondaTower[3],
                        damage: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Attack Range</span>
              <input
                type="number"
                value={config.anacondaTower[3].range}
                onChange={e =>
                  setConfig({
                    ...config,
                    anacondaTower: {
                      ...config.anacondaTower,
                      3: {
                        ...config.anacondaTower[3],
                        range: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>
      <div className="small-separation-line"></div>
      <div className="tower">
        <h1>Piranha Tower Specs</h1>
        <div className="columns">
          <div className="tier">
            <h3>Base Specs</h3>
            <div className="input">
              <span>Price</span>
              <input
                type="number"
                value={config.piranhaTower[1].price}
                onChange={e =>
                  setConfig({
                    ...config,
                    piranhaTower: {
                      ...config.piranhaTower,
                      1: {
                        ...config.piranhaTower[1],
                        price: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Health</span>
              <input
                type="number"
                value={config.piranhaTower[1].health}
                onChange={e =>
                  setConfig({
                    ...config,
                    piranhaTower: {
                      ...config.piranhaTower,
                      1: {
                        ...config.piranhaTower[1],
                        health: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Attack Cooldown</span>
              <input
                type="number"
                value={config.piranhaTower[1].cooldown}
                onChange={e =>
                  setConfig({
                    ...config,
                    piranhaTower: {
                      ...config.piranhaTower,
                      1: {
                        ...config.piranhaTower[1],
                        cooldown: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Attack Damage</span>
              <input
                type="number"
                value={config.piranhaTower[1].damage}
                onChange={e =>
                  setConfig({
                    ...config,
                    piranhaTower: {
                      ...config.piranhaTower,
                      1: {
                        ...config.piranhaTower[1],
                        damage: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Attack Range</span>
              <input
                type="number"
                value={config.piranhaTower[1].range}
                onChange={e =>
                  setConfig({
                    ...config,
                    piranhaTower: {
                      ...config.piranhaTower,
                      1: {
                        ...config.piranhaTower[1],
                        range: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
          </div>
          <div className="tier">
            <h3>Level 2</h3>
            <div className="input">
              <span>Price</span>
              <input
                type="number"
                value={config.piranhaTower[2].price}
                onChange={e =>
                  setConfig({
                    ...config,
                    piranhaTower: {
                      ...config.piranhaTower,
                      2: {
                        ...config.piranhaTower[2],
                        price: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Health</span>
              <input
                type="number"
                value={config.piranhaTower[2].health}
                onChange={e =>
                  setConfig({
                    ...config,
                    piranhaTower: {
                      ...config.piranhaTower,
                      2: {
                        ...config.piranhaTower[2],
                        health: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Attack Cooldown</span>
              <input
                type="number"
                value={config.piranhaTower[2].cooldown}
                onChange={e =>
                  setConfig({
                    ...config,
                    piranhaTower: {
                      ...config.piranhaTower,
                      2: {
                        ...config.piranhaTower[2],
                        cooldown: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Attack Damage</span>
              <input
                type="number"
                value={config.piranhaTower[2].damage}
                onChange={e =>
                  setConfig({
                    ...config,
                    piranhaTower: {
                      ...config.piranhaTower,
                      2: {
                        ...config.piranhaTower[2],
                        damage: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Attack Range</span>
              <input
                type="number"
                value={config.piranhaTower[2].range}
                onChange={e =>
                  setConfig({
                    ...config,
                    piranhaTower: {
                      ...config.piranhaTower,
                      2: {
                        ...config.piranhaTower[2],
                        range: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
          </div>
          <div className="tier">
            <h3>Level 3</h3>
            <div className="input">
              <span>Price</span>
              <input
                type="number"
                value={config.piranhaTower[3].price}
                onChange={e =>
                  setConfig({
                    ...config,
                    piranhaTower: {
                      ...config.piranhaTower,
                      3: {
                        ...config.piranhaTower[3],
                        price: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Health</span>
              <input
                type="number"
                value={config.piranhaTower[3].health}
                onChange={e =>
                  setConfig({
                    ...config,
                    piranhaTower: {
                      ...config.piranhaTower,
                      3: {
                        ...config.piranhaTower[3],
                        health: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Attack Cooldown</span>
              <input
                type="number"
                value={config.piranhaTower[3].cooldown}
                onChange={e =>
                  setConfig({
                    ...config,
                    piranhaTower: {
                      ...config.piranhaTower,
                      3: {
                        ...config.piranhaTower[3],
                        cooldown: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Attack Damage</span>
              <input
                type="number"
                value={config.piranhaTower[3].damage}
                onChange={e =>
                  setConfig({
                    ...config,
                    piranhaTower: {
                      ...config.piranhaTower,
                      3: {
                        ...config.piranhaTower[3],
                        damage: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Attack Range</span>
              <input
                type="number"
                value={config.piranhaTower[3].range}
                onChange={e =>
                  setConfig({
                    ...config,
                    piranhaTower: {
                      ...config.piranhaTower,
                      3: {
                        ...config.piranhaTower[3],
                        range: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>
      <div className="small-separation-line"></div>
      <div className="tower">
        <h1>Sloth Tower Specs</h1>
        <div className="columns">
          <div className="tier">
            <h3>Base Specs</h3>
            <div className="input">
              <span>Price</span>
              <input
                type="number"
                value={config.slothTower[1].price}
                onChange={e =>
                  setConfig({
                    ...config,
                    slothTower: {
                      ...config.slothTower,
                      1: {
                        ...config.slothTower[1],
                        price: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Health</span>
              <input
                type="number"
                value={config.slothTower[1].health}
                onChange={e =>
                  setConfig({
                    ...config,
                    slothTower: {
                      ...config.slothTower,
                      1: {
                        ...config.slothTower[1],
                        health: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Attack Cooldown</span>
              <input
                type="number"
                value={config.slothTower[1].cooldown}
                onChange={e =>
                  setConfig({
                    ...config,
                    slothTower: {
                      ...config.slothTower,
                      1: {
                        ...config.slothTower[1],
                        cooldown: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Attack Damage</span>
              <input
                type="number"
                value={config.slothTower[1].damage}
                onChange={e =>
                  setConfig({
                    ...config,
                    slothTower: {
                      ...config.slothTower,
                      1: {
                        ...config.slothTower[1],
                        damage: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Attack Range</span>
              <input
                type="number"
                value={config.slothTower[1].range}
                onChange={e =>
                  setConfig({
                    ...config,
                    slothTower: {
                      ...config.slothTower,
                      1: {
                        ...config.slothTower[1],
                        range: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
          </div>
          <div className="tier">
            <h3>Level 2</h3>
            <div className="input">
              <span>Price</span>
              <input
                type="number"
                value={config.slothTower[2].price}
                onChange={e =>
                  setConfig({
                    ...config,
                    slothTower: {
                      ...config.slothTower,
                      2: {
                        ...config.slothTower[2],
                        price: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Health</span>
              <input
                type="number"
                value={config.slothTower[2].health}
                onChange={e =>
                  setConfig({
                    ...config,
                    slothTower: {
                      ...config.slothTower,
                      2: {
                        ...config.slothTower[2],
                        health: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Attack Cooldown</span>
              <input
                type="number"
                value={config.slothTower[2].cooldown}
                onChange={e =>
                  setConfig({
                    ...config,
                    slothTower: {
                      ...config.slothTower,
                      2: {
                        ...config.slothTower[2],
                        cooldown: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Attack Damage</span>
              <input
                type="number"
                value={config.slothTower[2].damage}
                onChange={e =>
                  setConfig({
                    ...config,
                    slothTower: {
                      ...config.slothTower,
                      2: {
                        ...config.slothTower[2],
                        damage: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Attack Range</span>
              <input
                type="number"
                value={config.slothTower[2].range}
                onChange={e =>
                  setConfig({
                    ...config,
                    slothTower: {
                      ...config.slothTower,
                      2: {
                        ...config.slothTower[2],
                        range: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
          </div>
          <div className="tier">
            <h3>Level 3</h3>
            <div className="input">
              <span>Price</span>
              <input
                type="number"
                value={config.slothTower[3].price}
                onChange={e =>
                  setConfig({
                    ...config,
                    slothTower: {
                      ...config.slothTower,
                      3: {
                        ...config.slothTower[3],
                        price: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Health</span>
              <input
                type="number"
                value={config.slothTower[3].health}
                onChange={e =>
                  setConfig({
                    ...config,
                    slothTower: {
                      ...config.slothTower,
                      3: {
                        ...config.slothTower[3],
                        health: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Attack Cooldown</span>
              <input
                type="number"
                value={config.slothTower[3].cooldown}
                onChange={e =>
                  setConfig({
                    ...config,
                    slothTower: {
                      ...config.slothTower,
                      3: {
                        ...config.slothTower[3],
                        cooldown: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Attack Damage</span>
              <input
                type="number"
                value={config.slothTower[3].damage}
                onChange={e =>
                  setConfig({
                    ...config,
                    slothTower: {
                      ...config.slothTower,
                      3: {
                        ...config.slothTower[3],
                        damage: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Attack Range</span>
              <input
                type="number"
                value={config.slothTower[3].range}
                onChange={e =>
                  setConfig({
                    ...config,
                    slothTower: {
                      ...config.slothTower,
                      3: {
                        ...config.slothTower[3],
                        range: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>
      <div className="small-separation-line"></div>
      <div className="crypt">
        <h1>Gorilla Tower Specs</h1>
        <div className="columns">
          <div className="tier">
            <h3>Base Specs</h3>
            <div className="input">
              <span>Price</span>
              <input
                type="number"
                value={config.gorillaCrypt[1].price}
                onChange={e =>
                  setConfig({
                    ...config,
                    gorillaCrypt: {
                      ...config.gorillaCrypt,
                      1: {
                        ...config.gorillaCrypt[1],
                        price: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Unit Health</span>
              <input
                type="number"
                value={config.gorillaCrypt[1].unitHealth}
                onChange={e =>
                  setConfig({
                    ...config,
                    gorillaCrypt: {
                      ...config.gorillaCrypt,
                      1: {
                        ...config.gorillaCrypt[1],
                        unitHealth: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Spawn Cooldown</span>
              <input
                type="number"
                value={config.gorillaCrypt[1].spawnRate}
                onChange={e =>
                  setConfig({
                    ...config,
                    gorillaCrypt: {
                      ...config.gorillaCrypt,
                      1: {
                        ...config.gorillaCrypt[1],
                        spawnRate: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Spawn Capacity</span>
              <input
                type="number"
                value={config.gorillaCrypt[1].spawnCapacity}
                onChange={e =>
                  setConfig({
                    ...config,
                    gorillaCrypt: {
                      ...config.gorillaCrypt,
                      1: {
                        ...config.gorillaCrypt[1],
                        spawnCapacity: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Attack Damage</span>
              <input
                type="number"
                value={config.gorillaCrypt[1].attackDamage}
                onChange={e =>
                  setConfig({
                    ...config,
                    gorillaCrypt: {
                      ...config.gorillaCrypt,
                      1: {
                        ...config.gorillaCrypt[1],
                        attackDamage: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Unit Speed</span>
              <input
                type="number"
                value={config.gorillaCrypt[1].unitSpeed}
                onChange={e =>
                  setConfig({
                    ...config,
                    gorillaCrypt: {
                      ...config.gorillaCrypt,
                      1: {
                        ...config.gorillaCrypt[1],
                        unitSpeed: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>
                <del>Buff Range</del>
              </span>
              <input
                type="number"
                value={config.gorillaCrypt[1].buffRange}
                onChange={e =>
                  setConfig({
                    ...config,
                    gorillaCrypt: {
                      ...config.gorillaCrypt,
                      1: {
                        ...config.gorillaCrypt[1],
                        buffRange: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>
                <del>Buff Cooldown</del>
              </span>
              <input
                type="number"
                value={config.gorillaCrypt[1].buffCooldown}
                onChange={e =>
                  setConfig({
                    ...config,
                    gorillaCrypt: {
                      ...config.gorillaCrypt,
                      1: {
                        ...config.gorillaCrypt[1],
                        buffCooldown: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
          </div>
          <div className="tier">
            <h3>Level 2</h3>
            <div className="input">
              <span>Price</span>
              <input
                type="number"
                value={config.gorillaCrypt[2].price}
                onChange={e =>
                  setConfig({
                    ...config,
                    gorillaCrypt: {
                      ...config.gorillaCrypt,
                      2: {
                        ...config.gorillaCrypt[2],
                        price: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Unit Health</span>
              <input
                type="number"
                value={config.gorillaCrypt[2].unitHealth}
                onChange={e =>
                  setConfig({
                    ...config,
                    gorillaCrypt: {
                      ...config.gorillaCrypt,
                      2: {
                        ...config.gorillaCrypt[2],
                        unitHealth: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Spawn Cooldown</span>
              <input
                type="number"
                value={config.gorillaCrypt[2].spawnRate}
                onChange={e =>
                  setConfig({
                    ...config,
                    gorillaCrypt: {
                      ...config.gorillaCrypt,
                      2: {
                        ...config.gorillaCrypt[2],
                        spawnRate: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Spawn Capacity</span>
              <input
                type="number"
                value={config.gorillaCrypt[2].spawnCapacity}
                onChange={e =>
                  setConfig({
                    ...config,
                    gorillaCrypt: {
                      ...config.gorillaCrypt,
                      2: {
                        ...config.gorillaCrypt[2],
                        spawnCapacity: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Attack Damage</span>
              <input
                type="number"
                value={config.gorillaCrypt[2].attackDamage}
                onChange={e =>
                  setConfig({
                    ...config,
                    gorillaCrypt: {
                      ...config.gorillaCrypt,
                      2: {
                        ...config.gorillaCrypt[2],
                        attackDamage: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Unit Speed</span>
              <input
                type="number"
                value={config.gorillaCrypt[2].unitSpeed}
                onChange={e =>
                  setConfig({
                    ...config,
                    gorillaCrypt: {
                      ...config.gorillaCrypt,
                      2: {
                        ...config.gorillaCrypt[2],
                        unitSpeed: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>
                <del>Buff Range</del>
              </span>
              <input
                type="number"
                value={config.gorillaCrypt[2].buffRange}
                onChange={e =>
                  setConfig({
                    ...config,
                    gorillaCrypt: {
                      ...config.gorillaCrypt,
                      2: {
                        ...config.gorillaCrypt[2],
                        buffRange: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>
                <del>Buff Cooldown</del>
              </span>
              <input
                type="number"
                value={config.gorillaCrypt[2].buffCooldown}
                onChange={e =>
                  setConfig({
                    ...config,
                    gorillaCrypt: {
                      ...config.gorillaCrypt,
                      2: {
                        ...config.gorillaCrypt[2],
                        buffCooldown: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
          </div>
          <div className="tier">
            <h3>Level 3</h3>
            <div className="input">
              <span>Price</span>
              <input
                type="number"
                value={config.gorillaCrypt[3].price}
                onChange={e =>
                  setConfig({
                    ...config,
                    gorillaCrypt: {
                      ...config.gorillaCrypt,
                      3: {
                        ...config.gorillaCrypt[3],
                        price: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Unit Health</span>
              <input
                type="number"
                value={config.gorillaCrypt[3].unitHealth}
                onChange={e =>
                  setConfig({
                    ...config,
                    gorillaCrypt: {
                      ...config.gorillaCrypt,
                      3: {
                        ...config.gorillaCrypt[3],
                        unitHealth: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Spawn Cooldown</span>
              <input
                type="number"
                value={config.gorillaCrypt[3].spawnRate}
                onChange={e =>
                  setConfig({
                    ...config,
                    gorillaCrypt: {
                      ...config.gorillaCrypt,
                      3: {
                        ...config.gorillaCrypt[3],
                        spawnRate: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Spawn Capacity</span>
              <input
                type="number"
                value={config.gorillaCrypt[3].spawnCapacity}
                onChange={e =>
                  setConfig({
                    ...config,
                    gorillaCrypt: {
                      ...config.gorillaCrypt,
                      3: {
                        ...config.gorillaCrypt[3],
                        spawnCapacity: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Attack Damage</span>
              <input
                type="number"
                value={config.gorillaCrypt[3].attackDamage}
                onChange={e =>
                  setConfig({
                    ...config,
                    gorillaCrypt: {
                      ...config.gorillaCrypt,
                      3: {
                        ...config.gorillaCrypt[3],
                        attackDamage: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Unit Speed</span>
              <input
                type="number"
                value={config.gorillaCrypt[3].unitSpeed}
                onChange={e =>
                  setConfig({
                    ...config,
                    gorillaCrypt: {
                      ...config.gorillaCrypt,
                      3: {
                        ...config.gorillaCrypt[3],
                        unitSpeed: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>
                <del>Buff Range</del>
              </span>
              <input
                type="number"
                value={config.gorillaCrypt[3].buffRange}
                onChange={e =>
                  setConfig({
                    ...config,
                    gorillaCrypt: {
                      ...config.gorillaCrypt,
                      3: {
                        ...config.gorillaCrypt[3],
                        buffRange: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>
                <del>Buff Cooldown</del>
              </span>
              <input
                type="number"
                value={config.gorillaCrypt[3].buffCooldown}
                onChange={e =>
                  setConfig({
                    ...config,
                    gorillaCrypt: {
                      ...config.gorillaCrypt,
                      3: {
                        ...config.gorillaCrypt[3],
                        buffCooldown: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>
      <div className="small-separation-line"></div>
      <div className="crypt">
        <h1>Jaguar Tower Specs</h1>
        <div className="columns">
          <div className="tier">
            <h3>Base Specs</h3>
            <div className="input">
              <span>Price</span>
              <input
                type="number"
                value={config.jaguarCrypt[1].price}
                onChange={e =>
                  setConfig({
                    ...config,
                    jaguarCrypt: {
                      ...config.jaguarCrypt,
                      1: {
                        ...config.jaguarCrypt[1],
                        price: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Unit Health</span>
              <input
                type="number"
                value={config.jaguarCrypt[1].unitHealth}
                onChange={e =>
                  setConfig({
                    ...config,
                    jaguarCrypt: {
                      ...config.jaguarCrypt,
                      1: {
                        ...config.jaguarCrypt[1],
                        unitHealth: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Spawn Cooldown</span>
              <input
                type="number"
                value={config.jaguarCrypt[1].spawnRate}
                onChange={e =>
                  setConfig({
                    ...config,
                    jaguarCrypt: {
                      ...config.jaguarCrypt,
                      1: {
                        ...config.jaguarCrypt[1],
                        spawnRate: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Spawn Capacity</span>
              <input
                type="number"
                value={config.jaguarCrypt[1].spawnCapacity}
                onChange={e =>
                  setConfig({
                    ...config,
                    jaguarCrypt: {
                      ...config.jaguarCrypt,
                      1: {
                        ...config.jaguarCrypt[1],
                        spawnCapacity: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Attack Damage</span>
              <input
                type="number"
                value={config.jaguarCrypt[1].attackDamage}
                onChange={e =>
                  setConfig({
                    ...config,
                    jaguarCrypt: {
                      ...config.jaguarCrypt,
                      1: {
                        ...config.jaguarCrypt[1],
                        attackDamage: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Unit Speed</span>
              <input
                type="number"
                value={config.jaguarCrypt[1].unitSpeed}
                onChange={e =>
                  setConfig({
                    ...config,
                    jaguarCrypt: {
                      ...config.jaguarCrypt,
                      1: {
                        ...config.jaguarCrypt[1],
                        unitSpeed: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>
                <del>Buff Range</del>
              </span>
              <input
                type="number"
                value={config.jaguarCrypt[1].buffRange}
                onChange={e =>
                  setConfig({
                    ...config,
                    jaguarCrypt: {
                      ...config.jaguarCrypt,
                      1: {
                        ...config.jaguarCrypt[1],
                        buffRange: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>
                <del>Buff Cooldown</del>
              </span>
              <input
                type="number"
                value={config.jaguarCrypt[1].buffCooldown}
                onChange={e =>
                  setConfig({
                    ...config,
                    jaguarCrypt: {
                      ...config.jaguarCrypt,
                      1: {
                        ...config.jaguarCrypt[1],
                        buffCooldown: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
          </div>
          <div className="tier">
            <h3>Level 2</h3>
            <div className="input">
              <span>Price</span>
              <input
                type="number"
                value={config.jaguarCrypt[2].price}
                onChange={e =>
                  setConfig({
                    ...config,
                    jaguarCrypt: {
                      ...config.jaguarCrypt,
                      2: {
                        ...config.jaguarCrypt[2],
                        price: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Unit Health</span>
              <input
                type="number"
                value={config.jaguarCrypt[2].unitHealth}
                onChange={e =>
                  setConfig({
                    ...config,
                    jaguarCrypt: {
                      ...config.jaguarCrypt,
                      2: {
                        ...config.jaguarCrypt[2],
                        unitHealth: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Spawn Cooldown</span>
              <input
                type="number"
                value={config.jaguarCrypt[2].spawnRate}
                onChange={e =>
                  setConfig({
                    ...config,
                    jaguarCrypt: {
                      ...config.jaguarCrypt,
                      2: {
                        ...config.jaguarCrypt[2],
                        spawnRate: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Spawn Capacity</span>
              <input
                type="number"
                value={config.jaguarCrypt[2].spawnCapacity}
                onChange={e =>
                  setConfig({
                    ...config,
                    jaguarCrypt: {
                      ...config.jaguarCrypt,
                      2: {
                        ...config.jaguarCrypt[2],
                        spawnCapacity: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Attack Damage</span>
              <input
                type="number"
                value={config.jaguarCrypt[2].attackDamage}
                onChange={e =>
                  setConfig({
                    ...config,
                    jaguarCrypt: {
                      ...config.jaguarCrypt,
                      2: {
                        ...config.jaguarCrypt[2],
                        attackDamage: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Unit Speed</span>
              <input
                type="number"
                value={config.jaguarCrypt[2].unitSpeed}
                onChange={e =>
                  setConfig({
                    ...config,
                    jaguarCrypt: {
                      ...config.jaguarCrypt,
                      2: {
                        ...config.jaguarCrypt[2],
                        unitSpeed: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>
                <del>Buff Range</del>
              </span>
              <input
                type="number"
                value={config.jaguarCrypt[2].buffRange}
                onChange={e =>
                  setConfig({
                    ...config,
                    jaguarCrypt: {
                      ...config.jaguarCrypt,
                      2: {
                        ...config.jaguarCrypt[2],
                        buffRange: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>
                <del>Buff Cooldown</del>
              </span>
              <input
                type="number"
                value={config.jaguarCrypt[2].buffCooldown}
                onChange={e =>
                  setConfig({
                    ...config,
                    jaguarCrypt: {
                      ...config.jaguarCrypt,
                      2: {
                        ...config.jaguarCrypt[2],
                        buffCooldown: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
          </div>
          <div className="tier">
            <h3>Level 3</h3>
            <div className="input">
              <span>Price</span>
              <input
                type="number"
                value={config.jaguarCrypt[3].price}
                onChange={e =>
                  setConfig({
                    ...config,
                    jaguarCrypt: {
                      ...config.jaguarCrypt,
                      3: {
                        ...config.jaguarCrypt[3],
                        price: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Unit Health</span>
              <input
                type="number"
                value={config.jaguarCrypt[3].unitHealth}
                onChange={e =>
                  setConfig({
                    ...config,
                    jaguarCrypt: {
                      ...config.jaguarCrypt,
                      3: {
                        ...config.jaguarCrypt[3],
                        unitHealth: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Spawn Cooldown</span>
              <input
                type="number"
                value={config.jaguarCrypt[3].spawnRate}
                onChange={e =>
                  setConfig({
                    ...config,
                    jaguarCrypt: {
                      ...config.jaguarCrypt,
                      3: {
                        ...config.jaguarCrypt[3],
                        spawnRate: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Spawn Capacity</span>
              <input
                type="number"
                value={config.jaguarCrypt[3].spawnCapacity}
                onChange={e =>
                  setConfig({
                    ...config,
                    jaguarCrypt: {
                      ...config.jaguarCrypt,
                      3: {
                        ...config.jaguarCrypt[3],
                        spawnCapacity: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Attack Damage</span>
              <input
                type="number"
                value={config.jaguarCrypt[3].attackDamage}
                onChange={e =>
                  setConfig({
                    ...config,
                    jaguarCrypt: {
                      ...config.jaguarCrypt,
                      3: {
                        ...config.jaguarCrypt[3],
                        attackDamage: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Unit Speed</span>
              <input
                type="number"
                value={config.jaguarCrypt[3].unitSpeed}
                onChange={e =>
                  setConfig({
                    ...config,
                    jaguarCrypt: {
                      ...config.jaguarCrypt,
                      3: {
                        ...config.jaguarCrypt[3],
                        unitSpeed: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>
                <del>Buff Range</del>
              </span>
              <input
                type="number"
                value={config.jaguarCrypt[3].buffRange}
                onChange={e =>
                  setConfig({
                    ...config,
                    jaguarCrypt: {
                      ...config.jaguarCrypt,
                      3: {
                        ...config.jaguarCrypt[3],
                        buffRange: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>
                <del>Buff Cooldown</del>
              </span>
              <input
                type="number"
                value={config.jaguarCrypt[3].buffCooldown}
                onChange={e =>
                  setConfig({
                    ...config,
                    jaguarCrypt: {
                      ...config.jaguarCrypt,
                      3: {
                        ...config.jaguarCrypt[3],
                        buffCooldown: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>
      <div className="small-separation-line"></div>
      <div className="crypt">
        <h1>Macaw Tower Specs</h1>
        <div className="columns">
          <div className="tier">
            <h3>Base Specs</h3>
            <div className="input">
              <span>Price</span>
              <input
                type="number"
                value={config.macawCrypt[1].price}
                onChange={e =>
                  setConfig({
                    ...config,
                    macawCrypt: {
                      ...config.macawCrypt,
                      1: {
                        ...config.macawCrypt[1],
                        price: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Unit Health</span>
              <input
                type="number"
                value={config.macawCrypt[1].unitHealth}
                onChange={e =>
                  setConfig({
                    ...config,
                    macawCrypt: {
                      ...config.macawCrypt,
                      1: {
                        ...config.macawCrypt[1],
                        unitHealth: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Spawn Cooldown</span>
              <input
                type="number"
                value={config.macawCrypt[1].spawnRate}
                onChange={e =>
                  setConfig({
                    ...config,
                    macawCrypt: {
                      ...config.macawCrypt,
                      1: {
                        ...config.macawCrypt[1],
                        spawnRate: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Spawn Capacity</span>
              <input
                type="number"
                value={config.macawCrypt[1].spawnCapacity}
                onChange={e =>
                  setConfig({
                    ...config,
                    macawCrypt: {
                      ...config.macawCrypt,
                      1: {
                        ...config.macawCrypt[1],
                        spawnCapacity: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Attack Damage</span>
              <input
                type="number"
                value={config.macawCrypt[1].attackDamage}
                onChange={e =>
                  setConfig({
                    ...config,
                    macawCrypt: {
                      ...config.macawCrypt,
                      1: {
                        ...config.macawCrypt[1],
                        attackDamage: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Attack Cooldown</span>
              <input
                type="number"
                value={config.macawCrypt[1].attackCooldown}
                onChange={e =>
                  setConfig({
                    ...config,
                    macawCrypt: {
                      ...config.macawCrypt,
                      1: {
                        ...config.macawCrypt[1],
                        attackCooldown: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Unit Speed</span>
              <input
                type="number"
                value={config.macawCrypt[1].unitSpeed}
                onChange={e =>
                  setConfig({
                    ...config,
                    macawCrypt: {
                      ...config.macawCrypt,
                      1: {
                        ...config.macawCrypt[1],
                        unitSpeed: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>
                <del>Buff Range</del>
              </span>
              <input
                type="number"
                value={config.macawCrypt[1].buffRange}
                onChange={e =>
                  setConfig({
                    ...config,
                    macawCrypt: {
                      ...config.macawCrypt,
                      1: {
                        ...config.macawCrypt[1],
                        buffRange: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>
                <del>Buff Cooldown</del>
              </span>
              <input
                type="number"
                value={config.macawCrypt[1].buffCooldown}
                onChange={e =>
                  setConfig({
                    ...config,
                    macawCrypt: {
                      ...config.macawCrypt,
                      1: {
                        ...config.macawCrypt[1],
                        buffCooldown: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
          </div>
          <div className="tier">
            <h3>Level 2</h3>
            <div className="input">
              <span>Price</span>
              <input
                type="number"
                value={config.macawCrypt[2].price}
                onChange={e =>
                  setConfig({
                    ...config,
                    macawCrypt: {
                      ...config.macawCrypt,
                      2: {
                        ...config.macawCrypt[2],
                        price: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Unit Health</span>
              <input
                type="number"
                value={config.macawCrypt[2].unitHealth}
                onChange={e =>
                  setConfig({
                    ...config,
                    macawCrypt: {
                      ...config.macawCrypt,
                      2: {
                        ...config.macawCrypt[2],
                        unitHealth: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Spawn Cooldown</span>
              <input
                type="number"
                value={config.macawCrypt[2].spawnRate}
                onChange={e =>
                  setConfig({
                    ...config,
                    macawCrypt: {
                      ...config.macawCrypt,
                      2: {
                        ...config.macawCrypt[2],
                        spawnRate: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Spawn Capacity</span>
              <input
                type="number"
                value={config.macawCrypt[2].spawnCapacity}
                onChange={e =>
                  setConfig({
                    ...config,
                    macawCrypt: {
                      ...config.macawCrypt,
                      2: {
                        ...config.macawCrypt[2],
                        spawnCapacity: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Attack Damage</span>
              <input
                type="number"
                value={config.macawCrypt[2].attackDamage}
                onChange={e =>
                  setConfig({
                    ...config,
                    macawCrypt: {
                      ...config.macawCrypt,
                      2: {
                        ...config.macawCrypt[2],
                        attackDamage: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Attack Cooldown</span>
              <input
                type="number"
                value={config.macawCrypt[2].attackCooldown}
                onChange={e =>
                  setConfig({
                    ...config,
                    macawCrypt: {
                      ...config.macawCrypt,
                      2: {
                        ...config.macawCrypt[2],
                        attackCooldown: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Unit Speed</span>
              <input
                type="number"
                value={config.macawCrypt[2].unitSpeed}
                onChange={e =>
                  setConfig({
                    ...config,
                    macawCrypt: {
                      ...config.macawCrypt,
                      2: {
                        ...config.macawCrypt[2],
                        unitSpeed: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>
                <del>Buff Range</del>
              </span>
              <input
                type="number"
                value={config.macawCrypt[2].buffRange}
                onChange={e =>
                  setConfig({
                    ...config,
                    macawCrypt: {
                      ...config.macawCrypt,
                      2: {
                        ...config.macawCrypt[2],
                        buffRange: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>
                <del>Buff Cooldown</del>
              </span>
              <input
                type="number"
                value={config.macawCrypt[2].buffCooldown}
                onChange={e =>
                  setConfig({
                    ...config,
                    macawCrypt: {
                      ...config.macawCrypt,
                      2: {
                        ...config.macawCrypt[2],
                        buffCooldown: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
          </div>
          <div className="tier">
            <h3>Level 3</h3>
            <div className="input">
              <span>Price</span>
              <input
                type="number"
                value={config.macawCrypt[3].price}
                onChange={e =>
                  setConfig({
                    ...config,
                    macawCrypt: {
                      ...config.macawCrypt,
                      3: {
                        ...config.macawCrypt[3],
                        price: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Unit Health</span>
              <input
                type="number"
                value={config.macawCrypt[3].unitHealth}
                onChange={e =>
                  setConfig({
                    ...config,
                    macawCrypt: {
                      ...config.macawCrypt,
                      3: {
                        ...config.macawCrypt[3],
                        unitHealth: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Spawn Cooldown</span>
              <input
                type="number"
                value={config.macawCrypt[3].spawnRate}
                onChange={e =>
                  setConfig({
                    ...config,
                    macawCrypt: {
                      ...config.macawCrypt,
                      3: {
                        ...config.macawCrypt[3],
                        spawnRate: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Spawn Capacity</span>
              <input
                type="number"
                value={config.macawCrypt[3].spawnCapacity}
                onChange={e =>
                  setConfig({
                    ...config,
                    macawCrypt: {
                      ...config.macawCrypt,
                      3: {
                        ...config.macawCrypt[3],
                        spawnCapacity: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Attack Damage</span>
              <input
                type="number"
                value={config.macawCrypt[3].attackDamage}
                onChange={e =>
                  setConfig({
                    ...config,
                    macawCrypt: {
                      ...config.macawCrypt,
                      3: {
                        ...config.macawCrypt[3],
                        attackDamage: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Attack Cooldown</span>
              <input
                type="number"
                value={config.macawCrypt[3].attackCooldown}
                onChange={e =>
                  setConfig({
                    ...config,
                    macawCrypt: {
                      ...config.macawCrypt,
                      3: {
                        ...config.macawCrypt[3],
                        attackCooldown: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>Unit Speed</span>
              <input
                type="number"
                value={config.macawCrypt[3].unitSpeed}
                onChange={e =>
                  setConfig({
                    ...config,
                    macawCrypt: {
                      ...config.macawCrypt,
                      3: {
                        ...config.macawCrypt[3],
                        unitSpeed: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>
                <del>Buff Range</del>
              </span>
              <input
                type="number"
                value={config.macawCrypt[3].buffRange}
                onChange={e =>
                  setConfig({
                    ...config,
                    macawCrypt: {
                      ...config.macawCrypt,
                      3: {
                        ...config.macawCrypt[3],
                        buffRange: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
            <div className="input">
              <span>
                <del>Buff Cooldown</del>
              </span>
              <input
                type="number"
                value={config.macawCrypt[3].buffCooldown}
                onChange={e =>
                  setConfig({
                    ...config,
                    macawCrypt: {
                      ...config.macawCrypt,
                      3: {
                        ...config.macawCrypt[3],
                        buffCooldown: parseInt(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div className="send-button-container">
        <button className="simulate-button" onClick={simulate}>
          SIMULATE
        </button>
        <button className="log-button" onClick={logCurrentConfig}>
          LOG
        </button>
        <button className="send-button" onClick={submit}>
          SEND
        </button>
      </div>

      <div className="simulation-panel">
        <h2>Game Simulation</h2>
        <div className="input">
          <span>Map</span>
          <select
            name=""
            id=""
            onChange={e => {
              setMapName(e.target.value);
              setMap(maps[e.target.value]);
              console.log(maps[e.target.value], 'map');
            }}
          >
            {Object.keys(maps).map(map => (
              <option value={map} key={map}>
                {map}
              </option>
            ))}
          </select>
        </div>
        <div className="result">
          <Simulation data={matchStates} />
        </div>
      </div>
    </div>
  );
}
