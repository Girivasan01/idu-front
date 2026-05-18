/**
 * pages/Performance/index.jsx — Webaac Solutions Finance Management
 * API: GET /api/staff/performance
 * Response: { success, result: { staffWise[], activeCount, topPerformer } }
 */
import { useEffect, useState } from 'react';
import {
  Row, Col, Card, Table, Spin, Alert, Statistic,
  Typography, Grid, Progress, Tag, Space, Avatar,
} from 'antd';
import {
  TeamOutlined, TrophyOutlined, DollarOutlined,
  UserOutlined, WarningOutlined, RiseOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { request } from '@/request';
import useFetch from '@/hooks/useFetch';
import useLanguage from '@/locale/useLanguage';
import { useMoney } from '@/settings';
import { DashboardLayout } from '@/layout';

const { useBreakpoint } = Grid;

const BRAND    = '#28a7ab';
const effColor = (e) => e >= 75 ? '#52c41a' : e >= 50 ? '#faad14' : '#ff4d4f';

function StaffCard({ staff, rank, moneyFormatter }) {
  const isTop = rank === 1;
  return (
    <Card
      size="small"
      style={{
        marginBottom: 12,
        borderRadius: 12,
        border: isTop ? '1.5px solid #faad14' : '1px solid #f0f0f0',
        boxShadow: isTop ? '0 2px 12px rgba(250,173,20,0.15)' : '0 1px 4px rgba(0,0,0,0.06)',
        position: 'relative',
        overflow: 'visible',
      }}
      styles={{ body: { padding: '14px 16px' } }}
    >
      <div style={{
        position: 'absolute', top: -10, left: 14,
        background: isTop ? '#faad14' : BRAND,
        color: '#fff', borderRadius: 20, padding: '1px 10px',
        fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4,
      }}>
        {isTop ? <><TrophyOutlined /> Top</> : `#${rank}`}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6, marginBottom: 14 }}>
        <Avatar size={42} icon={<UserOutlined />} style={{ background: isTop ? '#faad14' : BRAND, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{staff.name}</div>
          <div style={{ color: '#8c8c8c', fontSize: 12 }}>{staff.email || staff.phone || '—'}</div>
        </div>
        <Tag color={effColor(staff.efficiency)} style={{ borderRadius: 20, fontWeight: 600, fontSize: 12 }}>
          {staff.efficiency}%
        </Tag>
      </div>
      <Row gutter={[10, 10]}>
        <Col span={12}>
          <div style={{ background: '#f6ffed', borderRadius: 8, padding: '8px 10px', border: '1px solid #52c41a22' }}>
            <div style={{ color: '#8c8c8c', fontSize: 11, marginBottom: 2 }}>Total Collected</div>
            <div style={{ fontWeight: 700, color: '#52c41a', fontSize: 14 }}>{moneyFormatter({ amount: staff.totalCollected })}</div>
          </div>
        </Col>
        <Col span={12}>
          <div style={{ background: '#fff7e6', borderRadius: 8, padding: '8px 10px', border: '1px solid #fa8c1622' }}>
            <div style={{ color: '#8c8c8c', fontSize: 11, marginBottom: 2 }}>Pending</div>
            <div style={{ fontWeight: 700, color: '#fa8c16', fontSize: 14 }}>{moneyFormatter({ amount: staff.totalPending })}</div>
          </div>
        </Col>
        <Col span={8}>
          <div style={{ background: '#e6f7ff', borderRadius: 8, padding: '8px 10px', border: '1px solid #1890ff22' }}>
            <div style={{ color: '#8c8c8c', fontSize: 11, marginBottom: 2 }}>Clients</div>
            <div style={{ fontWeight: 700, color: '#1890ff', fontSize: 15 }}>{staff.customerCount}</div>
          </div>
        </Col>
        <Col span={8}>
          <div style={{ background: '#f0f5ff', borderRadius: 8, padding: '8px 10px', border: `1px solid ${BRAND}22` }}>
            <div style={{ color: '#8c8c8c', fontSize: 11, marginBottom: 2 }}>This Month</div>
            <div style={{ fontWeight: 700, color: BRAND, fontSize: 13 }}>{moneyFormatter({ amount: staff.monthCollected })}</div>
          </div>
        </Col>
        <Col span={8}>
          <div style={{ background: '#fff1f0', borderRadius: 8, padding: '8px 10px', border: '1px solid #ff4d4f22' }}>
            <div style={{ color: '#8c8c8c', fontSize: 11, marginBottom: 2 }}>Overdue</div>
            <div style={{ fontWeight: 700, color: '#ff4d4f', fontSize: 15 }}>{staff.overdueCount}</div>
          </div>
        </Col>
      </Row>
      <div style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <Typography.Text type="secondary" style={{ fontSize: 11 }}>Collection Efficiency</Typography.Text>
          <Typography.Text style={{ fontSize: 11, color: effColor(staff.efficiency), fontWeight: 600 }}>{staff.efficiency}%</Typography.Text>
        </div>
        <Progress percent={staff.efficiency} showInfo={false} strokeColor={effColor(staff.efficiency)} trailColor="#f0f0f0" size="small" style={{ margin: 0 }} />
      </div>
    </Card>
  );
}

export default function Performance() {
  const translate          = useLanguage();
  const { moneyFormatter } = useMoney();
  const screens            = useBreakpoint();
  const isMobile           = !screens.md;
  const [loading, setLoading] = useState(true);

  const { result: perfData, error } = useFetch(() =>
    request.get({ entity: 'staff/performance' })
  );

  useEffect(() => {
    if (perfData || error) setLoading(false);
  }, [perfData, error]);

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

  // ── Fix: useFetch wraps response, so perfData = { success, result: { staffWise, ... } }
  // We need perfData?.result to get the inner object
  const data      = perfData?.result ?? perfData ?? {};
  const staffWise = data.staffWise   ?? [];

  const totals = staffWise.reduce(
    (acc, s) => ({
      collected: acc.collected + (s.totalCollected ?? 0),
      pending:   acc.pending   + (s.totalPending   ?? 0),
      clients:   acc.clients   + (s.customerCount  ?? 0),
      overdue:   acc.overdue   + (s.overdueCount   ?? 0),
    }),
    { collected: 0, pending: 0, clients: 0, overdue: 0 }
  );

  const columns = [
    {
      title: 'Rank', key: 'rank', width: 60, align: 'center',
      render: (_, __, i) => i === 0
        ? <TrophyOutlined style={{ color: '#faad14', fontSize: 18 }} />
        : <span style={{ fontWeight: 600, color: '#8c8c8c' }}>{i + 1}</span>,
    },
    {
      title: 'Staff Name', key: 'name',
      render: (_, r) => (
        <Space>
          <Avatar size={32} icon={<UserOutlined />} style={{ background: BRAND }} />
          <div>
            <div style={{ fontWeight: 600 }}>{r.name}</div>
            <div style={{ fontSize: 11, color: '#8c8c8c' }}>{r.email || r.phone}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Clients', dataIndex: 'customerCount', key: 'customerCount',
      align: 'center', width: 80,
      render: (v) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: 'Total Collected', dataIndex: 'totalCollected', key: 'totalCollected', align: 'right',
      render: (v) => <span style={{ color: '#52c41a', fontWeight: 600 }}>{moneyFormatter({ amount: v })}</span>,
      sorter: (a, b) => a.totalCollected - b.totalCollected,
      defaultSortOrder: 'descend',
    },
    {
      title: 'Month Collected', dataIndex: 'monthCollected', key: 'monthCollected', align: 'right',
      render: (v) => <span style={{ color: BRAND, fontWeight: 500 }}>{moneyFormatter({ amount: v })}</span>,
      sorter: (a, b) => a.monthCollected - b.monthCollected,
    },
    {
      title: 'Pending', dataIndex: 'totalPending', key: 'totalPending', align: 'right',
      render: (v) => <span style={{ color: '#fa8c16' }}>{moneyFormatter({ amount: v })}</span>,
    },
    {
      title: 'Overdue', dataIndex: 'overdueCount', key: 'overdueCount', align: 'center', width: 80,
      render: (v) => <Tag color={v > 0 ? 'red' : 'green'}>{v}</Tag>,
    },
    {
      title: 'Efficiency', dataIndex: 'efficiency', key: 'efficiency', width: 130,
      render: (v) => (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
            <span style={{ fontSize: 11, color: effColor(v), fontWeight: 600 }}>{v}%</span>
          </div>
          <Progress percent={v} showInfo={false} strokeColor={effColor(v)} size="small" style={{ margin: 0 }} />
        </div>
      ),
      sorter: (a, b) => a.efficiency - b.efficiency,
    },
  ];

  return (
    <DashboardLayout>
      <div style={{ padding: isMobile ? '12px 10px' : '24px' }}>
        <Typography.Title level={isMobile ? 4 : 3} style={{ marginBottom: isMobile ? 14 : 24, marginTop: 0 }}>
          <ThunderboltOutlined style={{ color: BRAND, marginRight: 8 }} />
          {translate('Staff Performance View')}
        </Typography.Title>

        <Row gutter={[10, 10]} style={{ marginBottom: isMobile ? 14 : 20 }}>
          <Col xs={12} sm={12} md={6}>
            <Card size="small" bordered={false}
              style={{ borderRadius: 10, background: '#f4fbfc', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
              styles={{ body: { padding: isMobile ? '12px' : '16px 20px' } }}>
              <Statistic title={<span style={{ fontSize: isMobile ? 11 : 13 }}>Active Staff</span>}
                value={data.activeCount ?? staffWise.length}
                prefix={<TeamOutlined style={{ color: BRAND }} />}
                valueStyle={{ fontSize: isMobile ? 20 : 24, color: BRAND }} />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Card size="small" bordered={false}
              style={{ borderRadius: 10, background: '#fffbe6', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
              styles={{ body: { padding: isMobile ? '12px' : '16px 20px' } }}>
              <Statistic title={<span style={{ fontSize: isMobile ? 11 : 13 }}>Top Performer</span>}
                value={data.topPerformer ?? staffWise[0]?.name ?? 'N/A'}
                prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ fontSize: isMobile ? 14 : 18, color: '#d48806' }} />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Card size="small" bordered={false}
              style={{ borderRadius: 10, background: '#f6ffed', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
              styles={{ body: { padding: isMobile ? '12px' : '16px 20px' } }}>
              <Statistic title={<span style={{ fontSize: isMobile ? 11 : 13 }}>Total Collected</span>}
                value={moneyFormatter({ amount: totals.collected })}
                prefix={<RiseOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ fontSize: isMobile ? 14 : 18, color: '#52c41a' }} />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Card size="small" bordered={false}
              style={{ borderRadius: 10, background: '#fff1f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
              styles={{ body: { padding: isMobile ? '12px' : '16px 20px' } }}>
              <Statistic title={<span style={{ fontSize: isMobile ? 11 : 13 }}>Total Overdue</span>}
                value={totals.overdue}
                prefix={<WarningOutlined style={{ color: '#ff4d4f' }} />}
                valueStyle={{ fontSize: isMobile ? 20 : 24, color: '#ff4d4f' }} />
            </Card>
          </Col>
        </Row>

        {staffWise.length === 0 && (
          <Alert type="info" showIcon message="No staff data found"
            description="Make sure staff members are created and have clients assigned to them."
            style={{ marginBottom: 16, borderRadius: 8 }} />
        )}

        {isMobile ? (
          <>
            <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
              {staffWise.length} staff member{staffWise.length !== 1 ? 's' : ''}
            </Typography.Text>
            {staffWise.map((staff, i) => (
              <StaffCard key={staff._id || staff.name} staff={staff} rank={i + 1} moneyFormatter={moneyFormatter} />
            ))}
          </>
        ) : (
          <Card
            title={<Space><DollarOutlined style={{ color: BRAND }} /><span>{translate('Staff Collections & Efficiency')}</span></Space>}
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}
          >
            <Table dataSource={staffWise} columns={columns} pagination={false}
              rowKey={(r) => r._id || r.name} size="middle" scroll={{ x: 800 }}
              rowClassName={(_, i) => i === 0 ? 'top-performer-row' : ''} />
          </Card>
        )}
      </div>
      <style>{`.top-performer-row td { background: #fffbe6 !important; } .top-performer-row:hover td { background: #fff3b8 !important; }`}</style>
    </DashboardLayout>
  );
}
