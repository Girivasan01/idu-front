import { Space, Layout, Divider, Typography } from 'antd';
import logo from '@/style/images/logo-icon.svg';
import useLanguage from '@/locale/useLanguage';
import { useSelector } from 'react-redux';

const { Content } = Layout;
const { Title, Text } = Typography;

export default function SideContent() {
  const translate = useLanguage();

  return (
    <Content
      style={{
        padding: '150px 30px 30px',
        width: '100%',
        maxWidth: '450px',
        margin: '0 auto',
      }}
      className="sideContent"
    >
      <div style={{ width: '100%' }}>
        <img
          src={logo}
          alt="Webaac Solutions Finance Management"
          style={{ margin: '0 0 18px', display: 'block' }}
          height={52}
          width={52}
        />
        <Title level={3} style={{ marginTop: 0, marginBottom: 20 }}>
          Webaac Solutions Finance Management
        </Title>

        <Title level={1} style={{ fontSize: 28 }}>
          Finance Management Platform
        </Title>
        <Text>
          Accounting / Invoicing / Repayment App built with Node.js, React.js and Ant Design
        </Text>

        <div className="space20"></div>
      </div>
    </Content>
  );
}
