import { isValidElement, useEffect, useMemo, useState } from 'react';
import { Row, Col } from 'antd';
import { useSelector } from 'react-redux';

import dayjs from 'dayjs';
import { dataForRead } from '@/utils/dataStructure';

import { useCrudContext } from '@/context/crud';
import { selectCurrentItem } from '@/redux/crud/selectors';
import { valueByString } from '@/utils/helpers';

import useLanguage from '@/locale/useLanguage';
import { useDate } from '@/settings';

export default function ReadItem({ config }) {
  const { dateFormat } = useDate();
  const translate = useLanguage();
  const { result: currentResult } = useSelector(selectCurrentItem);
  const { state } = useCrudContext();
  const { isReadBoxOpen } = state;
  const [listState, setListState] = useState([]);

  const configSafe = config || {};
  const fields = configSafe.fields || [];
  const readColumnsFromConfig = Array.isArray(configSafe.readColumns) ? configSafe.readColumns : [];
  const hasConfiguredFields =
    fields &&
    typeof fields === 'object' &&
    !Array.isArray(fields) &&
    Object.keys(fields).length > 0;

  const readColumns = useMemo(() => {
    return hasConfiguredFields ? dataForRead({ fields, translate }) : readColumnsFromConfig;
  }, [fields, hasConfiguredFields, readColumnsFromConfig, translate]);

  const excludedKeys = ['paymentDetails', 'startDate', 'endDate', 'enabled', 'created', 'updated', '__v', '_id', 'removed'];

  const formatLabel = (key) => {
    if (!key) return '';
    const humanized = key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .trim();
    return humanized.charAt(0).toUpperCase() + humanized.slice(1).toLowerCase();
  };

  const formatValue = (value) => {
    if (value === undefined || value === null || value === '') return '-';
    if (isValidElement(value)) return value;
    if (typeof value === 'object') {
      if (value.name || value.email || value.label) {
        return value.name || value.email || value.label || '-';
      }
      return Array.isArray(value) ? value.join(', ') : JSON.stringify(value);
    }
    return value;
  };

  useEffect(() => {
    let list = [];

    if (Array.isArray(readColumns) && readColumns.length > 0) {
      list = readColumns
        .filter((props) => !excludedKeys.includes(props?.dataIndex || ''))
        .map((props) => {
          const propsKey = props?.dataIndex || '';
          const propsTitle = props?.title || formatLabel(propsKey);
          const isDate = props?.isDate || false;
          const rawValue = valueByString(currentResult || {}, propsKey);
          let value = rawValue;

          if (typeof props?.render === 'function') {
            value = props.render(rawValue, currentResult || {});
          } else if (isDate) {
            value = rawValue ? dayjs(rawValue).format(dateFormat) : '-';
          }

          return { propsKey, label: formatLabel(propsTitle), value: formatValue(value) };
        });
    }

    if ((!Array.isArray(readColumns) || readColumns.length === 0) && currentResult && typeof currentResult === 'object') {
      list = Object.keys(currentResult)
        .filter((key) => !excludedKeys.includes(key))
        .map((key) => {
          const displayValue = formatValue(currentResult[key]);
          return { propsKey: key, label: formatLabel(key), value: displayValue };
        });
    }

    setListState((prevListState) => {
      const isEqual =
        prevListState.length === list.length &&
        prevListState.every((item, index) => item.propsKey === list[index].propsKey && item.value === list[index].value);
      return isEqual ? prevListState : list;
    });
  }, [currentResult, dateFormat, readColumns]);

  if (!isReadBoxOpen || listState.length === 0) {
    return null;
  }

  const itemsList = listState.map((item) => (
    <Row key={item.propsKey || Math.random()} gutter={12}>
      <Col className="gutter-row" span={8}>
        <p>{item.label}</p>
      </Col>
      <Col className="gutter-row" span={2}>
        <p> : </p>
      </Col>
      <Col className="gutter-row" span={14}>
        <div>{item.value}</div>
      </Col>
    </Row>
  ));

  return <div>{itemsList}</div>;
}
