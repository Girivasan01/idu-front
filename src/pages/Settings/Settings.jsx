/**
 * pages/settings/Settings.jsx — Webaac Solutions Finance Management
 *
 * Mobile fixes:
 *  - tabPosition: top (not left) on mobile — left tabs break on small screens
 *  - Each settings card is full-width on mobile
 *  - Padding adjusted
 *
 * NOTE: Imports your existing sub-components from the Settings folder.
 * Adjust the import paths if your folder structure differs.
 */
import { Grid, Tabs, Typography } from 'antd';
import {
  BankOutlined,
  SettingOutlined,
  DollarOutlined,
  GlobalOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import { ErpLayout } from '@/layout';
import CompanySettings    from './CompanySettings';
import CompanyLogoSettings from './CompanyLogoSettings';
import FinanceSettings    from './FinanceSettings';
import GeneralSettings    from './GeneralSettings';
import MoneyFormatSettings from './MoneyFormatSettings';

const { useBreakpoint } = Grid;

const TAB_ITEMS = [
  {
    key:      'company',
    label:    <span><BankOutlined /> Company</span>,
    children: <CompanySettings />,
  },
  {
    key:      'logo',
    label:    <span><PictureOutlined /> Logo</span>,
    children: <CompanyLogoSettings />,
  },
  // {
  //   key:      'finance',
  //   label:    <span><DollarOutlined /> Finance</span>,
  //   children: <FinanceSettings />,
  // },
  // {
  //   key:      'general',
  //   label:    <span><SettingOutlined /> General</span>,
  //   children: <GeneralSettings />,
  // },
  // {
  //   key:      'money',
  //   label:    <span><GlobalOutlined /> Money Format</span>,
  //   children: <MoneyFormatSettings />,
  // },
];

export default function Settings() {
  const screens  = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <ErpLayout>
      <div
        style={{
          padding:    isMobile ? '12px 8px' : '24px',
          background: '#fff',
          minHeight:  '100%',
        }}
      >
        <Typography.Title
          level={isMobile ? 4 : 3}
          style={{ marginBottom: isMobile ? 12 : 20, marginTop: 0 }}
        >
          <SettingOutlined style={{ marginRight: 8, color: '#28a7ab' }} />
          Settings
        </Typography.Title>

        <Tabs
          defaultActiveKey="company"
          tabPosition={isMobile ? 'top' : 'left'}
          size={isMobile ? 'small' : 'middle'}
          items={TAB_ITEMS}
          style={{
            background: '#fff',
          }}
          tabBarStyle={
            isMobile
              ? { marginBottom: 16, overflowX: 'auto' }
              : { minWidth: 160 }
          }
        />
      </div>
    </ErpLayout>
  );
}
