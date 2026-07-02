import React, { useState, useMemo } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { Card, Form, Select, Input, Button, Collapse, Table, Space } from 'antd';
import { PlusOutlined, SaveOutlined, EditOutlined } from '@ant-design/icons';
import colors from '../../theme/colors';
import constants from '../../theme/constants';

const { Option } = Select;
const { Panel } = Collapse;

const styles = {
  headerCard: {
    border: `1px solid ${colors.border}`,
    borderRadius: constants.borderRadius,
    marginBottom: constants.spacing.lg,
  },
  sectionCard: {
    border: `1px solid ${colors.border}`,
    borderRadius: constants.borderRadius,
  },
  formRow: {
    display: 'flex',
    gap: constants.spacing.md,
    flexWrap: 'wrap',
    alignItems: 'flex-end',
  },
  formItem: {
    marginBottom: 0,
    minWidth: '160px',
  },
  sectionTitle: {
    fontFamily: constants.fontFamily,
    fontWeight: '600',
    fontSize: '14px',
    color: colors.textPrimary,
  },
  subSectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: constants.spacing.md,
  },
  subSectionTitle: {
    fontFamily: constants.fontFamily,
    fontWeight: '600',
    fontSize: '13px',
    color: colors.secondaryText,
  },
  subSection: {
    marginBottom: constants.spacing.lg,
  },
  inputRow: {
    display: 'flex',
    gap: constants.spacing.md,
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    marginBottom: constants.spacing.md,
    paddingBottom: constants.spacing.md,
    borderBottom: `1px solid ${colors.border}`,
  },
  inputItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: constants.spacing.xs,
  },
  inputLabel: {
    fontFamily: constants.fontFamily,
    fontSize: '12px',
    color: colors.textSecondary,
  },
};

const machineDowntimeColumns = [
  { title: 'Module', dataIndex: 'module', key: 'module' },
  { title: 'Reason Code', dataIndex: 'reasonCode', key: 'reasonCode' },
  { title: 'Duration', dataIndex: 'duration', key: 'duration' },
];

const targetCycleColumns = [
  { title: 'Module', dataIndex: 'module', key: 'module' },
  { title: 'Target Cycle Time (Seconds)', dataIndex: 'targetCycle', key: 'targetCycle' },
];

