import { baseConfig } from '@tower-defense/game-logic';
import { useState } from 'react';
import mw from 'mw';
export default function () {
  const [config, setConfig] = useState(baseConfig);
  async function submit() {
    console.log(config, 'config');
    const l = await mw.userWalletLogin('metamask');
    console.log(l, 'l');
    const r = await mw.registerConfig(config);
    console.log(r, 'r');
  }

  return (
    <div id="config-creator">
      <button onClick={submit}>SEND</button>
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
          onChange={e => setConfig({ ...config, baseAttackerGoldRate: parseInt(e.target.value) })}
        />
      </div>
      <div className="input">
        <span>Defender Gold per turn</span>
        <input
          type="number"
          value={config.baseDefenderGoldRate}
          onChange={e => setConfig({ ...config, baseDefenderGoldRate: parseInt(e.target.value) })}
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
      <div className="input">
        <span>Tower health regained by repairing</span>
        <input
          type="number"
          value={config.towerRepairValue}
          onChange={e => setConfig({ ...config, towerRepairValue: parseInt(e.target.value) })}
        />
      </div>
      <div className="input">
        <span>Money recouped when salvaging structures</span>
        <input
          type="number"
          value={config.recoupAmount}
          onChange={e => setConfig({ ...config, recoupAmount: parseInt(e.target.value) })}
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
      <div className="tower">
        <h1>Anaconda Tower Specs</h1>
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
            <span>Attack Cooldown</span>
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
      <div className="tower">
        <h1>Piranha Tower Specs</h1>
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
      <div className="tower">
        <h1>Sloth Tower Specs</h1>
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
      <div className="crypt">
        <h1>Gorilla Tower Specs</h1>
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
      <div className="crypt">
        <h1>Jaguar Tower Specs</h1>
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
      <div className="crypt">
        <h1>Macaw Tower Specs</h1>
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
  );
}
