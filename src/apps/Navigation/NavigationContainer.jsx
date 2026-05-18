// import { useState, useEffect } from 'react';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import { Layout, Menu } from 'antd';

// import { useAppContext } from '@/context/appContext';
// import useLanguage from '@/locale/useLanguage';
// import logoIcon from '@/style/images/logo-icon.svg';
// import useResponsive from '@/hooks/useResponsive';

// import {
//   SettingOutlined,
//   CustomerServiceOutlined,
//   ContainerOutlined,
//   FileSyncOutlined,
//   DashboardOutlined,
//   CreditCardOutlined,
//   ShopOutlined,
//   WalletOutlined,
//   ReconciliationOutlined,
//   TeamOutlined,
//   BarChartOutlined,
//   UserOutlined
// } from '@ant-design/icons';

// const { Sider } = Layout;

// export default function Navigation() {
//   const { isMobile } = useResponsive();
//   return <Sidebar collapsible={false} isMobile={isMobile} />;
// }

// function Sidebar({ collapsible, isMobile = false }) {
//   let location = useLocation();

//   const { state: stateApp, appContextAction } = useAppContext();
//   const { isNavMenuClose } = stateApp;
//   const { navMenu } = appContextAction;

//   const [showLogoApp, setLogoApp] = useState(isNavMenuClose);
//   const [currentPath, setCurrentPath] = useState(location.pathname.slice(1));

//   const { current: currentAdmin } = useSelector((state) => state.auth);

//   const isStaff = currentAdmin?.role === 'staff';
//   const isAdmin = currentAdmin?.role !== 'staff';

//   const translate = useLanguage();
//   const navigate = useNavigate();

//   let items = [

//     // DASHBOARD
//     ...(isAdmin
//       ? [
//           {
//             key: 'dashboard',
//             icon: <DashboardOutlined />,
//             label: <Link to={'/'}>{translate('dashboard')}</Link>,
//           },
//           {
//             key: 'reports',
//             icon: <ContainerOutlined />,
//             label: <Link to={'/reports'}>{translate('Reports')}</Link>,
//           },
//           {
//             key: 'performance',
//             icon: <TeamOutlined />,
//             label: <Link to={'/performance'}>{translate('Performance')}</Link>,
//           }
//         ]
//       : [
//           {
//             key: 'staff-dashboard',
//             icon: <DashboardOutlined />,
//             label: <Link to={'/staff-dashboard'}>{translate('dashboard')}</Link>,
//           },
//           {
//             key: 'performance-summary',
//             icon: <BarChartOutlined />,
//             label: <Link to={'/performance-summary'}>{translate('My Performance')}</Link>,
//           }
//         ]),

//     {
//       key: 'repayment',
//       icon: <ReconciliationOutlined />,
//       label: <Link to={'/repayment'}>{translate('repayment')}</Link>,
//     },

//     {
//       key: 'customer',
//       icon: <UserOutlined />,
//       label: <Link to={'/customer'}>{translate('Customer')}</Link>,
//     },

//     ...(isAdmin
//       ? [
//           // {
//           //   key: 'invoice',
//           //   icon: <ContainerOutlined />,
//           //   label: <Link to={'/invoice'}>{translate('invoices')}</Link>,
//           // },
//           // {
//           //   key: 'quote',
//           //   icon: <FileSyncOutlined />,
//           //   label: <Link to={'/quote'}>{translate('quote')}</Link>,
//           // },
//           {
//             key: 'payment',
//             icon: <CreditCardOutlined />,
//             label: <Link to={'/payment'}>{translate('payments')}</Link>,
//           },
//           {
//             key: 'paymentMode',
//             label: <Link to={'/payment/mode'}>{translate('payments_mode')}</Link>,
//             icon: <WalletOutlined />,
//           },
//           // {
//           //   key: 'taxes',
//           //   label: <Link to={'/taxes'}>{translate('taxes')}</Link>,
//           //   icon: <ShopOutlined />,
//           // },
//           {
//             key: 'staff',
//             icon: <TeamOutlined />,
//             label: <Link to={'/staff'}>{translate('staff')}</Link>,
//           },
//           {
//             key: 'generalSettings',
//             label: <Link to={'/settings'}>{translate('settings')}</Link>,
//             icon: <SettingOutlined />,
//           },
//         ]
//       : []),

//     {
//       key: 'about',
//       label: <Link to={'/about'}>{translate('about')}</Link>,
//       icon: <ReconciliationOutlined />,
//     },
//   ];

//   useEffect(() => {
//     if (location)
//       if (currentPath !== location.pathname) {
//         if (location.pathname === '/') {
//           setCurrentPath('dashboard');
//         } else {
//           setCurrentPath(location.pathname.slice(1));
//         }
//       }
//   }, [location, currentPath]);

//   useEffect(() => {
//     if (isNavMenuClose) {
//       setLogoApp(isNavMenuClose);
//     }

//     const timer = setTimeout(() => {
//       if (!isNavMenuClose) {
//         setLogoApp(isNavMenuClose);
//       }
//     }, 200);

