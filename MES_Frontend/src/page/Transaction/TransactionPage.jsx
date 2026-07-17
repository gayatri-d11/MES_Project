import React, { useState, useEffect, useMemo } from 'react';
import { Card, Form, Select, Input, Button, Collapse, Table, App, DatePicker, Typography, Modal } from 'antd';
import { PlusOutlined, EditOutlined, SaveOutlined, DeleteOutlined, CalculatorOutlined } from '@ant-design/icons';
import colors from '../../theme/colors';
import constants from '../../theme/constants';
import apiFetch from '../../utils/apiFetch';
import { useTransaction } from '../../context/TransactionContext';

const { Option } = Select;
const { Panel } = Collapse;

const styles = {
  headerCard: { border: `1px solid ${colors.border}`, borderRadius: constants.borderRadius, marginBottom: constants.spacing.lg },
  sectionCard: { border: `1px solid ${colors.border}`, borderRadius: constants.borderRadius },
  formRow: { display: 'flex', gap: 8, flexWrap: 'nowrap', alignItems: 'flex-end' },
  formItem: { marginBottom: 0, flexShrink: 0 },
  sectionTitle: { fontFamily: constants.fontFamily, fontWeight: '600', fontSize: '14px', color: colors.textPrimary },
  subSectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: constants.spacing.md },
  subSectionTitle: { fontFamily: constants.fontFamily, fontWeight: '600', fontSize: '13px', color: colors.secondaryText },
  subSection: { marginBottom: constants.spacing.lg },
  inputRow: { display: 'flex', gap: constants.spacing.md, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: constants.spacing.md, paddingBottom: constants.spacing.md, borderBottom: `1px solid ${colors.border}` },
  inputItem: { display: 'flex', flexDirection: 'column', gap: constants.spacing.xs },
  inputLabel: { fontFamily: constants.fontFamily, fontSize: '12px', color: colors.textSecondary },
};

const machineDowntimeColumns = [
  { title: 'Module', dataIndex: 'module', key: 'module' },
  {
    title: 'Reason Code', dataIndex: 'reasonCode', key: 'reasonCode',
    render: (code, record) => record.reasonDescription || code,
  },
  { title: 'Duration (sec)', dataIndex: 'duration', key: 'duration' },
];
const targetCycleColumns = [
  { title: 'Module', dataIndex: 'module', key: 'module' },
  { title: 'Target Cycle Time (Seconds)', dataIndex: 'targetCycle', key: 'targetCycle' },
];
const resourceColumns = [
  { title: 'Work Station', dataIndex: 'workStation', key: 'workStation' },
  { title: 'Resource Count', dataIndex: 'resourceCount', key: 'resourceCount' },
  { title: 'Resource Names', dataIndex: 'resourceNames', key: 'resourceNames' },
];
const productionColumns = [
  { title: 'Variant Type', dataIndex: 'variantType', key: 'variantType' },
  { title: 'OK Count', dataIndex: 'okCount', key: 'okCount' },
  { title: 'NOK Count', dataIndex: 'nokCount', key: 'nokCount' },
  { title: 'NOK Type', dataIndex: 'nokType', key: 'nokType' },
  { title: 'NOK Reason Code', dataIndex: 'nokReasonCode', key: 'nokReasonCode' },
];
const complaintColumns = [
  { title: 'Variant Type', dataIndex: 'variantType', key: 'variantType' },
  { title: 'Reason', dataIndex: 'reason', key: 'reason' },
  { title: 'Complaint Details', dataIndex: 'details', key: 'details' },
];

