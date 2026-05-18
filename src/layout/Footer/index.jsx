import React from 'react';
import { Layout, Typography, Grid } from 'antd';

const { Footer } = Layout;
const { useBreakpoint } = Grid;

const BRAND = '#28a7ab';
const year  = new Date().getFullYear();

const FooterContent = () => {
  const screens  = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <Footer
      style={{
        textAlign:   'center',
        background:  'transparent',
        padding:     isMobile ? '14px 16px' : '16px 24px',
        borderTop:   '1px solid #f0f0f0',
        marginTop:   'auto',
      }}
    >
      <Typography.Text
        style={{
          fontSize:   isMobile ? 11 : 12,
          color:      '#8c8c8c',
          display:    'block',
          lineHeight: 1.8,
        }}
      >
        Designed and Developed by{' '}
        <a
          href="https://webaac.in/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: BRAND, fontWeight: 600 }}
        >
          Webaac Solutions
        </a>
      </Typography.Text>
      <Typography.Text
        style={{
          fontSize: isMobile ? 10 : 11,
          color:    '#bfbfbf',
          display:  'block',
        }}
      >
        © {year} Webaac Solutions. All rights reserved.
      </Typography.Text>
    </Footer>
  );
};

export default FooterContent;
