import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Input, Select, App, Modal, Tabs } from 'antd';
import { PlusOutlined, SaveOutlined, SettingOutlined } from '@ant-design/icons';
import colors from '../../theme/colors';
import constants from '../../theme/constants';

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

export default function MasterDataScreen1() {
  const { modal } = App.useApp();
  const token = localStorage.getItem('access_token');
  const authHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  const [plants, setPlants] = useState([]);
  const [workCenters, setWorkCenters] = useState([]);
  const [workstations, setWorkstations] = useState([]);
  const [machineLayout, setMachineLayout] = useState([]);
  const [reasonCodes, setReasonCodes] = useState([]);
  const [reasonTypes, setReasonTypes] = useState([]);

  const [newMachine, setNewMachine] = useState({ plant: '', workCentre: '', workStation: '', module: '' });
  const [newReason, setNewReason] = useState({ reasonCode: '', description: '', category: '', reasonType: '' });

  const [manageOpen, setManageOpen] = useState(false);
  const [newPlant, setNewPlant] = useState('');
  const [newWC, setNewWC] = useState({ work_center: '', facility: '' });
  const [newWS, setNewWS] = useState({ resource_name: '', work_center: '' });

  const fetchAll = () => {
    const h = { headers: { 'Authorization': `Bearer ${token}` } };
    fetch(`${API}/plants/`, h).then(r => r.json()).then(d => setPlants(Array.isArray(d) ? d : []));
    fetch(`${API}/work-centers/`, h).then(r => r.json()).then(d => setWorkCenters(Array.isArray(d) ? d : []));
    fetch(`${API}/workstations/`, h).then(r => r.json()).then(d => setWorkstations(Array.isArray(d) ? d : []));
    fetch(`${API}/machines/`, h).then(r => r.json()).then(d => {
      if (Array.isArray(d)) {
        setMachineLayout(d.map(m => ({
          key: String(m.id), id: m.id,
          plant: m.facility_name, workCentre: m.work_center_name,
          workStation: m.workstation_name, module: m.equipment,
        })));
      }
    });
    fetch(`${API}/reason-codes/`, h).then(r => r.json()).then(d => setReasonCodes(Array.isArray(d) ? d : []));
    fetch(`${API}/reason-types/`, h).then(r => r.json()).then(d => setReasonTypes(Array.isArray(d) ? d : []));
  };

  useEffect(() => { fetchAll(); }, []);

  const filteredWCs = workCenters.filter(w => w.facility === newMachine.plant);
  const filteredWSs = workstations.filter(w => w.work_center_name === newMachine.workCentre);

  const validateName = (name, label) => {
    if (!name.trim()) { modal.error({ title: 'Error', content: `${label} is required.` }); return false; }
    if (!NAME_RE.test(name.trim())) { modal.error({ title: 'Error', content: `${label} cannot contain special characters.` }); return false; }
    return true;
  };

  const handleDelete = (url, body, confirmMsg) => {
    modal.confirm({
      title: 'Confirm Delete',
      content: confirmMsg,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        const res = await fetch(`${API}${url}`, { method: 'DELETE', headers: authHeaders, body: JSON.stringify(body) });
        const data = await res.json();
        if (res.ok) { fetchAll(); modal.success({ title: data.message }); }
        else modal.error({ title: 'Cannot Delete', content: data.error || 'Something went wrong.' });
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
    const res = await fetch(`${API}/machines/`, {
      method: 'POST', headers: authHeaders,
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
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(newReason.description.trim())) { modal.error({ title: 'Error', content: 'Description cannot contain special characters.' }); return; }
    if (!newReason.category.trim()) { modal.error({ title: 'Error', content: 'Category is required.' }); return; }
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(newReason.category.trim())) { modal.error({ title: 'Error', content: 'Category cannot contain special characters.' }); return; }
    if (!newReason.reasonType.trim()) { modal.error({ title: 'Error', content: 'Reason Type is required.' }); return; }
    if (!/^[a-zA-Z0-9\s\-_:]+$/.test(newReason.reasonType.trim())) { modal.error({ title: 'Error', content: 'Reason Type cannot contain special characters.' }); return; }
    const selectedType = reasonTypes.find(rt => rt.reason_type === newReason.reasonType.trim());
    const res = await fetch(`${API}/reason-codes/`, {
      method: 'POST', headers: authHeaders,
      body: JSON.stringify({
        reason_code: newReason.reasonCode.trim(),
        description: newReason.description.trim(),
        category: newReason.category.trim(),
        reason_type_text: newReason.reasonType.trim(),
      }),
    });
    const data = await res.json();
    if (res.ok) { fetchAll(); setNewReason({ reasonCode: '', description: '', category: '', reasonType: '' }); modal.success({ title: data.message }); }
    else modal.error({ title: 'Error', content: data.error || 'Something went wrong.' });
  };

  const handleAddPlant = async () => {
    if (!validateName(newPlant, 'Plant name')) return;
    const res = await fetch(`${API}/plants/`, { method: 'POST', headers: authHeaders, body: JSON.stringify({ facility: newPlant.trim() }) });
    const data = await res.json();
    if (res.ok) { fetchAll(); setNewPlant(''); modal.success({ title: data.message }); }
    else modal.error({ title: 'Error', content: data.error || 'Something went wrong.' });
  };

  const handleAddWC = async () => {
    if (!validateName(newWC.work_center, 'Work Center name')) return;
    if (!newWC.facility) { modal.error({ title: 'Error', content: 'Please select a Plant.' }); return; }
    const res = await fetch(`${API}/work-centers/`, { method: 'POST', headers: authHeaders, body: JSON.stringify(newWC) });
    const data = await res.json();
    if (res.ok) { fetchAll(); setNewWC({ work_center: '', facility: '' }); modal.success({ title: data.message }); }
    else modal.error({ title: 'Error', content: data.error || 'Something went wrong.' });
  };

  const handleAddWS = async () => {
    if (!validateName(newWS.resource_name, 'Workstation name')) return;
    if (!newWS.work_center) { modal.error({ title: 'Error', content: 'Please select a Work Center.' }); return; }
    const res = await fetch(`${API}/workstations/`, { method: 'POST', headers: authHeaders, body: JSON.stringify(newWS) });
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
        <Button type="link" danger style={{ padding: 0 }}
          onClick={() => handleDelete('/machines/', { id: r.id }, `Delete machine "${r.module}"?`)}>
          Delete
        </Button>
      ),
    },
  ];

  const reasonColumns = [
    { title: 'Reason Code', dataIndex: 'reason_code', key: 'reason_code' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'Reason Type', dataIndex: 'reason_type_text', key: 'reason_type_text' },
  ];

  const plantColumns = [
    { title: 'Plant', dataIndex: 'facility', key: 'facility' },
    { title: 'Action', key: 'action', render: (_, r) => <Button type="link" danger style={{ padding: 0 }} onClick={() => handleDelete('/plants/', { facility: r.facility }, `Delete plant "${r.facility}"?`)}>Delete</Button> },
  ];

  const wcColumns = [
    { title: 'Plant', dataIndex: 'facility', key: 'facility' },
    { title: 'Work Center', dataIndex: 'work_center', key: 'work_center' },
    { title: 'Action', key: 'action', render: (_, r) => <Button type="link" danger style={{ padding: 0 }} onClick={() => handleDelete('/work-centers/', { work_center: r.work_center }, `Delete work center "${r.work_center}"?`)}>Delete</Button> },
  ];

  const wsColumns = [
    { title: 'Plant', dataIndex: 'facility_name', key: 'facility_name' },
    { title: 'Work Center', dataIndex: 'work_center_name', key: 'work_center_name' },
    { title: 'Workstation', dataIndex: 'resource_name', key: 'resource_name' },
    { title: 'Action', key: 'action', render: (_, r) => <Button type="link" danger style={{ padding: 0 }} onClick={() => handleDelete('/workstations/', { id: r.id }, `Delete workstation "${r.resource_name}"?`)}>Delete</Button> },
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
            options={plants.map(p => ({ label: p.facility, value: p.facility }))}
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
        <Table columns={machineColumns} dataSource={machineLayout} pagination={false} size="small" />
      </Card>

      {/* Section 2 — Reason Code Definition */}
      <Card style={styles.sectionCard}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>Section 2 — Reason Code Definition</span>
        </div>
        <div style={styles.inputRow}>
          <Input placeholder="Reason Code" value={newReason.reasonCode} onChange={e => setNewReason({ ...newReason, reasonCode: e.target.value })} style={{ width: '130px' }} />
          <Input placeholder="Description" value={newReason.description} onChange={e => setNewReason({ ...newReason, description: e.target.value })} style={{ width: '160px' }} />
          <Input placeholder="Category" value={newReason.category} onChange={e => setNewReason({ ...newReason, category: e.target.value })} style={{ width: '150px' }} />
          <Input placeholder="Reason Type" value={newReason.reasonType} onChange={e => setNewReason({ ...newReason, reasonType: e.target.value })} style={{ width: '200px' }} />
          <Button icon={<PlusOutlined />} onClick={handleAddReason}>ADD</Button>
        </div>
        <Table columns={reasonColumns} dataSource={reasonCodes} rowKey="reason_code" pagination={false} size="small" />
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
                <Table size="small" pagination={false} dataSource={plants} rowKey="facility" columns={plantColumns} />
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
                    options={plants.map(p => ({ label: p.facility, value: p.facility }))}
                  />
                  <Input placeholder="Work Center Name" value={newWC.work_center} onChange={e => setNewWC({ ...newWC, work_center: e.target.value })} style={{ width: '180px' }} />
                  <Button icon={<PlusOutlined />} onClick={handleAddWC}>ADD</Button>
                </div>
                <Table size="small" pagination={false} dataSource={workCenters} rowKey="work_center" columns={wcColumns} />
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
                    options={workCenters.map(w => ({ label: `${w.facility} / ${w.work_center}`, value: w.work_center }))}
                  />
                  <Input placeholder="Workstation Name" value={newWS.resource_name} onChange={e => setNewWS({ ...newWS, resource_name: e.target.value })} style={{ width: '180px' }} />
                  <Button icon={<PlusOutlined />} onClick={handleAddWS}>ADD</Button>
                </div>
                <Table size="small" pagination={false} dataSource={workstations} rowKey="id" columns={wsColumns} />
              </div>
            ),
          },
        ]} />
      </Modal>

    </div>
  );
}
