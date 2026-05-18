import { useState } from 'react';
import { Alert, Button, Card, Form, Input, Space, Typography } from 'antd';
import { LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { DASHBOARD_PIN_KEY, DEFAULT_DASHBOARD_PIN } from '@/utils/dashboardPin';

const { Paragraph, Text, Title } = Typography;

export default function PinLock({
  onSuccess,
  pin = DEFAULT_DASHBOARD_PIN,
  sessionKey = DASHBOARD_PIN_KEY,
}) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!/^\d{4}$/.test(value)) {
      setError('Please enter a valid 4-digit PIN.');
      return;
    }

    if (value !== pin) {
      setError('Incorrect PIN. Please try again.');
      return;
    }

    window.sessionStorage.setItem(sessionKey, 'true');
    setError('');
    onSuccess?.();
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: '#ffffff',
      }}
    >
      <Card
        bordered
        style={{
          width: '100%',
          maxWidth: 420,
          borderColor: '#e0e0e0',
          borderRadius: 16,
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
        }}
        bodyStyle={{ padding: 32 }}
      >
        <Space direction="vertical" size={20} style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 64,
                height: 64,
                margin: '0 auto 16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(24, 144, 255, 0.08)',
                color: '#1890ff',
                fontSize: 28,
              }}
            >
              <SafetyCertificateOutlined />
            </div>

            <Title level={3} style={{ marginBottom: 8, color: '#1f1f1f' }}>
              Dashboard PIN Required
            </Title>
            <Paragraph style={{ marginBottom: 0, color: '#595959' }}>
              Enter your 4-digit PIN to unlock the dashboard for this session.
            </Paragraph>
          </div>

          {error ? <Alert type="error" showIcon message={error} /> : null}

          <Form layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label={<Text strong style={{ color: '#262626' }}>PIN</Text>}
              style={{ marginBottom: 16 }}
            >
              <Input.Password
                value={value}
                onChange={(event) => {
                  const nextValue = event.target.value.replace(/\D/g, '').slice(0, 4);
                  setValue(nextValue);
                  if (error) {
                    setError('');
                  }
                }}
                onPressEnter={handleSubmit}
                maxLength={4}
                size="large"
                prefix={<LockOutlined style={{ color: '#1890ff' }} />}
                placeholder="Enter 4-digit PIN"
                inputMode="numeric"
                autoComplete="one-time-code"
                style={{
                  borderColor: '#e0e0e0',
                  borderRadius: 10,
                }}
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              style={{
                height: 44,
                borderRadius: 10,
                background: '#1890ff',
              }}
            >
              Unlock Dashboard
            </Button>
          </Form>
        </Space>
      </Card>
    </div>
  );
}
