import React, { useState } from 'react';
import { Card, Button, Table, Select, Input } from 'antd';
import { PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { useAppData } from '../../context/AppDataContext';
import colors from '../../theme/colors';
import constants from '../../theme/constants';

const { Option } = Select;

const styles = {
  sectionCard: {
    border: `1px solid ${colors.border}`,
    borderRadius: constants.borderRadius,
    marginBottom: constants.spacing.lg,
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: constants.spacing.md,
  },
  sectionTitle: {
    fontFamily: constants.fontFamily,
    fontWeight: '600',
    fontSize: '14px',
    color: colors.textPrimary,
  },
  inputRow: {
    display: 'flex',
    gap: constants.spacing.md,
    flexWrap: 'wrap',
    marginBottom: constants.spacing.md,
    paddingBottom: constants.spacing.md,
    borderBottom: `1px solid ${colors.border}`,
  },
};

export default function MasterDataScreen2() {
  const { variants, setVariants, shifts, setShifts, shiftPlanning, setShiftPlanning, machineLayout } = useAppData();

  const [newVariant, setNewVariant] = useState({ materialNumber: '', description: '', traceability: '' });
  const [newShift, setNewShift] = useState({ shiftName: '', duration: '', breakTime: '' });
  const [newPlanning, setNewPlanning] = useState({ shift: '', workCentre: '', active: '' });

  const uniqueWorkCentres = [...new Set(machineLayout.map(m => m.workCentre))];

  const variantColumns = [
    { title: 'Material Number', dataIndex: 'materialNumber', key: 'materialNumber' },
    { title: 'Material Description', dataIndex: 'description', key: 'description' },
    { title: 'Traceability Level', dataIndex: 'traceability', key: 'traceability' },
  ];

  const shiftColumns = [
    { title: 'Shift Name', dataIndex: 'shiftName', key: 'shiftName' },
    { title: 'Shift Duration', dataIndex: 'duration', key: 'duration' },
    { title: 'Break Time', dataIndex: 'breakTime', key: 'breakTime' },
  ];

  const planningColumns = [
    { title: 'Shift', dataIndex: 'shift', key: 'shift' },
    { title: 'Work Centre', dataIndex: 'workCentre', key: 'workCentre' },
    { title: 'Active', dataIndex: 'active', key: 'active' },
  ];

  const handleAddVariant = () => {
    if (!newVariant.materialNumber || !newVariant.description || !newVariant.traceability) return;
    setVariants([...variants, { ...newVariant, key: Date.now().toString() }]);
    setNewVariant({ materialNumber: '', description: '', traceability: '' });
  };

  const handleAddShift = () => {
    if (!newShift.shiftName || !newShift.duration || !newShift.breakTime) return;
    setShifts([...shifts, { ...newShift, key: Date.now().toString() }]);
    setNewShift({ shiftName: '', duration: '', breakTime: '' });
  };

  const handleAddPlanning = () => {
    if (!newPlanning.shift || !newPlanning.workCentre || !newPlanning.active) return;
    setShiftPlanning([...shiftPlanning, { ...newPlanning, key: Date.now().toString() }]);
    setNewPlanning({ shift: '', workCentre: '', active: '' });
  };

  return (
    <div>

      {/* Section 1 — Variant Definition */}
      <Card style={styles.sectionCard}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>Section 1 — Variant Definition</span>
          <Button type="primary" icon={<SaveOutlined />}>SAVE</Button>
        </div>
        <div style={styles.inputRow}>
          <Input placeholder="Material Number" value={newVariant.materialNumber} onChange={(e) => setNewVariant({ ...newVariant, materialNumber: e.target.value })} style={{ width: '160px' }} />
          <Input placeholder="Material Description" value={newVariant.description} onChange={(e) => setNewVariant({ ...newVariant, description: e.target.value })} style={{ width: '180px' }} />
          <Select placeholder="Traceability Level" value={newVariant.traceability || undefined} onChange={(val) => setNewVariant({ ...newVariant, traceability: val })} style={{ width: '180px' }}>
            <Option value="Serial">Serial</Option>
            <Option value="Batch">Batch</Option>
            <Option value="None">None</Option>
          </Select>
          <Button icon={<PlusOutlined />} onClick={handleAddVariant}>ADD</Button>
        </div>
        <Table columns={variantColumns} dataSource={variants} pagination={false} size="small" />
      </Card>

      {/* Section 2 — Shift Definition */}
      <Card style={styles.sectionCard}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>Section 2 — Shift Definition</span>
          <Button type="primary" icon={<SaveOutlined />}>SAVE</Button>
        </div>
        <div style={styles.inputRow}>
          <Input placeholder="Shift Name" value={newShift.shiftName} onChange={(e) => setNewShift({ ...newShift, shiftName: e.target.value })} style={{ width: '160px' }} />
          <Input placeholder="Shift Duration" value={newShift.duration} onChange={(e) => setNewShift({ ...newShift, duration: e.target.value })} style={{ width: '160px' }} />
          <Input placeholder="Break Time" value={newShift.breakTime} onChange={(e) => setNewShift({ ...newShift, breakTime: e.target.value })} style={{ width: '160px' }} />
          <Button icon={<PlusOutlined />} onClick={handleAddShift}>ADD</Button>
        </div>
        <Table columns={shiftColumns} dataSource={shifts} pagination={false} size="small" />
      </Card>

      {/* Section 3 — Shift Planning */}
      <Card style={styles.sectionCard}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>Section 3 — Shift Planning</span>
          <Button type="primary" icon={<SaveOutlined />}>SAVE</Button>
        </div>
        <div style={styles.inputRow}>
          <Select placeholder="Shift" value={newPlanning.shift || undefined} onChange={(val) => setNewPlanning({ ...newPlanning, shift: val })} style={{ width: '180px' }}>
            {shifts.map(s => <Option key={s.key} value={s.shiftName}>{s.shiftName}</Option>)}
          </Select>
          <Select placeholder="Work Centre" value={newPlanning.workCentre || undefined} onChange={(val) => setNewPlanning({ ...newPlanning, workCentre: val })} style={{ width: '160px' }}>
            {uniqueWorkCentres.map(wc => <Option key={wc} value={wc}>{wc}</Option>)}
          </Select>
          <Select placeholder="Active" value={newPlanning.active || undefined} onChange={(val) => setNewPlanning({ ...newPlanning, active: val })} style={{ width: '120px' }}>
            <Option value="Yes">Yes</Option>
            <Option value="No">No</Option>
          </Select>
          <Button icon={<PlusOutlined />} onClick={handleAddPlanning}>ADD</Button>
        </div>
        <Table columns={planningColumns} dataSource={shiftPlanning} pagination={false} size="small" />
      </Card>

    </div>
  );
}
