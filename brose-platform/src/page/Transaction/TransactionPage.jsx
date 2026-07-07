import React, { useState, useEffect, useMemo } from 'react';
import { Card, Form, Select, Input, Button, Collapse, Table, Space, App, DatePicker } from 'antd';
import { PlusOutlined, SaveOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import colors from '../../theme/colors';
import constants from '../../theme/constants';

const { Option } = Select;
const { Panel } = Collapse;
const API = 'http://localhost:8000/api';

const styles = {
  headerCard: { border: `1px solid ${colors.border}`, borderRadius: constants.borderRadius, marginBottom: constants.spacing.lg },
  sectionCard: { border: `1px solid ${colors.border}`, borderRadius: constants.borderRadius },
  formRow: { display: 'flex', gap: constants.spacing.md, flexWrap: 'wrap', alignItems: 'flex-end' },
  formItem: { marginBottom: 0, minWidth: '160px' },
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
  { title: 'Reason Code', dataIndex: 'reasonCode', key: 'reasonCode' },
  { title: 'Duration (min)', dataIndex: 'duration', key: 'duration' },
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

function SectionTable({ title, inputFields, columns, data, onAdd, disabled }) {
  const [rowInput, setRowInput] = useState({});

  const handleAdd = () => {
    if (onAdd) onAdd(rowInput);
    setRowInput({});
  };

  return (
    <div style={styles.subSection}>
      <div style={styles.subSectionHeader}>
        <span style={styles.subSectionTitle}>{title}</span>
      </div>
      {!disabled && (
        <div style={styles.inputRow}>
          {inputFields.map((field, index) => (
            <div key={index} style={styles.inputItem}>
              <span style={styles.inputLabel}>{field.label}</span>
              {field.type === 'select' ? (
                <Select
                  placeholder={`Select ${field.label}`}
                  style={{ width: '160px' }}
                  size="small"
                  value={rowInput[field.key] || undefined}
                  onChange={(val) => setRowInput({ ...rowInput, [field.key]: val })}
                >
                  {field.options.map((opt, i) => (
                    <Option key={i} value={opt.value}>{opt.label}</Option>
                  ))}
                </Select>
              ) : (
                <Input
                  placeholder={field.label}
                  style={{ width: '160px' }}
                  size="small"
                  value={rowInput[field.key] || ''}
                  onChange={(e) => setRowInput({ ...rowInput, [field.key]: e.target.value })}
                />
              )}
            </div>
          ))}
          <Button icon={<PlusOutlined />} size="small" style={{ alignSelf: 'flex-end' }} onClick={handleAdd}>ADD</Button>
        </div>
      )}
      <Table columns={columns} dataSource={data} pagination={{ pageSize: 5 }} size="small" scroll={{ x: true }} />
    </div>
  );
}

export default function TransactionPage() {
  const { modal } = App.useApp();
  const token = localStorage.getItem('access_token');
  const employeeNo = (() => { try { return JSON.parse(atob(token.split('.')[1])).employee_no; } catch { return ''; } })();
  const authHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
  const h = { headers: { 'Authorization': `Bearer ${token}` } };

  const [activeKeys, setActiveKeys] = useState([]);
  const [readOnly, setReadOnly] = useState(true);

  // Master data from API
  const [plants, setPlants] = useState([]);
  const [workCenters, setWorkCenters] = useState([]);
  const [workstations, setWorkstations] = useState([]);
  const [machineLayout, setMachineLayout] = useState([]);
  const [reasonCodes, setReasonCodes] = useState([]);
  const [variants, setVariants] = useState([]);
  const [shifts, setShifts] = useState([]);

  // Header selections
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [selectedWorkCentre, setSelectedWorkCentre] = useState(null);
  const [selectedShift, setSelectedShift] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  // Section data
  const [machineDowntimeData, setMachineDowntimeData] = useState([]);
  const [targetCycleData, setTargetCycleData] = useState([]);
  const [resourceData, setResourceData] = useState([]);
  const [productionData, setProductionData] = useState([]);
  const [complaintData, setComplaintData] = useState([]);

  useEffect(() => {
    fetch(`${API}/plants/`, h).then(r => r.json()).then(d => setPlants(Array.isArray(d) ? d : []));
    fetch(`${API}/work-centers/`, h).then(r => r.json()).then(d => setWorkCenters(Array.isArray(d) ? d : []));
    fetch(`${API}/workstations/`, h).then(r => r.json()).then(d => setWorkstations(Array.isArray(d) ? d : []));
    fetch(`${API}/machines/`, h).then(r => r.json()).then(d => setMachineLayout(Array.isArray(d) ? d : []));
    fetch(`${API}/reason-codes/`, h).then(r => r.json()).then(d => setReasonCodes(Array.isArray(d) ? d : []));
    fetch(`${API}/products/`, h).then(r => r.json()).then(d => setVariants(Array.isArray(d) ? d : []));
    fetch(`${API}/shifts/`, h).then(r => r.json()).then(d => setShifts(Array.isArray(d) ? d : []));
  }, []);

  const filteredWCs = useMemo(() => workCenters.filter(w => w.facility === selectedPlant), [workCenters, selectedPlant]);
  const modules = useMemo(() => machineLayout.filter(m => m.work_center_name === selectedWorkCentre).map(m => ({ value: m.equipment, label: m.equipment })), [machineLayout, selectedWorkCentre]);
  const workStationOptions = useMemo(() => workstations.filter(w => w.work_center_name === selectedWorkCentre).map(w => ({ value: w.resource_name, label: w.resource_name })), [workstations, selectedWorkCentre]);
  const downtimeReasonCodes = useMemo(() => reasonCodes.filter(r => r.category === 'Machine Downtime').map(r => ({ value: r.reason_code, label: r.reason_code })), [reasonCodes]);
  const nokReasonCodes = useMemo(() => reasonCodes.filter(r => r.category === 'NOK').map(r => ({ value: r.reason_code, label: r.reason_code })), [reasonCodes]);
  const variantOptions = useMemo(() => variants.map(v => ({ value: v.product_no, label: v.product_no })), [variants]);

  const addRow = (setter, existing, row) => {
    if (!row || Object.keys(row).length === 0) return;
    setter([...existing, { ...row, key: Date.now().toString() }]);
  };

  const handleShow = async () => {
    if (!selectedPlant || !selectedWorkCentre || !selectedShift || !selectedDate) {
      modal.error({ title: 'Error', content: 'Please select Plant, Work Centre, Shift and Date.' });
      return;
    }
    const dateStr = selectedDate.format('YYYY-MM-DD');
    const res = await fetch(`${API}/transactions/?facility=${selectedPlant}&work_center=${selectedWorkCentre}&shift=${selectedShift}&date=${dateStr}`, h);
    const data = await res.json();
    if (!res.ok) { modal.error({ title: 'Error', content: data.error }); return; }

    if (data.exists) {
      setMachineDowntimeData((data.downtime || []).map((r, i) => ({ ...r, key: String(i) })));
      setTargetCycleData((data.targetCycle || []).map((r, i) => ({ ...r, key: String(i) })));
      setResourceData((data.resourcePlan || []).map((r, i) => ({ ...r, key: String(i) })));
      setProductionData((data.production || []).map((r, i) => ({ ...r, key: String(i) })));
      setComplaintData((data.complaints || []).map((r, i) => ({ ...r, key: String(i) })));
      setReadOnly(true);
      setActiveKeys(['1', '2', '3']);
      modal.success({ title: 'Transaction loaded.' });
    } else {
      setMachineDowntimeData([]); setTargetCycleData([]); setResourceData([]);
      setProductionData([]); setComplaintData([]);
      setReadOnly(false);
      setActiveKeys(['1', '2', '3']);
      modal.info({ title: 'No existing transaction found. You can enter new data.' });
    }
  };

  const handleSave = async () => {
    if (!selectedPlant || !selectedWorkCentre || !selectedShift || !selectedDate) {
      modal.error({ title: 'Error', content: 'Please fill in all header fields.' });
      return;
    }
    const payload = {
      facility: selectedPlant,
      work_center: selectedWorkCentre,
      shift: selectedShift,
      date: selectedDate.format('YYYY-MM-DD'),
      employee_no: employeeNo,
      downtime: machineDowntimeData,
      targetCycle: targetCycleData,
      resourcePlan: resourceData,
      production: productionData,
      complaints: complaintData,
    };
    const res = await fetch(`${API}/transactions/`, { method: 'POST', headers: authHeaders, body: JSON.stringify(payload) });
    const data = await res.json();
    if (res.ok) { modal.success({ title: data.message }); setReadOnly(true); }
    else modal.error({ title: 'Error', content: data.error || 'Failed to save transaction.' });
  };

  return (
    <div>
      <Card style={styles.headerCard}>
        <div style={{ marginBottom: constants.spacing.md }}>
          <span style={styles.sectionTitle}>Header</span>
        </div>
        <Form layout="vertical">
          <div style={styles.formRow}>
            <Form.Item label="Plant" style={styles.formItem}>
              <Select placeholder="Select Plant" style={{ width: '160px' }} value={selectedPlant}
                onChange={(val) => { setSelectedPlant(val); setSelectedWorkCentre(null); }}>
                {plants.map(p => <Option key={p.facility} value={p.facility}>{p.facility}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item label="Work Centre" style={styles.formItem}>
              <Select placeholder="Select Work Centre" style={{ width: '180px' }} value={selectedWorkCentre}
                disabled={!selectedPlant} onChange={setSelectedWorkCentre}>
                {filteredWCs.map(wc => <Option key={wc.work_center} value={wc.work_center}>{wc.work_center}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item label="Shift" style={styles.formItem}>
              <Select placeholder="Select Shift" style={{ width: '160px' }} value={selectedShift} onChange={setSelectedShift}>
                {shifts.map(s => <Option key={s.id} value={s.shift_name}>{s.shift_name}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item label="Date" style={styles.formItem}>
              <DatePicker style={{ width: '160px' }} value={selectedDate} onChange={setSelectedDate} />
            </Form.Item>
            <Form.Item style={styles.formItem}>
              <Button type="primary" onClick={handleShow}>SHOW</Button>
            </Form.Item>
            <Form.Item style={styles.formItem}>
              <Button style={{ borderColor: colors.secondaryText, color: colors.secondaryText }}
                onClick={() => setReadOnly(false)} disabled={!readOnly}>EDIT</Button>
            </Form.Item>
            <Form.Item style={styles.formItem}>
              <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} disabled={readOnly}>SAVE</Button>
            </Form.Item>
          </div>
        </Form>
      </Card>

      <Card style={styles.sectionCard}>
        <Collapse activeKey={activeKeys} onChange={setActiveKeys} ghost>

          <Panel header={<span style={styles.sectionTitle}>Downtime & OEE</span>} key="1">
            <SectionTable
              title="A. Machine Downtime Classification"
              columns={machineDowntimeColumns}
              data={machineDowntimeData}
              disabled={readOnly}
              onAdd={(row) => addRow(setMachineDowntimeData, machineDowntimeData, row)}
              inputFields={[
                { label: 'Module', key: 'module', type: 'select', options: modules },
                { label: 'Reason Code', key: 'reasonCode', type: 'select', options: downtimeReasonCodes },
                { label: 'Duration (min)', key: 'duration', type: 'input' },
              ]}
            />
            <SectionTable
              title="B. Machine Target Cycle Time"
              columns={targetCycleColumns}
              data={targetCycleData}
              disabled={readOnly}
              onAdd={(row) => addRow(setTargetCycleData, targetCycleData, row)}
              inputFields={[
                { label: 'Module', key: 'module', type: 'select', options: modules },
                { label: 'Target Cycle Time (Seconds)', key: 'targetCycle', type: 'input' },
              ]}
            />
            <SectionTable
              title="C. Resource Planning"
              columns={resourceColumns}
              data={resourceData}
              disabled={readOnly}
              onAdd={(row) => addRow(setResourceData, resourceData, row)}
              inputFields={[
                { label: 'Work Station', key: 'workStation', type: 'select', options: workStationOptions },
                { label: 'Resource Count', key: 'resourceCount', type: 'input' },
                { label: 'Resource Names', key: 'resourceNames', type: 'input' },
              ]}
            />
          </Panel>

          <Panel header={<span style={styles.sectionTitle}>Production Data</span>} key="2">
            <SectionTable
              title="Production Data"
              columns={productionColumns}
              data={productionData}
              disabled={readOnly}
              onAdd={(row) => addRow(setProductionData, productionData, row)}
              inputFields={[
                { label: 'Variant Type', key: 'variantType', type: 'select', options: variantOptions },
                { label: 'OK Count', key: 'okCount', type: 'input' },
                { label: 'NOK Count', key: 'nokCount', type: 'input' },
                { label: 'NOK Type', key: 'nokType', type: 'select', options: [{ value: 'Scrap', label: 'Scrap' }, { value: 'Rework', label: 'Rework' }, { value: 'Retest', label: 'Retest' }] },
                { label: 'NOK Reason Code', key: 'nokReasonCode', type: 'select', options: nokReasonCodes },
              ]}
            />
          </Panel>

          <Panel header={<span style={styles.sectionTitle}>Customer Complaint</span>} key="3">
            <SectionTable
              title="Customer Complaint"
              columns={complaintColumns}
              data={complaintData}
              disabled={readOnly}
              onAdd={(row) => addRow(setComplaintData, complaintData, row)}
              inputFields={[
                { label: 'Variant Type', key: 'variantType', type: 'select', options: variantOptions },
                { label: 'Reason', key: 'reason', type: 'input' },
                { label: 'Complaint Details', key: 'details', type: 'input' },
              ]}
            />
          </Panel>

        </Collapse>
      </Card>
    </div>
  );
}
