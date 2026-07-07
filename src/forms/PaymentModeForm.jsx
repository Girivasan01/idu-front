import React from 'react';
import { Switch, Form, Input, Button, Space } from 'antd';
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';

export default function PaymentModeForm({ isUpdateForm = false, onCancel, loading = false }) {
  const translate = useLanguage();
  return (
    <>
      <Form.Item
        label={translate('Payment Mode')}
        name="name"
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Input placeholder="e.g., UPI, Bank Transfer" />
      </Form.Item>
      <Form.Item
        label={translate('Description')}
        name="description"
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Input.TextArea />
      </Form.Item>

      <Form.Item
        label={translate('enabled')}
        name="enabled"
        style={{
          display: 'inline-block',
          width: 'calc(50%)',
          paddingRight: '5px',
        }}
        valuePropName="checked"
        initialValue={true}
      >
        <Switch checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} />
      </Form.Item>
      <Form.Item
        label={translate('Default Mode')}
        name="isDefault"
        style={{
          display: 'inline-block',
          width: 'calc(50%)',
          paddingLeft: '5px',
        }}
        valuePropName="checked"
      >
        <Switch checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} />
      </Form.Item>

      <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
        <Space>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isUpdateForm ? 'Update Payment Mode' : 'Save Payment Mode'}
          </Button>
        </Space>
      </Form.Item>
    </>
  );
}
