/**
 * pages/repayment/index.jsx — Webaac Solutions Finance Management
 * FIX: openRepaymentEditor now uses getDisplayStatus() so past-due
 *      repayments show 'default' in the form instead of 'not-started'
 */
import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  ArrowLeftOutlined, RedoOutlined, CalendarOutlined,
  UserOutlined, DollarOutlined,
} from '@ant-design/icons';
import {
  App, Avatar, Badge, Button, Calendar, Card, Col, DatePicker,
  Form, Input, Modal, Row, Select, Space, Spin, Typography,
} from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';

import { ErpLayout } from '@/layout';
import { crud } from '@/redux/crud/actions';
import { selectListItems } from '@/redux/crud/selectors';
import { erp } from '@/redux/erp/actions';
import { request } from '@/request';
import useLanguage from '@/locale/useLanguage';
import RepaymentForm from '@/forms/RepaymentForm';
import { repaymentStatusColor } from '@/utils/repaymentStatusColor';
import { getRepaymentCalendarStyle } from '@/utils/repaymentCalendarStyle';

const BOX_BORDER = '#28a7ab';
const BOX_TEXT  = '#117a8b';
const HEADER_BG = 'linear-gradient(90deg, rgba(40,167,171,0.14) 0%, rgba(24,144,255,0.06) 100%)';

const normalizeRepaymentStatus = (status) => {
  const s = String(status || '').trim().toLowerCase();
  if (s === 'late payment' || s === 'late_payment') return 'late';
  if (s === 'not-paid'    || s === 'not paid')      return 'default';
  if (s === 'not_started' || s === 'not started' || s === 'not-started') return 'not-started';
  return s || 'not-started';
};

// ── KEY FIX: computes the REAL display status including past-due logic ────────
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

  if (normalizeRepaymentStatus(repayment?.status) === 'paid') return 'paid';
  if (normalizeRepaymentStatus(repayment?.status) === 'late') return 'late';
  if (normalizeRepaymentStatus(repayment?.status) === 'partial') return 'partial';

  return 'not-started';
};

const displayStatusPriority   = { default: 1, late: 2, partial: 3, paid: 4, 'not-started': 5 };
const roundCurrency           = (v) => Number.parseFloat(Number(v || 0).toFixed(2));

const resolveClientId = (client) => {
  if (!client) return null;
  if (typeof client === 'string') return client;
  if (client._id) return String(client._id);
  return String(client);
};

const buildRepaymentPayloadFromClient = (client, dueDate) => {
  const installmentCount = Number.parseInt(client?.term, 10);
  const principal        = Number.parseFloat(client?.loanAmount || 0);
  const monthlyRate      = Number.parseFloat(client?.interestRate || 0) / 100;
  const targetDate       = dayjs(dueDate).format('YYYY-MM-DD');
  const start            = dayjs(client?.startDate);

  if (!installmentCount || !start.isValid()) {
    return {
      client: resolveClientId(client._id || client),
      date: dayjs(dueDate).toISOString(),
      amount: 0,
      principal: 0,
      interest: 0,
      amountPaid: 0,
    };
  }

  const principalPerInstallment = installmentCount > 0 ? principal / installmentCount : 0;
  let durationUnit = 'month';
  let periodsPerMonth = 1;
  if (client?.repaymentType === 'Weekly') {
    durationUnit = 'week';
    periodsPerMonth = 4.33;
  }
  if (client?.repaymentType === 'Daily') {
    durationUnit = 'day';
    periodsPerMonth = 30;
  }

  const schedule = [];

  const periodRate = periodsPerMonth > 0 ? monthlyRate / periodsPerMonth : monthlyRate;
  let outstanding = principal;

  for (let index = 1; index <= installmentCount; index += 1) {
    const interest = outstanding * periodRate;
    schedule.push({
      date: start.add(index, durationUnit).format('YYYY-MM-DD'),
      principal: roundCurrency(principalPerInstallment),
      interest: roundCurrency(interest),
      amount: roundCurrency(principalPerInstallment + interest),
    });
    outstanding = Math.max(0, outstanding - principalPerInstallment);
  }

  const selectedInstallment =
    schedule.find((item) => item.date === targetDate) || schedule[0] || {
      amount: 0,
      principal: 0,
      interest: 0,
    };

  return {
    client:     resolveClientId(client._id || client),
    date:       dayjs(dueDate).toISOString(),
    amount:     roundCurrency(selectedInstallment.amount),
    principal:  roundCurrency(selectedInstallment.principal),
    interest:   roundCurrency(selectedInstallment.interest),
    amountPaid: 0,
  };
};

