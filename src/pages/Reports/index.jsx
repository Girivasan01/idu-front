/**
 * pages/Reports/index.jsx — Webaac Solutions Finance Management
 * - Date range filters BOTH the live page data and the CSV export
 * - Uses the same backend endpoint with ?from=&to= query params
 */
import { useState, useCallback, useEffect } from 'react';
import {
  Row, Col, Card, Table, Spin, Alert, Statistic,
  Typography, Grid, Space, DatePicker, Button, Divider, message,
} from 'antd';
import {
  DollarCircleOutlined, RiseOutlined, FallOutlined,
  LineChartOutlined, ExclamationCircleOutlined, DownloadOutlined,
} from '@ant-design/icons';
import { request } from '@/request';
import useLanguage from '@/locale/useLanguage';
import { useMoney } from '@/settings';
import { useSelector } from 'react-redux';
import { selectMoneyFormat } from '@/redux/settings/selectors';
import { DashboardLayout } from '@/layout';

const { RangePicker } = DatePicker;
const { useBreakpoint } = Grid;

export default function Reports() {
  const translate          = useLanguage();
  const { moneyFormatter } = useMoney();
  const moneySettings      = useSelector(selectMoneyFormat);
  const screens            = useBreakpoint();
  const isMobile           = !screens.md;

  const currencyCode =
    moneySettings?.default_currency_code ||
    moneySettings?.currency_code         ||
    'INR';

  const fmt = (v) =>
    moneyFormatter({ amount: Number(v ?? 0), currency_code: currencyCode });

  const [range,     setRange]     = useState([]);
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error,     setError]     = useState(null);

  // ── Fetch data (with optional date range) ─────────────────────────────────
  const fetchData = useCallback(async (from, to) => {
    setLoading(true);
    setError(null);
    try {
      let entity = 'reports';
      if (from && to) entity = `reports?from=${from}&to=${to}`;

      const res = await request.get({ entity });
      // useFetch wraps in result — raw request.get returns full response
      const d = res?.result ?? res ?? {};
      setData(d);
    } catch (err) {
      console.error('[Reports] fetch error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load — no date filter
  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Handle range picker change ────────────────────────────────────────────
  const handleRangeChange = (dates) => {
    setRange(dates || []);
    if (dates?.length === 2) {
      const from = dates[0].format('YYYY-MM-DD');
      const to   = dates[1].format('YYYY-MM-DD');
      fetchData(from, to);
    } else if (!dates) {
      // Cleared — reload full data
      fetchData();
    }
  };

  // ── CSV builder ───────────────────────────────────────────────────────────
  const buildAndDownloadCSV = (reportData, fromStr, toStr) => {
    const d = reportData ?? {};
    const rows = [
      ['=== COLLECTION SUMMARY ==='],
      fromStr && toStr
        ? [`Date Range: ${fromStr} to ${toStr}`]
        : ['Date Range: All Time'],
      [],
      ['Metric', 'Amount'],
      ['Total Collected',  d.collections?.totalCollected ?? 0],
      ['Pending Balance',  d.collections?.totalPending   ?? 0],
      ['Month Collected',  d.collections?.monthCollected ?? 0],
      ['Month Pending',    d.collections?.monthPending   ?? 0],
      [],
      ['=== STATUS BREAKDOWN ==='],
      ['Status', 'Count', 'Percentage'],
      ...(d.statusBreakdown || []).map((r) => [
        String(r.status || '').replace(/_/g, ' '),
        r.count,
        `${r.percentage}%`,
      ]),
      [],
      ['=== PLAN-WISE ANALYTICS ==='],
      ['Plan Group', 'Customers', 'Collected', 'Pending'],
      ...(d.planWise || []).map((r) => [
        r.planGroup || 'Unknown',
        r.customers ?? 0,
        r.collected ?? 0,
        r.pending   ?? 0,
      ]),
    ];

    const csv  = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    const label = fromStr && toStr ? `${fromStr}-to-${toStr}` : 'all-time';
    a.href     = url;
    a.download = `collection-report-${label}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // ── Export: uses the already-filtered data currently on screen ───────────
  const handleExportCSV = async () => {
    const from = range?.[0]?.format?.('YYYY-MM-DD') || '';
    const to   = range?.[1]?.format?.('YYYY-MM-DD') || '';

    // The page data is already filtered — just export what's displayed
    if (data) {
      setExporting(true);
      try {
        buildAndDownloadCSV(data, from, to);
        message.success(
          from && to
            ? `Filtered report (${from} → ${to}) downloaded`
            : 'Full report downloaded'
        );
      } finally {
        setExporting(false);
      }
      return;
    }

    // Fallback — fetch and export
    setExporting(true);
    try {
      let entity = 'reports';
      if (from && to) entity = `reports?from=${from}&to=${to}`;
      const res = await request.get({ entity });
      buildAndDownloadCSV(res?.result ?? res, from, to);
      message.success('Report downloaded');
    } catch (err) {
      message.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  // ── Defaulted amount from status breakdown ────────────────────────────────
  const defaultedAmount = (data?.statusBreakdown || [])
    .filter((s) => String(s.status).toLowerCase() === 'default')
    .reduce((sum, s) => sum + Number(s.pending || 0), 0);

  const kpis = [
    { title: 'Total Collected',  value: data?.collections?.totalCollected ?? 0, icon: <DollarCircleOutlined />, color: '#16a34a', bg: '#f0fdf4' },
    { title: 'Pending Balance',  value: data?.collections?.totalPending   ?? 0, icon: <FallOutlined />,          color: '#dc2626', bg: '#fef2f2' },
    { title: 'Month Collected',  value: data?.collections?.monthCollected ?? 0, icon: <RiseOutlined />,          color: '#2563eb', bg: '#eff6ff' },
    { title: 'Month Pending',    value: data?.collections?.monthPending   ?? 0, icon: <LineChartOutlined />,     color: '#d97706', bg: '#fffbeb' },
    { title: 'Defaulted Amount', value: defaultedAmount,                         icon: <ExclamationCircleOutlined />, color: '#b91c1c', bg: '#fef2f2' },
  ];

  const statusColumns = [
    {
      title:     'Status',
      dataIndex: 'status',
      render: (v) => {
        const w = String(v || '').replace(/_/g, ' ').toLowerCase()
          .split(' ').map((x) => x.charAt(0).toUpperCase() + x.slice(1)).join(' ');
        const colors = { Paid: '#52c41a', Late: '#fa8c16', Partial: '#faad14', Default: '#ff4d4f', 'Not Started': '#8c8c8c' };
        return <span style={{ color: colors[w] || '#595959', fontWeight: 500 }}>{w}</span>;
      },
    },
    { title: 'Count',      dataIndex: 'count',      align: 'right' },
    { title: 'Percentage', dataIndex: 'percentage', align: 'right', render: (v) => `${v}%` },
  ];

  const planColumns = [
    { title: 'Plan Group', dataIndex: 'planGroup',  render: (v) => v || 'Unknown' },
    { title: 'Customers',  dataIndex: 'customers',  align: 'right' },
    { title: 'Collected',  dataIndex: 'collected',  align: 'right', render: (v) => <span style={{ color: '#16a34a' }}>{fmt(v)}</span> },
    { title: 'Pending',    dataIndex: 'pending',    align: 'right', render: (v) => <span style={{ color: '#dc2626' }}>{fmt(v)}</span> },
  ];

  if (loading && !data) return (
    <DashboardLayout>
      <Spin size="large" style={{ display: 'block', margin: '120px auto' }} />
    </DashboardLayout>
  );

  if (error && !data) return (
    <DashboardLayout>
      <Alert message="Error loading reports" type="error" showIcon style={{ margin: 24 }} />
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div style={{ padding: isMobile ? 14 : 28 }}>

        {/* Header */}
        <Row justify="space-between" align="middle" gutter={[12, 12]}>
          <Col xs={24} md={12}>
            <Typography.Title level={isMobile ? 4 : 2} style={{ margin: 0 }}>
              Collection Reports
              {range?.length === 2 && (
                <Typography.Text
                  type="secondary"
                  style={{ fontSize: 13, fontWeight: 400, marginLeft: 12 }}
                >
                  {range[0].format('DD MMM YYYY')} → {range[1].format('DD MMM YYYY')}
                </Typography.Text>
              )}
            </Typography.Title>
          </Col>
          <Col xs={24} md={12}>
            <Space style={{ width: '100%', justifyContent: isMobile ? 'flex-start' : 'flex-end', flexWrap: 'wrap' }}>
              <RangePicker
                style={{ width: isMobile ? '100%' : 260 }}
                onChange={handleRangeChange}
                allowClear
              />
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleExportCSV}
                loading={exporting || loading}
                style={{ background: '#0f766e', border: 'none', fontWeight: 600 }}
              >
                {range?.length === 2 ? 'Export Filtered CSV' : 'Export CSV'}
              </Button>
            </Space>
          </Col>
        </Row>

        <Divider />

        {/* KPI Grid — shows filtered data when range is selected */}
        <Spin spinning={loading}>
          <div style={{
            display:             'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5, 1fr)',
            gap:                 14,
            marginBottom:        16,
          }}>
            {kpis.map((kpi, i) => (
              <Card key={i} bordered={false}
                style={{ background: kpi.bg, borderRadius: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
              >
                <Statistic
                  title={<span style={{ fontWeight: 600, fontSize: isMobile ? 11 : 13 }}>{kpi.title}</span>}
                  value={kpi.value}
                  prefix={<span style={{ color: kpi.color }}>{kpi.icon}</span>}
                  formatter={fmt}
                  valueStyle={{ color: kpi.color, fontSize: isMobile ? 16 : 20, fontWeight: 700 }}
                />
              </Card>
            ))}
          </div>
        </Spin>

        <Divider />

        {/* Tables — also filtered */}
        <Spin spinning={loading}>
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Status Breakdown" bordered={false} style={{ borderRadius: 12 }}>
                <Table
                  dataSource={data?.statusBreakdown ?? []}
                  columns={statusColumns}
                  pagination={false}
                  rowKey="status"
                  size="small"
                  scroll={{ x: true }}
                />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Plan-wise Analytics" bordered={false} style={{ borderRadius: 12 }}>
                <Table
                  dataSource={data?.planWise ?? []}
                  columns={planColumns}
                  pagination={false}
                  rowKey="planGroup"
                  size="small"
                  scroll={{ x: true }}
                />
              </Card>
            </Col>
          </Row>
        </Spin>

      </div>
    </DashboardLayout>
  );
}
