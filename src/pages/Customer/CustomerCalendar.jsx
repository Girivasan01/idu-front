/**
 * pages/customer/CustomerCalendar.jsx — Webaac Solutions Finance Management
 * Clicking a calendar entry opens the Edit Repayment form modal.
 */
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftOutlined, CalendarOutlined,
  DollarOutlined, CheckCircleOutlined, ClockCircleOutlined,
  ExclamationCircleOutlined, LeftOutlined, RightOutlined,
} from '@ant-design/icons';
import {
  Badge, Button, Calendar, Card, Col, Row,
  Space, Spin, Tag, Typography, Modal, Form, Grid, Descriptions,
} from 'antd';
import { App } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import dayjs from 'dayjs';
import { ErpLayout } from '@/layout';
import { crud } from '@/redux/crud/actions';
import { erp } from '@/redux/erp/actions';
import { selectReadItem } from '@/redux/crud/selectors';
import { useDispatch, useSelector } from 'react-redux';
import useLanguage from '@/locale/useLanguage';
import { useMoney, useDate } from '@/settings';
import { request } from '@/request';
import { repaymentStatusColor } from '@/utils/repaymentStatusColor';
import RepaymentForm from '@/forms/RepaymentForm';
import CustomerAvatar from '@/components/CustomerAvatar';
import { getRepaymentCalendarStyle } from '@/utils/repaymentCalendarStyle';

const { useBreakpoint } = Grid;

const BOX_BORDER = '#28a7ab';
const BOX_TEXT = '#117a8b';
const HEADER_BG = 'linear-gradient(90deg, rgba(40,167,171,0.14) 0%, rgba(24,144,255,0.06) 100%)';

// ── Helpers ───────────────────────────────────────────────────────────────────

const normalizeStatus = (status) => {
  const s = String(status || '').trim().toLowerCase();
  if (s === 'late payment' || s === 'late_payment') return 'late';
  if (s === 'not-paid' || s === 'not paid') return 'default';
  if (s === 'not_started' || s === 'not started' || s === 'not-started') return 'not-started';
  return s || 'not-started';
};

const getDisplayStatus = (repayment) => {
  const today = new Date();
  const due = new Date(repayment?.date);
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const amount = Number(repayment?.amount || 0);
  const amountPaid = Number(repayment?.amountPaid || 0);

  if (amount > 0 && amountPaid >= amount) {
    const paidDate = repayment?.paymentDate || repayment?.paidDate;
    if (paidDate) {
      const paidAt = new Date(paidDate);
      paidAt.setHours(0, 0, 0, 0);
      if (paidAt > due) return 'late';
      return 'paid';
    }
    return 'paid';
  }

  if (amountPaid > 0 && amountPaid < amount) {
    if (due < today) return 'late';
    return 'partial';
  }

  if (amountPaid === 0) {
    if (due < today) return 'default';
    return 'not-started';
  }

  if (normalizeStatus(repayment?.status) === 'paid') return 'paid';
  if (normalizeStatus(repayment?.status) === 'late') return 'late';
  if (normalizeStatus(repayment?.status) === 'partial') return 'partial';

  return 'not-started';
};

const ClientMapLink = ({ client }) => {
  const mapLink = client?.map_link || client?.mapLink || '';

  if (!mapLink) {
    return '-';
  }

  return (
    <a href={mapLink} target="_blank" rel="noopener noreferrer">
      Open in Google Maps
    </a>
  );
};

