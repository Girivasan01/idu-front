import React from 'react';
import { Spin } from 'antd';

import { LoadingOutlined } from '@ant-design/icons';

const PageLoader = () => {
  const antIcon = <LoadingOutlined style={{ fontSize: 64 }} spin />;
  return (
    <div
      className="centerAbsolute"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255, 255, 255, 0.9)',
        zIndex: 9999,
      }}
    >
      <Spin indicator={antIcon}></Spin>
    </div>
  );
};
export default PageLoader;
