import React from 'react';

interface IGameApiResponse {
  defenderBase: {
    health: number;
  };
  actors: {
    crypts: {
      [key: string]: {
        type: string;
        faction: string;
        id: number;
        structure: string;
        upgrades: number;
        coordinates: number;
        builtOnRound: number;
        spawned: number[];
        health?: number;
      };
    };
    towers: {
      [key: string]: {
        type: string;
        faction: string;
        id: number;
        structure: string;
        health: number;
        upgrades: number;
        coordinates: number;
        lastShot: number;
      };
    };
    units: {};
  };
  currentRound: number;
  finishedSpawning: number[];
}

interface IGameApiDisplayProps {
  data: IGameApiResponse;
}

const GameApiDisplay: React.FC<IGameApiDisplayProps> = ({ data }) => {
  const { crypts, towers } = data.actors;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
      <div>
        <h2>Results</h2>
        <p>Final health: {data.defenderBase.health}</p>
      </div>
      <div>
        <h2>Crypts</h2>
        {Object.values(crypts).map(crypt => (
          <div key={crypt.id}>
            <p>Structure: {crypt.structure}</p>
            {crypt.health && <p>Health: {crypt.health}</p>}
            <p>Coordinates: {crypt.coordinates}</p>
            <p>Upgrades: {crypt.upgrades}</p>
          </div>
        ))}
      </div>
      <div>
        <h2>Towers</h2>
        {Object.values(towers).map(tower => (
          <div key={tower.id}>
            <p>Structure: {tower.structure}</p>
            <p>Health: {tower.health}</p>
            <p>Coordinates: {tower.coordinates}</p>
            <p>Upgrades: {tower.upgrades}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameApiDisplay;
