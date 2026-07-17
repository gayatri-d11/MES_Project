import React, { createContext, useContext, useState } from 'react';

const ProductionContext = createContext(null);

export function ProductionProvider({ children }) {
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [selectedWC, setSelectedWC] = useState(null);
  const [selectedWS, setSelectedWS] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedShift, setSelectedShift] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null); // dayjs object, no serialization needed

  return (
    <ProductionContext.Provider value={{
      selectedPlant, setSelectedPlant,
      selectedWC, setSelectedWC,
      selectedWS, setSelectedWS,
      selectedModule, setSelectedModule,
      selectedShift, setSelectedShift,
      selectedVariant, setSelectedVariant,
      selectedDate, setSelectedDate,
    }}>
      {children}
    </ProductionContext.Provider>
  );
}

export function useProduction() {
  return useContext(ProductionContext);
}
