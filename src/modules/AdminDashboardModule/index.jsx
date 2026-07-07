import { useEffect, useState } from 'react';
import { Row, Col, Statistic, Card, Progress, Table, Spin, Alert, Divider } from 'antd';
import { PieChartOutlined, DollarCircleOutlined, ClockCircleOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';
import { useMoney } from '@/settings';
import { request } from '@/request';
import useFetch from '@/hooks/useFetch';
import { useSelector } from 'react-redux';
import { selectCurrentAdmin } from '@/redux/auth/selectors';

// Charts optional - use Progress bars instead



export default function AdminDashboardModule() {
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const currentAdmin = useSelector(selectCurrentAdmin);
  const [loading, setLoading] = useState(true);

  const { result: dashboardData, error } = useFetch(() => 
    request.get('/dashboard/summary')
  );


  useEffect(() => {
    if (dashboardData || error) setLoading(false);
  }, [dashboardData, error]);

  if (loading) return <Spin size="large" />;
  if (error) return <Alert message="Error loading dashboard" type="error" />;

  const data = dashboardData.result || {};
  const { totalGiven = 0, totalPending = 0 } = data;

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '80vh' }}>
      <Row gutter={[32, 32]} justify="center" align="middle" style={{ maxWidth: 800, margin: '0 auto' }}>
        <Col xs={24} lg={12}>
          <Card 
            style={{ 
              height: 200, 
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              borderRadius: 12 
            }}
            styles={{ body: { padding: '40px 20px' } }}
          >
            <Statistic
              title="TOTAL GIVEN"
              value={totalGiven}
              prefix="₹"
              formatter={moneyFormatter}
              valueStyle={{ 
                fontSize: 36, 
                color: '#52c41a',
                fontWeight: 700
              }}
            />
            <div style={{ fontSize: 14, color: '#666', marginTop: 8 }}>
              Total Loan Amount Disbursed (Active Clients)
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            style={{ 
              height: 200, 
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              borderRadius: 12 
            }}
            styles={{ body: { padding: '40px 20px' } }}
          >
            <Statistic
              title="TOTAL PENDING"
              value={totalPending}
              prefix="₹"
              formatter={moneyFormatter}
              valueStyle={{ 
                fontSize: 36, 
                color: '#ff4d4f',
                fontWeight: 700
              }}
            />
            <div style={{ fontSize: 14, color: '#666', marginTop: 8 }}>
              Outstanding Balance (Active Clients)
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}


