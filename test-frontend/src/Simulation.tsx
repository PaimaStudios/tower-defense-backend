import type {
  AttackerStructure,
  CryptConfig,
  DefenderStructure,
  MatchConfig,
  MatchState,
  TowerConfig,
} from '@tower-defense/utils';
import React, { useState } from 'react';

const GameApiResponseDisplay: React.FC<{ response: MatchState; config: MatchConfig }> = ({
  response,
  config,
}) => {
  const { crypts, towers } = response.actors;

  const calculateCooldownTime = (actor: DefenderStructure | AttackerStructure): number => {
    const structureConfig = config[actor.structure][actor.upgrades];
    let cooldown: number;
    if ('attackCooldown' in structureConfig) {
      cooldown = structureConfig.attackCooldown;
    } else {
      cooldown = structureConfig.cooldown;
    }
    const cooldownTime = (1 / config.baseSpeed) * cooldown;
    return cooldownTime;
  };

  const battalionHP = (actor: DefenderStructure | AttackerStructure): number => {
    const structureConfig: CryptConfig | TowerConfig = config[actor.structure][actor.upgrades];
    let hp: number;
    if ('unitHealth' in structureConfig) {
      return structureConfig.unitHealth * structureConfig.spawnCapacity;
    } else {
      return 0;
    }
  };

  const damagePerSec = (actor: DefenderStructure | AttackerStructure, cooldown: number): number => {
    const structureConfig: CryptConfig | TowerConfig = config[actor.structure][actor.upgrades];
    let damage: number;
    if ('attackDamage' in structureConfig) {
      damage = actor.structure === 'macawCrypt' ? structureConfig.attackDamage : 0;
    } else {
      damage = structureConfig.damage;
    }
    const quantity = 'spawnCapacity' in structureConfig ? structureConfig.spawnCapacity : 1;
    const totalDamage = (damage * quantity) / cooldown;
    return totalDamage;
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
      <div>
        <h2>Results</h2>
        <p>Final health: {response.defenderBase.health}</p>
        <p>Current round (finalized): {response.currentRound}</p>
      </div>
      <div>
        <h2>Towers</h2>
        {Object.values(towers).map(tower => {
          const cooldownTime = calculateCooldownTime(tower);
          return (
            <div key={tower.id}>
              <p>
                Structure: <b>{tower.structure}</b>
              </p>
              <p>Health: {tower.health}</p>
              <p>Coordinates: {tower.coordinates}</p>
              <p>Upgrades: {tower.upgrades}</p>
              <p>Power per sec: {damagePerSec(tower, cooldownTime).toFixed(2)}</p>
            </div>
          );
        })}
      </div>
      <div>
        <h2>Crypts</h2>
        {Object.values(crypts).map(crypt => {
          const cooldownTime = calculateCooldownTime(crypt);

          return (
            <div key={crypt.id}>
              <p>
                Structure: <b>{crypt.structure}</b>
              </p>
              <p>Coordinates: {crypt.coordinates}</p>
              <p>Units: {crypt.spawned.length}</p>
              <p>Upgrades: {crypt.upgrades}</p>
              <p>Battalion HP: {battalionHP(crypt)}</p>
              <p>Power per sec: {damagePerSec(crypt, cooldownTime).toFixed(2)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface IGameApiDisplayProps {
  data: MatchState[];
  config: MatchConfig;
}

const GameApiDisplay: React.FC<IGameApiDisplayProps> = ({ data, config }) => {
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
            <GameApiResponseDisplay response={response} config={config} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameApiDisplay;
