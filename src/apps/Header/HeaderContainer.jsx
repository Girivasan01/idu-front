// import { useSelector } from 'react-redux';
// import { Link, useNavigate } from 'react-router-dom';
// import { Avatar, Dropdown, Layout, Button } from 'antd';

// // import Notifications from '@/components/Notification';

// import { LogoutOutlined, ToolOutlined, UserOutlined, MenuOutlined } from '@ant-design/icons';

// import { selectCurrentAdmin } from '@/redux/auth/selectors';

// import { FILE_BASE_URL } from '@/config/serverApiConfig';

// import useLanguage from '@/locale/useLanguage';
// import useResponsive from '@/hooks/useResponsive';

// import { useAppContext } from '@/context/appContext';

// import logoIcon from '@/style/images/logo-icon.svg';

// export default function HeaderContent() {
//   const currentAdmin = useSelector(selectCurrentAdmin);
//   const { Header } = Layout;
//   const { isMobile } = useResponsive();

//   const { state: stateApp, appContextAction } = useAppContext();
//   const { navMenu } = appContextAction;

//   const translate = useLanguage();

//   const handleMenuToggle = () => {
//     navMenu.toggle();
//   };

//   const ProfileDropdown = () => {
//     const navigate = useNavigate();
//     return (
//       <div className="profileDropdown" onClick={() => navigate('/profile')}>
//         <Avatar
//           size="large"
//           className="last"
//           src={currentAdmin?.photo ? FILE_BASE_URL + currentAdmin?.photo : undefined}
//           style={{
//             color: '#f56a00',
//             backgroundColor: currentAdmin?.photo ? 'none' : '#fde3cf',
//             boxShadow: 'rgba(150, 190, 238, 0.35) 0px 0px 6px 1px',
//           }}
//         >
//           {currentAdmin?.name?.charAt(0)?.toUpperCase()}
//         </Avatar>
//         <div className="profileDropdownInfo">
//           <p>
//             {currentAdmin?.name} {currentAdmin?.surname}
//           </p>
//           <p>{currentAdmin?.email}</p>
//         </div>
//       </div>
//     );
//   };

//   const DropdownMenu = ({ text }) => {
//     return <span style={{}}>{text}</span>;
//   };

//   const items = [
//     {
//       label: <ProfileDropdown className="headerDropDownMenu" />,
//       key: 'ProfileDropdown',
//     },
//     {
//       type: 'divider',
//     },
//     {
//       icon: <UserOutlined />,
//       key: 'settingProfile',
//       label: (
//         <Link to={'/profile'}>
//           <DropdownMenu text={translate('profile_settings')} />
//         </Link>
//       ),
//     },
//     {
//       icon: <ToolOutlined />,
//       key: 'settingApp',
//       label: <Link to={'/settings'}>{translate('app_settings')}</Link>,
//     },

//     {
//       type: 'divider',
//     },

//     {
//       icon: <LogoutOutlined />,
//       key: 'logout',
//       label: <Link to={'/logout'}>{translate('logout')}</Link>,
//     },
//   ];

//   // Mobile header with hamburger, center logo/title, and avatar
//   if (isMobile) {
//     return (
//       <Header
//         className="mobile-header app-header"
//         style={{
//           padding: '12px 16px',
//           background: '#ffffff',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'space-between',
//           width: '100%',
//         }}
//       >
//         {/* Left: Hamburger Button */}
//         <div className="header-left">
//           <Button
//             type="text"
//             size="large"
//             onClick={handleMenuToggle}
//             style={{
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'flex-start',
//               padding: '4px 8px',
//               margin: 0,
//             }}
//           >
//             <MenuOutlined style={{ fontSize: 22 }} />
//           </Button>
//         </div>

//         {/* Center: Logo + Website Name */}
//         <div className="header-center">
//           <img src={logoIcon} alt="Logo" className="app-logo" />
//           <span className="app-title">Webaac Solutions Finance Management</span>
//         </div>

