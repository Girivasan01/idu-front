import { useCallback, useEffect, useState } from 'react';

import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  EllipsisOutlined,
  RedoOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Dropdown, Table, Button, Input, Select } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';

import { useSelector, useDispatch } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { selectListItems } from '@/redux/crud/selectors';
import useLanguage from '@/locale/useLanguage';
import { dataForTable } from '@/utils/dataStructure';
import { useMoney, useDate } from '@/settings';

import { generate as uniqueId } from 'shortid';

import { useCrudContext } from '@/context/crud';

function AddNewItem({ config }) {
  const { crudContextAction } = useCrudContext();
  const { collapsedBox, panel } = crudContextAction;
  const { ADD_NEW_ENTITY } = config;

  const handelClick = () => {
    panel.open();
    collapsedBox.close();
  };

  return (
    <Button onClick={handelClick} type="primary">
      {ADD_NEW_ENTITY}
    </Button>
  );
}

/**
 * Reusable select-based filter dropdown.
 * Pass `filterKey` (the field name sent to the API) and `options`
 * (array of { label, value }) to reuse this for any field, not just
 * repaymentType.
 */
function TableFilterDropdown({ filterKey, options, value, onChange, placeholder }) {
  return (
    <Select
      allowClear
      value={value || undefined}
      placeholder={placeholder}
      onChange={(val) => onChange(filterKey, val)}
      style={{ width: '160px' }}
      options={options}
    />
  );
}

