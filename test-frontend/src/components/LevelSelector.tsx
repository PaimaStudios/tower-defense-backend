import type { Dispatch, SetStateAction } from 'react';
import React from 'react';

interface LevelSelectorProps {
  currentLevel: number;
  setCurrentLevel: Dispatch<SetStateAction<number>>;
}

const buttonStyle = {
  padding: '10px 20px',
  margin: '0 10px',
  border: 'none',
  borderRadius: '5px',
  backgroundColor: 'gray',
  color: 'white',
  cursor: 'pointer',
};

const selectedButtonStyle = {
  ...buttonStyle,
  backgroundColor: 'blue',
};

// LevelSelector component
export const LevelSelector: React.FC<LevelSelectorProps> = ({ currentLevel, setCurrentLevel }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
      <button
        onClick={() => setCurrentLevel(1)}
        style={currentLevel === 1 ? selectedButtonStyle : buttonStyle}
      >
        Level 1
      </button>
      <button
        onClick={() => setCurrentLevel(2)}
        style={currentLevel === 2 ? selectedButtonStyle : buttonStyle}
      >
        Level 2
      </button>
      <button
        onClick={() => setCurrentLevel(3)}
        style={currentLevel === 3 ? selectedButtonStyle : buttonStyle}
      >
        Level 3
      </button>
    </div>
  );
};
