import type { MatchState } from '@tower-defense/utils';
import React, { useState } from 'react';

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderSize = 3;

  const prevSlide = () => {
    setCurrentIndex(prevIndex => (prevIndex === 0 ? data.length - sliderSize : prevIndex - 3));
  };

  const nextSlide = () => {
    setCurrentIndex(prevIndex => (prevIndex === data.length - sliderSize ? 0 : prevIndex + 3));
  };

  const sliderControlsStyle = {
    display: 'flex',
    justifyContent: 'space-between',
  };

  return (
    <div className="result">
      <div style={sliderControlsStyle}>
        <button onClick={prevSlide}>Left</button>
        <div />
        <button onClick={nextSlide}>Right</button>
      </div>
      <div className="slider">
        {data.slice(currentIndex, currentIndex + sliderSize).map((response, index) => (
          <div key={index}>
            <div className="separation-line"></div>
            <GameApiResponseDisplay response={response} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameApiDisplay;
