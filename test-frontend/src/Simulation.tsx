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
  data: IGameApiResponse[];
}

const GameApiResponseDisplay: React.FC<{ response: IGameApiResponse }> = ({ response }) => {
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
            {crypt.health && <p>Health: {crypt.health}</p>}
            <p>Coordinates: {crypt.coordinates}</p>
            <p>Upgrades: {crypt.upgrades}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const GameApiDisplay: React.FC<IGameApiDisplayProps> = ({ data }) => {
  return (
    <div>
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
