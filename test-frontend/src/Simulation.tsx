import type { MatchState } from '@tower-defense/utils';
import React from 'react';

const GameApiResponseDisplay: React.FC<{ response: MatchState }> = ({ response }) => {
  const { crypts, towers } = response.actors;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
      <div>
        <h2>Results</h2>
        <p>Final health: {response.defenderBase.health}</p>
        <p>Current round (finalized): {response.currentRound}</p>
      </div>
      <div>
        <h2>Towers</h2>
        {Object.values(towers).map(tower => (
          <div key={tower.id}>
            <p>
              Structure: <b>{tower.structure}</b>
            </p>
            <p>Health: {tower.health}</p>
            <p>Coordinates: {tower.coordinates}</p>
            <p>Upgrades: {tower.upgrades}</p>
          </div>
        ))}
      </div>
      <div>
        <h2>Crypts</h2>
        {Object.values(crypts).map(crypt => (
          <div key={crypt.id}>
            <p>
              Structure: <b>{crypt.structure}</b>
            </p>
            <p>Coordinates: {crypt.coordinates}</p>
            <p>Upgrades: {crypt.upgrades}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

interface IGameApiDisplayProps {
  data: MatchState[];
}

const GameApiDisplay: React.FC<IGameApiDisplayProps> = ({ data }) => {
  return (
    <div className="result">
      {data.map((response, index) => (
        <div key={index}>
          <div className="separation-line"></div>
          <GameApiResponseDisplay response={response} />
        </div>
      ))}
    </div>
  );
};

export default GameApiDisplay;
