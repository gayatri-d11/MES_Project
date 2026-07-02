import React from 'react';
import { Typography, Button, Dropdown, Avatar } from 'antd';
import { LogoutOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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

export default function Header({ pageTitle }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

 const handleLogout = () => {
  logout();
  navigate('/login');
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
       ...(user?.roles?.includes('Admin') ? [{
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
      <Avatar
        size="small"
        icon={<UserOutlined />}
        style={{ backgroundColor: colors.primary }}
      />
      <Text style={styles.userName}>{user?.employeeId}</Text>
    </div>
  </Dropdown>
</div>

    </div>
  );
}
