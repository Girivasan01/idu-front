// import { useEffect, useState } from 'react';

// import { Tag, Row, Col } from 'antd';
// import useLanguage from '@/locale/useLanguage';

// import { useMoney } from '@/settings';

// import { request } from '@/request';
// import useFetch from '@/hooks/useFetch';
// import useOnFetch from '@/hooks/useOnFetch';

// import RecentTable from './components/RecentTable';

// import SummaryCard from './components/SummaryCard';
// import PreviewCard from './components/PreviewCard';
// import CustomerPreviewCard from './components/CustomerPreviewCard';

// import { selectMoneyFormat } from '@/redux/settings/selectors';
// import { useSelector } from 'react-redux';

// export default function DashboardModule() {
//   const translate = useLanguage();
//   const { moneyFormatter } = useMoney();
//   const money_format_settings = useSelector(selectMoneyFormat);

//   const getStatsData = async ({ entity, currency }) => {
//     return await request.summary({
//       entity,
//       options: { currency },
//     });
//   };

//   const {
//     result: invoiceResult,
//     isLoading: invoiceLoading,
//     onFetch: fetchInvoicesStats,
//   } = useOnFetch();

//   const { result: quoteResult, isLoading: quoteLoading, onFetch: fetchQuotesStats } = useOnFetch();

//   const {
//     result: paymentResult,
//     isLoading: paymentLoading,
//     onFetch: fetchPayemntsStats,
//   } = useOnFetch();

//   const { result: clientResult, isLoading: clientLoading } = useFetch(() =>
//     request.summary({ entity: 'client' })
//   );

//   useEffect(() => {
//     const currency = money_format_settings.default_currency_code || null;

//     if (currency) {
//       fetchInvoicesStats(getStatsData({ entity: 'invoice', currency }));
//       fetchQuotesStats(getStatsData({ entity: 'quote', currency }));
//       fetchPayemntsStats(getStatsData({ entity: 'payment', currency }));
//     }
//   }, [money_format_settings.default_currency_code]);

//   const dataTableColumns = [
//     {
//       title: translate('number'),
//       dataIndex: 'number',
//     },
//     {
//       title: translate('Client'),
//       dataIndex: ['client', 'name'],
//     },

//     {
//       title: translate('Total'),
//       dataIndex: 'total',
//       onCell: () => {
//         return {
//           style: {
//             textAlign: 'right',
//             whiteSpace: 'nowrap',
//             direction: 'ltr',
//           },
//         };
//       },
//       render: (total, record) => moneyFormatter({ amount: total, currency_code: record.currency }),
//     },
//     {
//       title: translate('Status'),
//       dataIndex: 'status',
//     },
//   ];

//   const entityData = [
//     {
//       result: invoiceResult,
//       isLoading: invoiceLoading,
//       entity: 'invoice',
//       title: translate('Invoices'),
//     },
//     {
//       result: quoteResult,
//       isLoading: quoteLoading,
//       entity: 'quote',
//       title: translate('quote'),
//     },
//   ];

//   const statisticCards = entityData.map((data, index) => {
//     const { result, entity, isLoading, title } = data;

//     return (
//       <PreviewCard
//         key={index}
//         title={title}
//         isLoading={isLoading}
//         entity={entity}
//         statistics={
//           !isLoading &&
//           result?.performance?.map((item) => ({
//             tag: item?.status,
//             color: 'blue',
//             value: item?.percentage,
//           }))
//         }
//       />
//     );
//   });

//   if (money_format_settings) {
//     return (
//       <>
//         <Row gutter={[32, 32]}>
//           <SummaryCard
//             title={translate('Invoices')}
//             prefix={translate('This month')}
//             isLoading={invoiceLoading}
//             data={invoiceResult?.total}
//           />
//           <SummaryCard
//             title={translate('Quote')}
//             prefix={translate('This month')}
//             isLoading={quoteLoading}
//             data={quoteResult?.total}
//           />
//           <SummaryCard
//             title={translate('paid')}
//             prefix={translate('This month')}
//             isLoading={paymentLoading}
//             data={paymentResult?.total}
//           />
//           <SummaryCard
//             title={translate('Unpaid')}
//             prefix={translate('Not Paid')}
//             isLoading={invoiceLoading}
//             data={invoiceResult?.total_undue}
//           />
//         </Row>
//         <div className="space30"></div>
//         <Row gutter={[32, 32]}>
//           <Col className="gutter-row w-full" xs={24} sm={24} md={24} lg={18}>
//             <div className="whiteBox shadow" style={{ minHeight: 458 }}>
//               <Row className="pad20" gutter={[0, 0]}>
//                 {statisticCards}
//               </Row>
//             </div>
//           </Col>
//           <Col className="gutter-row w-full" xs={24} sm={24} md={24} lg={6}>
//             <CustomerPreviewCard
//               isLoading={clientLoading}
//               activeCustomer={clientResult?.active}
//               newCustomer={clientResult?.new}
//             />
//           </Col>
//         </Row>
//         <div className="space30"></div>
//         <Row gutter={[32, 32]}>
//           <Col className="gutter-row w-full" xs={24} lg={12}>
//             <div className="whiteBox shadow pad20" style={{ height: '100%' }}>
//               <h3 style={{ color: '#22075e', marginBottom: 5, padding: '0 20px 20px' }}>
//                 {translate('Recent Invoices')}
//               </h3>