function SectionTable({ title, inputFields, columns, data, onAdd, onDelete, onSave, globalReadOnly }) {
  const [localReadOnly, setLocalReadOnly] = useState(true);
  const [rowInput, setRowInput] = useState({});
  const [error, setError] = useState('');

  const handleSave = () => {
    const hasUnsavedInput = inputFields.some(f => rowInput[f.key] !== undefined && rowInput[f.key] !== '');
    if (hasUnsavedInput) {
      Modal.confirm({
        title: 'Unsaved Row',
        content: 'You have a row that has not been added yet. Do you want to add it before saving?',
        okText: 'Add & Save',
        cancelText: 'Discard & Save',
        onOk: () => {
          const missing = inputFields.filter(f => {
            if (f.required === false) return false;
            if (f.conditionalOn) {
              const depVal = rowInput[f.conditionalOn.key];
              if (!depVal || Number(depVal) === 0) return false;
            }
            return !rowInput[f.key];
          });
          if (missing.length > 0) {
            setError(`Please fill in: ${missing.map(f => f.label).join(', ')}`);
            return Promise.reject();
          }
          setError('');
          if (onAdd) onAdd(rowInput);
          setRowInput({});
          onSave && onSave();
          setLocalReadOnly(true);
        },
        onCancel: () => { setRowInput({}); setError(''); onSave && onSave(); setLocalReadOnly(true); },
      });
    } else {
      onSave && onSave();
      setLocalReadOnly(true);
    }
  };

  useEffect(() => { setLocalReadOnly(true); }, [globalReadOnly]);

  const isReadOnly = globalReadOnly || localReadOnly;

  const handleAdd = () => {
    const missing = inputFields.filter(f => {
      if (f.required === false) return false;
      if (f.conditionalOn) {
        const depVal = rowInput[f.conditionalOn.key];
        if (!depVal || Number(depVal) === 0) return false;
      }
      return !rowInput[f.key];
    });
    if (missing.length > 0) { setError(`Please fill in: ${missing.map(f => f.label).join(', ')}`); return; }
    setError('');
    if (onAdd) onAdd(rowInput);
    setRowInput({});
  };

  const deleteCol = {
    title: '', key: 'action', width: 40,
    render: (_, record) => (
      <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => onDelete && onDelete(record.key)} />
    ),
  };

  const tableColumns = isReadOnly ? columns : [...columns, deleteCol];

  return (
    <div style={styles.subSection}>
      <div style={styles.subSectionHeader}>
        <span style={styles.subSectionTitle}>{title}</span>
        {!globalReadOnly && (
          <div style={{ display: 'flex', gap: constants.spacing.sm }}>
            {localReadOnly ? (
              <Button size="small" icon={<EditOutlined />} onClick={() => setLocalReadOnly(false)}>EDIT</Button>
            ) : (
              <Button size="small" type="primary" icon={<SaveOutlined />} onClick={handleSave}>SAVE</Button>
            )}
          </div>
        )}
      </div>

      {!isReadOnly && (
        <div style={{ marginBottom: constants.spacing.md }}>
          <div style={styles.inputRow}>
            {inputFields.map((field, index) => (
              <div key={index} style={styles.inputItem}>
                <span style={styles.inputLabel}>
                  {field.label}
                  {(() => {
                    if (field.required === false) return null;
                    if (field.conditionalOn) {
                      const depVal = rowInput[field.conditionalOn.key];
                      if (!depVal || Number(depVal) === 0) return null;
                    }
                    return <span style={{ color: colors.error }}> *</span>;
                  })()}
                </span>
                {field.type === 'select' ? (
                  <Select
                    placeholder={`Select ${field.label}`}
                    style={{ width: field.wide ? '280px' : '160px' }}
                    size="small"
                    allowClear={field.key === 'nokType'}
                    value={rowInput[field.key] || undefined}
                    optionLabelProp="label"
                    onChange={(val) => {
                      const next = { ...rowInput, [field.key]: val };
                      if (field.key === 'nokReasonCode') {
                        const map = { 'nok-sc': 'Scrap', 'nok-rw': 'Rework', 'nok-rt': 'Retest' };
                        const mapped = map[val?.toLowerCase()];
                        if (mapped) next.nokType = mapped;
                      }
                      if (field.key === 'nokType') next.nokReasonCode = undefined;
                      setRowInput(next); setError('');
                    }}
                  >
                    {(field.optionsFn ? field.optionsFn(rowInput) : field.options || []).map((opt, i) => (
                      <Option key={i} value={opt.value} label={opt.value}>
                        {opt.description ? (
                          <div>
                            <span style={{ fontWeight: 500 }}>{opt.value}</span>
                            <span style={{ color: colors.textSecondary, fontSize: '11px', marginLeft: '6px' }}>{opt.description}</span>
                          </div>
                        ) : opt.label}
                      </Option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    placeholder={field.label}
                    style={{ width: '160px' }}
                    size="small"
                    maxLength={field.maxLength || 100}
                    value={rowInput[field.key] || ''}
                    onChange={(e) => {
                      let val = field.numeric ? e.target.value.replace(/[^0-9]/g, '') : e.target.value;
                      if (field.numeric && field.max && Number(val) > field.max) val = String(field.max);
                      setRowInput({ ...rowInput, [field.key]: val });
                      setError('');
                    }}
                  />
                )}
              </div>
            ))}
            <Button icon={<PlusOutlined />} size="small" style={{ alignSelf: 'flex-end' }} onClick={handleAdd}>ADD</Button>
          </div>
          {error && <Typography.Text type="danger" style={{ fontSize: '12px' }}>{error}</Typography.Text>}
        </div>
      )}

      <Table columns={tableColumns} dataSource={data} pagination={{ pageSize: 5 }} size="small" scroll={{ x: true }} />
    </div>
  );
}

export default function TransactionPage() {
  const { modal } = App.useApp();
  const authHeaders = { 'Content-Type': 'application/json' };
  const employeeNo = (() => { try { const t = localStorage.getItem('access_token'); return JSON.parse(atob(t.split('.')[1])).employee_no; } catch { return ''; } })();

  const {
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
  } = useTransaction();

  const [plants, setPlants] = useState([]);
  const [workCenters, setWorkCenters] = useState([]);
  const [workstations, setWorkstations] = useState([]);
  const [machineLayout, setMachineLayout] = useState([]);
  const [reasonCodes, setReasonCodes] = useState([]);
  const [variants, setVariants] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [shiftPlanning, setShiftPlanning] = useState([]);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    apiFetch(`/plants/`).then(r => r.json()).then(d => setPlants(Array.isArray(d) ? d : []));
    apiFetch(`/work-centers/`).then(r => r.json()).then(d => setWorkCenters(Array.isArray(d) ? d : []));
    apiFetch(`/workstations/`).then(r => r.json()).then(d => setWorkstations(Array.isArray(d) ? d : []));
    apiFetch(`/machines/`).then(r => r.json()).then(d => setMachineLayout(Array.isArray(d) ? d : []));
    apiFetch(`/reason-codes/`).then(r => r.json()).then(d => setReasonCodes(Array.isArray(d) ? d : []));
    apiFetch(`/products/`).then(r => r.json()).then(d => setVariants(Array.isArray(d) ? d : []));
    apiFetch(`/shifts/`).then(r => r.json()).then(d => setShifts(Array.isArray(d) ? d : []));
    apiFetch(`/shift-planning/`).then(r => r.json()).then(d => setShiftPlanning(Array.isArray(d) ? d : []));
  }, []);

  const filteredWCs = useMemo(() => workCenters.filter(w => w.facility === selectedPlant), [workCenters, selectedPlant]);
  const filteredShifts = useMemo(() => {
    if (!selectedWorkCentre) return [];
    const planned = shiftPlanning.filter(p => p.work_center_name === selectedWorkCentre).map(p => p.shift_name);
    return shifts.filter(s => planned.includes(s.shift_name));
  }, [shifts, shiftPlanning, selectedWorkCentre]);

  const shiftDurationMinutes = useMemo(() => {
    if (!selectedShift) return null;
    const shift = shifts.find(s => s.shift_name === selectedShift);
    if (!shift || !shift.duration) return null;
    const parts = shift.duration.split(' - ');
    if (parts.length !== 2) return null;
    const parse = (str) => {
      const m = str.trim().match(/^(\d+):(\d+)\s*(AM|PM)$/i);
      if (!m) return null;
      let h = parseInt(m[1]); const min = parseInt(m[2]); const ampm = m[3].toUpperCase();
      if (ampm === 'AM' && h === 12) h = 0;
      if (ampm === 'PM' && h !== 12) h += 12;
      return h * 60 + min;
    };
    const start = parse(parts[0]); const end = parse(parts[1]);
    if (start === null || end === null) return null;
    let mins = end - start;
    if (mins <= 0) mins += 24 * 60;
    return mins;
  }, [shifts, selectedShift]);

  const modules = useMemo(() => machineLayout.filter(m => m.work_center_name === selectedWorkCentre).map(m => ({ value: m.equipment, label: m.equipment })), [machineLayout, selectedWorkCentre]);
  const workStationOptions = useMemo(() => workstations.filter(w => w.work_center_name === selectedWorkCentre).map(w => ({ value: w.resource_name, label: w.resource_name })), [workstations, selectedWorkCentre]);
  const downtimeReasonCodes = useMemo(() => reasonCodes.filter(r => r.category === 'Machine Downtime').map(r => ({ value: r.reason_code, label: r.reason_code, description: r.description || '' })), [reasonCodes]);
  const nokReasonCodes = useMemo(() => reasonCodes.filter(r => r.category === 'NOK').map(r => ({ value: r.reason_code, label: r.reason_code, description: r.description || '' })), [reasonCodes]);
  const variantOptions = useMemo(() => variants.map(v => ({ value: v.product_no, label: v.product_no })), [variants]);

  const addRow = (setter, existing, row) => setter([...existing, { ...row, key: Date.now().toString() }]);
  const deleteRow = (setter, existing, key) => setter(existing.filter(r => r.key !== key));

  const handleShow = async () => {
    if (!selectedPlant || !selectedWorkCentre || !selectedShift || !selectedDate) return;
    const dateStr = selectedDate.format('YYYY-MM-DD');
    const res = await apiFetch(`/transactions/?facility=${selectedPlant}&work_center=${selectedWorkCentre}&shift=${selectedShift}&date=${dateStr}`);
    const data = await res.json();
    if (!res.ok) { modal.error({ title: 'Error', content: data.error }); return; }

    if (data.exists) {
      setMachineDowntimeData((data.downtime || []).map((r, i) => ({
        ...r, key: String(i),
        reasonDescription: reasonCodes.find(rc => rc.reason_code === r.reasonCode)?.description || '',
      })));
      setTargetCycleData((data.targetCycle || []).map((r, i) => ({ ...r, key: String(i) })));
      setResourceData((data.resourcePlan || []).map((r, i) => ({ ...r, key: String(i) })));
      setProductionData((data.production || []).map((r, i) => ({ ...r, key: String(i) })));
      setComplaintData((data.complaints || []).map((r, i) => ({ ...r, key: String(i) })));
      setGlobalReadOnly(true);
      setDataSaved(false);
      setActiveKeys(['1', '2', '3']);
      modal.success({ title: 'Transaction loaded.' });
    } else {
      setMachineDowntimeData([]); setTargetCycleData([]); setResourceData([]);
      setProductionData([]); setComplaintData([]);
      setGlobalReadOnly(false);
      setDataSaved(false);
      setActiveKeys(['1', '2', '3']);
      modal.info({ title: 'No existing transaction found. You can enter new data.' });
    }
  };

  const buildPayload = () => ({
    facility: selectedPlant,
    work_center: selectedWorkCentre,
    shift: selectedShift,
    date: selectedDate.format('YYYY-MM-DD'),
  });

  const SECTION_LABELS = {
    downtime: 'Machine Downtime Classification',
    targetCycle: 'Machine Target Cycle Time',
    resourcePlan: 'Resource Planning',
    production: 'Production Data',
  };

  const validateCycleTimes = () => {
    const downtimeModules = [...new Set(machineDowntimeData.map(r => r.module).filter(Boolean))];
    const cycleMap = Object.fromEntries(targetCycleData.map(r => [r.module, Number(r.targetCycle)]));
    return downtimeModules.filter(m => !cycleMap[m]);
  };

  const saveSubsection = async (sectionKey, sectionData) => {
    if (!selectedPlant || !selectedWorkCentre || !selectedShift || !selectedDate) {
      modal.error({ title: 'Error', content: 'Please fill in all header fields.' });
      return;
    }
    const payload = { ...buildPayload(), employee_no: employeeNo, section: sectionKey, data: sectionData };
    const res = await apiFetch(`/transactions/section/`, { method: 'POST', headers: authHeaders, body: JSON.stringify(payload) });
    const json = await res.json();
    if (res.ok) { modal.success({ title: `${SECTION_LABELS[sectionKey] || sectionKey} saved successfully.` }); setDataSaved(true); }
    else modal.error({ title: 'Save failed', content: json.error || 'Failed to save.' });
  };

  const handleCalculate = async () => {
    if (!selectedPlant || !selectedWorkCentre || !selectedShift || !selectedDate) {
      modal.error({ title: 'Error', content: 'Please select Plant, Work Centre, Shift and Date, then SHOW the transaction first.' });
      return;
    }
    const missing = validateCycleTimes();
    if (missing.length > 0) {
      modal.error({ title: 'Missing Target Cycle Time', content: `Please enter a target cycle time in Section B for: ${missing.join(', ')}` });
      return;
    }
    setCalculating(true);
    try {
      const res = await apiFetch('/transactions/calculate/', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          facility: selectedPlant,
          work_center: selectedWorkCentre,
          shift: selectedShift,
          date: selectedDate.format('YYYY-MM-DD'),
        }),
      });
      const json = await res.json();
      if (!res.ok) { modal.error({ title: 'Calculation failed', content: json.error || 'Failed to calculate KPIs.' }); return; }
      modal.success({ title: 'KPIs calculated and saved successfully.' });
    } finally {
      setCalculating(false);
    }
  };

  const handleEdit = () => {
    const hasData = machineDowntimeData.length || targetCycleData.length || resourceData.length || productionData.length || complaintData.length;
    if (hasData) {
      modal.confirm({
        title: 'Edit Transaction',
        content: 'You are about to edit an existing transaction. Continue?',
        okText: 'Edit',
        onOk: () => { setGlobalReadOnly(false); setDataSaved(false); },
      });
    } else {
      setGlobalReadOnly(false);
      setDataSaved(false);
    }
  };

  return (
    <div>
      <Card style={styles.headerCard}>
        <Form layout="inline">
          <div style={styles.formRow}>
            <Form.Item label="Plant" style={styles.formItem}>
              <Select placeholder="Plant" style={{ width: '120px' }} size="small" value={selectedPlant}
                onChange={(val) => { setSelectedPlant(val); setSelectedWorkCentre(null); setSelectedShift(null); clearSections(); }}>
                {plants.map(p => <Option key={p.facility} value={p.facility}>{p.facility}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item label="Work Centre" style={styles.formItem}>
              <Select placeholder="Work Centre" style={{ width: '150px' }} size="small" value={selectedWorkCentre}
                disabled={!selectedPlant} onChange={(val) => { setSelectedWorkCentre(val); setSelectedShift(null); clearSections(); }}>
                {filteredWCs.map(wc => <Option key={wc.work_center} value={wc.work_center}>{wc.work_center}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item label="Shift" style={styles.formItem}>
              <Select placeholder="Shift" style={{ width: '130px' }} size="small" value={selectedShift} disabled={!selectedWorkCentre} onChange={(val) => { setSelectedShift(val); clearSections(); }}>
                {filteredShifts.map(s => <Option key={s.id} value={s.shift_name}>{s.shift_name}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item label="Date" style={styles.formItem}>
              <DatePicker style={{ width: '130px' }} size="small" value={selectedDate} onChange={(val) => { setSelectedDate(val); clearSections(); }} />
            </Form.Item>
            <Form.Item style={styles.formItem}>
              <Button type="primary" size="small"
                disabled={!selectedPlant || !selectedWorkCentre || !selectedShift || !selectedDate}
                onClick={handleShow}>SHOW</Button>
            </Form.Item>
            <Form.Item style={styles.formItem}>
              <Button size="small" style={{ borderColor: colors.secondaryText, color: colors.secondaryText }}
                disabled={!selectedPlant || !selectedWorkCentre || !selectedShift || !selectedDate || !globalReadOnly}
                onClick={handleEdit}>EDIT</Button>
            </Form.Item>
          </div>
        </Form>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: constants.spacing.sm }}>
        <Button
          icon={<CalculatorOutlined />}
          loading={calculating}
          disabled={!dataSaved}
          onClick={handleCalculate}
          style={dataSaved ? { borderColor: colors.primary, color: colors.primary } : {}}
        >CALCULATE</Button>
      </div>

      <Card style={styles.sectionCard}>
        <Collapse activeKey={activeKeys} onChange={setActiveKeys} ghost>

          <Panel header={<span style={styles.sectionTitle}>Downtime & OEE</span>} key="1">
            <SectionTable
              title="A. Machine Downtime Classification"
              columns={machineDowntimeColumns}
              data={machineDowntimeData}
              globalReadOnly={globalReadOnly}
              onAdd={(row) => {
                const rc = downtimeReasonCodes.find(r => r.value === row.reasonCode);
                addRow(setMachineDowntimeData, machineDowntimeData, { ...row, reasonDescription: rc?.description || '' });
              }}
              onDelete={(key) => deleteRow(setMachineDowntimeData, machineDowntimeData, key)}
              onSave={() => saveSubsection('downtime', machineDowntimeData)}
              inputFields={[
                { label: 'Module', key: 'module', type: 'select', options: modules },
                { label: 'Reason Code', key: 'reasonCode', type: 'select', options: downtimeReasonCodes, wide: true },
                {
                  label: 'Duration (sec)', key: 'duration', type: 'input', numeric: true,
                  ...(shiftDurationMinutes ? { max: shiftDurationMinutes * 60 } : {}),
                },
              ]}
            />
            <SectionTable
              title="B. Machine Target Cycle Time"
              columns={targetCycleColumns}
              data={targetCycleData}
              globalReadOnly={globalReadOnly}
              onAdd={(row) => addRow(setTargetCycleData, targetCycleData, row)}
              onDelete={(key) => deleteRow(setTargetCycleData, targetCycleData, key)}
              onSave={() => saveSubsection('targetCycle', targetCycleData)}
              inputFields={[
                { label: 'Module', key: 'module', type: 'select', options: modules },
                { label: 'Target Cycle Time (Seconds)', key: 'targetCycle', type: 'input', numeric: true },
              ]}
            />
            <SectionTable
              title="C. Resource Planning"
              columns={resourceColumns}
              data={resourceData}
              globalReadOnly={globalReadOnly}
              onAdd={(row) => addRow(setResourceData, resourceData, row)}
              onDelete={(key) => deleteRow(setResourceData, resourceData, key)}
              onSave={() => saveSubsection('resourcePlan', resourceData)}
              inputFields={[
                { label: 'Work Station', key: 'workStation', type: 'select', options: workStationOptions },
                { label: 'Resource Count', key: 'resourceCount', type: 'input', numeric: true },
                { label: 'Resource Names', key: 'resourceNames', type: 'input', required: false, maxLength: 200 },
              ]}
            />
          </Panel>

          <Panel header={<span style={styles.sectionTitle}>Production Data</span>} key="2">
            <SectionTable
              title="Production Data"
              columns={productionColumns}
              data={productionData}
              globalReadOnly={globalReadOnly}
              onAdd={(row) => addRow(setProductionData, productionData, row)}
              onDelete={(key) => deleteRow(setProductionData, productionData, key)}
              onSave={() => saveSubsection('production', productionData)}
              inputFields={[
                { label: 'Variant Type', key: 'variantType', type: 'select', options: variantOptions },
                { label: 'OK Count', key: 'okCount', type: 'input', numeric: true },
                { label: 'NOK Count', key: 'nokCount', type: 'input', numeric: true, required: false },
                { label: 'NOK Type', key: 'nokType', type: 'select', conditionalOn: { key: 'nokCount' },
                  optionsFn: (row) => {
                    const map = { 'nok-sc': 'Scrap', 'nok-rw': 'Rework', 'nok-rt': 'Retest' };
                    const forced = map[row.nokReasonCode?.toLowerCase()];
                    const all = [{ value: 'Scrap', label: 'Scrap' }, { value: 'Rework', label: 'Rework' }, { value: 'Retest', label: 'Retest' }];
                    return forced ? all.filter(o => o.value === forced) : all;
                  },
                },
                { label: 'NOK Reason Code', key: 'nokReasonCode', type: 'select', wide: true, conditionalOn: { key: 'nokCount' },
                  optionsFn: (row) => {
                    if (row.nokType === 'Scrap') return nokReasonCodes.filter(r => r.value.toLowerCase() === 'nok-sc');
                    if (row.nokType === 'Rework') return nokReasonCodes.filter(r => r.value.toLowerCase() === 'nok-rw');
                    if (row.nokType === 'Retest') return nokReasonCodes.filter(r => r.value.toLowerCase() === 'nok-rt');
                    return nokReasonCodes;
                  },
                },
              ]}
            />
          </Panel>

          <Panel header={<span style={styles.sectionTitle}>Customer Complaint</span>} key="3">
            <div style={{ padding: constants.spacing.md, color: colors.textSecondary, fontFamily: constants.fontFamily, fontSize: '13px' }}>
              This section is not yet available.
            </div>
          </Panel>

        </Collapse>
      </Card>
    </div>
  );
}
