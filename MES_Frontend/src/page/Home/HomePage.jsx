import React from 'react';
import { Card, Row, Col, Tag, Divider, Timeline } from 'antd';
import {
  DatabaseOutlined,
  FormOutlined,
  BarChartOutlined,
  AimOutlined,
  ToolOutlined,
  LineChartOutlined,
  ShopOutlined,
  FilePdfOutlined,
} from '@ant-design/icons';
import colors from '../../theme/colors';
import constants from '../../theme/constants';

const pages = [
  {
    icon: <DatabaseOutlined style={{ fontSize: 28, color: colors.secondaryText }} />,
    title: 'Master Data',
    tag: 'Step 1',
    tagColor: 'blue',
    description: 'Set up your plant hierarchy — Plants, Work Centers, Workstations, and Machines. Define Reason Codes, Shifts, Shift Planning, and Product Variants. This must be configured before any transactions can be recorded.',
  },
  {
    icon: <FormOutlined style={{ fontSize: 28, color: colors.primary }} />,
    title: 'Manual Transaction',
    tag: 'Step 2',
    tagColor: 'red',
    description: 'Record daily shift transactions — downtime events with reason codes, target cycle times per module, resource planning per workstation, production counts (OK/NOK), and customer complaints. Select Plant → Work Center → Shift → Date to begin.',
  },
  {
    icon: <BarChartOutlined style={{ fontSize: 28, color: colors.success }} />,
    title: 'Production Dashboard',
    tag: 'Step 3',
    tagColor: 'green',
    description: 'Visualize production performance with KPI cards and charts. Filter by Plant, Work Center, Workstation, Module, Shift, Variant, and Date. See production by variant, OK vs NOK distribution, and downtime by reason code.',
  },
];

const s = {
  hero: {
    background: `linear-gradient(135deg, ${colors.primary} 0%, #8b1a26 60%, #1a1a2e 100%)`,
    borderRadius: constants.borderRadius,
    padding: '48px 40px',
    marginBottom: constants.spacing.lg,
    overflow: 'hidden',
    minHeight: '220px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: constants.spacing.lg,
  },
  heroText: { flex: 1 },
  heroTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: constants.fontFamily,
    margin: 0,
    letterSpacing: '1px',
  },
  heroSub: {
    fontSize: '15px',
    color: 'rgba(255,255,255,0.82)',
    fontFamily: constants.fontFamily,
    marginTop: '10px',
    lineHeight: '1.6',
    maxWidth: '560px',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '20px',
    padding: '4px 14px',
    fontSize: '12px',
    color: '#ffffff',
    fontFamily: constants.fontFamily,
    marginBottom: '14px',
    letterSpacing: '0.5px',
    gap: '6px',
  },
  sectionTitle: {
    fontSize: '17px',
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: constants.fontFamily,
    marginBottom: constants.spacing.md,
  },
  pageCard: {
    border: `1px solid ${colors.border}`,
    borderRadius: constants.borderRadius,
    height: '100%',
  },
  pageCardTop: {
    display: 'flex',
    alignItems: 'center',
    gap: constants.spacing.sm,
    marginBottom: constants.spacing.sm,
  },
  pageCardTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: constants.fontFamily,
    margin: 0,
  },
  pageCardDesc: {
    fontSize: '13px',
    color: colors.textSecondary,
    fontFamily: constants.fontFamily,
    lineHeight: '1.6',
    margin: 0,
  },
  card: {
    border: `1px solid ${colors.border}`,
    borderRadius: constants.borderRadius,
  },
  text: {
    fontSize: '13px',
    color: colors.textSecondary,
    fontFamily: constants.fontFamily,
    lineHeight: '1.8',
    margin: 0,
  },
  timelineLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: constants.fontFamily,
  },
  timelineDesc: {
    fontSize: '12px',
    color: colors.textSecondary,
    fontFamily: constants.fontFamily,
  },
  featureBox: (color) => ({
    background: `${color}10`,
    border: `1px solid ${color}30`,
    borderRadius: constants.borderRadius,
    padding: constants.spacing.md,
    height: '100%',
  }),
  featureTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: '8px',
    fontFamily: constants.fontFamily,
  },
};