//         {/* Right: User Avatar */}
//         <div className="header-right">
//           <Dropdown
//             menu={{
//               items,
//             }}
//             trigger={['click']}
//             placement="bottomRight"
//           >
//             <Avatar
//               className="last user-profile-avatar"
//               src={currentAdmin?.photo ? FILE_BASE_URL + currentAdmin?.photo : undefined}
//               style={{
//                 color: '#f56a00',
//                 backgroundColor: currentAdmin?.photo ? 'none' : '#fde3cf',
//                 boxShadow: 'rgba(150, 190, 238, 0.35) 0px 0px 10px 2px',
//                 cursor: 'pointer',
//               }}
//               size={36}
//             >
//               {currentAdmin?.name?.charAt(0)?.toUpperCase()}
//             </Avatar>
//           </Dropdown>
//         </div>
//       </Header>
//     );
//   }

//   // Desktop header (unchanged - avatar on right)
//   return (
//     <Header
//       style={{
//         padding: '20px',
//         background: '#ffffff',
//         display: 'flex',
//         flexDirection: 'row-reverse',
//         justifyContent: 'flex-start',
//         gap: '15px',
//         alignItems: 'center',
//       }}
//     >
//       <Dropdown
//         menu={{
//           items,
//         }}
//         trigger={['click']}
//         placement="bottomRight"
//         stye={{ width: '280px', float: 'right' }}
//       >
//         <Avatar
//           className="last"
//           src={currentAdmin?.photo ? FILE_BASE_URL + currentAdmin?.photo : undefined}
//           style={{
//             color: '#f56a00',
//             backgroundColor: currentAdmin?.photo ? 'none' : '#fde3cf',
//             boxShadow: 'rgba(150, 190, 238, 0.35) 0px 0px 10px 2px',
//             float: 'right',
//             cursor: 'pointer',
//           }}
//           size="large"
//         >
//           {currentAdmin?.name?.charAt(0)?.toUpperCase()}
//         </Avatar>
//       </Dropdown>
//     </Header>
//   );
// }

// //  console.log(
// //    '🚀 Welcome to IDURAR ERP CRM! Did you know that we also offer commercial customization services? Contact us at hello@idurarapp.com for more information.'
// //  );


import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, Dropdown, Layout, Button } from 'antd';

import { LogoutOutlined, ToolOutlined, UserOutlined, MenuOutlined } from '@ant-design/icons';

import { selectCurrentAdmin } from '@/redux/auth/selectors';
import { selectCompanySettings } from '@/redux/settings/selectors';
import { FILE_BASE_URL } from '@/config/serverApiConfig';

import useLanguage from '@/locale/useLanguage';
import useResponsive from '@/hooks/useResponsive';
import { useAppContext } from '@/context/appContext';

import logoIcon from '@/style/images/logo-icon.svg';

