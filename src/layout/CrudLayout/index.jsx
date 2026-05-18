import { useEffect, useState } from 'react';
import DefaultLayout from '../DefaultLayout';
import SidePanel from '@/components/SidePanel';
import { Layout, Grid } from 'antd';
import { useCrudContext } from '@/context/crud';

const { Content } = Layout;
const { useBreakpoint } = Grid;

const ContentBox = ({ children }) => {
  const screens = useBreakpoint();
  const { state: stateCrud } = useCrudContext();
  const { isPanelClose }     = stateCrud;
  const [isSidePanelClose, setSidePanel] = useState(isPanelClose);

  useEffect(() => {
    let timer;
    if (isPanelClose) {
      timer = setTimeout(() => setSidePanel(isPanelClose), 200);
    } else {
      setSidePanel(isPanelClose);
    }
    return () => clearTimeout(timer);
  }, [isPanelClose]);

  return (
    <Content
      className="whiteBox shadow layoutPadding"
      style={{ margin: screens.md ? '30px auto' : '10px', width: '100%', maxWidth: '100%', flex: 'none' }}
    >
      {children}
    </Content>
  );
};

export default function CrudLayout({
  children,
  config,
  sidePanelTopContent,
  sidePanelBottomContent,
  fixHeaderPanel,
}) {
  return (
    <>
      <DefaultLayout>
        <SidePanel
          config={config}
          topContent={sidePanelTopContent}
          bottomContent={sidePanelBottomContent}
          fixHeaderPanel={fixHeaderPanel}
        />
        <ContentBox>{children}</ContentBox>
      </DefaultLayout>
    </>
  );
}