//     return () => clearTimeout(timer);
//   }, [isNavMenuClose]);

//   const onCollapse = () => {
//     navMenu.collapse();
//   };

//   // Mobile: collapsedWidth=0 hides completely when collapsed
//   // Desktop: normal behavior
//   const siderWidth = 250;
//   const collapsedWidth = isMobile ? 0 : undefined;

//   const sidebarOpen = isMobile && !isNavMenuClose;

//   return (
//     <>
//       {/* Backdrop overlay - only shows on mobile when sidebar is open */}
//       {sidebarOpen && (
//         <div
//           className="sidebar-overlay"
//           onClick={() => navMenu.collapse()}
//           style={{
//             position: 'fixed',
//             top: 0,
//             left: 0,
//             width: '100%',
//             height: '100%',
//             background: 'rgba(0,0,0,0.3)',
//             zIndex: 999,
//           }}
//         />
//       )}
      
//       <Sider
//         collapsible={collapsible}
//         collapsed={isNavMenuClose}
//         onCollapse={onCollapse}
//         className="navigation"
//         width={siderWidth}
//         collapsedWidth={collapsedWidth}
//         breakpoint="md"
//         trigger={null}
//         style={{
//           overflow: 'auto',
//           height: '100vh',
//           position: isMobile ? 'fixed' : 'relative',
//           top: isMobile ? 0 : undefined,
//           bottom: isMobile ? undefined : '20px',
//           left: isMobile ? 0 : '20px',
//           zIndex: isMobile ? 1000 : 100,
//         }}
//         theme={'light'}
//       >
//         <div
//           className="logo"
//           onClick={() => {
//             // Navigate based on role - staff goes to /staff-dashboard, others go to /
//             if (currentAdmin?.role === 'staff') {
//               navigate('/staff-dashboard');
//             } else {
//               navigate('/');
//             }
//             // Close mobile sidebar when clicking logo
//             if (isMobile && !isNavMenuClose) {
//               navMenu.collapse();
//             }
//           }}
//           style={{
//             cursor: 'pointer',
//             display: 'flex',
//             alignItems: 'center',
//           }}
//         >
//           <img
//             src={logoIcon}
//             alt="Logo"
//             style={{ marginLeft: '0px', height: '40px', width: '40px' }}
//           />

//           {!showLogoApp && (
//             <div
//               style={{
//                 marginTop: '0',
//                 marginLeft: '8px',
//                 fontSize: '13px',
//                 fontWeight: 700,
//                 lineHeight: 1.15,
//                 color: '#0f2d52',
//                 letterSpacing: '0.2px',
//                 maxWidth: '180px',
//                 whiteSpace: 'nowrap',
//               }}
//             >
//               Webaac Solutions
//               <br />
//               Finance Management
//             </div>
//           )}
//         </div>

//         <Menu
//           items={items}
//           mode="inline"
//           theme={'light'}
//           selectedKeys={[currentPath]}
//           style={{
//             width: siderWidth,
//           }}
//         />
//       </Sider>
//     </>
//   );
// }

import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Layout, Menu } from 'antd';

import { useAppContext } from '@/context/appContext';
import useLanguage from '@/locale/useLanguage';
import logoIcon from '@/style/images/logo-icon.svg';
import useResponsive from '@/hooks/useResponsive';
import { selectCompanySettings } from '@/redux/settings/selectors';
import { FILE_BASE_URL } from '@/config/serverApiConfig';

