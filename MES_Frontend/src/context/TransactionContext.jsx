import React, { createContext, useContext, useState } from 'react';

const TransactionContext = createContext(null);

export function TransactionProvider({ children }) {
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [selectedWorkCentre, setSelectedWorkCentre] = useState(null);
  const [selectedShift, setSelectedShift] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null); // dayjs object, no serialization needed

  const [machineDowntimeData, setMachineDowntimeData] = useState([]);
  const [targetCycleData, setTargetCycleData] = useState([]);
  const [resourceData, setResourceData] = useState([]);
  const [productionData, setProductionData] = useState([]);
  const [complaintData, setComplaintData] = useState([]);

  const [globalReadOnly, setGlobalReadOnly] = useState(true);
  const [dataSaved, setDataSaved] = useState(false);
  const [activeKeys, setActiveKeys] = useState([]);

  const clearSections = () => {
    setMachineDowntimeData([]); setTargetCycleData([]); setResourceData([]);
    setProductionData([]); setComplaintData([]);
    setGlobalReadOnly(true); setDataSaved(false); setActiveKeys([]);
  };

  return (
    <TransactionContext.Provider value={{
      selectedPlant, setSelectedPlant,
      selectedWorkCentre, setSelectedWorkCentre,
      selectedShift, setSelectedShift,
      selectedDate, setSelectedDate,
      machineDowntimeData, setMachineDowntimeData,
      targetCycleData, setTargetCycleData,
      resourceData, setResourceData,
      productionData, setProductionData,
      complaintData, setComplaintData,
      globalReadOnly, setGlobalReadOnly,
      dataSaved, setDataSaved,
      activeKeys, setActiveKeys,
      clearSections,
    }}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransaction() {
  return useContext(TransactionContext);
}
