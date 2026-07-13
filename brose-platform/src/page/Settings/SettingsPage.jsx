import React, { useState, useEffect } from 'react';
import { Tabs, Card, Table, Button, Tag, Input, Select, Modal, App, Descriptions } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import colors from '../../theme/colors';
import constants from '../../theme/constants';
import apiFetch from '../../utils/apiFetch';

const styles = {
  card: {
    border: `1px solid ${colors.border}`,
    borderRadius: constants.borderRadius,
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
};

export default function SettingsPage() {
  const { modal } = App.useApp();
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [newEmployee, setNewEmployee] = useState({ employeeId: '', last_name: '', password: '', role_ids: [] });
  const [editEmployee, setEditEmployee] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [newRole, setNewRole] = useState({ role_name: '', pages: [] });
  const [editRole, setEditRole] = useState(null);
  const [editRoleModalOpen, setEditRoleModalOpen] = useState(false);
  const PAGE_OPTIONS = [
    { label: 'Dashboard', value: 'dashboard' },
    { label: 'Master Data', value: 'master_data' },
    { label: 'Transactions', value: 'transactions' },
    { label: 'Production', value: 'production' },
    { label: 'Settings', value: 'settings' },
  ];

  const fetchEmployees = () => {
    apiFetch('/employees/').then(r => r.json()).then(data => setEmployees(Array.isArray(data) ? data : []));
  };

  const fetchRoles = () => {
    apiFetch('/roles/').then(r => r.json()).then(data => setRoles(Array.isArray(data) ? data : []));
  };

  useEffect(() => {
    fetchEmployees();
    fetchRoles();
  }, []);

 const handleAdd = async () => {
    if (!newEmployee.last_name.trim()) {
      modal.error({ title: 'Error', content: 'Employee name is required.' });
      return;
    }
    if (!/^[a-zA-Z\s]+$/.test(newEmployee.last_name)) {
      modal.error({ title: 'Error', content: 'Employee name cannot contain special characters or numbers.' });
      return;
    }
    if (!newEmployee.role_ids.length) {
      modal.error({ title: 'Error', content: 'Please select at least one role.' });
      return;
    }
    if (!newEmployee.employeeId || !newEmployee.password) return;

    const response = await apiFetch('/employees/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employee_no: `BR-${newEmployee.employeeId}`,
        last_name: newEmployee.last_name,
        password: newEmployee.password,
        role_ids: newEmployee.role_ids,
        employee_valid_date: new Date().toISOString(),
      })
    });

    if (response.ok) {
      fetchEmployees();
      setNewEmployee({ employeeId: '', last_name: '', password: '', role_ids: [] });
      modal.success({ title: 'Employee created successfully' });
    } else {
      const errorData = await response.json();
      const msg = errorData.error || Object.values(errorData).flat()[0];
      modal.error({ title: 'Error', content: msg });
    }
  };

const handleEditOpen = (record) => {
    setEditEmployee({
      id: record.id,
      last_name: record.last_name,
      role_ids: roles.filter(r => record.role?.includes(r.role_name)).map(r => r.id),
      password: '',
    });
    setEditModalOpen(true);
  };