import {
  SettingOutlined,
  ContainerOutlined,
  DashboardOutlined,
  CreditCardOutlined,
  WalletOutlined,
  ReconciliationOutlined,
  TeamOutlined,
  BarChartOutlined,
  UserOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

export default function Navigation() {
  const { isMobile } = useResponsive();
  return <Sidebar collapsible={false} isMobile={isMobile} />;
}

function Sidebar({ collapsible, isMobile = false }) {
  let location = useLocation();

  const { state: stateApp, appContextAction } = useAppContext();
  const { isNavMenuClose } = stateApp;
  const { navMenu } = appContextAction;

  const [showLogoApp, setLogoApp] = useState(isNavMenuClose);
  const [currentPath, setCurrentPath] = useState(location.pathname.slice(1));

  const { current: currentAdmin } = useSelector((state) => state.auth);
  const companySettings = useSelector(selectCompanySettings);

  // Dynamic company name — falls back to default if not set yet
  const companyName = companySettings?.company_name || 'Webaac Solutions Finance Management';

  // Split into two lines: first word(s) as line 1, rest as line 2
  const nameParts  = companyName.split(' ');
  const midpoint   = Math.ceil(nameParts.length / 2);
  const nameLine1  = nameParts.slice(0, midpoint).join(' ');
  const nameLine2  = nameParts.slice(midpoint).join(' ');

  // Dynamic logo — falls back to local SVG if not set
  const companyLogo = companySettings?.company_logo
    ? FILE_BASE_URL + companySettings.company_logo
    : logoIcon;

  const isStaff = currentAdmin?.role === 'staff';
  const isAdmin = currentAdmin?.role !== 'staff';

  const translate = useLanguage();
  const navigate  = useNavigate();

  let items = [
    ...(isAdmin
      ? [
          {
            key:   'dashboard',
            icon:  <DashboardOutlined />,
            label: <Link to={'/dashboard'}>{translate('dashboard')}</Link>,
          },
          {
            key:   'reports',
            icon:  <ContainerOutlined />,
            label: <Link to={'/reports'}>{translate('Reports')}</Link>,
          },
          {
            key:   'performance',
            icon:  <TeamOutlined />,
            label: <Link to={'/performance'}>{translate('Performance')}</Link>,
          },
        ]
      : [
          {
            key:   'staff-dashboard',
            icon:  <DashboardOutlined />,
            label: <Link to={'/staff-dashboard'}>{translate('dashboard')}</Link>,
          },
          {
            key:   'performance-summary',
            icon:  <BarChartOutlined />,
            label: <Link to={'/performance-summary'}>{translate('My Performance')}</Link>,
          },
        ]),

    {
      key:   'repayment',
      icon:  <ReconciliationOutlined />,
      label: <Link to={'/repayment'}>{translate('repayment')}</Link>,
    },
    {
      key:   'customer',
      icon:  <UserOutlined />,
      label: <Link to={'/customer'}>{translate('Customer')}</Link>,
    },

    ...(isAdmin
      ? [
          {
            key:   'payment',
            icon:  <CreditCardOutlined />,
            label: <Link to={'/payment'}>{translate('payments')}</Link>,
          },
          {
            key:   'paymentMode',
            icon:  <WalletOutlined />,
            label: <Link to={'/payment/mode'}>{translate('payments_mode')}</Link>,
          },
          {
            key:   'staff',
            icon:  <TeamOutlined />,
            label: <Link to={'/staff'}>{translate('staff')}</Link>,
          },
          {
            key:   'generalSettings',
            icon:  <SettingOutlined />,
            label: <Link to={'/settings'}>{translate('settings')}</Link>,
          },
        ]
      : []),

    {
      key:   'about',
      icon:  <ReconciliationOutlined />,
      label: <Link to={'/about'}>{translate('about')}</Link>,
    },
  ];

  useEffect(() => {
    if (location)
      if (currentPath !== location.pathname) {
        if (location.pathname === '/') {
          setCurrentPath('dashboard');
        } else {
          setCurrentPath(location.pathname.slice(1));
        }
      }
  }, [location, currentPath]);

  useEffect(() => {
    if (isNavMenuClose) {
      setLogoApp(isNavMenuClose);
    }
    const timer = setTimeout(() => {
      if (!isNavMenuClose) setLogoApp(isNavMenuClose);
    }, 200);
    return () => clearTimeout(timer);
  }, [isNavMenuClose]);

  const onCollapse = () => navMenu.collapse();

  const siderWidth    = 250;
  const collapsedWidth = isMobile ? 0 : undefined;
  const sidebarOpen   = isMobile && !isNavMenuClose;

  return (
    <>
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => navMenu.collapse()}
          style={{
            position: 'fixed', top: 0, left: 0,
            width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.3)', zIndex: 999,
          }}
        />
      )}

      <Sider
        collapsible={collapsible}
        collapsed={isNavMenuClose}
        onCollapse={onCollapse}
        className="navigation"
        width={siderWidth}
        collapsedWidth={collapsedWidth}
        breakpoint="md"
        trigger={null}
        style={{
          overflow:  'auto',
          height:    '100vh',
          position:  isMobile ? 'fixed' : 'relative',
          top:       isMobile ? 0 : undefined,
          left:      isMobile ? 0 : '20px',
          bottom:    isMobile ? undefined : '20px',
          zIndex:    isMobile ? 1000 : 100,
        }}
        theme="light"
      >
        <div
          className="logo"
          onClick={() => {
            navigate(currentAdmin?.role === 'staff' ? '/staff-dashboard' : '/');
            if (isMobile && !isNavMenuClose) navMenu.collapse();
          }}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <img
            src={companyLogo}
            alt="Logo"
            style={{ marginLeft: '0px', height: '40px', width: '40px', objectFit: 'contain' }}
          />

          {!showLogoApp && (
            <div
              style={{
                marginTop:    '0',
                marginLeft:   '8px',
                fontSize:     '13px',
                fontWeight:   700,
                lineHeight:   1.15,
                color:        '#0f2d52',
                letterSpacing:'0.2px',
                maxWidth:     '180px',
                whiteSpace:   'nowrap',
                overflow:     'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {nameLine2 ? (
                <>
                  {nameLine1}
                  <br />
                  {nameLine2}
                </>
              ) : (
                nameLine1
              )}
            </div>
          )}
        </div>

        <Menu
          items={items}
          mode="inline"
          theme="light"
          selectedKeys={[currentPath]}
          style={{ width: siderWidth }}
        />
      </Sider>
    </>
  );
}
