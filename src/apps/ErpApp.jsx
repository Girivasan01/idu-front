import { useLayoutEffect } from 'react';
import { useEffect } from 'react';
import { selectAppSettings } from '@/redux/settings/selectors';
import { useDispatch, useSelector } from 'react-redux';

import { Layout } from 'antd';

import { useAppContext } from '@/context/appContext';

import Navigation from '@/apps/Navigation/NavigationContainer';
import HeaderContent from '@/apps/Header/HeaderContainer';
import PageLoader from '@/components/PageLoader';

import { settingsAction } from '@/redux/settings/actions';
import { selectSettings } from '@/redux/settings/selectors';

import AppRouter from '@/router/AppRouter';
import useResponsive from '@/hooks/useResponsive';
import FooterContent from '@/layout/Footer';

export default function ErpCrmApp() {
  const { Content, Footer } = Layout;
  const { isMobile } = useResponsive();
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    dispatch(settingsAction.list({ entity: 'setting' }));
  }, []);

  const { isSuccess: settingIsloaded } = useSelector(selectSettings);
  const storedAuth = window.localStorage.getItem('auth');
  console.log('[erp-app] Settings bootstrap', { settingIsloaded, storedAuth });

  if (settingIsloaded)
    return (
      <Layout hasSider style={{ minHeight: '100vh' }}>
        <Navigation />

        {isMobile ? (
          <Layout style={{ marginLeft: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <HeaderContent />
            <Content
              style={{
                margin:   '60px auto 0',
                overflow: 'initial',
                width:    '100%',
                padding:  '0 12px',
                maxWidth: 'none',
                flex:     1,
              }}
            >
              <AppRouter />
            </Content>
            <FooterContent />
          </Layout>
        ) : (
          <Layout style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <HeaderContent />
            <Content
              style={{
                margin:   '40px auto 0',
                overflow: 'initial',
                width:    '100%',
                padding:  '0 50px',
                maxWidth: 1400,
                flex:     1,
              }}
            >
              <AppRouter />
            </Content>
            <FooterContent />
          </Layout>
        )}
      </Layout>
    );
  else return <PageLoader />;
}
