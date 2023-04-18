import { useState } from 'react';
import ConfigCreator from './ConfigCreator';
import TestFrontend from './TestFrontend';

export default function () {
  const [displayConfig, setDisplayConfig] = useState(true);

  return (
    <>
      <button onClick={() => setDisplayConfig(value => !value)}>Toggle Config</button>
      {displayConfig ? <ConfigCreator /> : <TestFrontend />}
    </>
  );
}