const handleToggleStatus = (record) => {
  const isActive = record.is_active;
  modal.confirm({
    title: isActive ? 'Deactivate this employee?' : 'Activate this employee?',
    content: `${record.employee_no} — ${record.last_name}`,
    okText: isActive ? 'Deactivate' : 'Activate',
    okType: isActive ? 'danger' : 'primary',
    cancelText: 'Cancel',
    onOk: async () => {
      const response = await apiFetch(`/employees/${record.id}/`, {
        method: isActive ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        fetchEmployees();
        modal.success({ title: isActive ? 'Employee deactivated successfully' : 'Employee activated successfully' });
      } else {
        modal.error({ title: 'Error', content: 'Failed to update employee status' });
      }
    },
  });
};



  const handleEditSave = async () => {
    const response = await apiFetch(`/employees/${editEmployee.id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        last_name: editEmployee.last_name,
        role_ids: editEmployee.role_ids,
        password: editEmployee.password,
      })
    });


    if (response.ok) {
      fetchEmployees();
      setEditModalOpen(false);
      setEditEmployee(null);
    }
  };

  const employeeColumns = [
    { title: 'Employee ID', dataIndex: 'employee_no', key: 'employee_no' },
    { title: 'Name', dataIndex: 'last_name', key: 'last_name' },
    {
      title: 'Role', dataIndex: 'role', key: 'role',
      render: (roleList) => (
        <>
          {(roleList || []).map(role => (
            <Tag key={role} color={role === 'Admin' ? 'red' : role === 'Manager' ? 'blue' : role === 'Supervisor' ? 'orange' : 'green'}>
              {role}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: 'Status', dataIndex: 'is_active', key: 'is_active',
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'default'}>{isActive ? 'Active' : 'Inactive'}</Tag>
      ),
    },
    {
      title: 'Action', key: 'action',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button type="link" style={{ color: colors.primary, padding: 0 }} onClick={() => handleEditOpen(record)}>
            Edit
          </Button>
          <Button
            type="link"
            style={{ padding: 0, color: record.is_active ? '#ff4d4f' : '#52c41a' }}
            onClick={() => handleToggleStatus(record)}
          >
            {record.is_active ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ];

  const handleAddRole = async () => {
    if (!newRole.role_name.trim()) {
      modal.error({ title: 'Error', content: 'Role name is required.' });
      return;
    }
    if (!/^[a-zA-Z\s]+$/.test(newRole.role_name.trim())) {
      modal.error({ title: 'Error', content: 'Role name can only contain letters and spaces.' });
      return;
    }
    if (!newRole.pages.length) {
      modal.error({ title: 'Error', content: 'Please select at least one page.' });
      return;
    }
    const response = await apiFetch('/roles/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRole),
    });
    if (response.ok) {
      fetchRoles();
      setNewRole({ role_name: '', pages: [] });
      modal.success({ title: 'Role created successfully' });
    } else {
      const err = await response.json();
      modal.error({ title: 'Error', content: err.error || 'Failed to create role' });
    }
  };

  const handleEditRoleSave = async () => {
    if (!editRole.role_name.trim()) {
      modal.error({ title: 'Error', content: 'Role name is required.' });
      return;
    }
    if (!/^[a-zA-Z\s]+$/.test(editRole.role_name.trim())) {
      modal.error({ title: 'Error', content: 'Role name can only contain letters and spaces.' });
      return;
    }
    if (!editRole.pages.length) {
      modal.error({ title: 'Error', content: 'Please select at least one page.' });
      return;
    }
    const response = await apiFetch(`/roles/${editRole.id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role_name: editRole.role_name, pages: editRole.pages }),
    });
    if (response.ok) {
      fetchRoles();
      setEditRoleModalOpen(false);
      setEditRole(null);
      modal.success({ title: 'Role updated successfully' });
    } else {
      const err = await response.json();
      modal.error({ title: 'Error', content: err.error || 'Failed to update role' });
    }
  };

  const handleDeleteRole = (record) => {
    modal.confirm({
      title: 'Delete this role?',
      content: `"${record.role_name}" will be permanently deleted. Employees assigned to this role must be reassigned first.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        const response = await apiFetch(`/roles/${record.id}/`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          fetchRoles();
          modal.success({ title: 'Role deleted successfully' });
        } else {
          const err = await response.json();
          modal.error({ title: 'Cannot Delete Role', content: err.error || 'Failed to delete role' });
        }
      },
    });
  };

  const roleColumns = [
    { title: 'Role Name', dataIndex: 'role_name', key: 'role_name' },
    {
      title: 'Access Scope', dataIndex: 'pages', key: 'pages',
      render: (pages) => (pages || []).map(p => (
        <Tag key={p}>{PAGE_OPTIONS.find(o => o.value === p)?.label || p}</Tag>
      )),
    },
    {
      title: 'Action', key: 'action',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button type="link" style={{ color: colors.primary, padding: 0 }}
            onClick={() => { setEditRole({ id: record.id, role_name: record.role_name, pages: record.pages || [] }); setEditRoleModalOpen(true); }}>
            Edit
          </Button>
          <Button type="link" danger style={{ padding: 0 }} onClick={() => handleDeleteRole(record)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const tabItems = [
    {
      key: '1',
      label: 'User Management',
      children: (
        <div>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTitle}>Employee List</span>
            <Input
              placeholder="Search by Employee ID or Name"
              prefix ={<SearchOutlined/>}
              value={searchText}
              onChange={(e)=>setSearchText(e.target.value)}
              style ={{width: '260px'}}
              allowClear
            />
          </div>
          <div style={{ display: 'flex', gap: constants.spacing.md, marginBottom: constants.spacing.md, flexWrap: 'wrap' }}>
            <Input
    placeholder="e.g. 00100001"
    prefix="BR-"
    maxLength={8}
    value={newEmployee.employeeId}
    onChange={(e) => {
        const val = e.target.value.replace(/\D/g, '');
        setNewEmployee({ ...newEmployee, employeeId: val });
    }}
    style={{ width: '180px' }}
/>

            <Input
              placeholder="Name"
              value={newEmployee.last_name}
              onChange={(e) => setNewEmployee({ ...newEmployee, last_name: e.target.value })}
              style={{ width: '160px' }}
              maxLength={100}
            />
            <Input.Password
              placeholder="Password"
              value={newEmployee.password}
              onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
              style={{ width: '160px' }}
            />
                        <Select
              mode="multiple"
              placeholder="Select Role(s)"
              value={newEmployee.role_ids}
              onChange={(val) => setNewEmployee({ ...newEmployee, role_ids: val })}
              style={{ width: '200px' }}
              options={roles.map(r => ({ label: r.role_name, value: r.id }))}
            />

            <Button icon={<PlusOutlined />} onClick={handleAdd}>ADD</Button>
          </div>
          <Table
            columns={employeeColumns}
            dataSource={employees.filter(emp=>
              emp.employee_no.toLowerCase().includes(searchText.toLowerCase()) ||
              emp.last_name.toLowerCase().includes(searchText.toLowerCase())
            )}
            rowKey="id"
            pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} items` }}
            size="small"
          />
        </div>
      ),
    },
    {
      key: '2',
      label: 'Role Management',
      children: (
        <div>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTitle}>Role List</span>
          </div>
          <div style={{ display: 'flex', gap: constants.spacing.md, marginBottom: constants.spacing.md, flexWrap: 'wrap' }}>
            <Input
              placeholder="Role Name"
              value={newRole.role_name}
              onChange={(e) => setNewRole({ ...newRole, role_name: e.target.value })}
              style={{ width: '180px' }}
              maxLength={50}
            />
            <Select
              mode="multiple"
              placeholder="Select Access Scope"
              value={newRole.pages}
              onChange={(val) => setNewRole({ ...newRole, pages: val })}
              style={{ width: '260px' }}
              options={PAGE_OPTIONS}
            />
            <Button icon={<PlusOutlined />} onClick={handleAddRole}>ADD</Button>
          </div>
          <Table
            columns={roleColumns}
            dataSource={roles}
            rowKey="id"
            pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} items` }}
            size="small"
          />
        </div>
      ),
    },
    {
      key: '3',
      label: 'App Configuration',
      children: (
        <div style={{ maxWidth: '520px' }}>
          <Descriptions column={1} bordered size="small" style={{ marginBottom: constants.spacing.lg }}>
            <Descriptions.Item label="Total Employees">{employees.length}</Descriptions.Item>
            <Descriptions.Item label="Active Employees">{employees.filter(e => e.is_active).length}</Descriptions.Item>
            <Descriptions.Item label="Inactive Employees">{employees.filter(e => !e.is_active).length}</Descriptions.Item>
            <Descriptions.Item label="Total Roles">{roles.length}</Descriptions.Item>
            <Descriptions.Item label="Role Names">
              {roles.map(r => <Tag key={r.id} color="blue">{r.role_name}</Tag>)}
            </Descriptions.Item>
            <Descriptions.Item label="Session Token Lifetime">8 hours (auto logout on expiry)</Descriptions.Item>
            <Descriptions.Item label="Support Contact">brose-digitalization@brose.com</Descriptions.Item>
          </Descriptions>
        </div>
      ),
    },
  ];

  return (
    <Card style={styles.card}>
      <Tabs items={tabItems} />

      <Modal
        title="Edit Employee"
        open={editModalOpen}
        onOk={handleEditSave}
        onCancel={() => setEditModalOpen(false)}
        okText="Save"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
          <Input
            placeholder="Name"
            value={editEmployee?.last_name || ''}
            onChange={(e) => setEditEmployee({ ...editEmployee, last_name: e.target.value })}
          />
                    <Select
            mode="multiple"
            placeholder="Select Role(s)"
            value={editEmployee?.role_ids || []}
            onChange={(val) => setEditEmployee({ ...editEmployee, role_ids: val })}
            style={{ width: '100%' }}
            options={roles.map(r => ({ label: r.role_name, value: r.id }))}
          />

          <Input.Password
            placeholder="New Password (leave blank to keep current)"
            value={editEmployee?.password || ''}
            onChange={(e) => setEditEmployee({ ...editEmployee, password: e.target.value })}
          />
        </div>
      </Modal>
      <Modal
        title="Edit Role"
        open={editRoleModalOpen}
        onOk={handleEditRoleSave}
        onCancel={() => setEditRoleModalOpen(false)}
        okText="Save"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
          <Input
            placeholder="Role Name"
            value={editRole?.role_name || ''}
            onChange={(e) => setEditRole({ ...editRole, role_name: e.target.value })}
          />
          <Select
            mode="multiple"
            placeholder="Select Page(s)"
            value={editRole?.pages || []}
            onChange={(val) => setEditRole({ ...editRole, pages: val })}
            style={{ width: '100%' }}
            options={PAGE_OPTIONS}
          />
        </div>
      </Modal>
    </Card>
  );
}
