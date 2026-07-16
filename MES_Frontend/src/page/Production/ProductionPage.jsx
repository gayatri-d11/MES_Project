import React, { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import { Card, Select, Button, DatePicker, Row, Col, Spin, Empty, Statistic, Tooltip as AntTooltip, Tabs } from 'antd';
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

const fmtDuration = (secs) => {
  const s = parseFloat(secs) || 0;
  const m = Math.floor(s / 60);
  const rem = Math.round(s % 60);
  return `${m}:${String(rem).padStart(2, '0')}`;
};

const fmtDurationText = (secs) => {
  const s = parseFloat(secs) || 0;
  const m = Math.floor(s / 60);
  const rem = Math.round(s % 60);
  if (m === 0) return `Total downtime is ${rem} sec`;
  if (rem === 0) return `Total downtime is ${m} min`;
  return `Total downtime is ${m} min ${rem} sec`;
};

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
  const [shiftPlanning, setShiftPlanning] = useState([]);
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
    apiFetch(`/shift-planning/`).then(r => r.json()).then(d => setShiftPlanning(Array.isArray(d) ? d : []));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedPlant) params.append('facility', selectedPlant);
    if (selectedWC) params.append('work_center', selectedWC);
    if (selectedShift) params.append('shift', selectedShift);
    apiFetch(`/products/?${params}`).then(r => r.json()).then(d => {
      setVariants(Array.isArray(d) ? d : []);
      setSelectedVariant(v => d.some(p => p.product_no === v) ? v : null);
    });
  }, [selectedPlant, selectedWC, selectedShift]);

  const filteredWCs = workCenters.filter(w => !selectedPlant || w.facility === selectedPlant);
  const filteredWSs = workstations.filter(w => !selectedWC || w.work_center_name === selectedWC);
  const filteredModules = machines.filter(m => !selectedWS || m.workstation_name === selectedWS);
  const filteredShifts = selectedWC
    ? shifts.filter(s => shiftPlanning.some(p => p.work_center_name === selectedWC && p.shift_name === s.shift_name))
    : shifts;

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
    { title: 'Total Production', value: data.kpis.totalProduction, suffix: 'pcs', color: colors.secondaryText, tooltip: `Total production is ${data.kpis.totalProduction} pieces (OK + NOK)` },
    { title: 'OK Count', value: data.kpis.totalOk, suffix: 'pcs', color: colors.success, tooltip: `${data.kpis.totalOk} pieces passed quality check` },
    { title: 'NOK Count', value: data.kpis.totalNok, suffix: 'pcs', color: colors.error, tooltip: `${data.kpis.totalNok} pieces failed quality check` },
    { title: 'Quality Rate', value: data.kpis.quality, suffix: '%', color: colors.primary, tooltip: `Quality rate is ${data.kpis.quality}% — ${data.kpis.totalOk} OK out of ${data.kpis.totalProduction} total` },
    { title: 'Total Downtime', value: fmtDuration(data.kpis.totalDowntime), suffix: '', color: colors.warning, tooltip: fmtDurationText(data.kpis.totalDowntime) },
  ] : [];

  const oeeKpis = data?.oeeKpis ? [
    { title: 'OEE', value: data.oeeKpis.oee ?? '—', suffix: data.oeeKpis.oee != null ? '%' : '', color: colors.primary, tooltip: 'Overall Equipment Effectiveness = (OK × Cycle Time) / TB' },
    { title: 'Availability (EA)', value: data.oeeKpis.availability ?? '—', suffix: data.oeeKpis.availability != null ? '%' : '', color: colors.success, tooltip: 'Availability = TN / TB' },
    { title: 'Performance (PE)', value: data.oeeKpis.performance ?? '—', suffix: data.oeeKpis.performance != null ? '%' : '', color: colors.secondaryText, tooltip: 'Performance = (Cycle Time × PPcs) / TN' },
    { title: 'Quality (QR)', value: data.oeeKpis.quality ?? '—', suffix: data.oeeKpis.quality != null ? '%' : '', color: colors.warning, tooltip: 'Quality = OK / PPcs' },
  ] : null;

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
              onChange={v => { setSelectedWC(v); setSelectedWS(null); setSelectedModule(null); setSelectedShift(null); }} disabled={!selectedPlant}>
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
              {filteredShifts.map(s => <Option key={s.id} value={s.shift_name}>{s.shift_name}</Option>)}
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
                <AntTooltip title={kpi.tooltip}>
                  <Card style={{ ...styles.kpiCard, cursor: 'default' }}>
                    <Statistic
                      title={<span style={{ fontSize: '12px', color: colors.textSecondary, fontFamily: constants.fontFamily }}>{kpi.title}</span>}
                      value={kpi.value}
                      suffix={kpi.suffix}
                      valueStyle={{ color: kpi.color, fontSize: '22px', fontFamily: constants.fontFamily }}
                    />
                  </Card>
                </AntTooltip>
              </Col>
            ))}
          </Row>



          <Tabs style={{ marginTop: constants.spacing.lg }} items={[
            {
              key: 'overview',
              label: 'Overview',
              children: !data || !hasData ? (
                <Card style={styles.chartCard}>
                  <Empty description="No production data found for the selected filters." />
                </Card>
              ) : (
                <>
                    {/* OEE — Downtime by Reason Code */}
                    <Row gutter={[16, 16]}>
                      <Col xs={24}>
                        <Card style={styles.chartCard}>
                          <span style={styles.chartTitle}>Downtime by Reason Code (mm:ss)</span>
                          {data.downtimeByReason.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                              <BarChart data={data.downtimeByReason} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="description" tick={{ fontSize: 11, fontFamily: constants.fontFamily }} />
                                <YAxis tickFormatter={fmtDuration} tick={{ fontSize: 11, fontFamily: constants.fontFamily }} />
                                <Tooltip formatter={(v, _, p) => [fmtDuration(v), p.payload.description]} />
                                <Bar dataKey="duration" name="Duration (mm:ss)" fill={colors.secondaryText} radius={[3, 3, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          ) : <Empty description="No downtime data." />}
                        </Card>
                      </Col>
                    </Row>

                    {/* Total Production Volume */}
                    <Row gutter={[16, 16]} style={{ marginTop: constants.spacing.lg }}>
                      <Col xs={24}>
                        <Card style={styles.chartCard}>
                          <span style={styles.chartTitle}>Total Production Volume</span>
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
                    </Row>

                    {/* OK Count by Variant + NOK Count by Variant */}
                    <Row gutter={[16, 16]} style={{ marginTop: constants.spacing.lg }}>
                      <Col xs={24} lg={12}>
                        <Card style={styles.chartCard}>
                          <span style={styles.chartTitle}>OK Count by Variant</span>
                          <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={data.productionByVariant} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                              <XAxis dataKey="variant" tick={{ fontSize: 11, fontFamily: constants.fontFamily }} />
                              <YAxis tick={{ fontSize: 11, fontFamily: constants.fontFamily }} />
                              <Tooltip />
                              <Bar dataKey="ok" name="OK" fill={colors.success} radius={[3, 3, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </Card>
                      </Col>
                      <Col xs={24} lg={12}>
                        <Card style={styles.chartCard}>
                          <span style={styles.chartTitle}>NOK Count by Variant</span>
                          <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={data.productionByVariant} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                              <XAxis dataKey="variant" tick={{ fontSize: 11, fontFamily: constants.fontFamily }} />
                              <YAxis tick={{ fontSize: 11, fontFamily: constants.fontFamily }} />
                              <Tooltip />
                              <Bar dataKey="nok" name="NOK" fill={colors.error} radius={[3, 3, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </Card>
                      </Col>
                    </Row>
                  </>
              ),
            },
            {
              key: 'analysis',
              label: 'Production Analysis',
              children: !data || !hasData ? (
                <Card style={styles.chartCard}>
                  <Empty description="No production data found for the selected filters." />
                </Card>
              ) : (
                <>
                    {/* OEE KPI Cards */}
                    {oeeKpis && (
                      <Row gutter={[12, 12]} style={{ marginTop: constants.spacing.lg }}>
                        {oeeKpis.map((kpi, i) => (
                          <Col xs={24} sm={12} lg={6} key={i} style={{ flex: '1 1 0' }}>
                            <AntTooltip title={kpi.tooltip}>
                              <Card style={{ ...styles.kpiCard, cursor: 'default' }}>
                                <Statistic
                                  title={<span style={{ fontSize: '12px', color: colors.textSecondary, fontFamily: constants.fontFamily }}>{kpi.title}</span>}
                                  value={kpi.value}
                                  suffix={kpi.suffix}
                                  valueStyle={{ color: kpi.color, fontSize: '22px', fontFamily: constants.fontFamily }}
                                />
                              </Card>
                            </AntTooltip>
                          </Col>
                        ))}
                      </Row>
                    )}

                    {/* Production Trend */}
                    {data.productionTrend.length > 0 ? (
                      <Row gutter={[16, 16]} style={{ marginTop: constants.spacing.lg }}>
                        <Col xs={24}>
                          <Card style={styles.chartCard}>
                            <span style={styles.chartTitle}>Production Trend by Date</span>
                            <ResponsiveContainer width="100%" height={280}>
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
                    ) : <Empty description="No trend data available." style={{ marginTop: 40 }} />}
                </>
              ),
            },
          ]} />

        </Spin>
      </div>
    </div>
  );
}
