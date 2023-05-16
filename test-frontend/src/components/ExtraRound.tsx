import type { Dispatch, SetStateAction } from 'react';
import React from 'react';

interface ExtraRoundsProps {
  extraRounds: number;
  setExtraRounds: Dispatch<SetStateAction<number>>;
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

// ExtraRounds component
export const ExtraRounds: React.FC<ExtraRoundsProps> = ({ extraRounds, setExtraRounds }) => {
  const decrement = () => {
    setExtraRounds(prev => prev - 1);
  };

  const increment = () => {
    setExtraRounds(prev => prev + 1);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
      <button onClick={decrement} style={buttonStyle}>
        -
      </button>
      <p>{extraRounds}</p>
      <button onClick={increment} style={buttonStyle}>
        +
      </button>
    </div>
  );
};