//               <RecentTable entity={'invoice'} dataTableColumns={dataTableColumns} />
//             </div>
//           </Col>

//           <Col className="gutter-row w-full" xs={24} lg={12}>
//             <div className="whiteBox shadow pad20" style={{ height: '100%' }}>
//               <h3 style={{ color: '#22075e', marginBottom: 5, padding: '0 20px 20px' }}>
//                 {translate('Recent Quotes')}
//               </h3>
//               <RecentTable entity={'quote'} dataTableColumns={dataTableColumns} />
//             </div>
//           </Col>
//         </Row>
//       </>
//     );
//   } else {
//     return <></>;
//   }
// }

import { useMemo } from 'react';
import {
  Row, Col, Card, Statistic, Progress,
  Typography, Divider, Spin, Alert, Tag, Space,
} from 'antd';
import {
  RiseOutlined, FallOutlined, ClockCircleOutlined,
  TeamOutlined, WarningOutlined, CalendarOutlined,
  CheckCircleOutlined, UserOutlined, StopOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import useLanguage from '@/locale/useLanguage';
import { useMoney } from '@/settings';
import { request } from '@/request';
import useFetch from '@/hooks/useFetch';
import { selectMoneyFormat } from '@/redux/settings/selectors';

const { Text, Title } = Typography;

const effColor  = (e) => e >= 75 ? '#52c41a' : e >= 40 ? '#faad14' : '#ff4d4f';
const effStatus = (e) => e >= 75 ? 'success'  : e >= 40 ? 'active'  : 'exception';
const effLabel  = (e) =>
  e >= 75 ? 'Good'   :
  e >= 40 ? 'Fair'   : 'Needs Attention';

export default function DashboardModule() {
  const translate          = useLanguage();
  const { moneyFormatter } = useMoney();
  const moneySettings      = useSelector(selectMoneyFormat);

  const currencyCode =
    moneySettings?.default_currency_code ||
    moneySettings?.currency_code         ||
    'INR';

  const fmt = (amount) =>
    moneyFormatter({ amount: Number(amount ?? 0), currency_code: currencyCode });

  const { result: dash, isLoading, error } =
    useFetch(() => request.get({ entity: 'dashboard/admin' }));

  const d               = dash ?? {};
  const totalCollected  = d.totalCollected  ?? 0;
  const pendingAmount   = d.pendingAmount   ?? 0;
  const monthCollected  = d.monthCollected  ?? 0;
  const overdueCount    = d.overdueCount    ?? 0;
  const upcomingCount   = d.upcomingCount   ?? 0;
  const efficiency      = d.efficiency      ?? 0;
  const totalAssigned   = d.totalAssigned   ?? 0;
  const cs              = d.customerSummary ?? {};
  const active          = cs.active    ?? 0;
  const completed       = cs.completed ?? 0;
  const defaulted       = cs.defaulted ?? 0;

  // Collection ratio — how much has been collected vs total expected
  const collectionRatio = useMemo(() => {
    const total = totalCollected + pendingAmount;
    return total > 0 ? +((totalCollected / total) * 100).toFixed(1) : 0;
  }, [totalCollected, pendingAmount]);

  // Health score — composite of efficiency + low overdue + high active
  const healthScore = useMemo(() => {
    if (totalAssigned === 0) return 0;
    const overdueRatio   = totalAssigned > 0 ? overdueCount / totalAssigned : 0;
    const defaultedRatio = totalAssigned > 0 ? defaulted    / totalAssigned : 0;
    const score = Math.max(
      0,
      Math.min(100, efficiency - (overdueRatio * 30) - (defaultedRatio * 40))
    );
    return +score.toFixed(1);
  }, [efficiency, overdueCount, defaulted, totalAssigned]);

  const cardStyle = {
    borderRadius: 12,
    boxShadow:    '0 1px 6px rgba(0,0,0,0.07)',
    height:       '100%',
  };

  if (isLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
      <Spin size="large" />
    </div>
  );

  if (error) return (
    <Alert message={translate('Failed to load dashboard')} type="error" showIcon style={{ margin: '24px 0' }} />
  );

  return (
    <div style={{ padding: '4px 0' }}>

      {/* ── Section 1: Financial KPIs ────────────────────────────────────── */}
      <Title level={5} style={{ marginBottom: 12, color: '#8c8c8c', fontWeight: 500, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' }}>
        Financial Overview
      </Title>

      <Row gutter={[14, 14]}>
        <Col xs={12} sm={12} lg={6}>
          <Card style={{ ...cardStyle, borderTop: '3px solid #52c41a' }}
            styles={{ body: { padding: '16px 18px' } }}>
            <Statistic
              title={<Text type="secondary" style={{ fontSize: 11 }}>{translate('Total Collected')}</Text>}
              value={totalCollected}
              formatter={fmt}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: 17, fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card style={{ ...cardStyle, borderTop: '3px solid #ff4d4f' }}
            styles={{ body: { padding: '16px 18px' } }}>
            <Statistic
              title={<Text type="secondary" style={{ fontSize: 11 }}>{translate('Pending Balance')}</Text>}
              value={pendingAmount}
              formatter={fmt}
              prefix={<FallOutlined />}
              valueStyle={{ color: '#ff4d4f', fontSize: 17, fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card style={{ ...cardStyle, borderTop: '3px solid #1890ff' }}
            styles={{ body: { padding: '16px 18px' } }}>
            <Statistic
              title={<Text type="secondary" style={{ fontSize: 11 }}>{translate('This Month Collected')}</Text>}
              value={monthCollected}
              formatter={fmt}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: 17, fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card style={{ ...cardStyle, borderTop: '3px solid #722ed1' }}
            styles={{ body: { padding: '16px 18px' } }}>
            <Statistic
              title={<Text type="secondary" style={{ fontSize: 11 }}>{translate('Total Clients')}</Text>}
              value={totalAssigned}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1', fontSize: 17, fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      <Divider style={{ margin: '18px 0 14px' }} />

      {/* ── Section 2: Operational Alerts ────────────────────────────────── */}
      <Title level={5} style={{ marginBottom: 12, color: '#8c8c8c', fontWeight: 500, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' }}>
        Operational Alerts
      </Title>

      <Row gutter={[14, 14]}>
        <Col xs={12} sm={12} lg={6}>
          <Card
            style={{ ...cardStyle, background: overdueCount > 0 ? '#fff1f0' : '#f6ffed',
              border: `1px solid ${overdueCount > 0 ? '#ffccc7' : '#b7eb8f'}` }}
            styles={{ body: { padding: '16px 18px' } }}
          >
            <Statistic
              title={<Text style={{ fontSize: 11, color: overdueCount > 0 ? '#cf1322' : '#389e0d' }}>
                {translate('Overdue Installments')}
              </Text>}
              value={overdueCount}
              prefix={<WarningOutlined />}
              valueStyle={{ color: overdueCount > 0 ? '#cf1322' : '#389e0d', fontSize: 26, fontWeight: 800 }}
            />
            <Tag
              color={overdueCount > 0 ? 'error' : 'success'}
              style={{ marginTop: 8, borderRadius: 20, fontSize: 11 }}
            >
              {overdueCount > 0 ? 'Action Required' : 'All Clear'}
            </Tag>
          </Card>
        </Col>

        <Col xs={12} sm={12} lg={6}>
          <Card style={{ ...cardStyle, background: '#fffbe6', border: '1px solid #ffe58f' }}
            styles={{ body: { padding: '16px 18px' } }}>
            <Statistic
              title={<Text style={{ fontSize: 11, color: '#ad6800' }}>{translate('Due in Next 7 Days')}</Text>}
              value={upcomingCount}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#d48806', fontSize: 26, fontWeight: 800 }}
            />
            <Tag color="warning" style={{ marginTop: 8, borderRadius: 20, fontSize: 11 }}>
              Upcoming Collections
            </Tag>
          </Card>
        </Col>

        <Col xs={12} sm={12} lg={6}>
          <Card style={{ ...cardStyle, background: '#f9f0ff', border: '1px solid #d3adf7' }}
            styles={{ body: { padding: '16px 18px' } }}>
            <Statistic
              title={<Text style={{ fontSize: 11, color: '#531dab' }}>{translate('Defaulted Clients')}</Text>}
              value={defaulted}
              prefix={<StopOutlined />}
              valueStyle={{ color: defaulted > 0 ? '#531dab' : '#389e0d', fontSize: 26, fontWeight: 800 }}
            />
            <Tag color="purple" style={{ marginTop: 8, borderRadius: 20, fontSize: 11 }}>
              Needs Follow-up
            </Tag>
          </Card>
        </Col>

        <Col xs={12} sm={12} lg={6}>
          <Card style={{ ...cardStyle, background: '#e6fffb', border: '1px solid #87e8de' }}
            styles={{ body: { padding: '16px 18px' } }}>
            <Statistic
              title={<Text style={{ fontSize: 11, color: '#006d75' }}>{translate('Completed Clients')}</Text>}
              value={completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#006d75', fontSize: 26, fontWeight: 800 }}
            />
            <Tag color="cyan" style={{ marginTop: 8, borderRadius: 20, fontSize: 11 }}>
              Fully Paid Off
            </Tag>
          </Card>
        </Col>
      </Row>

      <Divider style={{ margin: '18px 0 14px' }} />

      {/* ── Section 3: Portfolio Health ───────────────────────────────────── */}
      <Title level={5} style={{ marginBottom: 12, color: '#8c8c8c', fontWeight: 500, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' }}>
        Portfolio Health
      </Title>

      <Row gutter={[14, 14]}>


        {/* Portfolio Health Score */}
        <Col xs={24} sm={24} lg={8}>
          <Card style={cardStyle} styles={{ body: { padding: '20px 22px' } }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Client Portfolio Breakdown</Text>
            <div style={{ marginTop: 14 }}>
              {[
                { label: 'Active',    value: active,    color: '#1890ff', icon: <UserOutlined />,         pct: totalAssigned ? +((active    / totalAssigned) * 100).toFixed(0) : 0 },
                { label: 'Completed', value: completed, color: '#52c41a', icon: <CheckCircleOutlined />,   pct: totalAssigned ? +((completed / totalAssigned) * 100).toFixed(0) : 0 },
                { label: 'Defaulted', value: defaulted, color: '#ff4d4f', icon: <StopOutlined />,          pct: totalAssigned ? +((defaulted / totalAssigned) * 100).toFixed(0) : 0 },
              ].map(({ label, value, color, icon, pct }) => (
                <div key={label} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Space size={6}>
                      <span style={{ color }}>{icon}</span>
                      <Text style={{ fontSize: 13 }}>{label}</Text>
                    </Space>
                    <Space size={12}>
                      <Text strong style={{ color }}>{value}</Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>{pct}%</Text>
                    </Space>
                  </div>
                  <Progress
                    percent={pct}
                    showInfo={false}
                    strokeColor={color}
                    trailColor="#f0f0f0"
                    size="small"
                    style={{ margin: 0 }}
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>
        
        {/* Collection Ratio */}
        <Col xs={24} sm={12} lg={8}>
          <Card style={cardStyle} styles={{ body: { padding: '20px 22px' } }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Collection Ratio</Text>
            <div style={{ marginTop: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: effColor(collectionRatio) }}>
                {collectionRatio}%
              </span>
              <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>of total portfolio</Text>
            </div>
            <Progress
              percent={collectionRatio}
              showInfo={false}
              strokeColor={effColor(collectionRatio)}
              status={effStatus(collectionRatio)}
              size="default"
              style={{ marginBottom: 8 }}
            />
            <Row gutter={8}>
              <Col span={12}>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>Collected</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#52c41a' }}>{fmt(totalCollected)}</div>
              </Col>
              <Col span={12}>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>Remaining</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#ff4d4f' }}>{fmt(pendingAmount)}</div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Overall Efficiency */}
        <Col xs={24} sm={12} lg={8}>
          <Card style={cardStyle} styles={{ body: { padding: '20px 22px' } }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Overall Collection Efficiency</Text>
            <div style={{ marginTop: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: effColor(efficiency) }}>
                {efficiency}%
              </span>
              <Tag
                color={efficiency >= 75 ? 'success' : efficiency >= 40 ? 'warning' : 'error'}
                style={{ marginLeft: 10, borderRadius: 20, fontSize: 11 }}
              >
                {effLabel(efficiency)}
              </Tag>
            </div>
            <Progress
              percent={Math.min(efficiency, 100)}
              showInfo={false}
              strokeColor={effColor(efficiency)}
              status={effStatus(efficiency)}
              size="default"
              style={{ marginBottom: 8 }}
            />
            <Text type="secondary" style={{ fontSize: 11 }}>
              Collected vs expected installments across all clients
            </Text>
          </Card>
        </Col>
      </Row>

    </div>
  );
}
