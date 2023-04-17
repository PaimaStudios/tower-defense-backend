import { baseConfig, parseConfig } from '@tower-defense/game-logic';
import { useState } from 'react';
import mw from 'mw';
import './ConfigCreator.css';

export default function () {
  const [config, setConfig] = useState(baseConfig);
  const [configKey, setConfigKey] = useState('');
  const configEndpoint = 'https://td-backend-testnet-c1.paimastudios.com/user_configs';
  const creator = '0xf91266532e0559dd2e2a13d2b486edff09e3d3c3';

  console.log('baseConfig: ', config);

  async function submit() {
    console.log(config, 'config');
    const l = await mw.userWalletLogin('metamask');
    console.log(l, 'l');
    const r = await mw.registerConfig(config);
    console.log(r, 'r');
  }

  async function simulate() {
    console.log('Simulate');
  }

  async function getLatest() {
    const response = await fetch(configEndpoint + '?' + new URLSearchParams({ creator }));
    const responseHashMap = await response.json();
    const configs: [any] = responseHashMap.configs;
    // get the last element of the array
    const latestConfig = configs[configs.length - 1];
    // update config input field with the config id
    setConfigKey(latestConfig.id);
    // update the config object with the latest config
    // setConfig(latestConfig.content);
  }

  async function updateConfig() {
    const response = await fetch(configEndpoint + '?' + new URLSearchParams({ creator }));
    const responseHashMap = await response.json();
    console.log('responseHasmap: ', responseHashMap);
    // const updatedConfigValue = responseHashMap[configKey];

    const configObj = responseHashMap.configs.find((config: any) => config.id === configKey);
    console.log('config found: ', configObj);

    if (configObj) {
      const content = configObj.content;
      const parsedConfig = parseConfig(content);

      console.log('parsedConfig: ', parsedConfig);
      setConfig(parsedConfig);
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

      <div className="general">
        <div className="column">
          <div className="input">
            <span>Game Speed</span>
            <input
              type="number"
              value={config.baseSpeed}
              onChange={e => setConfig({ ...config, baseSpeed: parseInt(e.target.value) })}
            />
          </div>
          <div className="input">
            <span>Defender Base Health</span>
            <input
              type="number"
              value={config.defenderBaseHealth}
              onChange={e => setConfig({ ...config, defenderBaseHealth: parseInt(e.target.value) })}
            />
          </div>
          <div className="input">
            <span>Attacker Gold per turn</span>
            <input
              type="number"
              value={config.baseAttackerGoldRate}
              onChange={e =>
                setConfig({ ...config, baseAttackerGoldRate: parseInt(e.target.value) })
              }
            />
          </div>
          <div className="input">
            <span>Defender Gold per turn</span>
            <input
              type="number"
              value={config.baseDefenderGoldRate}
              onChange={e =>
                setConfig({ ...config, baseDefenderGoldRate: parseInt(e.target.value) })
              }
            />
          </div>
          <div className="input">
            <span>Cost of Repairing structures</span>
            <input
              type="number"
              value={config.repairCost}
              onChange={e => setConfig({ ...config, repairCost: parseInt(e.target.value) })}
            />
          </div>
        </div>
        <div className="column">
          <div className="input">
            <span>Tower health regained by repairing</span>
            <input
              type="number"
              value={config.towerRepairValue}
              onChange={e => setConfig({ ...config, towerRepairValue: parseInt(e.target.value) })}
            />
          </div>
          <div className="input">
            <span>Money recouped (in %) when salvaging structures</span>
            <input
              type="number"
              value={config.recoupPercentage}
              onChange={e => setConfig({ ...config, recoupPercentage: parseInt(e.target.value) })}
            />
          </div>
          <div className="input">
            <span>Health buff given by Upgraded Gorilla Crypts</span>
            <input
              type="number"
              value={config.healthBuffAmount}
              onChange={e => setConfig({ ...config, healthBuffAmount: parseInt(e.target.value) })}
            />
          </div>
          <div className="input">
            <span>Speed buff given by Upgraded Jaguar Crypts</span>
            <input
              type="number"
              value={config.speedBuffAmount}
              onChange={e => setConfig({ ...config, speedBuffAmount: parseInt(e.target.value) })}
            />
          </div>
        </div>
      </div>
      <div className="game-interpretation">
        <b>Game Interpretation:</b> 1 second = {config.baseSpeed} ticks
      </div>
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
              <span>Buff Range</span>
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
              <span>Buff Cooldown</span>
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
              <span>Buff Range</span>
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
              <span>Buff Cooldown</span>
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
              <span>Buff Range</span>
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
              <span>Buff Cooldown</span>
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
              <span>Buff Range</span>
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
              <span>Buff Cooldown</span>
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
              <span>Buff Range</span>
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
              <span>Buff Cooldown</span>
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
              <span>Buff Range</span>
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
              <span>Buff Cooldown</span>
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
              <span>Buff Range</span>
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
              <span>Buff Cooldown</span>
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
              <span>Buff Range</span>
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
              <span>Buff Cooldown</span>
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
                        ...config.macawCrypt[1],
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
              <span>Buff Range</span>
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
              <span>Buff Cooldown</span>
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
        <button className="send-button" onClick={submit}>
          SEND
        </button>
      </div>
    </div>
  );
}
