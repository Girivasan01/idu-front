/**
 * pages/about/About.jsx — Webaac Solutions Finance Management
 *
 * Changes:
 *  - Mobile responsive layout
 *  - Proper Webaac branding
 *  - Clean card layout instead of raw Result component
 *  - Links open in new tab safely (rel="noopener noreferrer")
 */
import { Button, Card, Grid, Space, Typography, Divider, Tag } from 'antd';
import {
  GlobalOutlined,
  GithubOutlined,
  MailOutlined,
  PhoneOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';
import { ErpLayout } from '@/layout';

const { useBreakpoint } = Grid;

const BRAND_COLOR = '#28a7ab';

export default function About() {
  const translate = useLanguage();
  const screens   = useBreakpoint();
  const isMobile  = !screens.md;

  const openUrl = (url) => window.open(url, '_blank', 'noopener,noreferrer');

  return (
    <ErpLayout>
      <div
        style={{
          padding:        isMobile ? '16px 10px' : '40px 60px',
          display:        'flex',
          justifyContent: 'center',
          alignItems:     'flex-start',
          minHeight:      '100%',
        }}
      >
        <Card
          style={{
            width:        '100%',
            maxWidth:     560,
            borderRadius: 14,
            boxShadow:    '0 4px 24px rgba(40,167,171,0.10)',
            border:       `1px solid ${BRAND_COLOR}22`,
          }}
          styles={{ body: { padding: isMobile ? '20px 16px' : '36px 32px' } }}
        >
          {/* ── Logo / Brand ── */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div
              style={{
                width:        60,
                height:       60,
                borderRadius: '50%',
                background:   `linear-gradient(135deg, ${BRAND_COLOR}, #1890ff)`,
                display:      'flex',
                alignItems:   'center',
                justifyContent: 'center',
                margin:       '0 auto 14px',
                fontSize:     26,
                color:        '#fff',
                fontWeight:   700,
                letterSpacing: -1,
              }}
            >
              W
            </div>

            <Typography.Title level={isMobile ? 4 : 3} style={{ margin: 0, color: BRAND_COLOR }}>
              Webaac Solutions
            </Typography.Title>
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              Finance Management System
            </Typography.Text>

            <div style={{ marginTop: 10 }}>
              <Tag color="cyan" style={{ borderRadius: 20 }}>v1.0</Tag>
            </div>
          </div>

          <Divider style={{ margin: '16px 0' }} />

          {/* ── Info ── */}
          <Space direction="vertical" size={14} style={{ width: '100%' }}>
            <Typography.Paragraph
              style={{ color: '#595959', fontSize: 14, margin: 0, textAlign: 'center' }}
            >
              {translate('Do you need help on customize of this app')}?
              {' '}Reach out to us — we're happy to help.
            </Typography.Paragraph>

            {/* Links */}
            <Card
              size="small"
              bordered={false}
              style={{ background: '#f4fbfc', borderRadius: 8 }}
              styles={{ body: { padding: '12px 16px' } }}
            >
              <Space direction="vertical" size={10} style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <GlobalOutlined style={{ color: BRAND_COLOR, fontSize: 16 }} />
                  <a
                    href="https://webaac.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: BRAND_COLOR, fontWeight: 500 }}
                  >
                    webaac.in
                  </a>
                </div>

                {/* <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <GithubOutlined style={{ color: '#333', fontSize: 16 }} />
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#333' }}
                  >
                    github.com/webaac
                  </a>
                </div> */}

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <MailOutlined style={{ color: '#1890ff', fontSize: 16 }} />
                  <a href="mailto:hello@webaac.in" style={{ color: '#1890ff' }}>
                    hello@webaac.in
                  </a>
                </div>
              </Space>
            </Card>

            {/* CTA */}
            <Button
              type="primary"
              size={isMobile ? 'middle' : 'large'}
              block
              icon={<GlobalOutlined />}
              onClick={() => openUrl('https://webaac.in/')}
              style={{
                background:   BRAND_COLOR,
                borderColor:  BRAND_COLOR,
                borderRadius: 8,
                marginTop:    4,
              }}
            >
              {translate('Contact us')}
            </Button>

            <Typography.Text
              type="secondary"
              style={{ display: 'block', textAlign: 'center', fontSize: 12 }}
            >
              <InfoCircleOutlined style={{ marginRight: 4 }} />
              © {new Date().getFullYear()} Webaac Solutions. All rights reserved.
            </Typography.Text>
          </Space>
        </Card>
      </div>
    </ErpLayout>
  );
}