const LegendItem = ({ color, label }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <span style={{
      width: 13, height: 13, backgroundColor: color,
      display: 'inline-block', marginRight: 5, borderRadius: 2,
      border: '1px solid #ccc', flexShrink: 0,
    }} />
    <span style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{label}</span>
  </div>
);

export default function Repayment() {
  const { notification } = App.useApp();
  const translate = useLanguage();
  const dispatch  = useDispatch();

  const { result: listResult, isLoading } = useSelector(selectListItems);
  const clients = Array.isArray(listResult?.items) ? listResult.items : [];

  const [isMobile, setIsMobile]             = useState(() => window.innerWidth <= 768);
  const [searchTerm, setSearchTerm]         = useState('');
  const [currentDate, setCurrentDate]       = useState(dayjs());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRepayment, setEditingRepayment] = useState(null);
  const [form]                              = Form.useForm();
  const [statusFilter, setStatusFilter]     = useState('all');
  const [repayments, setRepayments]         = useState([]);
  const [submitLoading, setSubmitLoading]   = useState(false);
  const [expandedDays, setExpandedDays]     = useState(new Set());

  const loadClients = useCallback(() => {
    dispatch(crud.list({ entity: 'client', options: { page: 1, items: 100 } }));
  }, [dispatch]);

  const loadRepayments = useCallback(async () => {
    try {
      const response = await request.list({ entity: 'repayment', options: { items: 500, page: 1 } });
      if (response?.success) setRepayments(response.result || []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    loadClients();
    loadRepayments();
    const handler = () => loadRepayments();
    window.addEventListener('repayment-updated', handler);
    return () => window.removeEventListener('repayment-updated', handler);
  }, [loadClients, loadRepayments]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getDueDatesForClientInMonth = (client, monthValue) => {
    const term = parseInt(client?.term, 10);
    if (!client?.startDate || Number.isNaN(term) || term <= 0) return [];
    const monthStart = monthValue.startOf('month');
    const monthEnd   = monthValue.endOf('month');
    const startDate  = dayjs(client.startDate);
    const dueDates   = [];
    let unit = 'month';
    if (client?.repaymentType === 'Weekly') unit = 'week';
    if (client?.repaymentType === 'Daily')  unit = 'day';
    for (let i = 1; i <= term; i++) {
      const dueDate = startDate.add(i, unit);
      if (dueDate.isAfter(monthEnd))    break;
      if (dueDate.isBefore(monthStart)) continue;
      dueDates.push(dueDate.date());
    }
    return dueDates;
  };

  const filteredClients = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return clients.filter((c) => {
      const matchName   = !query || (c?.name || '').toLowerCase().includes(query);
      const matchStatus = statusFilter === 'all' || c?.status === statusFilter;
      return matchName && matchStatus;
    });
  }, [clients, searchTerm, statusFilter]);

  const clientsByDay = useMemo(() => {
    const map = {};
    filteredClients.forEach((client) => {
      getDueDatesForClientInMonth(client, currentDate).forEach((dayNum) => {
        if (!map[dayNum]) map[dayNum] = [];
        map[dayNum].push(client);
      });
    });
    return map;
  }, [filteredClients, currentDate]);

  const repaymentMap = useMemo(() => {
    const map = new Map();
    if (!Array.isArray(repayments)) return map;
    repayments.forEach((item) => {
      const clientId = item.client?._id || item.client;
      const key      = `${clientId}-${dayjs(item.date).format('YYYY-MM-DD')}`;
      const cur      = map.get(key);
      const curPri   = cur  ? displayStatusPriority[getDisplayStatus(cur)]  ?? 99 : 99;
      const nextPri  = displayStatusPriority[getDisplayStatus(item)] ?? 99;
      if (!cur || nextPri < curPri) map.set(key, item);
    });
    return map;
  }, [repayments]);

  const getPaymentStatus = useCallback(
    (client, date) => repaymentMap.get(`${client._id}-${date.format('YYYY-MM-DD')}`) || null,
    [repaymentMap]
  );

  const totalDueClients = Object.values(clientsByDay).reduce((n, d) => n + d.length, 0);
  const startOfWeek = useMemo(() => currentDate.startOf('week'), [currentDate]);
  const endOfWeek   = useMemo(() => currentDate.endOf('week'),   [currentDate]);
  const weekDays    = useMemo(
    () => Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day')),
    [startOfWeek]
  );

  const goToPreviousWeek = useCallback(() => setCurrentDate((p) => p.subtract(1, 'week')), []);
  const goToNextWeek     = useCallback(() => setCurrentDate((p) => p.add(1, 'week')),      []);
  const goToToday        = useCallback(() => setCurrentDate(dayjs()),                        []);

  const formatRepaymentPayload = (values, existingRepayment = null) => {
    const payload = { ...values };
    payload.client = resolveClientId(payload.client);
    
    // Always preserve amountPaid — use from form, or fallback to existing repayment
    if (payload.amountPaid === undefined && existingRepayment) {
      payload.amountPaid = existingRepayment.amountPaid;
    }
    
    if (['paid', 'late'].includes(payload.status) && !payload.amountPaid)
      payload.amountPaid = payload.amount;
    payload.date = payload.date ? dayjs(payload.date).toISOString() : undefined;
    payload.paymentDate = payload.paymentDate
      ? dayjs(payload.paymentDate).toISOString()
      : (['paid', 'late'].includes(payload.status) ? new Date().toISOString() : null);
    return payload;
  };

  const updateRepaymentInState = useCallback((updated) => {
    setRepayments((prev) => prev.map((r) => r._id === updated._id ? { ...r, ...updated } : r));
  }, []);

  const appendRepaymentToState = useCallback((newR) => {
    setRepayments((prev) => prev.some((r) => r._id === newR._id) ? prev : [...prev, newR]);
  }, []);

  // ── KEY FIX: use getDisplayStatus() so past-due shows 'default' not 'not-started' ──
  const openRepaymentEditor = useCallback((repayment) => {
    if (!repayment) return;
    const displayStatus = getDisplayStatus(repayment); // ← computed, not raw DB value
    setEditingRepayment(repayment);
    form.setFieldsValue({
      ...repayment,
      status:          displayStatus,
      _originalStatus: displayStatus,
      date:            repayment.date        ? dayjs(repayment.date)        : null,
      paymentDate:     repayment.paymentDate ? dayjs(repayment.paymentDate) : null,
      amountPaid:      repayment.amountPaid  ?? 0,
    });
    setIsEditModalOpen(true);
  }, [form]);

  const handleClientClick = async (client, dueDate, repaymentRecord = null) => {
    if (repaymentRecord?._id) {
      openRepaymentEditor(repaymentRecord);
      return;
    }
    try {
      const formattedDate = dayjs(dueDate).format('YYYY-MM-DD');
      const response = await request.get({
        entity: `repayment/by-client-date?clientId=${client._id}&date=${formattedDate}`,
      });
      if (response?.success && response?.result) {
        openRepaymentEditor(response.result);
        return;
      }
    } catch (error) {
      const isNotFound = ['Repayment not found', 'No repayment found'].includes(error?.message);
      if (!isNotFound) {
        notification.error({ message: translate('Failed to fetch repayment'), description: error?.message });
        return;
      }
    }
    try {
      const createResponse = await request.create({
        entity:   'repayment',
        jsonData: buildRepaymentPayloadFromClient(client, dueDate),
      });
      if (!createResponse?.success || !createResponse?.result) {
        notification.error({ message: translate('Failed to open repayment'), description: createResponse?.message });
        return;
      }
      appendRepaymentToState(createResponse.result);
      openRepaymentEditor(createResponse.result);
      window.dispatchEvent(new Event('repayment-updated'));
    } catch (error) {
      notification.error({ message: translate('Failed to open repayment'), description: error?.message });
    }
  };

  const handleEditModalOk = async () => {
    setSubmitLoading(true);
    try {
      const values = await form.validateFields();

      if (!editingRepayment?._id || editingRepayment?.isVirtual) {
        const createResponse = await request.create({
          entity:   'repayment',
          jsonData: formatRepaymentPayload({
            ...editingRepayment,
            ...values,
            client: resolveClientId(editingRepayment?.client) || resolveClientId(values?.client),
          }),
        });
        if (!createResponse?.success || !createResponse?.result) {
          notification.error({ message: translate('Create failed'), description: createResponse?.message });
          return;
        }
        appendRepaymentToState(createResponse.result);
        setEditingRepayment(createResponse.result);
        window.dispatchEvent(new Event('repayment-updated'));
        notification.success({ message: translate('Repayment created successfully') });
      } else {
        const updateResponse = await request.update({
          entity:   'repayment',
          id:       editingRepayment._id,
          jsonData: formatRepaymentPayload(values, editingRepayment),
        });
        if (!updateResponse?.success || !updateResponse?.result) {
          notification.error({ message: translate('Update failed'), description: updateResponse?.message });
          return;
        }
        updateRepaymentInState(updateResponse.result);
        setEditingRepayment(updateResponse.result);
        window.dispatchEvent(new Event('repayment-updated'));
        notification.success({ message: translate('Repayment updated successfully') });
      }
      dispatch(erp.list({ entity: 'payment' }));
      setIsEditModalOpen(false);
      form.resetFields();
    } catch (error) {
      if (error?.errorFields) return;
      notification.error({ message: translate('Operation failed'), description: error?.message });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <ErpLayout>
      <PageHeader
        onBack={() => window.history.back()}
        backIcon={<ArrowLeftOutlined />}
        title={
          <Space>
            <CalendarOutlined style={{ color: BOX_TEXT }} />
            <span style={{ fontSize: isMobile ? 15 : 18 }}>{translate('Loans Calendar')}</span>
          </Space>
        }
        ghost={false}
        extra={[
          <div key="header-controls" style={{
            display: 'flex', flexWrap: 'wrap', gap: 8,
            justifyContent: isMobile ? 'flex-start' : 'flex-end', width: '100%',
          }}>
            <Input allowClear onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={translate('search')} value={searchTerm}
              style={{ flex: '1 1 140px', maxWidth: 210, minWidth: 120 }} />
            <Select value={statusFilter} onChange={setStatusFilter}
              style={{ flex: '1 1 110px', maxWidth: 150, minWidth: 100 }}
              options={[
                { label: translate('all'),       value: 'all'       },
                { label: translate('active'),    value: 'active'    },
                { label: translate('paid'),      value: 'paid'      },
                { label: translate('defaulted'), value: 'defaulted' },
              ]} />
            <Button icon={<RedoOutlined />} onClick={loadClients}>
              {!isMobile && translate('Refresh')}
            </Button>
          </div>,
        ]}
        style={{ padding: isMobile ? '12px 10px' : '18px 14px', borderRadius: 10, background: HEADER_BG, marginBottom: 12 }}
      />

      <Spin spinning={isLoading}>
        <Row gutter={[10, 10]} style={{ marginBottom: 10 }}>
          <Col xs={24} sm={8}>
            <Card size="small" bordered={false} style={{ background: '#f4fbfc' }}>
              <Space>
                <Avatar size={30} icon={<UserOutlined />} style={{ background: BOX_BORDER, flexShrink: 0 }} />
                <div>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>{translate('Clients in View')}</Typography.Text>
                  <div style={{ fontWeight: 600 }}>{filteredClients.length}</div>
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small" bordered={false} style={{ background: '#f4fbfc' }}>
              <Space>
                <Avatar size={30} icon={<CalendarOutlined />} style={{ background: '#1890ff', flexShrink: 0 }} />
                <div>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>{translate('Due Entries This Month')}</Typography.Text>
                  <div style={{ fontWeight: 600 }}>{totalDueClients}</div>
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small" bordered={false} style={{ background: '#f4fbfc' }}>
              <Space>
                <Avatar size={30} icon={<DollarOutlined />} style={{ background: '#13a78f', flexShrink: 0 }} />
                <div>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>{translate('Period')}</Typography.Text>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>
                    {isMobile
                      ? `${weekDays[0].format('DD MMM')} – ${weekDays[6].format('DD MMM')}`
                      : currentDate.format('MMMM YYYY')}
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        <Card bordered={false} style={{ borderRadius: 12, overflowX: 'hidden' }}>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '8px 14px', marginBottom: 16,
            background: '#fafafa', padding: '10px 14px', borderRadius: 6,
            border: '1px solid #f0f0f0', overflowX: 'auto',
          }}>
            <LegendItem color={repaymentStatusColor.paid}           label="Paid"        />
            <LegendItem color={repaymentStatusColor.late}           label="Late"        />
            <LegendItem color={repaymentStatusColor.partial}        label="Partial"     />
            <LegendItem color={repaymentStatusColor.default}        label="Default"     />
            <LegendItem color={repaymentStatusColor['not-started']} label="Not Started" />
          </div>

          <div className="week-nav-bar">
            <button type="button" className="nav-icon-btn" onClick={goToPreviousWeek}>←</button>
            <div className="week-center">
              <button type="button" className="today-pill" onClick={goToToday}>Today</button>
              <div className="week-range" style={{ fontSize: isMobile ? 12 : 14 }}>
                {startOfWeek.format('DD MMM')} – {endOfWeek.format('DD MMM YYYY')}
              </div>
            </div>
            <button type="button" className="nav-icon-btn" onClick={goToNextWeek}>→</button>
          </div>

          <div className="calendar-mobile-wrapper repayment-calendar-wrapper">
            {isMobile ? (
              <>
                <DatePicker picker="week" value={currentDate}
                  onChange={(date) => date && setCurrentDate(date)}
                  style={{ width: '100%', marginBottom: 12, marginTop: 8 }} />
                <div className="weekly-calendar">
                  {weekDays.map((day) => {
                    const dayClients = filteredClients.filter((client) =>
                      getDueDatesForClientInMonth(client, day).includes(day.date())
                    );
                    return (
                      <div key={day.format('YYYY-MM-DD')} className="week-day">
                        <div className="week-date" style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                          {day.format('ddd, DD MMM')}
                        </div>
                        {dayClients.length ? dayClients.map((client) => {
                          const repayment  = getPaymentStatus(client, day);
                          const forDisplay = repayment || { status: 'not-started', date: day.toDate() };
                          const normalizedDisplayStatus = getDisplayStatus(forDisplay);
                          const calendarStyle = getRepaymentCalendarStyle(forDisplay, normalizedDisplayStatus);
                          return (
                            <div key={`${client._id}-${day.format('YYYY-MM-DD')}`}
                              onClick={() => handleClientClick(client, day.format('YYYY-MM-DD'), repayment)}
                              style={{
                                ...calendarStyle.style,
                                cursor: 'pointer',
                                fontSize: 13,
                                padding: '4px 8px',
                                borderRadius: 4,
                                marginBottom: 4,
                              }}>
                              {client?.name}
                            </div>
                          );
                        }) : (
                          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            {translate('No repayments')}
                          </Typography.Text>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <Calendar fullscreen value={currentDate}
                onPanelChange={(v) => { setCurrentDate(v); setExpandedDays(new Set()); }}
                onChange={(v) => setCurrentDate(v)}
                fullCellRender={(date) => {
                  if (!date.isSame(currentDate, 'month'))
                    return <div style={{ minHeight: 110, padding: 6, background: '#fafafa' }} />;
                  const dayKey     = date.format('YYYY-MM-DD');
                  const dayClients = clientsByDay[date.date()] || [];
                  const isExpanded = expandedDays.has(dayKey);
                  const PREVIEW    = 2;
                  const visible    = isExpanded ? dayClients : dayClients.slice(0, PREVIEW);
                  const hidden     = Math.max(dayClients.length - PREVIEW, 0);
                  const isToday = date.isSame(dayjs(), 'day');
                  return (
                    <div className="calendar-cell" style={{
                      minHeight: 110, padding: 6, borderRadius: 8,
                      border: isToday ? '1px solid #1677ff' : dayClients.length ? '1px solid rgba(40,167,171,0.28)' : '1px solid #f0f0f0',
                      background: isToday ? '#e6f4ff' : dayClients.length ? '#fcffff' : '#ffffff',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography.Text strong style={{ fontSize: 12, color: isToday ? '#1677ff' : undefined }}>
                          {date.date()}
                        </Typography.Text>
                        {dayClients.length ? (
                          <Badge count={dayClients.length}
                            style={{ backgroundColor: BOX_BORDER, boxShadow: 'none', fontSize: 10 }} />
                        ) : null}
                      </div>
                      <Space direction="vertical" size={3} style={{ width: '100%', marginTop: 6 }}>
                        {visible.map((client) => {
                          const repayment  = getPaymentStatus(client, date);
                          const forDisplay = repayment || { status: 'not-started', date: date.toDate() };
                          const normalizedDisplayStatus = getDisplayStatus(forDisplay);
                          const calendarStyle = getRepaymentCalendarStyle(forDisplay, normalizedDisplayStatus);
                          return (
                            <button type="button"
                              key={`${client._id}-${date.date()}`}
                              onClick={(e) => { e.stopPropagation(); handleClientClick(client, date.format('YYYY-MM-DD'), repayment); }}
                              style={{
                                ...calendarStyle.style,
                                fontSize: 11,
                                width: '100%',
                                textAlign: 'left',
                                borderRadius: 8,
                                padding: '6px 4px',
                                marginTop: 4,
                                cursor: 'pointer',
                              }}>
                              {client?.name}
                            </button>
                          );
                        })}
                        {hidden > 0 && !isExpanded && (
                          <button type="button"
                            onClick={(e) => { e.stopPropagation(); setExpandedDays((prev) => { const next = new Set(prev); next.add(dayKey); return next; }); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: BOX_TEXT, fontSize: 11, padding: '2px 0', textAlign: 'left', width: '100%', fontWeight: 600 }}>
                            +{hidden} more ▾
                          </button>
                        )}
                        {isExpanded && dayClients.length > PREVIEW && (
                          <button type="button"
                            onClick={(e) => { e.stopPropagation(); setExpandedDays((prev) => { const next = new Set(prev); next.delete(dayKey); return next; }); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: BOX_TEXT, fontSize: 11, padding: '2px 0', textAlign: 'left', width: '100%', fontWeight: 600 }}>
                            ▴ show less
                          </button>
                        )}
                      </Space>
                    </div>
                  );
                }}
              />
            )}
          </div>
        </Card>
      </Spin>

      <Modal
        title={translate('Edit Repayment')}
        open={isEditModalOpen}
        onOk={handleEditModalOk}
        confirmLoading={submitLoading}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingRepayment(null);
          form.resetFields();
          const active = document.activeElement;
          if (active instanceof HTMLElement) active.blur();
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
    </ErpLayout>
  );
}