export default function HomePage() {
  return (
    <div style={{ fontFamily: constants.fontFamily }}>

      {/* Hero */}
      <div style={s.hero}>
        <div style={s.heroText}>
          <div style={s.heroBadge}>
            <ShopOutlined />Plant Digitalization Platform
          </div>
          <div style={s.heroTitle}>Welcome to Brose</div>
          <div style={s.heroSub}>
            A unified digital platform for recording shift transactions, monitoring
            production performance, and managing plant master data.
          </div>
        </div>
      </div>

      {/* About Brose */}
      <Card style={{ ...s.card, marginBottom: constants.spacing.lg }}>
        <div style={s.sectionTitle}>About Brose</div>
        <p style={s.text}>
          Brose is a family-owned automotive supplier headquartered in Coburg, Germany, founded in 1908.
          The company develops and manufactures mechatronic components and systems — primarily for vehicle
          doors, seats, and electric motors — and supplies to major automotive manufacturers worldwide.
        </p>
        <p style={{ ...s.text, marginTop: constants.spacing.md }}>
          This platform supports Brose's plant digitalization efforts by replacing manual shift logs with
          a structured digital system. It gives operators a simple way to record production data and gives
          supervisors real-time visibility into plant performance.
        </p>
      </Card>

      {/* How to Use */}
      <div style={{ marginBottom: constants.spacing.lg }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: constants.spacing.md }}>
          <div style={s.sectionTitle}>How to Use This Application</div>
          <a href="/Brose_Plant_Digitalization_Manual_V1.0.pdf" target="_blank" rel="noreferrer">
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontFamily: constants.fontFamily, fontWeight: 500 }}>
              <FilePdfOutlined /> User Manual
            </button>
          </a>
        </div>
        <Row gutter={[16, 16]}>
          {pages.map((page, i) => (
            <Col xs={24} sm={12} lg={8} key={i}>
              <Card style={s.pageCard}>
                <div style={s.pageCardTop}>
                  {page.icon}
                  <div>
                    <div style={s.pageCardTitle}>{page.title}</div>
                    <Tag color={page.tagColor} style={{ marginTop: '2px', fontSize: '11px' }}>{page.tag}</Tag>
                  </div>
                </div>
                <Divider style={{ margin: '10px 0' }} />
                <p style={s.pageCardDesc}>{page.description}</p>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Workflow */}
      <Card style={{ ...s.card, marginBottom: constants.spacing.lg }}>
        <div style={s.sectionTitle}>Recommended Workflow</div>
        <Timeline
          items={[
            {
              color: 'blue',
              children: (
                <div>
                  <div style={s.timelineLabel}>Configure Master Data</div>
                  <div style={s.timelineDesc}>Set up Plants, Work Centers, Workstations, Machines, Reason Codes, Shifts, and Products before recording any transactions.</div>
                </div>
              ),
            },
            {
              color: 'red',
              children: (
                <div>
                  <div style={s.timelineLabel}>Record Daily Transactions</div>
                  <div style={s.timelineDesc}>Each shift, log downtime, target cycle times, resource allocation, production counts (OK/NOK), and customer complaints.</div>
                </div>
              ),
            },
            {
              color: 'green',
              children: (
                <div>
                  <div style={s.timelineLabel}>Monitor Production</div>
                  <div style={s.timelineDesc}>Use the Production Dashboard to review KPIs, downtime patterns, quality rates, and variant performance across shifts.</div>
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Platform Features */}
      <Card style={{ ...s.card, marginBottom: constants.spacing.lg }}>
        <div style={s.sectionTitle}>Platform Features</div>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <div style={s.featureBox(colors.primary)}>
              <AimOutlined style={{ fontSize: '22px', color: colors.primary, marginBottom: '8px', display: 'block' }} />
              <div style={s.featureTitle}>Downtime Tracking</div>
              <p style={s.text}>Log downtime per module with reason codes. Distinguish between planned and unplanned stops to support maintenance decisions.</p>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={s.featureBox(colors.secondaryText)}>
              <ToolOutlined style={{ fontSize: '22px', color: colors.secondaryText, marginBottom: '8px', display: 'block' }} />
              <div style={s.featureTitle}>Production Recording</div>
              <p style={s.text}>Record OK and NOK counts per variant per shift. Capture NOK type and reason code for quality traceability.</p>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={s.featureBox(colors.success)}>
              <LineChartOutlined style={{ fontSize: '22px', color: colors.success, marginBottom: '8px', display: 'block' }} />
              <div style={s.featureTitle}>Performance Visibility</div>
              <p style={s.text}>Filter and visualize production KPIs across plants, shifts, and variants. Identify trends and quality issues at a glance.</p>
            </div>
          </Col>
        </Row>
      </Card>

    </div>
  );
}
