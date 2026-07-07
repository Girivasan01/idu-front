import { ErpContextProvider } from '@/context/erp';
import { Layout } from 'antd';
import useResponsive from '@/hooks/useResponsive';

const { Content } = Layout;

export default function ErpLayout({ children }) {
  const { isMobile } = useResponsive();

  return (
    <ErpContextProvider>
      <Content
        className="whiteBox shadow layoutPadding"
        style={{
          margin:    isMobile ? '8px auto 12px' : '12px auto 16px',
          width:     '100%',
          maxWidth:  isMobile ? '100%' : '1100px',
          minHeight: isMobile ? 'auto' : '600px',
          padding:   isMobile ? '0 12px' : '0',
        }}
      >
        {children}
      </Content>
    </ErpContextProvider>
  );
}
