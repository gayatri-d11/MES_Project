import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Input, Select, App, Modal, Tabs, Switch } from 'antd';
import { PlusOutlined, SaveOutlined, SettingOutlined, EditOutlined } from '@ant-design/icons';
import colors from '../../theme/colors';
import constants from '../../theme/constants';
import apiFetch from '../../utils/apiFetch';
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

export default function MasterDataScreen1() {
  const { modal } = App.useApp();
  const token = localStorage.getItem('access_token');
  const authHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  const [plants, setPlants] = useState([]);
  const [workCenters, setWorkCenters] = useState([]);
  const [workstations, setWorkstations] = useState([]);
  const [machineLayout, setMachineLayout] = useState([]);
  const [showInactiveMachines, setShowInactiveMachines] = useState(false);
  const [reasonCodes, setReasonCodes] = useState([]);
  const [reasonTypes, setReasonTypes] = useState([]);

  const [newMachine, setNewMachine] = useState({ plant: '', workCentre: '', workStation: '', module: '' });
  const [newReason, setNewReason] = useState({ reasonCode: '', description: '', category: '', reasonTypeId: null, reasonTypeText: '' });

  const [manageOpen, setManageOpen] = useState(false);
  const [newPlant, setNewPlant] = useState('');
  const [newWC, setNewWC] = useState({ work_center: '', facility: '' });
  const [newWS, setNewWS] = useState({ resource_name: '', work_center: '' });
  const [showInactivePlants, setShowInactivePlants] = useState(false);
  const [showInactiveWCs, setShowInactiveWCs] = useState(false);
  const [showInactiveWSs, setShowInactiveWSs] = useState(false);
  const [editReason, setEditReason] = useState(null);

  const fetchAll = () => {
    apiFetch(`/plants/${showInactivePlants ? '?all=true' : ''}`).then(r => r.json()).then(d => setPlants(Array.isArray(d) ? d : []));
    apiFetch(`/work-centers/${showInactiveWCs ? '?all=true' : ''}`).then(r => r.json()).then(d => setWorkCenters(Array.isArray(d) ? d : []));
    apiFetch(`/workstations/${showInactiveWSs ? '?all=true' : ''}`).then(r => r.json()).then(d => setWorkstations(Array.isArray(d) ? d : []));
    apiFetch(showInactiveMachines ? `/machines/?all=true` : `/machines/`).then(r => r.json()).then(d => {
      if (Array.isArray(d)) {
        setMachineLayout(d.map(m => ({
          key: String(m.id), id: m.id,
          plant: m.facility_name, workCentre: m.work_center_name,
          workStation: m.workstation_name, module: m.equipment,
          is_active: m.is_active,
        })));
      }
    });
    apiFetch(`/reason-codes/`).then(r => r.json()).then(d => setReasonCodes(Array.isArray(d) ? d : []));
    apiFetch(`/reason-types/`).then(r => r.json()).then(d => setReasonTypes(Array.isArray(d) ? d : []));
  };

  useEffect(() => { fetchAll(); }, [showInactiveMachines, showInactivePlants, showInactiveWCs, showInactiveWSs]);

  const filteredWCs = workCenters.filter(w => w.facility === newMachine.plant && w.is_active);
  const filteredWSs = workstations.filter(w => w.work_center_name === newMachine.workCentre && w.is_active);

  const validateName = (name, label) => {
    if (!name.trim()) { modal.error({ title: 'Error', content: `${label} is required.` }); return false; }
    if (!NAME_RE.test(name.trim())) { modal.error({ title: 'Error', content: `${label} cannot contain special characters.` }); return false; }
    return true;
  };

  const handleToggleMachine = (id, name, is_active) => {
    modal.confirm({
      title: is_active ? 'Deactivate this machine?' : 'Activate this machine?',
      content: `"${name}" will be ${is_active ? 'deactivated' : 'activated'}.`,
      okText: is_active ? 'Deactivate' : 'Activate',
      okType: is_active ? 'danger' : 'primary',
      cancelText: 'Cancel',
      onOk: async () => {
        const method = is_active ? 'DELETE' : 'PATCH';
        const res = await apiFetch(`/machines/`, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
        const data = await res.json();
        if (res.ok) { fetchAll(); modal.success({ title: data.message }); }
        else modal.error({ title: 'Error', content: data.error || 'Something went wrong.' });
      },
    });
  };

  const handleAddMachine = async () => {
    if (!newMachine.plant) { modal.error({ title: 'Error', content: 'Please select a Plant.' }); return; }
    if (!newMachine.workCentre) { modal.error({ title: 'Error', content: 'Please select a Work Centre.' }); return; }
    if (!newMachine.workStation) { modal.error({ title: 'Error', content: 'Please select a Work Station.' }); return; }
    if (!validateName(newMachine.module, 'Module name')) return;
    const ws = workstations.find(w => w.resource_name === newMachine.workStation);
    if (!ws) { modal.error({ title: 'Error', content: 'Workstation not found.' }); return; }
    const res = await apiFetch(`/machines/`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ equipment: newMachine.module.trim(), resource_id: ws.id }),
    });
    const data = await res.json();
    if (res.ok) { fetchAll(); setNewMachine({ plant: '', workCentre: '', workStation: '', module: '' }); modal.success({ title: data.message }); }
    else modal.error({ title: 'Error', content: data.error || 'Something went wrong.' });
  };

  const handleAddReason = async () => {
    if (!newReason.reasonCode.trim()) { modal.error({ title: 'Error', content: 'Reason Code is required.' }); return; }
    if (!/^[a-zA-Z0-9\-_]+$/.test(newReason.reasonCode.trim())) { modal.error({ title: 'Error', content: 'Reason Code can only contain letters, numbers, hyphens and underscores.' }); return; }
    if (!newReason.description.trim()) { modal.error({ title: 'Error', content: 'Description is required.' }); return; }
    if (!newReason.category) { modal.error({ title: 'Error', content: 'Category is required.' }); return; }
    if (!newReason.reasonTypeId) { modal.error({ title: 'Error', content: 'Reason Type is required.' }); return; }
    const res = await apiFetch(`/reason-codes/`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reason_code: newReason.reasonCode.trim(),
        description: newReason.description.trim(),
        category: newReason.category,
        reason_type_text: newReason.reasonTypeText,
        reason_type_id: newReason.reasonTypeId,
      }),
    });
    const data = await res.json();
    if (res.ok) { fetchAll(); setNewReason({ reasonCode: '', description: '', category: '', reasonTypeId: null, reasonTypeText: '' }); modal.success({ title: data.message }); }
    else modal.error({ title: 'Error', content: data.error || 'Something went wrong.' });
  };

  const handleEditReason = async () => {
    if (!editReason.description.trim()) { modal.error({ title: 'Error', content: 'Description is required.' }); return; }
    if (!editReason.category) { modal.error({ title: 'Error', content: 'Category is required.' }); return; }
    if (!editReason.reasonTypeId) { modal.error({ title: 'Error', content: 'Reason Type is required.' }); return; }
    const res = await apiFetch(`/reason-codes/`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason_code: editReason.reason_code, description: editReason.description.trim(), category: editReason.category, reason_type_text: editReason.reasonTypeText, reason_type_id: editReason.reasonTypeId }),
    });
    const data = await res.json();
    if (res.ok) { fetchAll(); setEditReason(null); modal.success({ title: data.message }); }
    else modal.error({ title: 'Error', content: data.error || 'Something went wrong.' });
  };

  const handleAddPlant = async () => {
    if (!validateName(newPlant, 'Plant name')) return;
    const res = await apiFetch(`/plants/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ facility: newPlant.trim() }) });
    const data = await res.json();
    if (res.ok) { fetchAll(); setNewPlant(''); modal.success({ title: data.message }); }
    else modal.error({ title: 'Error', content: data.error || 'Something went wrong.' });
  };

  const handleAddWC = async () => {
    if (!validateName(newWC.work_center, 'Work Center name')) return;
    if (!newWC.facility) { modal.error({ title: 'Error', content: 'Please select a Plant.' }); return; }
    const res = await apiFetch(`/work-centers/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newWC) });
    const data = await res.json();
    if (res.ok) { fetchAll(); setNewWC({ work_center: '', facility: '' }); modal.success({ title: data.message }); }
    else modal.error({ title: 'Error', content: data.error || 'Something went wrong.' });
  };

  const handleAddWS = async () => {
    if (!validateName(newWS.resource_name, 'Workstation name')) return;
    if (!newWS.work_center) { modal.error({ title: 'Error', content: 'Please select a Work Center.' }); return; }
    const res = await apiFetch(`/workstations/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newWS) });
    const data = await res.json();
    if (res.ok) { fetchAll(); setNewWS({ resource_name: '', work_center: '' }); modal.success({ title: data.message }); }
    else modal.error({ title: 'Error', content: data.error || 'Something went wrong.' });
  };

  const machineColumns = [
    { title: 'Plant', dataIndex: 'plant', key: 'plant' },
    { title: 'Work Centre', dataIndex: 'workCentre', key: 'workCentre' },
    { title: 'Work Station', dataIndex: 'workStation', key: 'workStation' },
    { title: 'Module', dataIndex: 'module', key: 'module' },
    {
      title: 'Action', key: 'action',
      render: (_, r) => (
        <Button
          type="link"
          style={{ padding: 0, color: r.is_active ? '#ff4d4f' : '#52c41a' }}
          onClick={() => handleToggleMachine(r.id, r.module, r.is_active)}
        >
          {r.is_active ? 'Deactivate' : 'Activate'}
        </Button>
      ),
    },
  ];

  const reasonColumns = [
    { title: 'Reason Code', dataIndex: 'reason_code', key: 'reason_code' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'Reason Type', dataIndex: 'reason_type_text', key: 'reason_type_text' },
    {
      title: 'Action', key: 'action',
      render: (_, r) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button type="link" icon={<EditOutlined />} style={{ padding: 0 }}
            onClick={() => setEditReason({ reason_code: r.reason_code, description: r.description || '', category: r.category || '', reasonTypeId: r.reason_type_id || null, reasonTypeText: r.reason_type_text || '' })}>
            Edit
          </Button>
          <Button type="link" style={{ padding: 0, color: '#ff4d4f' }}
            onClick={() => {
              modal.confirm({
                title: 'Deactivate this reason code?',
                content: `"${r.reason_code}" will be deactivated.`,
                okText: 'Deactivate', okType: 'danger', cancelText: 'Cancel',
                onOk: async () => {
                  const res = await apiFetch(`/reason-codes/`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason_code: r.reason_code }) });
                  const data = await res.json();
                  if (res.ok) { fetchAll(); modal.success({ title: data.message }); }
                  else modal.error({ title: 'Error', content: data.error || 'Something went wrong.' });
                },
              });
            }}>
            Deactivate
          </Button>
        </div>
      ),
    },
  ];

  const handleTogglePlant = (facility, is_active) => {
    modal.confirm({
      title: is_active ? 'Deactivate this plant?' : 'Activate this plant?',
      content: is_active
        ? `"${facility}" and all its Work Centers, Workstations, and Machines will be deactivated.`
        : `"${facility}" will be activated. Work Centers and Workstations must be activated separately.`,
      okText: is_active ? 'Deactivate' : 'Activate',
      okType: is_active ? 'danger' : 'primary',
      cancelText: 'Cancel',
      onOk: async () => {
        const res = await apiFetch(`/plants/`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ facility }) });
        const data = await res.json();
        if (res.ok) { fetchAll(); modal.success({ title: data.message }); }
        else modal.error({ title: 'Error', content: data.error || 'Something went wrong.' });
      },
    });
  };

  const handleToggleWC = (work_center, is_active) => {
    modal.confirm({
      title: is_active ? 'Deactivate this work center?' : 'Activate this work center?',
      content: is_active
        ? `"${work_center}" and all its Workstations and Machines will be deactivated.`
        : `"${work_center}" will be activated. Workstations must be activated separately.`,
      okText: is_active ? 'Deactivate' : 'Activate',
      okType: is_active ? 'danger' : 'primary',
      cancelText: 'Cancel',
      onOk: async () => {
        const res = await apiFetch(`/work-centers/`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ work_center }) });
        const data = await res.json();
        if (res.ok) { fetchAll(); modal.success({ title: data.message }); }
        else modal.error({ title: 'Error', content: data.error || 'Something went wrong.' });
      },
    });
  };

  const handleToggleWS = (id, name, is_active) => {
    modal.confirm({
      title: is_active ? 'Deactivate this workstation?' : 'Activate this workstation?',
      content: `"${name}" will be ${is_active ? 'deactivated' : 'activated'}.`,
      okText: is_active ? 'Deactivate' : 'Activate',
      okType: is_active ? 'danger' : 'primary',
      cancelText: 'Cancel',
      onOk: async () => {
        const res = await apiFetch(`/workstations/`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
        const data = await res.json();
        if (res.ok) { fetchAll(); modal.success({ title: data.message }); }
        else modal.error({ title: 'Error', content: data.error || 'Something went wrong.' });
      },
    });
  };

  const plantColumns = [
    { title: 'Plant', dataIndex: 'facility', key: 'facility' },
    { title: 'Action', key: 'action', render: (_, r) => (
      <Button type="link" style={{ padding: 0, color: r.is_active ? '#ff4d4f' : '#52c41a' }}
        onClick={() => handleTogglePlant(r.facility, r.is_active)}>
        {r.is_active ? 'Deactivate' : 'Activate'}
      </Button>
    )},
  ];

  const wcColumns = [
    { title: 'Plant', dataIndex: 'facility', key: 'facility' },
    { title: 'Work Center', dataIndex: 'work_center', key: 'work_center' },
    { title: 'Action', key: 'action', render: (_, r) => (
      <Button type="link" style={{ padding: 0, color: r.is_active ? '#ff4d4f' : '#52c41a' }}
        onClick={() => handleToggleWC(r.work_center, r.is_active)}>
        {r.is_active ? 'Deactivate' : 'Activate'}
      </Button>
    )},
  ];

  const wsColumns = [
    { title: 'Plant', dataIndex: 'facility_name', key: 'facility_name' },
    { title: 'Work Center', dataIndex: 'work_center_name', key: 'work_center_name' },
    { title: 'Workstation', dataIndex: 'resource_name', key: 'resource_name' },
    { title: 'Action', key: 'action', render: (_, r) => (
      <Button type="link" style={{ padding: 0, color: r.is_active ? '#ff4d4f' : '#52c41a' }}
        onClick={() => handleToggleWS(r.id, r.resource_name, r.is_active)}>
        {r.is_active ? 'Deactivate' : 'Activate'}
      </Button>
    )},
  ];

  return (
    <div>

      {/* Section 1 — Machine Layout */}
      <Card style={styles.sectionCard}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>Section 1 — Machine Layout</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button icon={<SettingOutlined />} onClick={() => setManageOpen(true)}>Manage</Button>
            <Button type="primary" icon={<SaveOutlined />}>SAVE</Button>
          </div>
        </div>
        <div style={styles.inputRow}>
          <Select
            placeholder="Plant"
            value={newMachine.plant || undefined}
            onChange={val => setNewMachine({ plant: val, workCentre: '', workStation: '', module: '' })}
            style={{ width: '140px' }}
            options={plants.filter(p => p.is_active).map(p => ({ label: p.facility, value: p.facility }))}
          />
          <Select
            placeholder="Work Centre"
            value={newMachine.workCentre || undefined}
            onChange={val => setNewMachine({ ...newMachine, workCentre: val, workStation: '' })}
            style={{ width: '140px' }}
            disabled={!newMachine.plant}
            options={filteredWCs.map(w => ({ label: w.work_center, value: w.work_center }))}
          />
          <Select
            placeholder="Work Station"
            value={newMachine.workStation || undefined}
            onChange={val => setNewMachine({ ...newMachine, workStation: val })}
            style={{ width: '140px' }}
            disabled={!newMachine.workCentre}
            options={filteredWSs.map(w => ({ label: w.resource_name, value: w.resource_name }))}
          />
          <Input
            placeholder="Module"
            value={newMachine.module}
            onChange={e => setNewMachine({ ...newMachine, module: e.target.value })}
            style={{ width: '140px' }}
          />
          <Button icon={<PlusOutlined />} onClick={handleAddMachine}>ADD</Button>
        </div>
        <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Switch size="small" checked={showInactiveMachines} onChange={setShowInactiveMachines} />
          <span style={{ fontSize: '13px', color: colors.textPrimary }}>Show Deactivated</span>
        </div>
        <style>{`.row-inactive-machine td { opacity: 0.45; }`}</style>
        <Table columns={machineColumns} dataSource={machineLayout} pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} items` }} size="small"
          rowClassName={(r) => !r.is_active ? 'row-inactive-machine' : ''}
        />
      </Card>

      {/* Section 2 — Reason Code Definition */}
      <Card style={styles.sectionCard}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>Section 2 — Reason Code Definition</span>
        </div>
        <div style={styles.inputRow}>
          <Input placeholder="Reason Code" value={newReason.reasonCode} onChange={e => setNewReason({ ...newReason, reasonCode: e.target.value })} style={{ width: '130px' }} />
          <Input placeholder="Description" value={newReason.description} onChange={e => setNewReason({ ...newReason, description: e.target.value })} style={{ width: '180px' }} />
          <Select
            placeholder="Category"
            value={newReason.category || undefined}
            onChange={val => setNewReason({ ...newReason, category: val, reasonTypeId: null, reasonTypeText: '' })}
            style={{ width: '160px' }}
            options={[
              { label: 'Machine Downtime', value: 'Machine Downtime' },
              { label: 'Scrap', value: 'Scrap' },
            ]}
          />
          <Select
            placeholder="Reason Type"
            value={newReason.reasonTypeId || undefined}
            onChange={(val, opt) => setNewReason({ ...newReason, reasonTypeId: val, reasonTypeText: opt.label })}
            style={{ width: '260px' }}
            disabled={!newReason.category}
            options={reasonTypes.filter(rt => rt.reason_category === newReason.category).map(rt => ({ label: rt.reason_type, value: rt.id }))}
          />
          <Button icon={<PlusOutlined />} onClick={handleAddReason}>ADD</Button>
        </div>
        <Table columns={reasonColumns} dataSource={reasonCodes} rowKey="reason_code" pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} items` }} size="small" />
      </Card>

      {/* Hierarchy Management Modal */}
      <Modal
        title="Manage Hierarchy"
        open={manageOpen}
        onCancel={() => setManageOpen(false)}
        footer={null}
        width={620}
      >
        <Tabs items={[
          {
            key: '1',
            label: 'Plant',
            children: (
              <div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <Input placeholder="Plant Name" value={newPlant} onChange={e => setNewPlant(e.target.value)} style={{ width: '200px' }} />
                  <Button icon={<PlusOutlined />} onClick={handleAddPlant}>ADD</Button>
                </div>
                <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Switch size="small" checked={showInactivePlants} onChange={setShowInactivePlants} />
                  <span style={{ fontSize: '13px', color: colors.textPrimary }}>Show Deactivated</span>
                </div>
                <style>{`.row-inactive-plant td { opacity: 0.45; }`}</style>
                <Table size="small" pagination={{ pageSize: 5 }} dataSource={plants} rowKey="facility" columns={plantColumns}
                  rowClassName={(r) => !r.is_active ? 'row-inactive-plant' : ''} />
              </div>
            ),
          },
          {
            key: '2',
            label: 'Work Center',
            children: (
              <div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <Select
                    placeholder="Select Plant"
                    value={newWC.facility || undefined}
                    onChange={val => setNewWC({ ...newWC, facility: val })}
                    style={{ width: '160px' }}
                    options={plants.filter(p => p.is_active).map(p => ({ label: p.facility, value: p.facility }))}
                  />
                  <Input placeholder="Work Center Name" value={newWC.work_center} onChange={e => setNewWC({ ...newWC, work_center: e.target.value })} style={{ width: '180px' }} />
                  <Button icon={<PlusOutlined />} onClick={handleAddWC}>ADD</Button>
                </div>
                <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Switch size="small" checked={showInactiveWCs} onChange={setShowInactiveWCs} />
                  <span style={{ fontSize: '13px', color: colors.textPrimary }}>Show Deactivated</span>
                </div>
                <style>{`.row-inactive-wc td { opacity: 0.45; }`}</style>
                <Table size="small" pagination={{ pageSize: 5 }} dataSource={workCenters} rowKey="work_center" columns={wcColumns}
                  rowClassName={(r) => !r.is_active ? 'row-inactive-wc' : ''} />
              </div>
            ),
          },
          {
            key: '3',
            label: 'Workstation',
            children: (
              <div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <Select
                    placeholder="Select Work Center"
                    value={newWS.work_center || undefined}
                    onChange={val => setNewWS({ ...newWS, work_center: val })}
                    style={{ width: '180px' }}
                    options={workCenters.filter(w => w.is_active).map(w => ({ label: `${w.facility} / ${w.work_center}`, value: w.work_center }))}
                  />
                  <Input placeholder="Workstation Name" value={newWS.resource_name} onChange={e => setNewWS({ ...newWS, resource_name: e.target.value })} style={{ width: '180px' }} />
                  <Button icon={<PlusOutlined />} onClick={handleAddWS}>ADD</Button>
                </div>
                <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Switch size="small" checked={showInactiveWSs} onChange={setShowInactiveWSs} />
                  <span style={{ fontSize: '13px', color: colors.textPrimary }}>Show Deactivated</span>
                </div>
                <style>{`.row-inactive-ws td { opacity: 0.45; }`}</style>
                <Table size="small" pagination={{ pageSize: 5 }} dataSource={workstations} rowKey="id" columns={wsColumns}
                  rowClassName={(r) => !r.is_active ? 'row-inactive-ws' : ''} />
              </div>
            ),
          },
        ]} />
      </Modal>

      {/* Edit Reason Code Modal */}
      <Modal
        title={`Edit Reason Code — ${editReason?.reason_code}`}
        open={!!editReason}
        onCancel={() => setEditReason(null)}
        onOk={handleEditReason}
        okText="Save"
      >
        {editReason && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
            <div>
              <div style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '4px' }}>Description</div>
              <Input value={editReason.description} onChange={e => setEditReason({ ...editReason, description: e.target.value })} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '4px' }}>Category</div>
              <Select
                value={editReason.category || undefined}
                onChange={val => setEditReason({ ...editReason, category: val, reasonTypeId: null, reasonTypeText: '' })}
                style={{ width: '100%' }}
                options={[
                  { label: 'Machine Downtime', value: 'Machine Downtime' },
                  { label: 'Scrap', value: 'Scrap' },
                ]}
              />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '4px' }}>Reason Type</div>
              <Select
                value={editReason.reasonTypeId || undefined}
                onChange={(val, opt) => setEditReason({ ...editReason, reasonTypeId: val, reasonTypeText: opt.label })}
                style={{ width: '100%' }}
                disabled={!editReason.category}
                options={reasonTypes.filter(rt => rt.reason_category === editReason.category).map(rt => ({ label: rt.reason_type, value: rt.id }))}
              />
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
