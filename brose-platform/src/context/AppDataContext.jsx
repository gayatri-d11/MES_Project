import React, { createContext, useContext, useState } from 'react';

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {

  const [employees, setEmployees] = useState([
    { key: '1', employeeId: 'BR-001', name: 'John Doe', role: 'Admin' },
    { key: '2', employeeId: 'BR-002', name: 'Anna Smith', role: 'Manager' },
    { key: '3', employeeId: 'BR-003', name: 'Mark Taylor', role: 'Supervisor' },
    { key: '4', employeeId: 'BR-004', name: 'Sara Lee', role: 'Operator' },
  ]);

  const [machineLayout, setMachineLayout] = useState([
    { key: '1', plant: 'Plant A', workCentre: 'WC-01', workStation: 'WS-001', module: 'MOD-01' },
    { key: '2', plant: 'Plant A', workCentre: 'WC-01', workStation: 'WS-002', module: 'MOD-02' },
    { key: '3', plant: 'Plant B', workCentre: 'WC-02', workStation: 'WS-003', module: 'MOD-03' },
  ]);

  const [reasonCodes, setReasonCodes] = useState([
    { key: '1', reasonCode: 'RC-001', description: 'Machine Breakdown', category: 'Machine Downtime', reasonType: 'Technical Downtime (TT)' },
    { key: '2', reasonCode: 'RC-002', description: 'Planned Maintenance', category: 'Machine Downtime', reasonType: 'Maintenance Time (TW)' },
    { key: '3', reasonCode: 'RC-003', description: 'Surface Defect', category: 'NOK', reasonType: '-' },
  ]);

  const [variants, setVariants] = useState([
    { key: '1', materialNumber: 'MAT-1001', description: 'Drive Shaft Type A', traceability: 'Serial' },
    { key: '2', materialNumber: 'MAT-1002', description: 'Control Unit Type B', traceability: 'Batch' },
    { key: '3', materialNumber: 'MAT-1003', description: 'Wiring Harness C', traceability: 'None' },
  ]);

  const [shifts, setShifts] = useState([
    { key: '1', shiftName: 'Morning Shift', duration: '8 hrs', breakTime: '30 min' },
    { key: '2', shiftName: 'Afternoon Shift', duration: '8 hrs', breakTime: '30 min' },
    { key: '3', shiftName: 'Night Shift', duration: '8 hrs', breakTime: '30 min' },
  ]);

const [productionSummary, setProductionSummary] = useState({
  oee: 87.4,
  totalProduction: 14860,
  okCount: 14620,
  nokCount: 240,
});

const [productionByVariant, setProductionByVariant] = useState([
  { variant: 'MAT-1001', ok: 8200, nok: 120 },
  { variant: 'MAT-1002', ok: 6420, nok: 120 },
]);

const [downtimeByReason, setDowntimeByReason] = useState([
  { reasonCode: 'RC-001', description: 'Machine Breakdown', duration: 120 },
  { reasonCode: 'RC-002', description: 'Planned Maintenance', duration: 60 },
  { reasonCode: 'RC-003', description: 'Surface Defect', duration: 30 },
]);



  const [shiftPlanning, setShiftPlanning] = useState([
    { key: '1', shift: 'Morning Shift', workCentre: 'WC-01', active: 'Yes' },
    { key: '2', shift: 'Afternoon Shift', workCentre: 'WC-01', active: 'Yes' },
    { key: '3', shift: 'Night Shift', workCentre: 'WC-02', active: 'No' },
  ]);

  return (
    <AppDataContext.Provider value={{
      employees, setEmployees,
      machineLayout, setMachineLayout,
      reasonCodes, setReasonCodes,
      variants, setVariants,
      shifts, setShifts,
      shiftPlanning, setShiftPlanning,
      productionSummary, setProductionSummary,
productionByVariant, setProductionByVariant,
downtimeByReason, setDowntimeByReason,

    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  return useContext(AppDataContext);
}
