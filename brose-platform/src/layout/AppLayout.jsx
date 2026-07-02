import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import colors from '../theme/colors';
import constants from '../theme/constants';

const styles = {
  wrapper: {
    display: 'flex',
    height: '100vh',
    backgroundColor: colors.background,
    fontFamily: constants.fontFamily,
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: constants.spacing.lg,
    overflowY: 'auto',
  },
};

export default function AppLayout({ children, pageTitle }) {
  return (
    <div style={styles.wrapper}>
      <Sidebar />
      <div style={styles.main}>
        <Header pageTitle={pageTitle} />
        <div style={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}
