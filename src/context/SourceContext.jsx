import { createContext, useContext, useState, useCallback } from 'react';
import { getActiveSource, setActiveSource } from '../services/api';
import { SOURCES } from '../config/sources';

const SourceContext = createContext(null);

export function SourceProvider({ children }) {
  const [source, setSource] = useState(() => getActiveSource());

  const changeSource = useCallback((newSource) => {
    if (!SOURCES[newSource]) return;
    setActiveSource(newSource);
    setSource(newSource);
  }, []);

  return (
    <SourceContext.Provider value={{ source, changeSource, sourceInfo: SOURCES[source] }}>
      {children}
    </SourceContext.Provider>
  );
}

export function useSource() {
  const ctx = useContext(SourceContext);
  if (!ctx) throw new Error('useSource must be used within SourceProvider');
  return ctx;
}
