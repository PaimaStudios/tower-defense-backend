import type { ChangeEvent } from 'react';
import React from 'react';
import Simulation from '../Simulation';

interface SimulationPanelProps {
  maps: { [key: string]: any }; // Replace 'any' with the type of map if you have a specific type.
  matchState: any; // Replace 'any' with the specific type of your matchState.
  setMapName: (mapName: string) => void;
  setMap: (map: any) => void; // Replace 'any' with the type of map if you have a specific type.
}

const SimulationPanel: React.FC<SimulationPanelProps> = ({
  maps,
  matchState,
  setMapName,
  setMap,
}) => {
  const handleMapChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedMap = e.target.value;
    setMapName(selectedMap);
    setMap(maps[selectedMap]);
    console.log(maps[selectedMap], 'map');
  };

  return (
    <div className="simulation-panel">
      <h2>Game Simulation</h2>
      <div className="input">
        <span>Map</span>
        <select name="" id="" onChange={handleMapChange}>
          {Object.keys(maps).map(map => (
            <option value={map} key={map}>
              {map}
            </option>
          ))}
        </select>
      </div>
      <div className="result">
        <Simulation data={matchState} />
      </div>
    </div>
  );
};

export default SimulationPanel;
