import type { MatchConfig } from '@tower-defense/utils';
import React from 'react';

interface Props {
  type: 'gorilla' | 'jaguar' | 'macaw';
  config: MatchConfig;
  setConfig: (config: MatchConfig) => void;
}

const CryptConfig: React.FC<Props> = ({ config, setConfig, type }) => {
  const key = `${type}Crypt` as 'gorillaCrypt' | 'jaguarCrypt' | 'macawCrypt';

  return (
    <div className="crypt">
      <h1>{`${type[0].toUpperCase()}${type.slice(1)}`} Crypt Specs</h1>
      <div className="columns">
        <div className="tier">
          <h3>Base Specs</h3>
          <div className="input">
            <span>Price</span>
            <input
              type="number"
              value={config[key][1].price}
              onChange={e =>
                setConfig({
                  ...config,
                  [key]: {
                    ...config[key],
                    1: {
                      ...config[key][1],
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
              value={config[key][1].unitHealth}
              onChange={e =>
                setConfig({
                  ...config,
                  [key]: {
                    ...config[key],
                    1: {
                      ...config[key][1],
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
              value={config[key][1].spawnRate}
              onChange={e =>
                setConfig({
                  ...config,
                  [key]: {
                    ...config[key],
                    1: {
                      ...config[key][1],
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
              value={config[key][1].spawnCapacity}
              onChange={e =>
                setConfig({
                  ...config,
                  [key]: {
                    ...config[key],
                    1: {
                      ...config[key][1],
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
              value={config[key][1].attackDamage}
              onChange={e =>
                setConfig({
                  ...config,
                  [key]: {
                    ...config[key],
                    1: {
                      ...config[key][1],
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
              value={config[key][1].unitSpeed}
              onChange={e =>
                setConfig({
                  ...config,
                  [key]: {
                    ...config[key],
                    1: {
                      ...config[key][1],
                      unitSpeed: parseInt(e.target.value),
                    },
                  },
                })
              }
            />
          </div>
          {type === 'macaw' && (
            <>
              <div className="input">
                <span>Attack Range</span>
                <input
                  type="number"
                  value={config[key][1].attackRange}
                  onChange={e =>
                    setConfig({
                      ...config,
                      [key]: {
                        ...config[key],
                        1: {
                          ...config[key][1],
                          attackRange: parseInt(e.target.value),
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
                  value={config[key][1].attackCooldown}
                  onChange={e =>
                    setConfig({
                      ...config,
                      [key]: {
                        ...config[key],
                        1: {
                          ...config[key][1],
                          attackCooldown: parseInt(e.target.value),
                        },
                      },
                    })
                  }
                />
              </div>
            </>
          )}
          <div className="input">
            <span>
              <del>Buff Range</del>
            </span>
            <input
              type="number"
              value={config[key][1].buffRange}
              onChange={e =>
                setConfig({
                  ...config,
                  [key]: {
                    ...config[key],
                    1: {
                      ...config[key][1],
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
              value={config[key][1].buffCooldown}
              onChange={e =>
                setConfig({
                  ...config,
                  [key]: {
                    ...config[key],
                    1: {
                      ...config[key][1],
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
              value={config[key][2].price}
              onChange={e =>
                setConfig({
                  ...config,
                  [key]: {
                    ...config[key],
                    2: {
                      ...config[key][2],
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
              value={config[key][2].unitHealth}
              onChange={e =>
                setConfig({
                  ...config,
                  [key]: {
                    ...config[key],
                    2: {
                      ...config[key][2],
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
              value={config[key][2].spawnRate}
              onChange={e =>
                setConfig({
                  ...config,
                  [key]: {
                    ...config[key],
                    2: {
                      ...config[key][2],
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
              value={config[key][2].spawnCapacity}
              onChange={e =>
                setConfig({
                  ...config,
                  [key]: {
                    ...config[key],
                    2: {
                      ...config[key][2],
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
              value={config[key][2].attackDamage}
              onChange={e =>
                setConfig({
                  ...config,
                  [key]: {
                    ...config[key],
                    2: {
                      ...config[key][2],
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
              value={config[key][2].unitSpeed}
              onChange={e =>
                setConfig({
                  ...config,
                  [key]: {
                    ...config[key],
                    2: {
                      ...config[key][2],
                      unitSpeed: parseInt(e.target.value),
                    },
                  },
                })
              }
            />
          </div>
          {type === 'macaw' && (
            <>
              <div className="input">
                <span>Attack Range</span>
                <input
                  type="number"
                  value={config[key][2].attackRange}
                  onChange={e =>
                    setConfig({
                      ...config,
                      [key]: {
                        ...config[key],
                        2: {
                          ...config[key][2],
                          attackRange: parseInt(e.target.value),
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
                  value={config[key][2].attackCooldown}
                  onChange={e =>
                    setConfig({
                      ...config,
                      [key]: {
                        ...config[key],
                        2: {
                          ...config[key][2],
                          attackCooldown: parseInt(e.target.value),
                        },
                      },
                    })
                  }
                />
              </div>
            </>
          )}
          <div className="input">
            <span>
              <del>Buff Range</del>
            </span>
            <input
              type="number"
              value={config[key][2].buffRange}
              onChange={e =>
                setConfig({
                  ...config,
                  [key]: {
                    ...config[key],
                    2: {
                      ...config[key][2],
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
              value={config[key][2].buffCooldown}
              onChange={e =>
                setConfig({
                  ...config,
                  [key]: {
                    ...config[key],
                    2: {
                      ...config[key][2],
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
              value={config[key][3].price}
              onChange={e =>
                setConfig({
                  ...config,
                  [key]: {
                    ...config[key],
                    3: {
                      ...config[key][3],
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
              value={config[key][3].unitHealth}
              onChange={e =>
                setConfig({
                  ...config,
                  [key]: {
                    ...config[key],
                    3: {
                      ...config[key][3],
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
              value={config[key][3].spawnRate}
              onChange={e =>
                setConfig({
                  ...config,
                  [key]: {
                    ...config[key],
                    3: {
                      ...config[key][3],
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
              value={config[key][3].spawnCapacity}
              onChange={e =>
                setConfig({
                  ...config,
                  [key]: {
                    ...config[key],
                    3: {
                      ...config[key][3],
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
              value={config[key][3].attackDamage}
              onChange={e =>
                setConfig({
                  ...config,
                  [key]: {
                    ...config[key],
                    3: {
                      ...config[key][3],
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
              value={config[key][3].unitSpeed}
              onChange={e =>
                setConfig({
                  ...config,
                  [key]: {
                    ...config[key],
                    3: {
                      ...config[key][3],
                      unitSpeed: parseInt(e.target.value),
                    },
                  },
                })
              }
            />
          </div>
          {type === 'macaw' && (
            <>
              <div className="input">
                <span>Attack Range</span>
                <input
                  type="number"
                  value={config[key][3].attackRange}
                  onChange={e =>
                    setConfig({
                      ...config,
                      [key]: {
                        ...config[key],
                        3: {
                          ...config[key][3],
                          attackRange: parseInt(e.target.value),
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
                  value={config[key][3].attackCooldown}
                  onChange={e =>
                    setConfig({
                      ...config,
                      [key]: {
                        ...config[key],
                        3: {
                          ...config[key][3],
                          attackCooldown: parseInt(e.target.value),
                        },
                      },
                    })
                  }
                />
              </div>
            </>
          )}
          <div className="input">
            <span>
              <del>Buff Range</del>
            </span>
            <input
              type="number"
              value={config[key][3].buffRange}
              onChange={e =>
                setConfig({
                  ...config,
                  [key]: {
                    ...config[key],
                    3: {
                      ...config[key][3],
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
              value={config[key][3].buffCooldown}
              onChange={e =>
                setConfig({
                  ...config,
                  [key]: {
                    ...config[key],
                    3: {
                      ...config[key][3],
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
};

export default CryptConfig;
