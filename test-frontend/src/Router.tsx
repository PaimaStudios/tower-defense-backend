import { useState } from 'react';
import ConfigCreator from './ConfigCreator';
import App from './App';

export default function () {
  const [displayConfig, setDisplayConfig] = useState(true);

  return (
    <>
      <button onClick={() => setDisplayConfig(value => !value)}>Toggle Config</button>
      {displayConfig ? <ConfigCreator /> : <App />}
    </>
  );
}
