import React, { useState } from 'react';
import { Card, Button, Table, Space, Input, Select } from 'antd';
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

export default function MasterDataScreen1() {
  const { machineLayout, setMachineLayout, reasonCodes, setReasonCodes } = useAppData();

  const [newMachine, setNewMachine] = useState({ plant: '', workCentre: '', workStation: '', module: '' });
  const [newReason, setNewReason] = useState({ reasonCode: '', description: '', category: '', reasonType: '' });

  const machineColumns = [
    { title: 'Plant', dataIndex: 'plant', key: 'plant' },
    { title: 'Work Centre', dataIndex: 'workCentre', key: 'workCentre' },
    { title: 'Work Station', dataIndex: 'workStation', key: 'workStation' },
    { title: 'Module', dataIndex: 'module', key: 'module' },
  ];

  const reasonColumns = [
    { title: 'Reason Code', dataIndex: 'reasonCode', key: 'reasonCode' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'Reason Type', dataIndex: 'reasonType', key: 'reasonType' },
  ];

  const handleAddMachine = () => {
    if (!newMachine.plant || !newMachine.workCentre || !newMachine.workStation || !newMachine.module) return;
    setMachineLayout([...machineLayout, { ...newMachine, key: Date.now().toString() }]);
    setNewMachine({ plant: '', workCentre: '', workStation: '', module: '' });
  };

  const handleAddReason = () => {
    if (!newReason.reasonCode || !newReason.description || !newReason.category) return;
    setReasonCodes([...reasonCodes, { ...newReason, key: Date.now().toString() }]);
    setNewReason({ reasonCode: '', description: '', category: '', reasonType: '' });
  };

  return (
    <div>

      {/* Section 1 — Machine Layout */}
      <Card style={styles.sectionCard}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>Section 1 — Machine Layout</span>
          <Button type="primary" icon={<SaveOutlined />}>SAVE</Button>
        </div>
        <div style={styles.inputRow}>
          <Input placeholder="Plant" value={newMachine.plant} onChange={(e) => setNewMachine({ ...newMachine, plant: e.target.value })} style={{ width: '140px' }} />
          <Input placeholder="Work Centre" value={newMachine.workCentre} onChange={(e) => setNewMachine({ ...newMachine, workCentre: e.target.value })} style={{ width: '140px' }} />
          <Input placeholder="Work Station" value={newMachine.workStation} onChange={(e) => setNewMachine({ ...newMachine, workStation: e.target.value })} style={{ width: '140px' }} />
          <Input placeholder="Module" value={newMachine.module} onChange={(e) => setNewMachine({ ...newMachine, module: e.target.value })} style={{ width: '140px' }} />
          <Button icon={<PlusOutlined />} onClick={handleAddMachine}>ADD</Button>
        </div>
        <Table columns={machineColumns} dataSource={machineLayout} pagination={false} size="small" />
      </Card>

      {/* Section 2 — Reason Code Definition */}
      <Card style={styles.sectionCard}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>Section 2 — Reason Code Definition</span>
          <Button type="primary" icon={<SaveOutlined />}>SAVE</Button>
        </div>
        <div style={styles.inputRow}>
          <Input placeholder="Reason Code" value={newReason.reasonCode} onChange={(e) => setNewReason({ ...newReason, reasonCode: e.target.value })} style={{ width: '140px' }} />
          <Input placeholder="Description" value={newReason.description} onChange={(e) => setNewReason({ ...newReason, description: e.target.value })} style={{ width: '160px' }} />
          <Select placeholder="Category" value={newReason.category || undefined} onChange={(val) => setNewReason({ ...newReason, category: val })} style={{ width: '180px' }}>
            <Option value="Machine Downtime">Machine Downtime</Option>
            <Option value="NOK">NOK</Option>
          </Select>
          <Select placeholder="Reason Type" value={newReason.reasonType || undefined} onChange={(val) => setNewReason({ ...newReason, reasonType: val })} style={{ width: '220px' }}>
            <Option value="Organizational Downtime (TO)">Organizational Downtime (TO)</Option>
            <Option value="Technical Downtime (TT)">Technical Downtime (TT)</Option>
            <Option value="Maintenance Time (TW)">Maintenance Time (TW)</Option>
            <Option value="-">- (NOK)</Option>
          </Select>
          <Button icon={<PlusOutlined />} onClick={handleAddReason}>ADD</Button>
        </div>
        <Table columns={reasonColumns} dataSource={reasonCodes} pagination={false} size="small" />
      </Card>

    </div>
  );
}
