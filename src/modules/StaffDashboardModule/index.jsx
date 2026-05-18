import { useMemo } from 'react';
import {
  Row, Col, Statistic, Card, Table,
  Spin, Alert, Divider, Progress, Typography,
} from 'antd';
import {
  UserOutlined,
  DollarCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  CalendarOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import useLanguage from '@/locale/useLanguage';
import { useMoney } from '@/settings';
import { request } from '@/request';
import useFetch from '@/hooks/useFetch';
import { selectMoneyFormat } from '@/redux/settings/selectors';

const { Title } = Typography;

export default function StaffDashboardModule() {

  const translate          = useLanguage();
  const { moneyFormatter } = useMoney();
  const moneySettings      = useSelector(selectMoneyFormat);

  const { result: data, isLoading, error } = useFetch(() =>
    request.get({ entity: 'dashboard/staff' })
  );

  // ── DEBUG LOGS — paste the console output to Claude, then remove these ──
  console.log('=== STAFF DASHBOARD DEBUG ===');
  console.log('isLoading:', isLoading);
  console.log('error:', error);
  console.log('data (raw from useFetch):', data);
  console.log('data.totalCollected:', data?.totalCollected);
  console.log('data.collections:', data?.collections);
  console.log('data.collections?.totalCollected:', data?.collections?.totalCollected);
  console.log('moneySettings (full object):', moneySettings);
  console.log('moneySettings.default_currency_code:', moneySettings?.default_currency_code);
  console.log('moneySettings.currency_code:', moneySettings?.currency_code);
  console.log('moneyFormatter:', moneyFormatter);
  console.log('moneyFormatter test (1000, INR):', moneyFormatter?.({ amount: 1000, currency_code: 'INR' }));
  console.log('moneyFormatter test (1000, undefined):', moneyFormatter?.({ amount: 1000, currency_code: undefined }));
  console.log('=============================');
  // ────────────────────────────────────────────────────────────────────────

  const currencyCode =
    moneySettings?.default_currency_code ||
    moneySettings?.currency_code         ||
    moneySettings?.currencyCode          ||
    'INR';

  const safeData       = data ?? {};
  const totalCollected = safeData.totalCollected  ?? safeData.collections?.totalCollected ?? 0;
  const totalPending   = safeData.pendingAmount   ?? safeData.collections?.totalPending   ?? 0;
  const monthCollected = safeData.monthCollected  ?? safeData.collections?.monthCollected  ?? 0;
  const overdueCount   = safeData.overdueCount    ?? safeData.installments?.overdue        ?? 0;
  const upcomingCount  = safeData.upcomingCount   ?? safeData.installments?.upcoming       ?? 0;
  const efficiency     = safeData.performance?.efficiency ?? 0;
  const efficiencyPct  = Math.min(100, Math.max(0, efficiency));
  const totalAssigned  = safeData.customerMetrics?.total ?? safeData.totalAssigned ?? 0;

  console.log('--- RESOLVED VALUES ---');
  console.log('currencyCode:', currencyCode);
  console.log('totalCollected:', totalCollected);
  console.log('totalPending:', totalPending);
  console.log('monthCollected:', monthCollected);
  console.log('formatMoney(totalCollected):', moneyFormatter?.({ amount: Number(totalCollected), currency_code: currencyCode }));
  console.log('-----------------------');

  const formatMoney = useMemo(
    () => (amount) =>
      moneyFormatter({ amount: Number(amount ?? 0), currency_code: currencyCode }),
    [moneyFormatter, currencyCode]
  );

  const summaryColumns = useMemo(
    () => [
      { title: translate('Metric'), dataIndex: 'title', key: 'title' },
      { title: translate('Value'),  dataIndex: 'value',  key: 'value' },
    ],
    [translate]
  );

  const summaryData = useMemo(
    () => [
      {
        key:   'total',
        title: translate('Total Assigned Customers'),
        value: safeData.customerMetrics?.total     ?? safeData.totalAssigned ?? 0,
      },
      {
        key:   'active',
        title: translate('Active'),
        value: safeData.customerMetrics?.active    ?? 0,
      },
      {
        key:   'completed',
        title: translate('Completed'),
        value: safeData.customerMetrics?.completed ?? 0,
      },
      {
        key:   'defaulted',
        title: translate('Defaulted'),
        value: safeData.customerMetrics?.defaulted ?? 0,
      },
    ],
    [safeData.customerMetrics, safeData.totalAssigned, translate]
  );

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <Spin size="large" tip={translate('Loading dashboard…')} />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message={translate('Failed to load dashboard')}
        description={translate('Please refresh the page or contact support.')}
        type="error"
        showIcon
        style={{ margin: '24px 0' }}
      />
    );
  }

  return (
    <div style={{ padding: '0 4px' }}>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={8}>
          <Card hoverable>
            <Statistic
              title={translate('Total Assigned')}
              value={totalAssigned}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card hoverable>
            <Statistic
              title={translate('Total Collected')}
              value={totalCollected}
              prefix={<DollarCircleOutlined />}
              formatter={formatMoney}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card hoverable>
            <Statistic
              title={translate('Pending Amount')}
              value={totalPending}
              prefix={<DollarCircleOutlined />}
              formatter={formatMoney}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title={translate('This Month Collected')}
              value={monthCollected}
              prefix={<ClockCircleOutlined />}
              formatter={formatMoney}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title={translate('Overdue Installments')}
              value={overdueCount}
              prefix={<WarningOutlined />}
              valueStyle={overdueCount > 0 ? { color: '#ff4d4f' } : undefined}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title={translate('Upcoming (7 days)')}
              value={upcomingCount}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title={translate('Collection Efficiency')}
              value={efficiencyPct}
              suffix="%"
              prefix={<BarChartOutlined />}
            />
            <Progress
              percent={efficiencyPct}
              status={
                efficiencyPct >= 75 ? 'success' :
                efficiencyPct >= 40 ? 'active'  : 'exception'
              }
              style={{ marginTop: 12 }}
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      <Row>
        <Col span={24}>
          <Card
            title={
              <Title level={5} style={{ margin: 0 }}>
                {translate('Customer Summary')}
              </Title>
            }
          >
            <Table
              dataSource={summaryData}
              columns={summaryColumns}
              rowKey="key"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

    </div>
  );
}
