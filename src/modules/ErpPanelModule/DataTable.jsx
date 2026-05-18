/**
 * DataTable/index.jsx  —  Webaac Solutions Finance Management
 *
 * FIX: CSV export 404 — root cause was `import axios from 'axios'` which
 * bypasses Vite proxy rewriting and the app's JWT interceptor.
 * Solution: read the token from localStorage and call fetch() with the
 * correct absolute backend URL (same pattern Idurar's request.js uses).
 *
 * UI improvements:
 *  - Cleaner header with teal accent
 *  - Better toolbar layout (search left, actions right)
 *  - Subtle row hover, rounded table
 *  - Mobile-responsive controls
 */

import { useEffect, useState } from 'react';
import {
  EditOutlined, DeleteOutlined, FilePdfOutlined,
  RedoOutlined, PlusOutlined, EllipsisOutlined,
  ArrowLeftOutlined, DownloadOutlined, SearchOutlined,
} from '@ant-design/icons';
import {
  Dropdown, Table, Button, Space, DatePicker,
  notification, Row, Col, message, Typography, Tag, Grid,
} from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import AutoCompleteAsync from '@/components/AutoCompleteAsync';
import { useSelector, useDispatch } from 'react-redux';
import useLanguage from '@/locale/useLanguage';
import { erp } from '@/redux/erp/actions';
import { selectListItems } from '@/redux/erp/selectors';
import { useErpContext } from '@/context/erp';
import { useNavigate } from 'react-router-dom';
import { DOWNLOAD_BASE_URL } from '@/config/serverApiConfig';
import { downloadPaymentPdf } from '@/utils/downloadPaymentPdf';

const { RangePicker } = DatePicker;
const { useBreakpoint } = Grid;
const { Text } = Typography;

// ── Brand colour ──────────────────────────────────────────────────────────────
const TEAL = '#0f766e';

