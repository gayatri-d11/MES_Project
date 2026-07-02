import React from 'react';
import { Card, Select, Button, Tabs, DatePicker, Row, Col } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useAppData } from '../../context/AppDataContext';
import colors from '../../theme/colors';
import constants from '../../theme/constants';

const { Option } = Select;

const CHART_COLORS = ['#52c41a', '#ff4d4f', '#c32d3e', '#005EA1', '#faad14'];

const styles = {
  wrapper: {
    display: 'flex',
    gap: constants.spacing.lg,
  },
  filterSidebar: {
    width: '200px',
    flexShrink: 0,
  },
  filterCard: {
    border: `1px solid ${colors.border}`,
    borderRadius: constants.borderRadius,
  },
  filterTitle: {
    fontFamily: constants.fontFamily,
    fontWeight: '600',
    fontSize: '14px',
    color: colors.textPrimary,
    marginBottom: constants.spacing.md,
    display: 'block',
  },
  filterItem: {
    marginBottom: constants.spacing.md,
  },
  filterLabel: {
    fontFamily: constants.fontFamily,
    fontSize: '12px',
    color: colors.textSecondary,
    marginBottom: constants.spacing.xs,
    display: 'block',
  },
  mainContent: {
    flex: 1,
  },
  tabsCard: {
    border: `1px solid ${colors.border}`,
    borderRadius: constants.borderRadius,
  },
  exportBtn: {
    marginBottom: constants.spacing.md,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  kpiCard: {
    border: `1px solid ${colors.border}`,
    borderRadius: constants.borderRadius,
    textAlign: 'center',
  },
  kpiTitle: {
    fontSize: '12px',
    color: colors.textSecondary,
    fontFamily: constants.fontFamily,
    marginBottom: '8px',
  },
  kpiValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    fontFamily: constants.fontFamily,
  },
  chartCard: {
    border: `1px solid ${colors.border}`,
    borderRadius: constants.borderRadius,
    marginTop: constants.spacing.lg,
  },
  chartTitle: {
    fontSize: '13px',
    fontWeight: '600',
    fontFamily: constants.fontFamily,
    color: colors.textPrimary,
    marginBottom: constants.spacing.md,
    display: 'block',
  },
};

export default function ProductionPage() {
  const {
    productionSummary,
    productionByVariant,
    downtimeByReason,
    machineLayout,
    shifts,
    variants,
  } = useAppData();

  const plants = [...new Set(machineLayout.map(m => m.plant))];
  const workCentres = [...new Set(machineLayout.map(m => m.workCentre))];
  const workStations = [...new Set(machineLayout.map(m => m.workStation))];
  const modules = [...new Set(machineLayout.map(m => m.module))];

  const kpis = [
    { title: 'OEE', value: `${productionSummary.oee}%`, color: colors.secondaryText },
    { title: 'Total Production', value: productionSummary.totalProduction.toLocaleString(), color: colors.primary },
    { title: 'OK Count', value: productionSummary.okCount.toLocaleString(), color: colors.success },
    { title: 'NOK Count', value: productionSummary.nokCount.toLocaleString(), color: colors.error },
  ];

  const overviewTab = (
    <div>
      {/* KPI Cards */}
      <Row gutter={[16, 16]}>
        {kpis.map((kpi, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card style={styles.kpiCard}>
              <div style={styles.kpiTitle}>{kpi.title}</div>
              <div style={{ ...styles.kpiValue, color: kpi.color }}>{kpi.value}</div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginTop: constants.spacing.lg }}>

        {/* Production by Variant — Bar Chart */}
        <Col xs={24} lg={12}>
          <Card style={styles.chartCard}>
            <span style={styles.chartTitle}>Production by Variant</span>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={productionByVariant}>
                <XAxis dataKey="variant" tick={{ fontSize: 11, fontFamily: constants.fontFamily }} />
                <YAxis tick={{ fontSize: 11, fontFamily: constants.fontFamily }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="ok" name="OK Count" fill={colors.success} />
                <Bar dataKey="nok" name="NOK Count" fill={colors.error} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* OK vs NOK — Pie Chart */}
        <Col xs={24} lg={12}>
          <Card style={styles.chartCard}>
            <span style={styles.chartTitle}>OK vs NOK Distribution</span>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'OK Count', value: productionSummary.okCount },
                    { name: 'NOK Count', value: productionSummary.nokCount },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                >
                  <Cell fill={colors.success} />
                  <Cell fill={colors.error} />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Downtime by Reason Code — Bar Chart */}
        <Col xs={24}>
          <Card style={styles.chartCard}>
            <span style={styles.chartTitle}>Downtime by Reason Code (minutes)</span>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={downtimeByReason}>
                <XAxis dataKey="reasonCode" tick={{ fontSize: 11, fontFamily: constants.fontFamily }} />
                <YAxis tick={{ fontSize: 11, fontFamily: constants.fontFamily }} />
                <Tooltip
                  formatter={(value, name, props) => [`${value} min`, props.payload.description]}
                />
                <Bar dataKey="duration" name="Duration (min)" fill={colors.primary} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

      </Row>
    </div>
  );

  const tabItems = [
    { key: '1', label: 'Overview', children: overviewTab },
  ];

  return (
    <div style={styles.wrapper}>

      {/* Left Filter Sidebar */}
      <div style={styles.filterSidebar}>
        <Card style={styles.filterCard}>
          <span style={styles.filterTitle}>Filters</span>

          <div style={styles.filterItem}>
            <span style={styles.filterLabel}>Plant</span>
            <Select placeholder="Select" style={{ width: '100%' }}>
              {plants.map(p => <Option key={p} value={p}>{p}</Option>)}
            </Select>
          </div>

          <div style={styles.filterItem}>
            <span style={styles.filterLabel}>Work Centre</span>
            <Select placeholder="Select" style={{ width: '100%' }}>
              {workCentres.map(wc => <Option key={wc} value={wc}>{wc}</Option>)}
            </Select>
          </div>

          <div style={styles.filterItem}>
            <span style={styles.filterLabel}>Work Station</span>
            <Select placeholder="Select" style={{ width: '100%' }}>
              {workStations.map(ws => <Option key={ws} value={ws}>{ws}</Option>)}
            </Select>
          </div>

          <div style={styles.filterItem}>
            <span style={styles.filterLabel}>Module</span>
            <Select placeholder="Select" style={{ width: '100%' }}>
              {modules.map(m => <Option key={m} value={m}>{m}</Option>)}
            </Select>
          </div>

          <div style={styles.filterItem}>
            <span style={styles.filterLabel}>Shift</span>
            <Select placeholder="Select" style={{ width: '100%' }}>
              {shifts.map(s => <Option key={s.key} value={s.shiftName}>{s.shiftName}</Option>)}
            </Select>
          </div>

          <div style={styles.filterItem}>
            <span style={styles.filterLabel}>Variant</span>
            <Select placeholder="Select" style={{ width: '100%' }}>
              {variants.map(v => <Option key={v.key} value={v.materialNumber}>{v.materialNumber}</Option>)}
            </Select>
          </div>

          <div style={styles.filterItem}>
            <span style={styles.filterLabel}>Date Range</span>
            <DatePicker.RangePicker style={{ width: '100%' }} size="small" />
          </div>

        </Card>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.exportBtn}>
          <Button icon={<ExportOutlined />} style={{ borderColor: colors.secondaryText, color: colors.secondaryText }}>
            Export
          </Button>
        </div>
        <Card style={styles.tabsCard}>
          <Tabs items={tabItems} />
        </Card>
      </div>

    </div>
  );
}
