import React, { useState, useEffect, useCallback } from 'react';
import { Card, Select, Button, DatePicker, Row, Col, Spin, Empty, Statistic } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import colors from '../../theme/colors';
import constants from '../../theme/constants';

import apiFetch from '../../utils/apiFetch';

const { Option } = Select;
const NOK_COLORS = ['#ff4d4f', '#faad14', '#c32d3e', '#005EA1', '#722ed1'];

const styles = {
  wrapper: { display: 'flex', gap: constants.spacing.lg },
  sidebar: { width: '200px', flexShrink: 0 },
  filterCard: { border: `1px solid ${colors.border}`, borderRadius: constants.borderRadius },
  filterTitle: { fontFamily: constants.fontFamily, fontWeight: '600', fontSize: '14px', color: colors.textPrimary, marginBottom: constants.spacing.md, display: 'block' },
  filterItem: { marginBottom: constants.spacing.md },
  filterLabel: { fontFamily: constants.fontFamily, fontSize: '12px', color: colors.textSecondary, marginBottom: constants.spacing.xs, display: 'block' },
  main: { flex: 1, minWidth: 0 },
  kpiCard: { border: `1px solid ${colors.border}`, borderRadius: constants.borderRadius, textAlign: 'center' },
  chartCard: { border: `1px solid ${colors.border}`, borderRadius: constants.borderRadius, marginTop: constants.spacing.lg },
  chartTitle: { fontSize: '13px', fontWeight: '600', fontFamily: constants.fontFamily, color: colors.textPrimary, marginBottom: constants.spacing.md, display: 'block' },
  topBar: { display: 'flex', justifyContent: 'flex-end', marginBottom: constants.spacing.md, gap: constants.spacing.sm },
};