const LegendDot = ({ color, label }) => (
  <span style={{ display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
    <span style={{ width: 12, height: 12, background: color, borderRadius: 3, display: 'inline-block', flexShrink: 0 }} />
    <span style={{ fontSize: 12 }}>{label}</span>
  </span>
);

// ── Mobile week list ──────────────────────────────────────────────────────────

function WeekListView({ weekDays, eventsByDate, moneyFormatter, onEventClick }) {
  return (
    <div>
      {weekDays.map((day) => {
        const key = day.format('YYYY-MM-DD');
        const events = eventsByDate[key] || [];
        const isToday = day.isSame(dayjs(), 'day');
        return (
          <div
            key={key}
            style={{
              marginBottom: 10, borderRadius: 10, overflow: 'hidden',
              border: events.length ? `1px solid ${BOX_BORDER}44` : '1px solid #f0f0f0',
            }}
          >
            <div style={{
              background: isToday ? BOX_BORDER : '#f5f5f5',
              color: isToday ? '#fff' : '#595959',
              padding: '8px 14px', fontWeight: 600, fontSize: 13,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span>{day.format('ddd, DD MMM')}</span>
              {events.length > 0 && (
                <Badge count={events.length}
                  style={{ backgroundColor: isToday ? '#fff' : BOX_BORDER, color: isToday ? BOX_BORDER : '#fff' }} />
              )}
            </div>
            {events.length > 0 ? (
              <div style={{ padding: '8px 12px', background: '#fff' }}>
                {events.map((event) => {
                  const calendarStyle = getRepaymentCalendarStyle(event.repayment, event.status);
                  return (
                    <div
                      key={event.id}
                      onClick={() => onEventClick(event.repayment)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 12px',
                        marginBottom: 6,
                        borderRadius: 8,
                        cursor: 'pointer',
                        ...calendarStyle.style,
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: 14, color: calendarStyle.style.color }}>
                        {moneyFormatter({ amount: event.repayment.amount })}
                      </span>
                      <Tag
                        color={calendarStyle.isToday ? '#1677ff' : event.color}
                        style={{ borderRadius: 20, fontSize: 11, margin: 0 }}
                      >
                        {event.status.replace(/-|_/g, ' ').toUpperCase()}
                      </Tag>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '10px 14px', color: '#bfbfbf', fontSize: 13 }}>No repayments</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function CustomerCalendar() {
  const { clientId } = useParams();
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const { dateFormat } = useDate();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const { notification } = App.useApp();

  const { result: client, isLoading: isClientLoading } = useSelector(selectReadItem);

  const [repayments, setRepayments] = useState([]);
  const [isRepaymentsLoading, setIsRepaymentsLoading] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(dayjs());
  const [weekStart, setWeekStart] = useState(dayjs().startOf('week'));

  // ── Edit modal state ──────────────────────────────────────────────────────
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [editingRepayment, setEditingRepayment] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [form] = Form.useForm();

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day')),
    [weekStart]
  );

  // ── Fetch repayments ──────────────────────────────────────────────────────
  const fetchRepayments = useCallback(async () => {
    setIsRepaymentsLoading(true);
    try {
      const response = await request.get({ entity: `repayment/client/${clientId}` });
      if (response.success) setRepayments(response.result || []);
      else setRepayments([]);
    } catch { setRepayments([]); }
    finally { setIsRepaymentsLoading(false); }
  }, [clientId]);

  useEffect(() => {
    dispatch(crud.read({ entity: 'client', id: clientId }));
    fetchRepayments();
    const handler = () => fetchRepayments();
    window.addEventListener('repayment-updated', handler);
    return () => window.removeEventListener('repayment-updated', handler);
  }, [clientId, fetchRepayments]);

  // ── Calendar events ───────────────────────────────────────────────────────
  const calendarEvents = useMemo(() =>
    repayments.map((r) => {
      const status = getDisplayStatus(r);
      return {
        id: r._id,
        date: dayjs(r.date),
        color: repaymentStatusColor[status] || repaymentStatusColor['not-started'],
        repayment: r,
        status,
      };
    }), [repayments]
  );

  const eventsByDate = useMemo(() => {
    const map = {};
    calendarEvents.forEach((e) => {
      const k = e.date.format('YYYY-MM-DD');
      if (!map[k]) map[k] = [];
      map[k].push(e);
    });
    return map;
  }, [calendarEvents]);

  // ── Totals ────────────────────────────────────────────────────────────────
  const totals = useMemo(() => {
    const paid = repayments
      .filter((r) => ['paid', 'late'].includes(normalizeStatus(r.status)))
      .reduce((s, r) => s + Number(r.amount || 0), 0);
    const pending = repayments
      .filter((r) => !['paid', 'late'].includes(normalizeStatus(r.status)))
      .reduce((s, r) => s + Number(r.amount || 0), 0);
    return { paid, pending, total: paid + pending };
  }, [repayments]);

  // ── Open edit modal ───────────────────────────────────────────────────────
  const openEditModal = useCallback((repayment) => {
    if (!repayment) return;
    setEditingRepayment(repayment);
    form.setFieldsValue({
      ...repayment,
      status: normalizeStatus(repayment.status),
      _originalStatus: normalizeStatus(repayment.status),
      date: repayment.date ? dayjs(repayment.date) : null,
      paymentDate: repayment.paymentDate ? dayjs(repayment.paymentDate) : null,
      amountPaid: repayment.amountPaid ?? 0,
    });
    setEditModalOpen(true);
  }, [form]);

  const handleCalendarClick = useCallback((repayment) => {
    openEditModal(repayment);
  }, [openEditModal]);

  const handleDateClick = (date) => {
    const events = eventsByDate[date.format('YYYY-MM-DD')];
    if (events?.length) openEditModal(events[0].repayment);
  };

  // ── Format payload for submit ─────────────────────────────────────────────
  const formatPayload = (values) => {
    const amountPaid = values.amountPaid !== undefined
      ? values.amountPaid
      : (editingRepayment?.amountPaid ?? 0);

    return {
      ...values,
      amountPaid: (['paid', 'late'].includes(values.status) && !amountPaid)
        ? values.amount : amountPaid,
      date: values.date ? dayjs(values.date).toISOString() : undefined,
      paymentDate: values.paymentDate
        ? dayjs(values.paymentDate).toISOString()
        : (['paid', 'late'].includes(values.status) ? new Date().toISOString() : null),
    };
  };

  // ── Submit edit ───────────────────────────────────────────────────────────
  const handleEditOk = async () => {
    setSubmitLoading(true);
    try {
      const values = await form.validateFields();

      const updateResponse = await request.update({
        entity: 'repayment',
        id: editingRepayment._id,
        jsonData: formatPayload(values),
      });

      if (!updateResponse?.success || !updateResponse?.result) {
        notification.error({
          message: translate('Update failed'),
          description: updateResponse?.message || translate('Something went wrong'),
        });
        return;
      }

      // Update local state
      setRepayments((prev) =>
        prev.map((r) => r._id === updateResponse.result._id ? { ...r, ...updateResponse.result } : r)
      );

      window.dispatchEvent(new Event('repayment-updated'));
      dispatch(erp.list({ entity: 'payment' }));

      notification.success({ message: translate('Repayment updated successfully') });
      setEditModalOpen(false);
      form.resetFields();
    } catch (error) {
      if (error?.errorFields) return; // form validation — shown inline
      notification.error({
        message: translate('Operation failed'),
        description: error?.message || translate('Something went wrong'),
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <ErpLayout>
      <Spin spinning={isClientLoading}>

        {/* Header */}
        <PageHeader
          onBack={() => navigate('/customer')}
          backIcon={<ArrowLeftOutlined />}
          title={
            <Space>
              <CalendarOutlined style={{ color: BOX_TEXT }} />
              <span style={{ fontSize: isMobile ? 14 : 18 }}>{translate('Repayment Calendar')}</span>
            </Space>
          }
          ghost={false}
          extra={[
            <Space key="actions" direction={isMobile ? 'vertical' : 'horizontal'} style={{ width: '100%', alignItems: isMobile ? 'flex-end' : 'center' }}>
              <Button size={isMobile ? 'small' : 'middle'}
                onClick={() => navigate(`/repayment/client/${clientId}`)}>
                {translate('View List')}
              </Button>
              <Button size={isMobile ? 'small' : 'middle'} type="primary"
                onClick={() => setDetailsModalOpen(true)}>
                {translate('Client Details') || 'Client Details'}
              </Button>
            </Space>,
          ]}
          style={{ padding: isMobile ? '10px 12px' : '18px 14px', borderRadius: 10, background: HEADER_BG, marginBottom: 12 }}
        />

        {/* Client Info */}
        <Card bordered={false} size="small"
          style={{ borderRadius: 12, marginBottom: 12 }}
          styles={{ body: { padding: isMobile ? '14px 12px' : '16px 20px' } }}
        >
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} sm={8}>
              <Space>
                {/* ✅ FIX: pass client.photo — mapClient returns photo: row.photo || '' */}
                <CustomerAvatar
                  photo={client?.photo || ''}
                  name={client?.name}
                  size={isMobile ? 40 : 48}
                />
                <div>
                  <Typography.Text type="secondary" style={{ fontSize: 11 }}>{translate('Client')}</Typography.Text>
                  <div style={{ fontWeight: 700, fontSize: isMobile ? 15 : 17 }}>{client?.name || '—'}</div>
                </div>
              </Space>
            </Col>
            <Col xs={12} sm={8}>
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                <DollarOutlined /> {translate('Loan Amount')}
              </Typography.Text>
              <div style={{ fontWeight: 600, fontSize: isMobile ? 14 : 16 }}>
                {moneyFormatter({ amount: client?.loanAmount })}
              </div>
            </Col>
            <Col xs={12} sm={8}>
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                <ClockCircleOutlined /> {translate('Term')}
              </Typography.Text>
              <div style={{ fontWeight: 600, fontSize: isMobile ? 14 : 16 }}>
                {client?.term} {translate('Installments')}
              </div>
            </Col>
          </Row>
        </Card>

        {/* Summary Stats */}
        <Row gutter={[10, 10]} style={{ marginBottom: 12 }}>

          {[
            {
              label: translate('Installment Amount'),
              value: repayments?.[0]?.amount || 0,
              color: '#722ed1',
              bg: '#f9f0ff',
              icon: <CalendarOutlined />,
            },
            {
              label: translate('Paid'),
              value: totals.paid,
              color: '#52c41a',
              bg: '#f6ffed',
              icon: <CheckCircleOutlined />,
            },
            {
              label: translate('Pending'),
              value: totals.pending,
              color: '#fa8c16',
              bg: '#fff2e8',
              icon: <ExclamationCircleOutlined />,
            },
            {
              label: translate('Total'),
              value: totals.total,
              color: '#1890ff',
              bg: '#e6f7ff',
              icon: <DollarOutlined />,
            },
          ].map(({ label, value, color, bg, icon }) => (
            <Col xs={24} sm={12} md={6} key={label}>
              <Card
                size="small"
                bordered={false}
                style={{
                  background: bg,
                  borderRadius: 10,
                  border: `1px solid ${color}33`,
                }}
                styles={{ body: { padding: isMobile ? '12px 14px' : '14px 18px' } }}
              >
                <Space>
                  <span style={{ color, fontSize: isMobile ? 20 : 22 }}>
                    {icon}
                  </span>

                  <div>
                    <Typography.Text
                      type="secondary"
                      style={{ fontSize: 11 }}
                    >
                      {label}
                    </Typography.Text>

                    <div
                      style={{
                        fontWeight: 700,
                        color,
                        fontSize: isMobile ? 15 : 17,
                      }}
                    >
                      {moneyFormatter({ amount: value })}
                    </div>
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Legend */}
        <Card bordered={false} size="small"
          style={{ borderRadius: 10, marginBottom: 12 }}
          styles={{ body: { padding: '10px 14px' } }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px' }}>
            <LegendDot color={repaymentStatusColor.paid} label="Paid" />
            <LegendDot color={repaymentStatusColor.late} label="Late" />
            <LegendDot color={repaymentStatusColor.partial} label="Partial" />
            <LegendDot color={repaymentStatusColor.default} label="Default" />
            <LegendDot color={repaymentStatusColor['not-started']} label="Not Started" />
          </div>
        </Card>

        {/* Calendar */}
        <Card bordered={false} style={{ borderRadius: 12 }}
          styles={{ body: { padding: isMobile ? '12px 10px' : '20px' } }}
        >
          <Spin spinning={isRepaymentsLoading}>
            {isMobile ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 8 }}>
                  <Button icon={<LeftOutlined />}
                    onClick={() => setWeekStart((p) => p.subtract(1, 'week'))}
                    style={{ minWidth: 44, minHeight: 44 }} />
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: BOX_TEXT }}>
                      {weekStart.format('DD MMM')} – {weekStart.add(6, 'day').format('DD MMM YYYY')}
                    </div>
                    <Button size="small" type="link"
                      onClick={() => setWeekStart(dayjs().startOf('week'))}
                      style={{ padding: 0, fontSize: 12 }}>
                      Today
                    </Button>
                  </div>
                  <Button icon={<RightOutlined />}
                    onClick={() => setWeekStart((p) => p.add(1, 'week'))}
                    style={{ minWidth: 44, minHeight: 44 }} />
                </div>
                <WeekListView
                  weekDays={weekDays}
                  eventsByDate={eventsByDate}
                  moneyFormatter={moneyFormatter}
                  onEventClick={handleCalendarClick}
                />
              </>
            ) : (
              <Calendar
                value={calendarMonth}
                onPanelChange={(v) => setCalendarMonth(v)}
                onSelect={handleDateClick}
                fullCellRender={(date) => {
                  if (!date.isSame(calendarMonth, 'month'))
                    return <div style={{ minHeight: 100, padding: 6, background: '#fafafa' }} />;

                  const dateKey = date.format('YYYY-MM-DD');
                  const dayEvents = eventsByDate[dateKey] || [];
                  const visible = dayEvents.slice(0, 2);
                  const hidden = Math.max(dayEvents.length - 2, 0);
                  const isToday = date.isSame(dayjs(), 'day');

                  return (
                    <div
                      onClick={() => dayEvents.length && handleDateClick(date)}
                      style={{
                        minHeight: 100, padding: 6, borderRadius: 8,
                        border: isToday ? '1px solid #1677ff'
                          : dayEvents.length ? '1px solid rgba(40,167,171,0.28)' : '1px solid #f0f0f0',
                        background: isToday ? '#e6f4ff' : dayEvents.length ? '#fcffff' : '#ffffff',
                        cursor: dayEvents.length ? 'pointer' : 'default',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography.Text strong style={{
                          fontSize: 12, color: isToday ? BOX_BORDER : undefined,
                          background: isToday ? `${BOX_BORDER}18` : undefined,
                          borderRadius: 20, width: 22, height: 22,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {date.date()}
                        </Typography.Text>
                        {dayEvents.length > 0 && (
                          <Badge count={dayEvents.length}
                            style={{ backgroundColor: BOX_BORDER, boxShadow: 'none', fontSize: 10 }} />
                        )}
                      </div>
                      <Space direction="vertical" size={2} style={{ width: '100%', marginTop: 4 }}>
                        {visible.map((event) => (
                          <div key={event.id} style={{
                            ...getRepaymentCalendarStyle(event.repayment, event.status).style,
                            padding: '3px 6px',
                            borderRadius: 4,
                            fontSize: 11,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            textAlign: 'center',
                          }}>
                            {moneyFormatter({ amount: event.repayment.amount })}
                          </div>
                        ))}
                        {hidden > 0 && (
                          <Typography.Text style={{ color: BOX_TEXT, fontSize: 10 }}>
                            +{hidden} {translate('more')}
                          </Typography.Text>
                        )}
                      </Space>
                    </div>
                  );
                }}
              />
            )}
          </Spin>
        </Card>

        {/* ── Edit Repayment Modal ── */}
        <Modal
          title={translate('Edit Repayment')}
          open={editModalOpen}
          onOk={handleEditOk}
          confirmLoading={submitLoading}
          onCancel={() => {
            setEditModalOpen(false);
            setEditingRepayment(null);
            form.resetFields();
          }}
          width={isMobile ? '95vw' : 760}
          style={{ top: isMobile ? 10 : 24 }}
          styles={{ body: { maxHeight: isMobile ? '72vh' : '78vh', overflowY: 'auto', padding: isMobile ? 16 : 24 } }}
          maskClosable={false}
          destroyOnClose
          focusTriggerAfterClose={false}
        >
          <Form form={form} layout="vertical">
            <RepaymentForm isUpdateForm={true} />
          </Form>
        </Modal>

        {/* ── Client Details Modal ── */}
        <Modal
          title={translate('Client Details') || 'Client Details'}
          open={detailsModalOpen}
          onCancel={() => {
            setDetailsModalOpen(false);
            const active = document.activeElement;
            if (active instanceof HTMLElement) active.blur();
          }}
          footer={[<Button key="close" onClick={() => setDetailsModalOpen(false)}>{translate('Close') || 'Close'}</Button>]}
          width={isMobile ? '95vw' : 800}
          styles={{ body: { padding: isMobile ? 16 : 24 } }}
          destroyOnClose
          focusTriggerAfterClose={false}
        >
          {client && (
            <>
              <Descriptions
                title={<Typography.Text type="secondary">BASIC INFO</Typography.Text>}
                bordered
                column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                style={{ marginBottom: 20 }}
              >
                <Descriptions.Item label="Photo">
                  {/* ✅ FIX: pass size=72 and both photo + name so preview works on click */}
                  <CustomerAvatar
                    photo={client.photo || ''}
                    name={client.name}
                    size={72}
                  />
                </Descriptions.Item>
                <Descriptions.Item label="Name">{client.name}</Descriptions.Item>
                <Descriptions.Item label="Phone">{client.phone}</Descriptions.Item>
                <Descriptions.Item label="Email">{client.email || '-'}</Descriptions.Item>
                <Descriptions.Item label="Address">{client.address || '-'}</Descriptions.Item>
                <Descriptions.Item label="Location">
                  <ClientMapLink client={client} />
                </Descriptions.Item>
                <Descriptions.Item label="Assigned Staff">
                  {client.assigned?.name || 'Unknown Staff'}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions
                title={<Typography.Text type="secondary">LOAN INFO</Typography.Text>}
                bordered
                column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                style={{ marginBottom: 20 }}
              >
                <Descriptions.Item label="Loan Amount">{moneyFormatter({ amount: client.loanAmount })}</Descriptions.Item>
                <Descriptions.Item label="Interest Rate">{client.interestRate}%</Descriptions.Item>
                <Descriptions.Item label="Term">{client.term}</Descriptions.Item>
                <Descriptions.Item label="Start Date">
                  {client?.startDate && dayjs(client.startDate).isValid()
                    ? dayjs(client.startDate).format(dateFormat)
                    : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Ending Date">
                  {client?.endDate && dayjs(client.endDate).isValid()
                    ? dayjs(client.endDate).format(dateFormat)
                    : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Repayment Type">{client.repaymentType}</Descriptions.Item>
                <Descriptions.Item label="Collection Time">
                  {client?.collectionTime
                    ? dayjs(client.collectionTime, 'HH:mm:ss').format('hh:mm A')
                    : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={client.status === 'active' ? 'blue' : client.status === 'paid' ? 'green' : 'red'}>
                    {client.status?.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>

              <Descriptions
                title={<Typography.Text type="secondary">PAYMENT INFO</Typography.Text>}
                bordered
                column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
              >
                {(() => {
                  const pd = client.paymentDetails || {};

                  const upiId = pd.upiId || client.upiId;
                  const bankName = pd.bankName || client.bankName;
                  const accountNumber = pd.accountNumber || client.accountNumber;
                  const ifscCode = pd.ifscCode || client.ifscCode;
                  const accountHolderName = pd.accountHolderName || client.accountHolderName;

                  const hasBank = !!(bankName || accountNumber || ifscCode);
                  const hasUPI = !!upiId;

                  if (!hasBank && !hasUPI) {
                    return (
                      <Descriptions.Item label="Payment Mode">
                        <Tag color="green">Cash</Tag>
                      </Descriptions.Item>
                    );
                  }

                  const modes = [];
                  if (hasUPI) modes.push('UPI');

                  return (
                    <>
                      <Descriptions.Item label="Payment Mode">
                        {modes.map((m) => (
                          <Tag key={m} color={m === 'UPI' ? 'purple' : 'blue'}>
                            {m}
                          </Tag>
                        ))}
                      </Descriptions.Item>

                      {hasBank && (
                        <>
                          {bankName && (
                            <Descriptions.Item label="Bank Name">{bankName}</Descriptions.Item>
                          )}
                          {accountHolderName && (
                            <Descriptions.Item label="Account Holder">{accountHolderName}</Descriptions.Item>
                          )}
                          {accountNumber && (
                            <Descriptions.Item label="Account Number">{accountNumber}</Descriptions.Item>
                          )}
                          {ifscCode && (
                            <Descriptions.Item label="IFSC Code">{ifscCode}</Descriptions.Item>
                          )}
                        </>
                      )}

                      {hasUPI && (
                        <Descriptions.Item label="UPI ID">{upiId}</Descriptions.Item>
                      )}
                    </>
                  );
                })()}
              </Descriptions>
            </>
          )}
        </Modal>

      </Spin>
    </ErpLayout>
  );
}