// ── AddNewItem ────────────────────────────────────────────────────────────────
function AddNewItem({ config }) {
  const navigate = useNavigate();
  const { ADD_NEW_ENTITY, entity } = config;
  return (
    <Button
      type="primary"
      icon={<PlusOutlined />}
      onClick={() => navigate(`/${entity.toLowerCase()}/create`)}
      style={{ background: TEAL, border: 'none' }}
    >
      {ADD_NEW_ENTITY}
    </Button>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function DataTable({ config, extra = [] }) {
  const translate = useLanguage();
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const screens   = useBreakpoint();
  const isMobile  = !screens.md;

  const { entity, dataTableColumns, disableAdd = false, searchConfig } = config;
  const { DATATABLE_TITLE } = config;

  const { result: listResult, isLoading } = useSelector(selectListItems);
  const { pagination = {}, items: dataSource = [] } = listResult || {};

  const { erpContextAction } = useErpContext();
  const { modal } = erpContextAction;

  const [range,     setRange]     = useState(null);
  const [exporting, setExporting] = useState(false);

  // ── Date filter ──────────────────────────────────────────────────────────
  const handleRangeChange = (dates) => {
    setRange(dates);
    if (!dates) {
      dispatch(erp.list({ entity }));
      return;
    }
    const [from, to] = dates;
    dispatch(erp.list({
      entity,
      options: {
        from: from.format('YYYY-MM-DD'),
        to:   to.format('YYYY-MM-DD'),
      },
    }));
  };

  // ── CSV Export ────────────────────────────────────────────────────────────
  // FIX: Do NOT use `import axios from 'axios'` — that bypasses the Vite proxy
  // rewrite (/api → http://localhost:8888/api) and loses the JWT interceptor.
  //
  // Instead: use the browser's native fetch() with:
  //   1. An absolute URL to the backend (reads from VITE_API_BASE_URL or default)
  //   2. The JWT token manually attached from localStorage
  //
  // This is identical to what Idurar's request.js does internally.
  const handleExport = async () => {
    if (!range) {
      message.warning('Please select a date range first');
      return;
    }

    const [from, to] = range;
    const fromStr    = from.format('YYYY-MM-DD');
    const toStr      = to.format('YYYY-MM-DD');

    setExporting(true);
    try {
      // Read the JWT token exactly the way Idurar's request.js reads it
      const auth = JSON.parse(localStorage.getItem('auth') || '{}');
      const token = auth?.token || auth?.current?.token || localStorage.getItem('token') || '';

      // Build the absolute backend URL — avoids Vite proxy entirely
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8888/api';
      const url      = `${API_BASE}/payment/export?from=${fromStr}&to=${toStr}`;

      const response = await fetch(url, {
        method:  'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type':  'application/json',
        },
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`Server returned ${response.status}: ${errBody}`);
      }

      // Stream the CSV blob into a download
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href     = URL.createObjectURL(blob);
      link.download = `payments-${fromStr}-to-${toStr}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);

      message.success(`Payments ${fromStr} → ${toStr} downloaded ✓`);
    } catch (err) {
      console.error('[DataTable] export error:', err);
      notification.error({
        message:     'Export failed',
        description: err.message || 'Could not download CSV',
      });
    } finally {
      setExporting(false);
    }
  };

  // ── Action menu ──────────────────────────────────────────────────────────
  const actionItems = [
    { label: translate('Edit'),     key: 'edit',     icon: <EditOutlined />    },
    { label: translate('Download'), key: 'download', icon: <FilePdfOutlined /> },
    ...extra,
    { type: 'divider' },
    { label: <span style={{ color: '#ff4d4f' }}>{translate('Delete')}</span>,
      key: 'delete', icon: <DeleteOutlined style={{ color: '#ff4d4f' }} /> },
  ];

  const handleEdit = (record) => {
    dispatch(erp.currentAction({ actionType: 'update', data: record }));
    navigate(`/${entity}/update/${record._id}`);
  };

  const handleDownload = async (record) => {
    try {
      if (entity === 'payment') {
        await downloadPaymentPdf(record._id);
        return;
      }
      window.open(`${DOWNLOAD_BASE_URL}/${entity}/${entity}-${record._id}.pdf`, '_blank');
    } catch (error) {
      notification.error({ message: error.message || 'Download failed' });
    }
  };

  const handleDelete = (record) => {
    dispatch(erp.currentAction({ actionType: 'delete', data: record }));
    modal.open();
  };

  // ── Table columns ────────────────────────────────────────────────────────
  const columns = [
    ...dataTableColumns,
    {
      title: '',
      key:   'action',
      fixed: 'right',
      width: 48,
      render: (_, record) => (
        <Dropdown
          menu={{
            items:   actionItems,
            onClick: ({ key }) => {
              if (key === 'edit')     handleEdit(record);
              if (key === 'download') handleDownload(record);
              if (key === 'delete')   handleDelete(record);
            },
          }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<EllipsisOutlined style={{ fontSize: 20 }} />}
            onClick={(e) => e.preventDefault()}
            style={{ color: '#8c8c8c' }}
          />
        </Dropdown>
      ),
    },
  ];

  // ── Data load ────────────────────────────────────────────────────────────
  const handleTableChange = (pag) => {
    dispatch(erp.list({
      entity,
      options: { page: pag.current, items: pag.pageSize },
    }));
  };

  useEffect(() => {
    dispatch(erp.list({ entity }));
  }, [dispatch, entity]);

  const filterTable = (value) => {
    dispatch(erp.list({
      entity,
      options: { equal: value, filter: searchConfig?.entity },
    }));
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: isMobile ? '0 0 16px' : '0 0 24px' }}>
      {/* ── Page Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 0 14px', borderBottom: '1px solid #f0f0f0', marginBottom: 18,
        flexWrap: 'wrap', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => window.history.back()}
            style={{ color: '#8c8c8c' }}
          />
          <div style={{ width: 4, height: 22, background: TEAL, borderRadius: 2 }} />
          <Typography.Title level={4} style={{ margin: 0, fontSize: isMobile ? 16 : 20 }}>
            {DATATABLE_TITLE}
          </Typography.Title>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        flexWrap: 'wrap', gap: 10, marginBottom: 16,
      }}>
        {/* Left: Search */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <AutoCompleteAsync
            entity={searchConfig?.entity}
            displayLabels={['name']}
            searchFields={'name'}
            onChange={filterTable}
          />
          <Button
            icon={<RedoOutlined />}
            onClick={() => dispatch(erp.list({ entity }))}
            style={{ color: '#595959' }}
          >
            {!isMobile && translate('Refresh')}
          </Button>
        </div>

        {/* Right: Export + Add */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <RangePicker
            onChange={handleRangeChange}
            format="YYYY-MM-DD"
            style={{ width: isMobile ? 220 : 260 }}
            placeholder={['From date', 'To date']}
            size="middle"
          />
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExport}
            loading={exporting}
            disabled={!range}
            style={{
              background: range ? TEAL : undefined,
              color:      range ? '#fff' : undefined,
              border:     range ? 'none' : undefined,
              fontWeight: 600,
            }}
          >
            {exporting ? 'Exporting…' : 'Export CSV'}
          </Button>
          {!disableAdd && <AddNewItem config={config} />}
        </div>
      </div>

      {/* ── Date range info badge ── */}
      {range && (
        <div style={{ marginBottom: 10 }}>
          <Tag
            color="cyan"
            closable
            onClose={() => { setRange(null); dispatch(erp.list({ entity })); }}
            style={{ borderRadius: 20, padding: '2px 10px', fontSize: 12 }}
          >
            {range[0].format('DD MMM YYYY')} → {range[1].format('DD MMM YYYY')}
          </Tag>
        </div>
      )}

      {/* ── Table ── */}
      <div style={{
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}>
        <Table
          columns={columns}
          rowKey={(item) => item._id}
          dataSource={dataSource}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => (
              <Text type="secondary" style={{ fontSize: 13 }}>{total} records</Text>
            ),
          }}
          loading={isLoading}
          onChange={handleTableChange}
          scroll={{ x: true }}
          size="middle"
          rowClassName={() => 'datatable-row'}
        />
      </div>

      <style>{`
        .datatable-row:hover td { background: #f0fdf9 !important; }
        .ant-table-thead > tr > th {
          background: #fafafa !important;
          font-weight: 600 !important;
          font-size: 13px !important;
          color: #595959 !important;
          border-bottom: 2px solid #f0f0f0 !important;
        }
        .ant-table-tbody > tr > td {
          font-size: 13px;
          border-bottom: 1px solid #f8f8f8 !important;
        }
        .ant-pagination { padding: 12px 16px !important; }
      `}</style>
    </div>
  );
}
