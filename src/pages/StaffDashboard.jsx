/**
 * StaffDashboard.jsx — Webaac Solutions Finance Management
 * EXACT layout + REAL DATA from API (dashboard/staff)
 */

import { useEffect, useState } from 'react';
import {
  Row, Col, Card, Spin, Alert,
  Statistic, Progress, Typography,
  Grid, Table
} from 'antd';

import {
  TeamOutlined,
  DollarCircleOutlined,
  WarningOutlined,
  CalendarOutlined,
} from '@ant-design/icons';

import { request } from '@/request';
import useFetch from '@/hooks/useFetch';
import useLanguage from '@/locale/useLanguage';
import { useMoney } from '@/settings';
import { DashboardLayout } from '@/layout';

const { useBreakpoint } = Grid;

export default function StaffDashboard() {

  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // 🔥 Fetch Staff Dashboard Data
  const { result: data, error } = useFetch(() =>
    request.get({ entity: 'dashboard/staff' })
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (data || error) setLoading(false);
  }, [data, error]);

  // ───────── Loading ─────────

  if (loading) return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <Spin size="large" />
      </div>
    </DashboardLayout>
  );

  if (error) return (
    <DashboardLayout>
      <Alert message="Error loading dashboard" type="error" showIcon style={{ margin: 24 }} />
    </DashboardLayout>
  );

  // ───────── CORRECT FIELD MAPPING FROM API ─────────

  const {
    totalAssigned = 0,
    totalCollected = 0,
    pendingAmount = 0,
    monthCollected = 0,
    overdueCount = 0,
    upcomingCount = 0,
    performance = {},
    customerMetrics = {},
  } = data || {};

  const efficiency = performance?.efficiency ?? 0;

  // ───────── Summary Table Data ─────────

  const tableData = [
    { key: 1, metric: 'Total Assigned Customers', value: customerMetrics.total || totalAssigned },
    { key: 2, metric: 'Active', value: customerMetrics.active || 0 },
    { key: 3, metric: 'Completed', value: customerMetrics.completed || 0 },
    { key: 4, metric: 'Defaulted', value: customerMetrics.defaulted || 0 },
  ];

  const columns = [
    { title: 'Metric', dataIndex: 'metric', key: 'metric' },
    { title: 'Value', dataIndex: 'value', key: 'value', align: 'right' },
  ];

  return (
    <DashboardLayout>

      <div style={{
        padding: isMobile ? 12 : 24,
        background: '#f5f5f5',
        minHeight: '80vh'
      }}>

        {/* ───────── Title ───────── */}

        <Typography.Title level={3} style={{ marginBottom: 24 }}>
          {translate('Dashboard')}
        </Typography.Title>

        {/* ───────── TOP CARDS ───────── */}

        <Row gutter={[16, 16]}>

          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title="Total Assigned"
                value={totalAssigned}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title="Total Collected"
                value={totalCollected}
                formatter={(v) => moneyFormatter({ amount: v })}
                prefix={<DollarCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title="Pending Amount"
                value={pendingAmount}
                formatter={(v) => moneyFormatter({ amount: v })}
                prefix={<DollarCircleOutlined style={{ color: '#ff4d4f' }} />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>

        </Row>

        {/* ───────── SECOND ROW ───────── */}

        <Row gutter={[16, 16]} style={{ marginTop: 8 }}>

          <Col xs={24} md={6}>
            <Card>
              <Statistic
                title="This Month Collected"
                value={monthCollected}
                formatter={(v) => moneyFormatter({ amount: v })}
                prefix={<DollarCircleOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>

          <Col xs={24} md={6}>
            <Card>
              <Statistic
                title="Overdue Installments"
                value={overdueCount}
                prefix={<WarningOutlined style={{ color: '#ff4d4f' }} />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>

          <Col xs={24} md={6}>
            <Card>
              <Statistic
                title="Upcoming (7 Days)"
                value={upcomingCount}
                prefix={<CalendarOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>

          <Col xs={24} md={6}>
            <Card>
              <Statistic
                title="Efficiency"
                value={efficiency}
                suffix="%"
                valueStyle={{ color: '#ff4d4f' }}
              />

              <Progress
                percent={efficiency}
                size="small"
                showInfo={false}
                strokeColor="#ff4d4f"
              />
            </Card>
          </Col>

        </Row>

        {/* ───────── SUMMARY TABLE ───────── */}

        <Card title="Customer Summary" style={{ marginTop: 16 }}>
          <Table
            columns={columns}
            dataSource={tableData}
            pagination={false}
            size="small"
          />
        </Card>

      </div>

    </DashboardLayout>
  );
}