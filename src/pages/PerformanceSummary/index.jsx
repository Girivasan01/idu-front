/**
 * pages/PerformanceSummary/index.jsx — Webaac Solutions Finance Management
 * API: GET /api/dashboard/performance-summary
 */
import { useEffect, useState } from 'react';
import {
  Row, Col, Card, Spin, Alert, Divider,
  Statistic, Progress, Typography, Grid, Space,
} from 'antd';
import {
  DollarCircleOutlined, BarChartOutlined,
  CheckCircleOutlined, SyncOutlined,
  UserOutlined, WarningOutlined, CalendarOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { request } from '@/request';
import useFetch from '@/hooks/useFetch';
import useLanguage from '@/locale/useLanguage';
import { useMoney } from '@/settings';
import { selectMoneyFormat } from '@/redux/settings/selectors';
import { DashboardLayout } from '@/layout';

const { useBreakpoint } = Grid;
const BRAND = '#28a7ab';

const effColor = (e) => e >= 75 ? '#52c41a' : e >= 50 ? '#1890ff' : '#cf1322';
const effLabel = (e, translate) =>
  e > 80 ? translate('Excellent Collection Rate')
  : e > 50 ? translate('Average Collection Rate')
  : translate('Needs Improvement');

export default function PerformanceSummary() {
  const translate          = useLanguage();
  const { moneyFormatter } = useMoney();
  const moneySettings      = useSelector(selectMoneyFormat);
  const screens            = useBreakpoint();
  const isMobile           = !screens.md;
  const [loading, setLoading] = useState(true);

  // useFetch internally does: setData(apiResponse.result)
  // So dashboardData IS already the inner result object — never add .result again
  const { result: dashboardData, error } = useFetch(() =>
    request.get({ entity: 'dashboard/performance-summary' })
  );

  useEffect(() => {
    if (dashboardData || error) setLoading(false);
  }, [dashboardData, error]);

  // FIX 1: currency_code — cover every Redux key shape, fallback to 'INR'
  const currencyCode =
    moneySettings?.default_currency_code ||
    moneySettings?.currency_code         ||
    moneySettings?.currencyCode          ||
    'INR';

  // FIX 2: wrap moneyFormatter so Antd Statistic's formatter(value) call
  // is converted to moneyFormatter({ amount, currency_code }) correctly
  const formatMoney = (value) =>
    moneyFormatter({ amount: Number(value ?? 0), currency_code: currencyCode });

  if (loading) return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <Spin size="large" />
      </div>
    </DashboardLayout>
  );

  if (error) return (
    <DashboardLayout>
      <Alert message="Error loading performance data" type="error" showIcon style={{ margin: 24 }} />
    </DashboardLayout>
  );

  // FIX 3: dashboardData IS already the result object (useFetch unwraps the envelope).
  // Read flat fields first, nested paths as fallback, 0 as last resort.
  const safeData   = dashboardData ?? {};
  const efficiency = safeData.performance?.efficiency ?? safeData.efficiency ?? 0;

  // Monetary values — flat path first, nested collections path as fallback
  const totalCollected = safeData.totalCollected  ?? safeData.collections?.totalCollected ?? 0;
  const totalPending   = safeData.pendingAmount   ?? safeData.collections?.totalPending   ?? 0;
  const monthCollected = safeData.monthCollected  ?? safeData.collections?.monthCollected  ?? 0;

  // Customer metrics — flat path first, nested customerMetrics as fallback
  const activeCustomers = safeData.activeCustomers ?? safeData.customerMetrics?.active    ?? 0;
  const fullyPaid       = safeData.fullyPaid       ?? safeData.customerMetrics?.completed ?? 0;
  const defaultedCount  = safeData.defaultedCount  ?? safeData.customerMetrics?.defaulted ?? 0;
  const upcomingCount   = safeData.upcomingCount   ?? safeData.installments?.upcoming     ?? 0;

  const collectionCards = [
    {
      title: translate('Total Collected'),
      value: totalCollected,
      icon:  <DollarCircleOutlined style={{ color: '#52c41a' }} />,
      color: '#52c41a',
      bg:    '#f6ffed',
    },
    {
      title: translate('Pending Amount'),
      value: totalPending,
      icon:  <SyncOutlined style={{ color: '#faad14' }} />,
      color: '#faad14',
      bg:    '#fffbe6',
    },
    {
      title: translate('This Month Collected'),
      value: monthCollected,
      icon:  <CheckCircleOutlined style={{ color: BRAND }} />,
      color: BRAND,
      bg:    '#f0fafa',
    },
  ];

  const breakdownItems = [
    {
      title: translate('Active Customers'),
      value: activeCustomers,
      color: '#1890ff',
      icon:  <UserOutlined />,
    },
    {
      title: translate('Fully Paid Customers'),
      value: fullyPaid,
      color: '#52c41a',
      icon:  <CheckCircleOutlined />,
    },
    {
      title: translate('Defaulted Accounts'),
      value: defaultedCount,
      color: '#cf1322',
      icon:  <WarningOutlined />,
    },
    {
      title: translate('Upcoming Installments'),
      value: upcomingCount,
      color: '#595959',
      icon:  <CalendarOutlined />,
    },
  ];

  return (
    <DashboardLayout>
      <div style={{ padding: isMobile ? '12px 10px' : '24px' }}>

        <Typography.Title
          level={isMobile ? 4 : 3}
          style={{ marginBottom: isMobile ? 14 : 24, marginTop: 0 }}
        >
          {translate('My Performance Summary')}
        </Typography.Title>

        {/* Collection stat cards */}
        <Row gutter={[10, 10]} style={{ marginBottom: isMobile ? 14 : 0 }}>
          {collectionCards.map((card) => (
            <Col xs={24} sm={8} key={card.title}>
              <Card
                bordered={false}
                style={{ borderRadius: 10, background: card.bg, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                styles={{ body: { padding: isMobile ? '14px 16px' : '20px' } }}
              >
                <Statistic
                  title={<span style={{ fontSize: isMobile ? 12 : 14, color: '#8c8c8c' }}>{card.title}</span>}
                  value={card.value}
                  prefix={card.icon}
                  formatter={formatMoney}
                  valueStyle={{ color: card.color, fontSize: isMobile ? 18 : 22 }}
                />
              </Card>
            </Col>
          ))}
        </Row>

        <Divider style={{ margin: isMobile ? '14px 0' : '24px 0' }} />

        {/* Efficiency + Breakdown */}
        <Row gutter={[10, 10]}>
          <Col xs={24} md={12}>
            <Card
              title={
                <Space>
                  <BarChartOutlined style={{ color: BRAND }} />
                  <span>{translate('Overall Efficiency')}</span>
                </Space>
              }
              bordered={false}
              style={{ borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', height: '100%' }}
              styles={{ body: { padding: isMobile ? '16px' : '24px' } }}
            >
              <div style={{ textAlign: 'center', padding: isMobile ? '8px 0' : '16px 0' }}>
                <Progress
                  type="dashboard"
                  percent={Math.min(efficiency, 100)}
                  strokeColor={effColor(efficiency)}
                  format={(p) => `${p}%`}
                  size={isMobile ? 140 : 180}
                />
                <Typography.Title
                  level={isMobile ? 5 : 4}
                  style={{ marginTop: 14, marginBottom: 6, color: effColor(efficiency) }}
                >
                  {effLabel(efficiency, translate)}
                </Typography.Title>
                <Typography.Text type="secondary" style={{ fontSize: isMobile ? 12 : 13 }}>
                  {translate('Efficiency is calculated as collected amount versus expected installments.')}
                </Typography.Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card
              title={translate('Account Actions Breakdown')}
              bordered={false}
              style={{ borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', height: '100%' }}
              styles={{ body: { padding: isMobile ? '14px' : '24px' } }}
            >
              <Row gutter={[10, 16]}>
                {breakdownItems.map((item) => (
                  <Col xs={12} key={item.title}>
                    <Card
                      size="small"
                      bordered={false}
                      style={{
                        background:   `${item.color}0f`,
                        borderRadius: 8,
                        border:       `1px solid ${item.color}22`,
                      }}
                      styles={{ body: { padding: '12px' } }}
                    >
                      <div style={{ color: '#8c8c8c', fontSize: 11, marginBottom: 4 }}>{item.title}</div>
                      <div style={{ fontWeight: 700, fontSize: isMobile ? 20 : 24, color: item.color }}>
                        {item.value}
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>

      </div>
    </DashboardLayout>
  );
}
