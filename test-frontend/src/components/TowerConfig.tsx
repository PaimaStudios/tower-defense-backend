import type { MatchConfig } from '@tower-defense/utils';
import React from 'react';

interface Props {
  type: 'anaconda' | 'piranha' | 'sloth';
  config: MatchConfig;
  setConfig: (config: MatchConfig) => void;
}

const TowerConfig: React.FC<Props> = ({ config, setConfig, type }) => {
  const key = `${type}Tower` as 'anacondaTower' | 'piranhaTower' | 'slothTower';
  const cooldownTime = ((1 / config.baseSpeed) * config[key][1].cooldown).toFixed(2);

  return (
    <div className="tower">
      <h1>{`${type[0].toUpperCase()}${type.slice(1)}`} Tower Specs</h1>
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
            <span>Health</span>
            <input
              type="number"
              value={config[key][1].health}
              onChange={e =>
                setConfig({
                  ...config,
                  [key]: {
                    ...config[key],
                    1: {
                      ...config[key][1],
                      health: parseInt(e.target.value),
                    },
                  },
                })
              }
            />
          </div>
          <div className="input">
            <span>Attack Cooldown ({cooldownTime}[s])</span>
            <input
              type="number"
              value={config[key][1].cooldown}
              onChange={e =>
                setConfig({
                  ...config,
                  [key]: {
                    ...config[key],
                    1: {
                      ...config[key][1],
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
              value={config[key][1].damage}
              onChange={e =>
                setConfig({
                  ...config,
                  [key]: {
                    ...config[key],
                    1: {
                      ...config[key][1],
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
              value={config[key][1].range}
              onChange={e =>
                setConfig({
                  ...config,
                  [key]: {
                    ...config[key],
                    1: {
                      ...config[key][1],
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
            <span>Health</span>
            <input
              type="number"
              value={config[key][2].health}
              onChange={e =>
                setConfig({
                  ...config,
                  [key]: {
                    ...config[key],
                    2: {
                      ...config[key][2],
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
              value={config[key][2].cooldown}
              onChange={e =>
                setConfig({
                  ...config,
                  [key]: {
                    ...config[key],
                    2: {
                      ...config[key][2],
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
              value={config[key][2].damage}
              onChange={e =>
                setConfig({
                  ...config,
                  [key]: {
                    ...config[key],
                    2: {
                      ...config[key][2],
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
              value={config[key][2].range}
              onChange={e =>
                setConfig({
                  ...config,
                  [key]: {
                    ...config[key],
                    2: {
                      ...config[key][2],
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
            <span>Health</span>
            <input
              type="number"
              value={config[key][3].health}
              onChange={e =>
                setConfig({
                  ...config,
                  [key]: {
                    ...config[key],
                    3: {
                      ...config[key][3],
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
              value={config[key][3].cooldown}
              onChange={e =>
                setConfig({
                  ...config,
                  [key]: {
                    ...config[key],
                    3: {
                      ...config[key][3],
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
              value={config[key][3].damage}
              onChange={e =>
                setConfig({
                  ...config,
                  [key]: {
                    ...config[key],
                    3: {
                      ...config[key][3],
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
              value={config[key][3].range}
              onChange={e =>
                setConfig({
                  ...config,
                  [key]: {
                    ...config[key],
                    3: {
                      ...config[key][3],
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
  );
};

export default TowerConfig;
