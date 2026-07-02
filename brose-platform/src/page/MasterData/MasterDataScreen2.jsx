import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Select, Input, App, TimePicker } from 'antd';
import { PlusOutlined, SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import colors from '../../theme/colors';
import constants from '../../theme/constants';

const { Option } = Select;
const API = 'http://localhost:8000/api';
const NAME_RE = /^[a-zA-Z0-9\s\-_]+$/;

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
  const { modal } = App.useApp();
  const token = localStorage.getItem('access_token');
  const authHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  const [products, setProducts] = useState([]);
  const [workCenters, setWorkCenters] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [shiftPlanning, setShiftPlanning] = useState([]);
  const [newVariant, setNewVariant] = useState({ materialNumber: '', description: '', traceability: [] });
  const [newShift, setNewShift] = useState({ shiftName: '', shiftStart: null, shiftEnd: null, breakStart: null, breakEnd: null });
  const [newPlanning, setNewPlanning] = useState({ shift: '', workCentre: '', active: '' });

  const h = { headers: { 'Authorization': `Bearer ${token}` } };

  const fetchProducts = () => {
    fetch(`${API}/products/`, h).then(r => r.json()).then(d => setProducts(Array.isArray(d) ? d : []));
    fetch(`${API}/work-centers/`, h).then(r => r.json()).then(d => setWorkCenters(Array.isArray(d) ? d : []));
  };

  const fetchShifts = () => {
    fetch(`${API}/shifts/`, h).then(r => r.json()).then(d => setShifts(Array.isArray(d) ? d : []));
  };

  useEffect(() => { fetchProducts(); fetchShifts(); }, []);

  const handleAddVariant = async () => {
    if (!newVariant.materialNumber.trim()) { modal.error({ title: 'Error', content: 'Material Number is required.' }); return; }
    if (!NAME_RE.test(newVariant.materialNumber.trim())) { modal.error({ title: 'Error', content: 'Material Number cannot contain special characters.' }); return; }
    if (!newVariant.description.trim()) { modal.error({ title: 'Error', content: 'Description is required.' }); return; }
    if (!NAME_RE.test(newVariant.description.trim())) { modal.error({ title: 'Error', content: 'Description cannot contain special characters.' }); return; }
    if (!newVariant.traceability || newVariant.traceability.length === 0) { modal.error({ title: 'Error', content: 'Please select at least one Traceability Level.' }); return; }
    const res = await fetch(`${API}/products/`, {
      method: 'POST', headers: authHeaders,
      body: JSON.stringify({ product_no: newVariant.materialNumber.trim(), description: newVariant.description.trim(), traceability: newVariant.traceability }),
    });
    const data = await res.json();
    if (res.ok) { fetchProducts(); setNewVariant({ materialNumber: '', description: '', traceability: [] }); modal.success({ title: data.message }); }
    else modal.error({ title: 'Error', content: data.error || 'Something went wrong.' });
  };

  const handleDeleteVariant = (id, product_no) => {
    modal.confirm({
      title: 'Confirm Delete',
      content: `Delete product "${product_no}"?`,
      okText: 'Delete', okType: 'danger', cancelText: 'Cancel',
      onOk: async () => {
        const res = await fetch(`${API}/products/`, { method: 'DELETE', headers: authHeaders, body: JSON.stringify({ id }) });
        const data = await res.json();
        if (res.ok) { fetchProducts(); modal.success({ title: data.message }); }
        else modal.error({ title: 'Cannot Delete', content: data.error || 'Something went wrong.' });
      },
    });
  };

  const variantColumns = [
    { title: 'Material Number', dataIndex: 'product_no', key: 'product_no' },
    { title: 'Material Description', dataIndex: 'description', key: 'description' },
    { title: 'Traceability Level', dataIndex: 'traceability', key: 'traceability' },
    {
      title: 'Action', key: 'action',
      render: (_, r) => (
        <Button type="link" danger style={{ padding: 0 }} onClick={() => handleDeleteVariant(r.id, r.product_no)}>Delete</Button>
      ),
    },
  ];

  const handleAddShift = async () => {
    if (!newShift.shiftName.trim()) { modal.error({ title: 'Error', content: 'Shift Name is required.' }); return; }
    if (!/^[a-zA-Z\s]+$/.test(newShift.shiftName.trim())) { modal.error({ title: 'Error', content: 'Shift Name cannot contain special characters.' }); return; }
    if (!newShift.shiftStart || !newShift.shiftEnd) { modal.error({ title: 'Error', content: 'Shift start and end time are required.' }); return; }
    if (!newShift.shiftEnd.isAfter(newShift.shiftStart)) { modal.error({ title: 'Invalid Timing', content: 'Shift end time must be after start time.' }); return; }
    if (!newShift.breakStart || !newShift.breakEnd) { modal.error({ title: 'Error', content: 'Break start and end time are required.' }); return; }
    if (!newShift.breakEnd.isAfter(newShift.breakStart)) { modal.error({ title: 'Invalid Timing', content: 'Break end time must be after break start time.' }); return; }
    if (!newShift.breakStart.isAfter(newShift.shiftStart) || !newShift.breakEnd.isBefore(newShift.shiftEnd)) {
      modal.error({ title: 'Invalid Timing', content: 'Break time must be within the shift duration.' }); return;
    }
    const fmt = 'h:mm A';
    const duration = `${newShift.shiftStart.format(fmt)} - ${newShift.shiftEnd.format(fmt)}`;
    const break_time = `${newShift.breakStart.format(fmt)} - ${newShift.breakEnd.format(fmt)}`;
    const res = await fetch(`${API}/shifts/`, {
      method: 'POST', headers: authHeaders,
      body: JSON.stringify({ shift_name: newShift.shiftName.trim(), duration, break_time }),
    });
    const data = await res.json();
    if (res.ok) { fetchShifts(); setNewShift({ shiftName: '', shiftStart: null, shiftEnd: null, breakStart: null, breakEnd: null }); modal.success({ title: data.message }); }
    else modal.error({ title: 'Error', content: data.error || 'Something went wrong.' });
  };

  const handleDeleteShift = (id, shift_name) => {
    modal.confirm({
      title: 'Confirm Delete',
      content: `Delete shift "${shift_name}"?`,
      okText: 'Delete', okType: 'danger', cancelText: 'Cancel',
      onOk: async () => {
        const res = await fetch(`${API}/shifts/`, { method: 'DELETE', headers: authHeaders, body: JSON.stringify({ id }) });
        const data = await res.json();
        if (res.ok) { fetchShifts(); modal.success({ title: data.message }); }
        else modal.error({ title: 'Cannot Delete', content: data.error || 'Something went wrong.' });
      },
    });
  };

  const shiftColumns = [
    { title: 'Shift Name', dataIndex: 'shift_name', key: 'shift_name' },
    { title: 'Shift Duration', dataIndex: 'duration', key: 'duration' },
    { title: 'Break Time', dataIndex: 'break_time', key: 'break_time' },
    {
      title: 'Action', key: 'action',
      render: (_, r) => (
        <Button type="link" danger style={{ padding: 0 }} onClick={() => handleDeleteShift(r.id, r.shift_name)}>Delete</Button>
      ),
    },
  ];

  const planningColumns = [
    { title: 'Shift', dataIndex: 'shift', key: 'shift' },
    { title: 'Work Centre', dataIndex: 'workCentre', key: 'workCentre' },
    { title: 'Active', dataIndex: 'active', key: 'active' },
  ];

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
          <Select mode="multiple" placeholder="Traceability Level" value={newVariant.traceability} onChange={(val) => setNewVariant({ ...newVariant, traceability: val })} style={{ width: '220px' }}>
            <Option value="Serial">Serial</Option>
            <Option value="Batch">Batch</Option>
            <Option value="None">None</Option>
          </Select>
          <Button icon={<PlusOutlined />} onClick={handleAddVariant}>ADD</Button>
        </div>
        <Table columns={variantColumns} dataSource={products} rowKey="id" pagination={false} size="small" />
      </Card>

      {/* Section 2 — Shift Definition */}
      <Card style={styles.sectionCard}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>Section 2 — Shift Definition</span>
          <Button type="primary" icon={<SaveOutlined />}>SAVE</Button>
        </div>
        <div style={styles.inputRow}>
          <Input
            placeholder="Shift Name"
            value={newShift.shiftName}
            onChange={(e) => { if (/^[a-zA-Z\s]*$/.test(e.target.value)) setNewShift({ ...newShift, shiftName: e.target.value }); }}
            style={{ width: '160px' }}
          />
          <TimePicker
            placeholder="Shift Start"
            use12Hours format="h:mm A"
            value={newShift.shiftStart}
            onChange={(val) => setNewShift({ ...newShift, shiftStart: val, shiftEnd: null })}
            style={{ width: '130px' }}
          />
          <span style={{ alignSelf: 'center', color: colors.textPrimary }}>—</span>
          <TimePicker
            placeholder="Shift End"
            use12Hours format="h:mm A"
            value={newShift.shiftEnd}
            disabledTime={() => newShift.shiftStart ? {
              disabledHours: () => Array.from({ length: newShift.shiftStart.hour() }, (_, i) => i),
            } : {}}
            onChange={(val) => setNewShift({ ...newShift, shiftEnd: val })}
            style={{ width: '130px' }}
          />
          <TimePicker
            placeholder="Break Start"
            use12Hours format="h:mm A"
            value={newShift.breakStart}
            onChange={(val) => setNewShift({ ...newShift, breakStart: val, breakEnd: null })}
            style={{ width: '130px' }}
          />
          <span style={{ alignSelf: 'center', color: colors.textPrimary }}>—</span>
          <TimePicker
            placeholder="Break End"
            use12Hours format="h:mm A"
            value={newShift.breakEnd}
            onChange={(val) => setNewShift({ ...newShift, breakEnd: val })}
            style={{ width: '130px' }}
          />
          <Button icon={<PlusOutlined />} onClick={handleAddShift}>ADD</Button>
        </div>
        <Table columns={shiftColumns} dataSource={shifts} rowKey="id" pagination={false} size="small" />
      </Card>

      {/* Section 3 — Shift Planning */}
      <Card style={styles.sectionCard}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>Section 3 — Shift Planning</span>
          <Button type="primary" icon={<SaveOutlined />}>SAVE</Button>
        </div>
        <div style={styles.inputRow}>
          <Select placeholder="Shift" value={newPlanning.shift || undefined} onChange={(val) => setNewPlanning({ ...newPlanning, shift: val })} style={{ width: '180px' }}>
            {shifts.map(s => <Option key={s.id} value={s.shift_name}>{s.shift_name}</Option>)}
          </Select>
          <Select placeholder="Work Centre" value={newPlanning.workCentre || undefined} onChange={(val) => setNewPlanning({ ...newPlanning, workCentre: val })} style={{ width: '160px' }}>
            {workCenters.map(wc => <Option key={wc.work_center} value={wc.work_center}>{wc.work_center}</Option>)}
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
