
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, App as AntApp } from 'antd';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { AppDataProvider } from './context/AppDataContext';
import antTheme from './theme/antTheme';
import 'antd/dist/reset.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider theme={antTheme}>
      <AntApp>
        <AuthProvider>
          <AppDataProvider>
            <App />
          </AppDataProvider>
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  </React.StrictMode>
);
