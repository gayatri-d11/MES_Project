import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Input, Select, App, Modal, Tabs, Switch } from 'antd';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';
import colors from '../../theme/colors';
import constants from '../../theme/constants';
import apiFetch from '../../utils/apiFetch';
const NAME_RE = /^[a-zA-Z0-9\s\-_]+$/;

// Extract the numeric/suffix part after a known prefix
const stripPrefix = (name, prefix) => name.startsWith(prefix) ? name.slice(prefix.length) : name;

const getPlantCode = (plantName) => {
  // Extract suffix after 'Plant-', e.g. 'Plant-A1' → 'A1'
  const match = plantName.match(/^Plant-(.+)$/i);
  return match ? match[1].replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : plantName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
};

const buildWCPrefix = (plantName) => {
  if (!plantName) return '';
  return `WC${getPlantCode(plantName)}-`;
};

const buildWSPrefix = (plantName, wcName) => {
  if (!plantName || !wcName) return '';
  const code = getPlantCode(plantName);
  const wcPrefix = `WC${code}-`;
  const wcNum = stripPrefix(wcName, wcPrefix).replace(/-/g, '');
  return `WS${code}-${wcNum}`;
};

const buildMachinePrefix = (plantName, wcName, wsName) => {
  if (!plantName || !wcName || !wsName) return '';
  const code = getPlantCode(plantName);
  const wcPrefix = `WC${code}-`;
  const wcNum = stripPrefix(wcName, wcPrefix).replace(/-/g, '');
  const wsStripped = wsName.replace(new RegExp(`^WS${code}-?`), '').replace(/-/g, '');
  const wsNum = wsStripped.slice(wcNum.length, wcNum.length + 2);
  return `M${code}${wcNum}${wsNum}`;
};

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
  const [showInactiveReasons, setShowInactiveReasons] = useState(false);
  const [reasonCodes, setReasonCodes] = useState([]);
  const [reasonTypes, setReasonTypes] = useState([]);

  const [newMachine, setNewMachine] = useState({ plant: '', workCentre: '', workStation: '', module: '' });
  const [newWCSuffix, setNewWCSuffix] = useState('');
  const [newWSSuffix, setNewWSSuffix] = useState('');
  const [newMachineSuffix, setNewMachineSuffix] = useState('');
  const [newReason, setNewReason] = useState({ reasonCode: '', description: '', category: '', reasonTypeId: null, reasonTypeText: '' });

  const [manageOpen, setManageOpen] = useState(false);
  const [newPlant, setNewPlant] = useState('');
  const [newWC, setNewWC] = useState({ work_center: '', facility: '' });
  const [newWS, setNewWS] = useState({ resource_name: '', work_center: '' });
  const [showInactivePlants, setShowInactivePlants] = useState(false);
  const [showInactiveWCs, setShowInactiveWCs] = useState(false);
  const [showInactiveWSs, setShowInactiveWSs] = useState(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  const fetchAll = async () => {
    const [plants, wcs, wss, machines, reasons, reasonTypes] = await Promise.all([
      apiFetch(`/plants/${showInactivePlants ? '?all=true' : ''}`).then(r => r.json()),
      apiFetch(`/work-centers/${showInactiveWCs ? '?all=true' : ''}`).then(r => r.json()),
      apiFetch(`/workstations/${showInactiveWSs ? '?all=true' : ''}`).then(r => r.json()),
      apiFetch(showInactiveMachines ? `/machines/?all=true` : `/machines/`).then(r => r.json()),
      apiFetch(showInactiveReasons ? `/reason-codes/?all=true` : `/reason-codes/`).then(r => r.json()),
      apiFetch(`/reason-types/`).then(r => r.json()),
    ]);
    setPlants(Array.isArray(plants) ? plants : []);
    setWorkCenters(Array.isArray(wcs) ? wcs : []);
    setWorkstations(Array.isArray(wss) ? wss : []);
    if (Array.isArray(machines)) {
      setMachineLayout(machines.map(m => ({
        key: String(m.id), id: m.id,
        plant: m.facility_name, workCentre: m.work_center_name,
        workStation: m.workstation_name, module: m.equipment,
        is_active: m.is_active,
      })));
    }
    setReasonCodes(Array.isArray(reasons) ? reasons : []);
    setReasonTypes(Array.isArray(reasonTypes) ? reasonTypes : []);
  };

  useEffect(() => { fetchAll(); }, [showInactiveMachines, showInactiveReasons, showInactivePlants, showInactiveWCs, showInactiveWSs]);

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
    if (!newMachineSuffix.trim()) { modal.error({ title: 'Error', content: 'Module name is required.' }); return; }
    const prefix = buildMachinePrefix(newMachine.plant, newMachine.workCentre, newMachine.workStation);
    const fullName = prefix + newMachineSuffix.trim();
    if (!NAME_RE.test(fullName)) { modal.error({ title: 'Error', content: 'Module name cannot contain special characters.' }); return; }
    const exists = machineLayout.some(m => m.module === fullName);
    if (exists) { modal.error({ title: 'Error', content: `"${fullName}" already exists.` }); return; }
    const ws = workstations.find(w => w.resource_name === newMachine.workStation);
    if (!ws) { modal.error({ title: 'Error', content: 'Workstation not found.' }); return; }
    const res = await apiFetch(`/machines/`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ equipment: fullName, resource_id: ws.id }),
    });
    const data = await res.json();
    if (res.ok) {
      fetchAll();
      const newPlantKey = `plant||${newMachine.plant}`;
      const newWCKey = `wc||${newMachine.plant}||${newMachine.workCentre}`;
      const newWSKey = `ws||${newMachine.plant}||${newMachine.workCentre}||${newMachine.workStation}`;
      setExpandedRowKeys([newPlantKey, newWCKey, newWSKey]);
      setNewMachineSuffix('');
      modal.success({ title: 'Machine Added', content: `Machine '${fullName}' has been added successfully under Workstation '${newMachine.workStation}', Work Centre '${newMachine.workCentre}', Plant '${newMachine.plant}'.` });
    }
    else modal.error({ title: 'Error', content: data.error || 'Something went wrong.' });
  };

  const handleAddReason = async () => {
    if (!newReason.reasonCode.trim()) { modal.error({ title: 'Error', content: 'Reason Code is required.' }); return; }
    if (!/^[a-zA-Z0-9\-_]+$/.test(newReason.reasonCode.trim())) { modal.error({ title: 'Error', content: 'Reason Code can only contain letters, numbers, hyphens and underscores.' }); return; }
    if (!newReason.description.trim()) { modal.error({ title: 'Error', content: 'Description is required.' }); return; }
    if (!newReason.category) { modal.error({ title: 'Error', content: 'Category is required.' }); return; }
    if (newReason.category === 'Machine Downtime' && !newReason.reasonTypeId) { modal.error({ title: 'Error', content: 'Reason Type is required for Machine Downtime.' }); return; }
    const res = await apiFetch(`/reason-codes/`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reason_code: newReason.reasonCode.trim(),
        description: newReason.description.trim(),
        category: newReason.category,
        reason_type_text: newReason.reasonTypeText || '',
        reason_type_id: newReason.reasonTypeId || null,
      }),
    });
    const data = await res.json();
    if (res.ok) { fetchAll(); setNewReason({ reasonCode: '', description: '', category: '', reasonTypeId: null, reasonTypeText: '' }); modal.success({ title: 'Reason Code Added', content: `Reason Code '${newReason.reasonCode.trim()}' has been created successfully under category '${newReason.category}'.` }); }
    else modal.error({ title: 'Error', content: data.error || 'Something went wrong.' });
  };

  const handleAddPlant = async () => {
    if (!validateName(newPlant, 'Plant name')) return;
    const fullName = `Plant-${newPlant.trim()}`;
    const res = await apiFetch(`/plants/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ facility: fullName }) });
    const data = await res.json();
    if (res.ok) { fetchAll(); setNewPlant(''); modal.success({ title: 'Plant Added', content: `Plant '${fullName}' has been added successfully.` }); }
    else modal.error({ title: 'Error', content: data.error || 'Something went wrong.' });
  };

  const handleAddWC = async () => {
    if (!newWC.facility) { modal.error({ title: 'Error', content: 'Please select a Plant.' }); return; }
    if (!newWCSuffix.trim()) { modal.error({ title: 'Error', content: 'Work Center name is required.' }); return; }
    const prefix = buildWCPrefix(newWC.facility);
    const fullName = prefix + newWCSuffix.trim();
    if (!NAME_RE.test(fullName)) { modal.error({ title: 'Error', content: 'Work Center name cannot contain special characters.' }); return; }
    const exists = workCenters.some(w => w.work_center === fullName);
    if (exists) { modal.error({ title: 'Error', content: `"${fullName}" already exists.` }); return; }
    const res = await apiFetch(`/work-centers/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ work_center: fullName, facility: newWC.facility }) });
    const data = await res.json();
    if (res.ok) { fetchAll(); setNewWC({ work_center: '', facility: '' }); setNewWCSuffix(''); modal.success({ title: 'Work Centre Added', content: `Work Centre '${fullName}' has been added successfully under Plant '${newWC.facility}'.` }); }
    else modal.error({ title: 'Error', content: data.error || 'Something went wrong.' });
  };

  const handleAddWS = async () => {
    if (!newWS.work_center) { modal.error({ title: 'Error', content: 'Please select a Work Center.' }); return; }
    if (!newWSSuffix.trim()) { modal.error({ title: 'Error', content: 'Workstation name is required.' }); return; }
    const selectedWC = workCenters.find(w => w.work_center === newWS.work_center);
    const plantName = selectedWC ? selectedWC.facility : '';
    const prefix = buildWSPrefix(plantName, newWS.work_center);
    const fullName = prefix + newWSSuffix.trim();
    if (!NAME_RE.test(fullName)) { modal.error({ title: 'Error', content: 'Workstation name cannot contain special characters.' }); return; }
    const exists = workstations.some(w => w.resource_name === fullName);
    if (exists) { modal.error({ title: 'Error', content: `"${fullName}" already exists.` }); return; }
    const res = await apiFetch(`/workstations/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resource_name: fullName, work_center: newWS.work_center }) });
    const data = await res.json();
    if (res.ok) { fetchAll(); setNewWS({ resource_name: '', work_center: '' }); setNewWSSuffix(''); modal.success({ title: 'Workstation Added', content: `Workstation '${fullName}' has been added successfully under Work Centre '${newWS.work_center}'.` }); }
    else modal.error({ title: 'Error', content: data.error || 'Something went wrong.' });
  };

  // Accordion expand: only one node open per level, collapse children when switching
  const handleTreeExpand = (expanded, record) => {
    if (!expanded) {
      // collapse this node and all its descendants
      setExpandedRowKeys(prev => prev.filter(k => k !== record.key && !k.startsWith(`wc||${record.key.split('||')[1]}`) && !k.startsWith(`ws||${record.key.split('||')[1]}`)));
      return;
    }
    setExpandedRowKeys(prev => {
      if (record.type === 'plant') {
        // close all other plants and all wc/ws keys
        return [record.key];
      }
      if (record.type === 'wc') {
        const plant = record.key.split('||')[1];
        // keep the parent plant key, close all other wc keys and all ws keys
        return [`plant||${plant}`, record.key];
      }
      if (record.type === 'ws') {
        const parts = record.key.split('||');
        // keep plant + wc ancestors, close other ws keys under same wc
        return [
          `plant||${parts[1]}`,
          `wc||${parts[1]}||${parts[2]}`,
          record.key,
        ];
      }
      return [...prev, record.key];
    });
  };

  // Clicking a row fills the add-machine form AND expands it
  const handleRowClick = (record) => {
    const isExpanded = expandedRowKeys.includes(record.key);
    handleTreeExpand(!isExpanded, record);
    if (record.type === 'plant') {
      setNewMachine({ plant: record.name, workCentre: '', workStation: '' }); setNewMachineSuffix('');
    } else if (record.type === 'wc') {
      const parts = record.key.split('||');
      setNewMachine({ plant: parts[1], workCentre: parts[2], workStation: '' }); setNewMachineSuffix('');
    } else if (record.type === 'ws') {
      const parts = record.key.split('||');
      setNewMachine({ plant: parts[1], workCentre: parts[2], workStation: parts[3] }); setNewMachineSuffix('');
    }
  };

  const buildMachineTree = () => {
    const visibleMachines = showInactiveMachines ? machineLayout : machineLayout.filter(m => m.is_active);
    return plants
      .filter(p => showInactiveMachines ? true : p.is_active)
      .map(p => {
        const pWCs = workCenters.filter(w => w.facility === p.facility && (showInactiveMachines ? true : w.is_active));
        return {
          key: `plant||${p.facility}`, name: p.facility, type: 'plant',
          children: pWCs.map(wc => {
            const pWSs = workstations.filter(w => w.work_center_name === wc.work_center && (showInactiveMachines ? true : w.is_active));
            return {
              key: `wc||${p.facility}||${wc.work_center}`, name: wc.work_center, type: 'wc',
              children: pWSs.map(ws => {
                const machines = visibleMachines.filter(m => m.workStation === ws.resource_name);
                return {
                  key: `ws||${p.facility}||${wc.work_center}||${ws.resource_name}`, name: ws.resource_name, type: 'ws',
                  children: machines.map(m => ({ ...m, key: m.key, name: m.module, type: 'machine' })),
                };
              }),
            };
          }),
        };
      });
  };

  const machineColumns = [
    {
      title: 'Name', dataIndex: 'name', key: 'name',
      render: (text, r) => {
        const color = { plant: colors.primary, wc: '#595959', ws: '#8c8c8c', machine: colors.textPrimary }[r.type];
        const weight = r.type === 'plant' ? 600 : r.type === 'machine' ? 400 : 500;
        return <span style={{ color, fontWeight: weight }}>{text}</span>;
      },
    },
    { title: 'Level', key: 'level', render: (_, r) => ({ plant: 'Plant', wc: 'Work Centre', ws: 'Workstation', machine: 'Machine' }[r.type]) },
    {
      title: 'Action', key: 'action',
      render: (_, r) => r.type !== 'machine' ? null : (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button type="link" style={{ padding: 0, color: r.is_active ? '#ff4d4f' : '#52c41a' }}
            onClick={() => handleToggleMachine(r.id, r.module, r.is_active)}>
            {r.is_active ? 'Deactivate' : 'Activate'}
          </Button>
          {!r.is_active && (
            <Button type="link" style={{ padding: 0, color: '#ff4d4f' }}
              onClick={() => {
                modal.confirm({
                  title: 'Permanently delete this machine?',
                  content: `"${r.module}" will be permanently deleted. This cannot be undone.`,
                  okText: 'Delete', okType: 'danger', cancelText: 'Cancel',
                  onOk: async () => {
                    const res = await apiFetch(`/machines/`, { method: 'DELETE', body: JSON.stringify({ id: r.id, permanent: true }) });
                    const data = await res.json();
                    if (res.ok) { fetchAll(); modal.success({ title: data.message }); }
                    else modal.error({ title: 'Error', content: data.error || 'Something went wrong.' });
                  },
                });
              }}>Delete</Button>
          )}
        </div>
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
      render: (_, r) => r.is_active ? (
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
      ) : (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button type="link" style={{ padding: 0, color: '#52c41a' }}
            onClick={() => {
              modal.confirm({
                title: 'Activate this reason code?',
                content: `"${r.reason_code}" will be activated.`,
                okText: 'Activate', okType: 'primary', cancelText: 'Cancel',
                onOk: async () => {
                  const res = await apiFetch(`/reason-codes/`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason_code: r.reason_code }) });
                  const data = await res.json();
                  if (res.ok) { fetchAll(); modal.success({ title: data.message }); }
                  else modal.error({ title: 'Error', content: data.error || 'Something went wrong.' });
                },
              });
            }}>Activate</Button>
          <Button type="link" style={{ padding: 0, color: '#ff4d4f' }}
            onClick={() => {
              modal.confirm({
                title: 'Permanently delete this reason code?',
                content: `"${r.reason_code}" will be permanently deleted from the database. This cannot be undone.`,
                okText: 'Delete', okType: 'danger', cancelText: 'Cancel',
                onOk: async () => {
                  const res = await apiFetch(`/reason-codes/`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason_code: r.reason_code, permanent: true }) });
                  const data = await res.json();
                  if (res.ok) { fetchAll(); modal.success({ title: data.message }); }
                  else modal.error({ title: 'Error', content: data.error || 'Something went wrong.' });
                },
              });
            }}>Delete</Button>
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
          <Button icon={<SettingOutlined />} onClick={() => setManageOpen(true)}>Manage</Button>
        </div>
        <div style={styles.inputRow}>
          <Select
            placeholder="Plant"
            value={newMachine.plant || undefined}
            onChange={val => { setNewMachine({ plant: val, workCentre: '', workStation: '', module: '' }); setNewMachineSuffix(''); }}
            style={{ width: '140px' }}
            options={plants.filter(p => p.is_active).map(p => ({ label: p.facility, value: p.facility }))}
          />
          <Select
            placeholder="Work Centre"
            value={newMachine.workCentre || undefined}
            onChange={val => { setNewMachine({ ...newMachine, workCentre: val, workStation: '' }); setNewMachineSuffix(''); }}
            style={{ width: '140px' }}
            disabled={!newMachine.plant}
            options={filteredWCs.map(w => ({ label: w.work_center, value: w.work_center }))}
          />
          <Select
            placeholder="Work Station"
            value={newMachine.workStation || undefined}
            onChange={val => { setNewMachine({ ...newMachine, workStation: val }); setNewMachineSuffix(''); }}
            style={{ width: '140px' }}
            disabled={!newMachine.workCentre}
            options={filteredWSs.map(w => ({ label: w.resource_name, value: w.resource_name }))}
          />
          {newMachine.workStation ? (
            <Input
              addonBefore={<span style={{ color: colors.textPrimary, fontWeight: 600 }}>{buildMachinePrefix(newMachine.plant, newMachine.workCentre, newMachine.workStation)}</span>}
              placeholder="suffix"
              value={newMachineSuffix}
              onChange={e => setNewMachineSuffix(e.target.value)}
              style={{ width: '220px' }}
              maxLength={20}
            />
          ) : (
            <Input placeholder="Module" disabled style={{ width: '220px' }} />
          )}
          <Button icon={<PlusOutlined />} onClick={handleAddMachine}>ADD</Button>
        </div>
        <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Switch size="small" checked={showInactiveMachines} onChange={setShowInactiveMachines} />
          <span style={{ fontSize: '13px', color: colors.textPrimary }}>Show Deactivated</span>
        </div>
        <style>{`.row-inactive-machine td { opacity: 0.45; } .machine-tree-row:not(.ant-table-row-level-3) { cursor: pointer; }`}</style>
        <Table
          columns={machineColumns}
          dataSource={buildMachineTree()}
          pagination={false}
          size="small"
          expandable={{ expandedRowKeys, onExpand: handleTreeExpand }}
          onRow={(record) => ({
            onClick: () => { if (record.type !== 'machine') handleRowClick(record); },
          })}
          rowClassName={(r) => [
            r.type === 'machine' && !r.is_active ? 'row-inactive-machine' : '',
            r.type !== 'machine' ? 'machine-tree-row' : '',
          ].filter(Boolean).join(' ')}
        />
      </Card>

      {/* Section 2 — Reason Code Definition */}
      <Card style={styles.sectionCard}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>Section 2 — Reason Code Definition</span>
        </div>
        <div style={styles.inputRow}>
          <Input placeholder="Reason Code" value={newReason.reasonCode} onChange={e => setNewReason({ ...newReason, reasonCode: e.target.value })} style={{ width: '130px' }} maxLength={20} />
          <Input placeholder="Description" value={newReason.description} onChange={e => setNewReason({ ...newReason, description: e.target.value })} style={{ width: '180px' }} maxLength={100} />
          <Select
            placeholder="Category"
            value={newReason.category || undefined}
            onChange={val => setNewReason({ ...newReason, category: val, reasonTypeId: null, reasonTypeText: '' })}
            style={{ width: '160px' }}
            options={[
              { label: 'Machine Downtime', value: 'Machine Downtime' },
              { label: 'NOK', value: 'NOK' },
            ]}
          />
          <Select
            placeholder="Reason Type"
            value={newReason.reasonTypeId || undefined}
            onChange={(val, opt) => setNewReason({ ...newReason, reasonTypeId: val, reasonTypeText: opt.label })}
            style={{ width: '260px' }}
            disabled={newReason.category !== 'Machine Downtime'}
            options={reasonTypes.filter(rt => rt.reason_category === 'Machine Downtime').map(rt => ({ label: rt.reason_type, value: rt.id }))}
          />
          <Button icon={<PlusOutlined />} onClick={handleAddReason}>ADD</Button>
        </div>
        <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Switch size="small" checked={showInactiveReasons} onChange={setShowInactiveReasons} />
          <span style={{ fontSize: '13px', color: colors.textPrimary }}>Show Deactivated</span>
        </div>
        <style>{`.row-inactive-reason td { opacity: 0.45; }`}</style>
        <Table columns={reasonColumns} dataSource={[...reasonCodes].reverse()} rowKey="reason_code" pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} items` }} size="small"
          rowClassName={(r) => !r.is_active ? 'row-inactive-reason' : ''}
        />
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
                  <Input
                    addonBefore={<span style={{ color: colors.textPrimary, fontWeight: 600 }}>Plant-</span>}
                    placeholder="suffix"
                    value={newPlant}
                    onChange={e => setNewPlant(e.target.value)}
                    style={{ width: '200px' }}
                    maxLength={50}
                  />
                  <Button icon={<PlusOutlined />} onClick={handleAddPlant}>ADD</Button>
                </div>
                <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Switch size="small" checked={showInactivePlants} onChange={setShowInactivePlants} />
                  <span style={{ fontSize: '13px', color: colors.textPrimary }}>Show Deactivated</span>
                </div>
                <style>{`.row-inactive-plant td { opacity: 0.45; }`}</style>
                <Table size="small" pagination={{ pageSize: 5 }} dataSource={[...plants].reverse()} rowKey="facility" columns={plantColumns}
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
                    onChange={val => { setNewWC({ ...newWC, facility: val }); setNewWCSuffix(''); }}
                    style={{ width: '160px' }}
                    options={plants.filter(p => p.is_active).map(p => ({ label: p.facility, value: p.facility }))}
                  />
                  {newWC.facility ? (
                    <Input
                      addonBefore={<span style={{ color: colors.textPrimary, fontWeight: 600 }}>{buildWCPrefix(newWC.facility)}</span>}
                      placeholder="suffix"
                      value={newWCSuffix}
                      onChange={e => setNewWCSuffix(e.target.value)}
                      style={{ width: '200px' }}
                      maxLength={20}
                    />
                  ) : (
                    <Input placeholder="Work Center Name" disabled style={{ width: '200px' }} />
                  )}
                  <Button icon={<PlusOutlined />} onClick={handleAddWC}>ADD</Button>
                </div>
                <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Switch size="small" checked={showInactiveWCs} onChange={setShowInactiveWCs} />
                  <span style={{ fontSize: '13px', color: colors.textPrimary }}>Show Deactivated</span>
                </div>
                <style>{`.row-inactive-wc td { opacity: 0.45; }`}</style>
                <Table size="small" pagination={{ pageSize: 5 }} dataSource={[...workCenters].reverse()} rowKey="work_center" columns={wcColumns}
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
                    onChange={val => { setNewWS({ ...newWS, work_center: val }); setNewWSSuffix(''); }}
                    style={{ width: '180px' }}
                    options={workCenters.filter(w => w.is_active).map(w => ({ label: `${w.facility} / ${w.work_center}`, value: w.work_center }))}
                  />
                  {newWS.work_center ? (() => {
                    const selWC = workCenters.find(w => w.work_center === newWS.work_center);
                    const wsPrefix = buildWSPrefix(selWC?.facility || '', newWS.work_center);
                    return (
                      <Input
                        addonBefore={<span style={{ color: colors.textPrimary, fontWeight: 600 }}>{wsPrefix}</span>}
                        placeholder="suffix"
                        value={newWSSuffix}
                        onChange={e => setNewWSSuffix(e.target.value)}
                        style={{ width: '220px' }}
                        maxLength={20}
                      />
                    );
                  })() : (
                    <Input placeholder="Workstation Name" disabled style={{ width: '220px' }} />
                  )}
                  <Button icon={<PlusOutlined />} onClick={handleAddWS}>ADD</Button>
                </div>
                <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Switch size="small" checked={showInactiveWSs} onChange={setShowInactiveWSs} />
                  <span style={{ fontSize: '13px', color: colors.textPrimary }}>Show Deactivated</span>
                </div>
                <style>{`.row-inactive-ws td { opacity: 0.45; }`}</style>
                <Table size="small" pagination={{ pageSize: 5 }} dataSource={[...workstations].reverse()} rowKey="id" columns={wsColumns}
                  rowClassName={(r) => !r.is_active ? 'row-inactive-ws' : ''} />
              </div>
            ),
          },
        ]} />
      </Modal>



    </div>
  );
}