export default function DataTable({ config, extra = [] }) {
  let { entity, dataTableColumns, DATATABLE_TITLE, fields, searchConfig } = config;
  const { crudContextAction } = useCrudContext();
  const { panel, collapsedBox, modal, readBox, editBox, advancedBox } = crudContextAction;
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const { dateFormat } = useDate();
  const navigate = useNavigate();

  // Generic filters state — keyed by field name so this pattern can be
  // reused for any additional dropdown filters later on.
  const [filters, setFilters] = useState({});
  const [searchValue, setSearchValue] = useState('');

  const items = [
    {
      label: translate('Edit'),
      key: 'edit',
      icon: <EditOutlined />,
    },
    ...extra,
    {
      type: 'divider',
    },

    {
      label: translate('Delete'),
      key: 'delete',
      icon: <DeleteOutlined />,
    },
  ];

  const handleRead = (record) => {
    dispatch(crud.currentItem({ data: record }));
    panel.open();
    collapsedBox.open();
    readBox.open();
  };
  function handleEdit(record) {
    dispatch(crud.currentItem({ data: record }));
    dispatch(crud.currentAction({ actionType: 'update', data: record }));
    editBox.open();
    panel.open();
    collapsedBox.open();
  }
  function handleDelete(record) {
    console.log('🚀 ~ handleDelete record:', record);
    console.log('🚀 ~ handleDelete _id:', record._id);
    dispatch(crud.currentAction({ actionType: 'delete', data: record }));
    modal.open();
  }

  function handleUpdatePassword(record) {
    dispatch(crud.currentItem({ data: record }));
    dispatch(crud.currentAction({ actionType: 'update', data: record }));
    advancedBox.open();
    panel.open();
    collapsedBox.open();
  }

  let dispatchColumns = [];
  if (fields) {
    dispatchColumns = [...dataForTable({ fields, translate, moneyFormatter, dateFormat })];
  } else {
    dispatchColumns = [...dataTableColumns];
  }

  dataTableColumns = [
    ...dispatchColumns,
    {
      title: '',
      key: 'action',
      fixed: 'right',
      width: 60,
      render: (_, record) => (
        <Dropdown
          menu={{
            items,
            onClick: ({ key }) => {
              switch (key) {
                case 'read':
                  handleRead(record);
                  break;
                case 'edit':
                  handleEdit(record);
                  break;

                case 'delete':
                  handleDelete(record);
                  break;
                case 'view':
                  navigate(`/calendar/client/${record._id}`);
                  break;
                case 'repayments':
                  navigate(`/repayment/client/${record._id}`);
                  break;
                case 'updatePassword':
                  handleUpdatePassword(record);
                  break;

                default:
                  break;
              }
            },
          }}
          trigger={['click']}
        >
          <EllipsisOutlined
            style={{ cursor: 'pointer', fontSize: '24px' }}
            onClick={(e) => e.preventDefault()}
          />
        </Dropdown>
      ),
    },
  ];

  const { result, isLoading: listIsLoading } = useSelector(selectListItems);
  const listResult = result || {};
  const pagination = listResult?.pagination || {};
  const dataSource = Array.isArray(listResult?.items) ? listResult.items : [];

  const dispatch = useDispatch();

  const fetchList = useCallback(
    (pageOptions = {}, nextFilters = filters, q = searchValue) => {
      const options = {
        page: pageOptions?.current || 1,
        items: pageOptions?.pageSize || 10,
        q: q || undefined,
        fields: q ? searchConfig?.searchFields || '' : undefined,
        ...nextFilters,
      };
      dispatch(crud.list({ entity, options }));
    },
    [dispatch, entity, filters, searchValue, searchConfig]
  );

  const handelDataTableLoad = useCallback(
    (paginationArg, tableFilters, sorter, extraInfo) => {
      if (extraInfo?.action && extraInfo.action !== 'paginate') {
        return;
      }
      fetchList(paginationArg);
    },
    [fetchList]
  );

  const filterTable = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    fetchList({ current: 1, pageSize: pagination?.pageSize }, filters, value);
  };

  // Generic handler: works for repaymentType today, and any future
  // dropdown filter you add to `dropdownFilters` below.
  const handleFilterChange = (filterKey, value) => {
    const nextFilters = { ...filters };
    if (value === undefined || value === null || value === '') {
      delete nextFilters[filterKey];
    } else {
      nextFilters[filterKey] = value;
    }
    setFilters(nextFilters);
    fetchList({ current: 1, pageSize: pagination?.pageSize }, nextFilters, searchValue);
  };

  const dispatcher = () => {
    dispatch(crud.list({ entity }));
  };

  useEffect(() => {
    const controller = new AbortController();
    dispatcher();
    return () => {
      controller.abort();
    };
  }, []);

  // Declare dropdown filters here — add more entries to reuse this
  // same pattern for other fields without touching the render logic.
  const dropdownFilters = [
    {
      key: 'repaymentType',
      placeholder: translate('Repayment Type'),
      options: [
        { label: translate('Daily'), value: 'Daily' },
        { label: translate('Weekly'), value: 'Weekly' },
        { label: translate('Monthly'), value: 'Monthly' },
      ],
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <AddNewItem config={config} />
      </div>
      <PageHeader
        onBack={() => window.history.back()}
        backIcon={<ArrowLeftOutlined />}
        title={DATATABLE_TITLE}
        ghost={false}
        style={{
          padding: '20px 0px',
        }}
      ></PageHeader>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          flexWrap: 'nowrap',
          gap: '8px',
          marginBottom: '16px',
        }}
      >
        {dropdownFilters.map((filter) => (
          <TableFilterDropdown
            key={filter.key}
            filterKey={filter.key}
            options={filter.options}
            value={filters[filter.key]}
            onChange={handleFilterChange}
            placeholder={filter.placeholder}
          />
        ))}

        <Input
          key={`searchFilterDataTable`}
          onChange={filterTable}
          placeholder={translate('search')}
          allowClear
          style={{ width: '200px' }}
        />

        <Button onClick={() => fetchList(pagination)} icon={<RedoOutlined />}>
          {translate('Refresh')}
        </Button>
      </div>

      <div className="table-responsive-wrapper">
        <Table
          columns={dataTableColumns}
          rowKey={(item) => item._id}
          dataSource={dataSource}
          pagination={pagination}
          loading={listIsLoading}
          onChange={handelDataTableLoad}
          scroll={{ x: 'max-content' }}
        />
      </div>
    </>
  );
}
