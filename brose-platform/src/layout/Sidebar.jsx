import React from 'react';
import { Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  DatabaseOutlined,
  FormOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import colors from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import constants from '../theme/constants';

const allMenuItems = [
  { key: '/', icon: <DashboardOutlined />, label: 'Dashboard', pageKey: 'dashboard' },
  {
    key: '/master-data',
    icon: <DatabaseOutlined />,
    label: 'Master Data',
    pageKey: 'master_data',
    children: [
      { key: '/master-data/screen1', label: 'Machine Layout & Reason Code' },
      { key: '/master-data/screen2', label: 'Variant, Shift & Planning' },
    ],
  },
  { key: '/transactions', icon: <FormOutlined />, label: 'Manual Transaction', pageKey: 'transactions' },
  { key: '/production', icon: <BarChartOutlined />, label: 'Production Dashboard', pageKey: 'production' },
];



const styles = {
  sidebar: {
    width: constants.sidebarWidth,
    minHeight: '100vh',
    backgroundColor: colors.white,
    borderRight: `1px solid ${colors.border}`,
    display: 'flex',
    flexDirection: 'column',
  },
  logo: {
    height: constants.headerHeight,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    fontFamily: constants.fontFamily,
    fontSize: '20px',
    fontWeight: 'bold',
    color: colors.white,
    letterSpacing: '3px',
    flexShrink: 0,
  },
  menu: {
    border: 'none',
    marginTop: '8px',
    fontFamily: constants.fontFamily,
  },
};

export default function Sidebar() {
  const navigate = useNavigate();
  const {user} = useAuth();

  const menuItems = allMenuItems.filter(item =>
    user?.pages?.includes(item.pageKey)
  );



  const location = useLocation();

  return (
    <div style={styles.sidebar}>
      <div style={styles.logo}>BROSE</div>
      <Menu
        mode="inline" //vertical
        selectedKeys={[location.pathname]}//current page
        defaultOpenKeys={['/master-data']}
        style={styles.menu}
        onClick={({ key }) => navigate(key)}
        items={menuItems}
      />
    </div>
  );
}
