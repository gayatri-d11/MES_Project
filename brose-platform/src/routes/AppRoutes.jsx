import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../layout/AppLayout';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../page/Login/LoginPage';
import DashboardPage from '../page/Dashboard/DashboardPage';
import TransactionPage from '../page/Transaction/TransactionPage';
import ProductionPage from '../page/Production/ProductionPage';
import SettingsPage from '../page/Settings/SettingsPage';
import MasterDataScreen1 from '../page/MasterData/MasterDataScreen1';
import MasterDataScreen2 from '../page/MasterData/MasterDataScreen2';


function LayoutWrapper({ component: Component, pageTitle }) {
  return (
    <AppLayout pageTitle={pageTitle}>
      <Component />
    </AppLayout>
  );
}

export default function AppRoutes() {
  return (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/" element={
      <ProtectedRoute allowedPages={['dashboard']}>
        <LayoutWrapper component={DashboardPage} pageTitle="Dashboard" />
      </ProtectedRoute>
    } />
    <Route path="/master-data/screen1" element={
      <ProtectedRoute allowedPages={['master_data']}>
        <LayoutWrapper component={MasterDataScreen1} pageTitle="Machine Layout & Reason Code" />
      </ProtectedRoute>
    } />
    <Route path="/master-data/screen2" element={
      <ProtectedRoute allowedPages={['master_data']}>
        <LayoutWrapper component={MasterDataScreen2} pageTitle="Variant, Shift & Planning" />
      </ProtectedRoute>
    } />
    <Route path="/transactions" element={
      <ProtectedRoute allowedPages={['transactions']}>
        <LayoutWrapper component={TransactionPage} pageTitle="Manual Transaction" />
      </ProtectedRoute>
    } />
    <Route path="/production" element={
      <ProtectedRoute allowedPages={['production']}>
        <LayoutWrapper component={ProductionPage} pageTitle="Production Dashboard" />
      </ProtectedRoute>
    } />
    <Route path="/settings" element={
      <ProtectedRoute allowedPages={['settings']}>
        <LayoutWrapper component={SettingsPage} pageTitle="Settings" />
      </ProtectedRoute>
    } />

    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

}