export default function HeaderContent() {
  const currentAdmin    = useSelector(selectCurrentAdmin);
  const companySettings = useSelector(selectCompanySettings);
  const { Header }      = Layout;
  const { isMobile }    = useResponsive();

  const { appContextAction } = useAppContext();
  const { navMenu }          = appContextAction;

  const translate = useLanguage();

  // Dynamic company name + logo — fall back to defaults if not saved yet
  const companyName = companySettings?.company_name || 'Webaac Solutions Finance Management';
  const companyLogo = companySettings?.company_logo
    ? FILE_BASE_URL + companySettings.company_logo
    : logoIcon;

  const handleMenuToggle = () => navMenu.toggle();

  const ProfileDropdown = () => {
    const navigate = useNavigate();
    return (
      <div className="profileDropdown" onClick={() => navigate('/profile')}>
        <Avatar
          size="large"
          className="last"
          src={currentAdmin?.photo ? FILE_BASE_URL + currentAdmin?.photo : undefined}
          style={{
            color:           '#f56a00',
            backgroundColor: currentAdmin?.photo ? 'none' : '#fde3cf',
            boxShadow:       'rgba(150, 190, 238, 0.35) 0px 0px 6px 1px',
          }}
        >
          {currentAdmin?.name?.charAt(0)?.toUpperCase()}
        </Avatar>
        <div className="profileDropdownInfo">
          <p>{currentAdmin?.name} {currentAdmin?.surname}</p>
          <p>{currentAdmin?.email}</p>
        </div>
      </div>
    );
  };

  const DropdownMenu = ({ text }) => <span>{text}</span>;

  const items = [
    {
      label: <ProfileDropdown className="headerDropDownMenu" />,
      key:   'ProfileDropdown',
    },
    { type: 'divider' },
    {
      icon:  <UserOutlined />,
      key:   'settingProfile',
      label: <Link to="/profile"><DropdownMenu text={translate('profile_settings')} /></Link>,
    },
    {
      icon:  <ToolOutlined />,
      key:   'settingApp',
      label: <Link to="/settings">{translate('app_settings')}</Link>,
    },
    { type: 'divider' },
    {
      icon:  <LogoutOutlined />,
      key:   'logout',
      label: <Link to="/logout">{translate('logout')}</Link>,
    },
  ];

  // ── Mobile header ──────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <Header
        className="mobile-header app-header"
        style={{
          padding:        '12px 16px',
          background:     '#ffffff',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          width:          '100%',
        }}
      >
        {/* Left: Hamburger */}
        <div className="header-left">
          <Button
            type="text"
            size="large"
            onClick={handleMenuToggle}
            style={{ display: 'flex', alignItems: 'center', padding: '4px 8px', margin: 0 }}
          >
            <MenuOutlined style={{ fontSize: 22 }} />
          </Button>
        </div>

        {/* Center: Dynamic logo + company name */}
        <div className="header-center" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img
            src={companyLogo}
            alt="Logo"
            className="app-logo"
            style={{ height: 28, width: 28, objectFit: 'contain' }}
          />
          <span
            className="app-title"
            style={{
              fontSize:     13,
              fontWeight:   700,
              color:        '#0f2d52',
              whiteSpace:   'nowrap',
              overflow:     'hidden',
              textOverflow: 'ellipsis',
              maxWidth:     180,
            }}
          >
            {companyName}
          </span>
        </div>

        {/* Right: Avatar */}
        <div className="header-right">
          <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
            <Avatar
              className="last user-profile-avatar"
              src={currentAdmin?.photo ? FILE_BASE_URL + currentAdmin?.photo : undefined}
              style={{
                color:           '#f56a00',
                backgroundColor: currentAdmin?.photo ? 'none' : '#fde3cf',
                boxShadow:       'rgba(150, 190, 238, 0.35) 0px 0px 10px 2px',
                cursor:          'pointer',
              }}
              size={36}
            >
              {currentAdmin?.name?.charAt(0)?.toUpperCase()}
            </Avatar>
          </Dropdown>
        </div>
      </Header>
    );
  }

  // ── Desktop header ─────────────────────────────────────────────────────────
  return (
    <Header
      style={{
        padding:        '20px',
        background:     '#ffffff',
        display:        'flex',
        flexDirection:  'row-reverse',
        justifyContent: 'flex-start',
        gap:            '15px',
        alignItems:     'center',
      }}
    >
      <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
        <Avatar
          className="last"
          src={currentAdmin?.photo ? FILE_BASE_URL + currentAdmin?.photo : undefined}
          style={{
            color:           '#f56a00',
            backgroundColor: currentAdmin?.photo ? 'none' : '#fde3cf',
            boxShadow:       'rgba(150, 190, 238, 0.35) 0px 0px 10px 2px',
            float:           'right',
            cursor:          'pointer',
          }}
          size="large"
        >
          {currentAdmin?.name?.charAt(0)?.toUpperCase()}
        </Avatar>
      </Dropdown>
    </Header>
  );
}
