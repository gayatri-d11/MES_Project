import React, { useState } from 'react';
import { Typography, Dropdown, Avatar, Modal, Descriptions, Tag, Divider, Input, Button } from 'antd';
import { LogoutOutlined, UserOutlined, SettingOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiFetch from '../utils/apiFetch';
import colors from '../theme/colors';
import constants from '../theme/constants';

const { Text } = Typography;

const styles = {
  header: {
    height: constants.headerHeight,
    backgroundColor: colors.white,
    borderBottom: `1px solid ${colors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `0 ${constants.spacing.lg}`,
    flexShrink: 0,
  },
  pageTitle: {
    fontFamily: constants.fontFamily,
    fontWeight: '600',
    fontSize: '15px',
    color: colors.textPrimary,
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: constants.spacing.md,
  },
  userName: {
    color: colors.secondaryText,
    fontSize: '13px',
    fontFamily: constants.fontFamily,
  },
};

const PAGE_LABELS = { dashboard: 'Home', master_data: 'Master Data', transactions: 'Transactions', production: 'Production', settings: 'Settings' };

export default function Header({ pageTitle }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleChangePassword = async () => {
    setPwError(''); setPwSuccess('');
    if (!pwForm.current) { setPwError('Current password is required.'); return; }
    if (!pwForm.newPw) { setPwError('New password is required.'); return; }
    if (pwForm.newPw.length < 8) { setPwError('New password must be at least 8 characters.'); return; }
    if (!/[A-Z]/.test(pwForm.newPw)) { setPwError('New password must contain at least 1 uppercase letter.'); return; }
    if (!/[0-9]/.test(pwForm.newPw)) { setPwError('New password must contain at least 1 number.'); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwError('Passwords do not match.'); return; }
    setPwLoading(true);
    try {
      const res = await apiFetch('/change-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: pwForm.current, new_password: pwForm.newPw }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfileOpen(false);
        setPwForm({ current: '', newPw: '', confirm: '' });
        setPwError(''); setPwSuccess('');
        setTimeout(() => { logout(); navigate('/login'); }, 1500);
        Modal.success({ title: 'Password Changed', content: 'Your password has been updated. You will be logged out now.' });
      }
      else setPwError(data.error || 'Failed to change password.');
    } finally { setPwLoading(false); }
  };

  return (
    <div style={styles.header}>
      <Text style={styles.pageTitle}>{pageTitle}</Text>
      <div style={styles.userSection}>
        <Dropdown
          menu={{
            items: [
              {
                key: 'profile',
                icon: <UserOutlined />,
                label: (
                  <div>
                    <div style={{ fontWeight: '600', color: colors.textPrimary }}>{user?.employeeId}</div>
                    <div style={{ fontSize: '12px', color: colors.textSecondary }}>{user?.roles?.join(', ')}</div>
                  </div>
                ),
                disabled: true,
              },
              { type: 'divider' },
              {
                key: 'my-profile',
                icon: <UserOutlined />,
                label: 'My Profile',
                onClick: () => setProfileOpen(true),
              },
              ...(user?.pages?.includes('settings') ? [{
                key: 'settings',
                icon: <SettingOutlined />,
                label: 'Settings',
                onClick: () => navigate('/settings'),
              }] : []),
              { type: 'divider' },
              {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: 'Logout',
                danger: true,
                onClick: handleLogout,
              },
            ],
          }}
          trigger={['click']}
        >
          <div style={{ ...styles.userSection, cursor: 'pointer' }}>
            <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: colors.primary }} />
            <Text style={styles.userName}>{user?.employeeId}</Text>
          </div>
        </Dropdown>
      </div>

      <Modal
        title="My Profile"
        open={profileOpen}
        onCancel={() => { setProfileOpen(false); setPwForm({ current: '', newPw: '', confirm: '' }); setPwError(''); setPwSuccess(''); }}
        footer={null}
        width={480}
      >
        <Descriptions column={1} bordered size="small" style={{ marginBottom: 16 }}>
          <Descriptions.Item label="Employee ID">
            <span style={{ fontWeight: '600' }}>{user?.employeeId}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Role(s)">
            {(user?.roles || []).map(r => <Tag key={r} color="blue">{r}</Tag>)}
          </Descriptions.Item>
          <Descriptions.Item label="Access Scope">
            {(user?.pages || []).map(p => <Tag key={p}>{PAGE_LABELS[p] || p}</Tag>)}
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left" style={{ fontSize: '13px' }}><LockOutlined /> Change Password</Divider>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {pwError && <div style={{ color: '#ff4d4f', fontSize: '13px' }}>{pwError}</div>}
          {pwSuccess && <div style={{ color: '#52c41a', fontSize: '13px' }}>{pwSuccess}</div>}
          <div>
            <div style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: 4 }}>Current Password</div>
            <Input.Password value={pwForm.current} onChange={e => setPwForm({ ...pwForm, current: e.target.value })} style={{ width: '100%' }} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: 4 }}>New Password</div>
            <Input.Password value={pwForm.newPw} onChange={e => setPwForm({ ...pwForm, newPw: e.target.value })} style={{ width: '100%' }} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: 4 }}>Confirm New Password</div>
            <Input.Password value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} style={{ width: '100%' }} />
          </div>
          <Button type="primary" loading={pwLoading} onClick={handleChangePassword} style={{ width: 'fit-content' }}>Update Password</Button>
        </div>
      </Modal>
    </div>
  );
}