export default function ProductionPage() {
const [plants, setPlants] = useState([]);
  const [workCenters, setWorkCenters] = useState([]);
  const [workstations, setWorkstations] = useState([]);
  const [machines, setMachines] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [variants, setVariants] = useState([]);

  const [selectedPlant, setSelectedPlant] = useState(null);
  const [selectedWC, setSelectedWC] = useState(null);
  const [selectedWS, setSelectedWS] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedShift, setSelectedShift] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    apiFetch(`/plants/`).then(r => r.json()).then(d => setPlants(Array.isArray(d) ? d : []));
    apiFetch(`/work-centers/`).then(r => r.json()).then(d => setWorkCenters(Array.isArray(d) ? d : []));
    apiFetch(`/workstations/`).then(r => r.json()).then(d => setWorkstations(Array.isArray(d) ? d : []));
    apiFetch(`/machines/`).then(r => r.json()).then(d => setMachines(Array.isArray(d) ? d : []));
    apiFetch(`/shifts/`).then(r => r.json()).then(d => setShifts(Array.isArray(d) ? d : []));
    apiFetch(`/products/`).then(r => r.json()).then(d => setVariants(Array.isArray(d) ? d : []));
  }, []);

  const filteredWCs = workCenters.filter(w => !selectedPlant || w.facility === selectedPlant);
  const filteredWSs = workstations.filter(w => !selectedWC || w.work_center_name === selectedWC);
  const filteredModules = machines.filter(m => !selectedWS || m.workstation_name === selectedWS);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedPlant) params.append('facility', selectedPlant);
    if (selectedWC) params.append('work_center', selectedWC);
    if (selectedWS) params.append('workstation', selectedWS);
    if (selectedModule) params.append('module', selectedModule);
    if (selectedShift) params.append('shift', selectedShift);
    if (selectedVariant) params.append('variant', selectedVariant);
    if (selectedDate) params.append('date_from', selectedDate.format('YYYY-MM-DD'));
    if (selectedDate) params.append('date_to', selectedDate.format('YYYY-MM-DD'));

    try {
      const res = await apiFetch(`/production-dashboard/?${params}`);
      const json = await res.json();
      setData(json);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedPlant, selectedWC, selectedWS, selectedModule, selectedShift, selectedVariant, selectedDate]);

  // Auto-fetch on mount and filter change
  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const kpis = data ? [
    { title: 'Total Production', value: data.kpis.totalProduction, color: colors.secondaryText, suffix: 'pcs' },
    { title: 'OK Count', value: data.kpis.totalOk, color: colors.success, suffix: 'pcs' },
    { title: 'NOK Count', value: data.kpis.totalNok, color: colors.error, suffix: 'pcs' },
    { title: 'Quality Rate', value: data.kpis.quality, color: colors.primary, suffix: '%' },
    { title: 'Total Downtime', value: data.kpis.totalDowntime, color: colors.warning, suffix: 'min' },
  ] : [];

  const hasData = data && data.kpis.totalProduction > 0;

  return (
    <div style={styles.wrapper}>

      {/* Filter Sidebar */}
      <div style={styles.sidebar}>
        <Card style={styles.filterCard}>
          <span style={styles.filterTitle}>Filters</span>

          <div style={styles.filterItem}>
            <span style={styles.filterLabel}>Plant</span>
            <Select allowClear placeholder="All Plants" style={{ width: '100%' }} value={selectedPlant}
              onChange={v => { setSelectedPlant(v); setSelectedWC(null); }}>
              {plants.map(p => <Option key={p.facility} value={p.facility}>{p.facility}</Option>)}
            </Select>
          </div>

          <div style={styles.filterItem}>
            <span style={styles.filterLabel}>Work Centre</span>
            <Select allowClear placeholder="All WCs" style={{ width: '100%' }} value={selectedWC}
              onChange={v => { setSelectedWC(v); setSelectedWS(null); setSelectedModule(null); }} disabled={!selectedPlant}>
              {filteredWCs.map(w => <Option key={w.work_center} value={w.work_center}>{w.work_center}</Option>)}
            </Select>
          </div>

          <div style={styles.filterItem}>
            <span style={styles.filterLabel}>Work Station</span>
            <Select allowClear placeholder="All WSs" style={{ width: '100%' }} value={selectedWS}
              onChange={v => { setSelectedWS(v); setSelectedModule(null); }} disabled={!selectedWC}>
              {filteredWSs.map(w => <Option key={w.id} value={w.resource_name}>{w.resource_name}</Option>)}
            </Select>
          </div>

          <div style={styles.filterItem}>
            <span style={styles.filterLabel}>Module</span>
            <Select allowClear placeholder="All Modules" style={{ width: '100%' }} value={selectedModule}
              onChange={setSelectedModule} disabled={!selectedWS}>
              {filteredModules.map(m => <Option key={m.id} value={m.equipment}>{m.equipment}</Option>)}
            </Select>
          </div>

          <div style={styles.filterItem}>
            <span style={styles.filterLabel}>Shift</span>
            <Select allowClear placeholder="All Shifts" style={{ width: '100%' }} value={selectedShift}
              onChange={setSelectedShift}>
              {shifts.map(s => <Option key={s.id} value={s.shift_name}>{s.shift_name}</Option>)}
            </Select>
          </div>

          <div style={styles.filterItem}>
            <span style={styles.filterLabel}>Variant</span>
            <Select allowClear placeholder="All Variants" style={{ width: '100%' }} value={selectedVariant}
              onChange={setSelectedVariant}>
              {variants.map(v => <Option key={v.id} value={v.product_no}>{v.product_no}</Option>)}
            </Select>
          </div>

          <div style={styles.filterItem}>
            <span style={styles.filterLabel}>Date</span>
            <DatePicker style={{ width: '100%' }} size="small" value={selectedDate} onChange={setSelectedDate} />
          </div>

          <Button type="primary" icon={<ReloadOutlined />} style={{ width: '100%', marginTop: constants.spacing.sm }}
            onClick={fetchDashboard} loading={loading}>
            Refresh
          </Button>
        </Card>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        <Spin spinning={loading}>

          {/* KPI Cards */}
          <Row gutter={[12, 12]}>
            {kpis.map((kpi, i) => (
              <Col xs={24} sm={12} lg={kpis.length === 5 ? 5 : 6} key={i} style={{ flex: '1 1 0' }}>
                <Card style={styles.kpiCard}>
                  <Statistic
                    title={<span style={{ fontSize: '12px', color: colors.textSecondary, fontFamily: constants.fontFamily }}>{kpi.title}</span>}
                    value={kpi.value}
                    suffix={kpi.suffix}
                    valueStyle={{ color: kpi.color, fontSize: '22px', fontFamily: constants.fontFamily }}
                  />
                </Card>
              </Col>
            ))}
          </Row>

          {!hasData && !loading && (
            <Card style={{ ...styles.chartCard, marginTop: constants.spacing.xl }}>
              <Empty description="No production data found for the selected filters." />
            </Card>
          )}

          {hasData && (
            <>
              {/* Row 1: Production by Variant + OK vs NOK Pie */}
              <Row gutter={[16, 16]} style={{ marginTop: constants.spacing.lg }}>
                <Col xs={24} lg={14}>
                  <Card style={styles.chartCard}>
                    <span style={styles.chartTitle}>Production by Variant</span>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={data.productionByVariant} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="variant" tick={{ fontSize: 11, fontFamily: constants.fontFamily }} />
                        <YAxis tick={{ fontSize: 11, fontFamily: constants.fontFamily }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="ok" name="OK" fill={colors.success} radius={[3, 3, 0, 0]} />
                        <Bar dataKey="nok" name="NOK" fill={colors.error} radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>

                <Col xs={24} lg={10}>
                  <Card style={styles.chartCard}>
                    <span style={styles.chartTitle}>OK vs NOK Distribution</span>
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'OK', value: data.kpis.totalOk },
                            { name: 'NOK', value: data.kpis.totalNok },
                          ]}
                          cx="50%" cy="50%" outerRadius={90} dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                          labelLine={false}
                        >
                          <Cell fill={colors.success} />
                          <Cell fill={colors.error} />
                        </Pie>
                        <Tooltip formatter={(v) => v.toLocaleString()} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
              </Row>

              {/* Row 2: Production Trend */}
              {data.productionTrend.length > 0 && (
                <Row gutter={[16, 16]} style={{ marginTop: constants.spacing.lg }}>
                  <Col xs={24}>
                    <Card style={styles.chartCard}>
                      <span style={styles.chartTitle}>Production Trend by Date</span>
                      <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={data.productionTrend} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: constants.fontFamily }} />
                          <YAxis tick={{ fontSize: 11, fontFamily: constants.fontFamily }} />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="ok" name="OK" stroke={colors.success} strokeWidth={2} dot={{ r: 4 }} />
                          <Line type="monotone" dataKey="nok" name="NOK" stroke={colors.error} strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </Card>
                  </Col>
                </Row>
              )}

              {/* Row 3: Downtime by Reason + NOK by Type */}
              <Row gutter={[16, 16]} style={{ marginTop: constants.spacing.lg }}>
                {data.downtimeByReason.length > 0 && (
                  <Col xs={24} lg={data.nokByType.length > 0 ? 14 : 24}>
                    <Card style={styles.chartCard}>
                      <span style={styles.chartTitle}>Downtime by Reason Code (min)</span>
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={data.downtimeByReason} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="reasonCode" tick={{ fontSize: 11, fontFamily: constants.fontFamily }} />
                          <YAxis tick={{ fontSize: 11, fontFamily: constants.fontFamily }} />
                          <Tooltip formatter={(v, _, p) => [`${v} min`, p.payload.description]} />
                          <Bar dataKey="duration" name="Duration (min)" fill={colors.secondaryText} radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                  </Col>
                )}

                {data.nokByType.length > 0 && (
                  <Col xs={24} lg={data.downtimeByReason.length > 0 ? 10 : 24}>
                    <Card style={styles.chartCard}>
                      <span style={styles.chartTitle}>NOK by Type</span>
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie
                            data={data.nokByType}
                            dataKey="count" nameKey="type"
                            cx="50%" cy="50%" outerRadius={90}
                            label={({ type, percent }) => `${type} ${(percent * 100).toFixed(1)}%`}
                            labelLine={false}
                          >
                            {data.nokByType.map((_, i) => (
                              <Cell key={i} fill={NOK_COLORS[i % NOK_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v) => v.toLocaleString()} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Card>
                  </Col>
                )}
              </Row>
            </>
          )}

        </Spin>
      </div>
    </div>
  );
}
