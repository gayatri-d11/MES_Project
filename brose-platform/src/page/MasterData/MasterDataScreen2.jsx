import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Select, Input, App, TimePicker, Switch } from 'antd';
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
  const [showInactive, setShowInactive] = useState(false);
  const [workCenters, setWorkCenters] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [showInactiveShifts, setShowInactiveShifts] = useState(false);
  const [shiftPlanning, setShiftPlanning] = useState([]);
  const [showInactivePlanning, setShowInactivePlanning] = useState(false);
  const [newVariant, setNewVariant] = useState({ materialNumber: '', description: '', traceability: [] });
  const [newShift, setNewShift] = useState({ shiftName: '', shiftStart: null, shiftEnd: null, breakStart: null, breakEnd: null });
  const [newPlanning, setNewPlanning] = useState({ shift: '', workCentre: '', active: '' });

  const h = { headers: { 'Authorization': `Bearer ${token}` } };

  const fetchProducts = () => {
    const url = showInactive ? `${API}/products/?all=true` : `${API}/products/`;
    fetch(url, h).then(r => r.json()).then(d => setProducts(Array.isArray(d) ? d : []));
    fetch(`${API}/work-centers/`, h).then(r => r.json()).then(d => setWorkCenters(Array.isArray(d) ? d : []));
  };

  const fetchShifts = () => {
    const url = showInactiveShifts ? `${API}/shifts/?all=true` : `${API}/shifts/`;
    fetch(url, h).then(r => r.json()).then(d => setShifts(Array.isArray(d) ? d : []));
  };

  const fetchShiftPlanning = () => {
    const url = showInactivePlanning ? `${API}/shift-planning/?all=true` : `${API}/shift-planning/`;
    fetch(url, h).then(r => r.json()).then(d => setShiftPlanning(Array.isArray(d) ? d : []));
  };

  useEffect(() => { fetchProducts(); fetchShifts(); fetchShiftPlanning(); }, [showInactive, showInactiveShifts, showInactivePlanning]);

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

  const handleToggleVariant = (id, product_no, is_active) => {
    modal.confirm({
      title: is_active ? 'Deactivate this variant?' : 'Activate this variant?',
      content: `"${product_no}" will be ${is_active ? 'deactivated' : 'activated'}.`,
      okText: is_active ? 'Deactivate' : 'Activate',
      okType: is_active ? 'danger' : 'primary',
      cancelText: 'Cancel',
      onOk: async () => {
        const res = await fetch(`${API}/products/`, { method: 'PATCH', headers: authHeaders, body: JSON.stringify({ id }) });
        const data = await res.json();
        if (res.ok) { fetchProducts(); modal.success({ title: data.message }); }
        else modal.error({ title: 'Error', content: data.error || 'Something went wrong.' });
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
        <Button
          type="link"
          style={{ padding: 0, color: r.is_active ? '#ff4d4f' : '#52c41a' }}
          onClick={() => handleToggleVariant(r.id, r.product_no, r.is_active)}
        >
          {r.is_active ? 'Deactivate' : 'Activate'}
        </Button>
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

  const handleToggleShift = (id, shift_name, is_active) => {
    modal.confirm({
      title: is_active ? 'Deactivate this shift?' : 'Activate this shift?',
      content: `"${shift_name}" will be ${is_active ? 'deactivated' : 'activated'}.`,
      okText: is_active ? 'Deactivate' : 'Activate',
      okType: is_active ? 'danger' : 'primary',
      cancelText: 'Cancel',
      onOk: async () => {
        const method = is_active ? 'DELETE' : 'PATCH';
        const res = await fetch(`${API}/shifts/`, { method, headers: authHeaders, body: JSON.stringify({ id }) });
        const data = await res.json();
        if (res.ok) { fetchShifts(); modal.success({ title: data.message }); }
        else modal.error({ title: 'Error', content: data.error || 'Something went wrong.' });
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
        <Button
          type="link"
          style={{ padding: 0, color: r.is_active ? '#ff4d4f' : '#52c41a' }}
          onClick={() => handleToggleShift(r.id, r.shift_name, r.is_active)}
        >
          {r.is_active ? 'Deactivate' : 'Activate'}
        </Button>
      ),
    },
  ];

  const planningColumns = [
    { title: 'Shift', dataIndex: 'shift_name', key: 'shift_name' },
    { title: 'Work Centre', dataIndex: 'work_center_name', key: 'work_center_name' },
    {
      title: 'Active', dataIndex: 'active', key: 'active',
      render: (val) => val ? 'Yes' : 'No',
    },
    {
      title: 'Action', key: 'action',
      render: (_, r) => (
        <Button
          type="link"
          style={{ padding: 0, color: r.is_active ? '#ff4d4f' : '#52c41a' }}
          onClick={() => handleTogglePlanning(r.id, r.shift_name, r.work_center_name, r.is_active)}
        >
          {r.is_active ? 'Deactivate' : 'Activate'}
        </Button>
      ),
    },
  ];

  const handleAddPlanning = async () => {
    if (!newPlanning.shift || !newPlanning.workCentre || !newPlanning.active) {
      modal.error({ title: 'Error', content: 'Please fill in all fields.' }); return;
    }
    const res = await fetch(`${API}/shift-planning/`, {
      method: 'POST', headers: authHeaders,
      body: JSON.stringify({ shift: newPlanning.shift, work_center: newPlanning.workCentre, active: newPlanning.active }),
    });
    const data = await res.json();
    if (res.ok) { fetchShiftPlanning(); setNewPlanning({ shift: '', workCentre: '', active: '' }); modal.success({ title: data.message }); }
    else modal.error({ title: 'Error', content: data.error || 'Something went wrong.' });
  };

  const handleTogglePlanning = (id, shift_name, work_center_name, is_active) => {
    modal.confirm({
      title: is_active ? 'Deactivate this shift planning?' : 'Activate this shift planning?',
      content: `"${shift_name} — ${work_center_name}" will be ${is_active ? 'deactivated' : 'activated'}.`,
      okText: is_active ? 'Deactivate' : 'Activate',
      okType: is_active ? 'danger' : 'primary',
      cancelText: 'Cancel',
      onOk: async () => {
        const res = await fetch(`${API}/shift-planning/`, { method: 'DELETE', headers: authHeaders, body: JSON.stringify({ id }) });
        const data = await res.json();
        if (res.ok) { fetchShiftPlanning(); modal.success({ title: data.message }); }
        else modal.error({ title: 'Error', content: data.error || 'Something went wrong.' });
      },
    });
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
        <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Switch size="small" checked={showInactive} onChange={setShowInactive} />
          <span style={{ fontSize: '13px', color: colors.textPrimary }}>Show Deactivated</span>
        </div>
        <style>{`.row-inactive td { opacity: 0.45; }`}</style>
        <Table columns={variantColumns} dataSource={products} rowKey="id" pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} items` }} size="small"
          rowClassName={(r) => !r.is_active ? 'row-inactive' : ''}
        />
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
        <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Switch size="small" checked={showInactiveShifts} onChange={setShowInactiveShifts} />
          <span style={{ fontSize: '13px', color: colors.textPrimary }}>Show Deactivated</span>
        </div>
        <style>{`.row-inactive-shift td { opacity: 0.45; }`}</style>
        <Table columns={shiftColumns} dataSource={shifts} rowKey="id" pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} items` }} size="small"
          rowClassName={(r) => !r.is_active ? 'row-inactive-shift' : ''}
        />
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
        <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Switch size="small" checked={showInactivePlanning} onChange={setShowInactivePlanning} />
          <span style={{ fontSize: '13px', color: colors.textPrimary }}>Show Deactivated</span>
        </div>
        <style>{`.row-inactive-planning td { opacity: 0.45; }`}</style>
        <Table columns={planningColumns} dataSource={shiftPlanning} rowKey="id"
          pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} items` }} size="small"
          rowClassName={(r) => !r.is_active ? 'row-inactive-planning' : ''}
        />
      </Card>

    </div>
  );
}
