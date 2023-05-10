import React, { ChangeEvent } from 'react';

interface GeneralConfigProps {
  config: {
    baseSpeed: number;
    defenderBaseHealth: number;
    baseAttackerGoldRate: number;
    baseDefenderGoldRate: number;
    repairCost: number;
    towerRepairValue: number;
    recoupPercentage: number;
    healthBuffAmount: number;
    speedBuffAmount: number;
    maxAttackerGold: number;
    maxDefenderGold: number;
  };
  setConfig: (config: any) => void;
}

const GeneralConfig: React.FC<GeneralConfigProps> = ({ config, setConfig }) => {
  return (
    <div>
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
            <span>Max Attacker's Gold</span>
            <input
              type="number"
              value={config.maxAttackerGold}
              onChange={e => setConfig({ ...config, maxAttackerGold: parseInt(e.target.value) })}
            />
          </div>
          <div className="input">
            <span>Max Defender's Gold</span>
            <input
              type="number"
              value={config.maxDefenderGold}
              onChange={e => setConfig({ ...config, maxDefenderGold: parseInt(e.target.value) })}
            />
          </div>
        </div>
        <div className="column">
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
            <span>Money recouped (in %) when salvaging structures</span>
            <input
              type="number"
              value={config.recoupPercentage}
              onChange={e => setConfig({ ...config, recoupPercentage: parseInt(e.target.value) })}
            />
          </div>
          <div className="input">
            <span>
              <del>Health buff given by Upgraded Gorilla Crypts</del>
            </span>
            <input
              type="number"
              value={config.healthBuffAmount}
              onChange={e => setConfig({ ...config, healthBuffAmount: parseInt(e.target.value) })}
            />
          </div>
          <div className="input">
            <span>
              <del>Speed buff given by Upgraded Jaguar Crypts</del>
            </span>
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
    </div>
  );
};

export default GeneralConfig;