const resourceColumns = [
  { title: 'Work Station', dataIndex: 'workStation', key: 'workStation' },
  { title: 'Duration', dataIndex: 'duration', key: 'duration' },
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

const accidentColumns = [
  { title: 'Variant Type', dataIndex: 'variantType', key: 'variantType' },
  { title: 'Reason', dataIndex: 'reason', key: 'reason' },
  { title: 'Accident Details', dataIndex: 'details', key: 'details' },
];

function SectionTable({ title, inputFields, columns, data, onAdd }) {
  const [rowInput, setRowInput] = useState({});

  const handleAdd = () => {
    if (onAdd) onAdd(rowInput);
    setRowInput({});
  };

  return (
    <div style={styles.subSection}>
      <div style={styles.subSectionHeader}>
        <span style={styles.subSectionTitle}>{title}</span>
        <Space>
          <Button size="small" icon={<EditOutlined />}>EDIT</Button>
          <Button size="small" type="primary" icon={<SaveOutlined />}>SAVE</Button>
        </Space>
      </div>
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
      <Table columns={columns} dataSource={data} pagination={false} size="small" scroll={{ x: true }} />
    </div>
  );
}

export default function TransactionPage() {
  const [activeKeys, setActiveKeys] = useState([]);
  const { machineLayout, reasonCodes, variants, shifts } = useAppData();

  const [selectedPlant, setSelectedPlant] = useState(null);
  const [selectedWorkCentre, setSelectedWorkCentre] = useState(null);

  const [machineDowntimeData, setMachineDowntimeData] = useState([]);
  const [targetCycleData, setTargetCycleData] = useState([]);
  const [resourceData, setResourceData] = useState([]);
  const [productionData, setProductionData] = useState([]);
  const [complaintData, setComplaintData] = useState([]);
  const [accidentData, setAccidentData] = useState([]);

  const plants = useMemo(() => [...new Set(machineLayout.map(m => m.plant))], [machineLayout]);
  const workCentres = useMemo(() => [...new Set(machineLayout.filter(m => m.plant === selectedPlant).map(m => m.workCentre))], [selectedPlant, machineLayout]);
  const workStations = useMemo(() => [...new Set(machineLayout.filter(m => m.workCentre === selectedWorkCentre).map(m => m.workStation))], [selectedWorkCentre, machineLayout]);
  const modules = useMemo(() => [...new Set(machineLayout.filter(m => m.workCentre === selectedWorkCentre).map(m => m.module))], [selectedWorkCentre, machineLayout]);
  const filteredShifts = useMemo(() => shifts.filter(s => s.shiftName), [shifts]);
  const downtimeReasonCodes = useMemo(() => reasonCodes.filter(r => r.category === 'Machine Downtime'), [reasonCodes]);
  const nokReasonCodes = useMemo(() => reasonCodes.filter(r => r.category === 'NOK'), [reasonCodes]);
  const variantOptions = useMemo(() => variants.map(v => ({ value: v.materialNumber, label: v.materialNumber })), [variants]);

  const addRow = (setter, existing, row) => {
    if (!row || Object.keys(row).length === 0) return;
    setter([...existing, { ...row, key: Date.now().toString() }]);
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
              <Select placeholder="Select Plant" style={{ width: '160px' }} onChange={(val) => { setSelectedPlant(val); setSelectedWorkCentre(null); }}>
                {plants.map(p => <Option key={p} value={p}>{p}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item label="Work Centre" style={styles.formItem}>
              <Select placeholder="Select Work Centre" style={{ width: '180px' }} onChange={(val) => setSelectedWorkCentre(val)}>
                {workCentres.map(wc => <Option key={wc} value={wc}>{wc}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item label="Shift" style={styles.formItem}>
              <Select placeholder="Select Shift" style={{ width: '160px' }}>
                {filteredShifts.map(s => <Option key={s.key} value={s.shiftName}>{s.shiftName}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item label="Date" style={styles.formItem}>
              <Select placeholder="Select Date" style={{ width: '160px' }}>
                <Option value="today">Today</Option>
              </Select>
            </Form.Item>
            <Form.Item style={styles.formItem}>
              <Button type="primary">SHOW</Button>
            </Form.Item>
            <Form.Item style={styles.formItem}>
              <Button style={{ borderColor: colors.secondaryText, color: colors.secondaryText }}>EDIT</Button>
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
              onAdd={(row) => addRow(setMachineDowntimeData, machineDowntimeData, row)}
              inputFields={[
                { label: 'Module', key: 'module', type: 'select', options: modules.map(m => ({ value: m, label: m })) },
                { label: 'Reason Code', key: 'reasonCode', type: 'select', options: downtimeReasonCodes.map(r => ({ value: r.reasonCode, label: r.reasonCode })) },
                { label: 'Duration', key: 'duration', type: 'select', options: filteredShifts.map(s => ({ value: s.duration, label: s.duration })) },
              ]}
            />
            <SectionTable
              title="B. Machine Target Cycle Time"
              columns={targetCycleColumns}
              data={targetCycleData}
              onAdd={(row) => addRow(setTargetCycleData, targetCycleData, row)}
              inputFields={[
                { label: 'Module', key: 'module', type: 'select', options: modules.map(m => ({ value: m, label: m })) },
                { label: 'Target Cycle Time (Seconds)', key: 'targetCycle', type: 'input' },
              ]}
            />
            <SectionTable
              title="C. Resource Planning"
              columns={resourceColumns}
              data={resourceData}
              onAdd={(row) => addRow(setResourceData, resourceData, row)}
              inputFields={[
                { label: 'Work Station', key: 'workStation', type: 'select', options: workStations.map(ws => ({ value: ws, label: ws })) },
                { label: 'Duration', key: 'duration', type: 'select', options: filteredShifts.map(s => ({ value: s.duration, label: s.duration })) },
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
              onAdd={(row) => addRow(setProductionData, productionData, row)}
              inputFields={[
                { label: 'Variant Type', key: 'variantType', type: 'select', options: variantOptions },
                { label: 'OK Count', key: 'okCount', type: 'input' },
                { label: 'NOK Count', key: 'nokCount', type: 'input' },
                { label: 'NOK Type', key: 'nokType', type: 'select', options: [{ value: 'Scrap', label: 'Scrap' }, { value: 'Rework', label: 'Rework' }, { value: 'Retest', label: 'Retest' }] },
                { label: 'NOK Reason Code', key: 'nokReasonCode', type: 'select', options: nokReasonCodes.map(r => ({ value: r.reasonCode, label: r.reasonCode })) },
              ]}
            />
          </Panel>

          <Panel header={<span style={styles.sectionTitle}>Customer Complaint & Accident</span>} key="3">
            <SectionTable
              title="Customer Complaint"
              columns={complaintColumns}
              data={complaintData}
              onAdd={(row) => addRow(setComplaintData, complaintData, row)}
              inputFields={[
                { label: 'Variant Type', key: 'variantType', type: 'select', options: variantOptions },
                { label: 'Reason', key: 'reason', type: 'input' },
                { label: 'Complaint Details', key: 'details', type: 'input' },
              ]}
            />
            <SectionTable
              title="Accident Data"
              columns={accidentColumns}
              data={accidentData}
              onAdd={(row) => addRow(setAccidentData, accidentData, row)}
              inputFields={[
                { label: 'Variant Type', key: 'variantType', type: 'select', options: variantOptions },
                { label: 'Reason', key: 'reason', type: 'input' },
                { label: 'Accident Details', key: 'details', type: 'input' },
              ]}
            />
          </Panel>

        </Collapse>
      </Card>
    </div>
  );
}
