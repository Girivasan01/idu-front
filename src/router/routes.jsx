import { lazy } from 'react';
import Staff from "@/pages/Staff";
import { Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

const Logout = lazy(() => import('@/pages/Logout.jsx'));
const NotFound = lazy(() => import('@/pages/NotFound.jsx'));

const DashboardProtected = lazy(() => import('@/components/DashboardProtected'));
const Customer = lazy(() => import('@/pages/Customer'));
const Invoice = lazy(() => import('@/pages/Invoice'));
const InvoiceCreate = lazy(() => import('@/pages/Invoice/InvoiceCreate'));

const InvoiceRead = lazy(() => import('@/pages/Invoice/InvoiceRead'));
const InvoiceUpdate = lazy(() => import('@/pages/Invoice/InvoiceUpdate'));
const InvoiceRecordPayment = lazy(() => import('@/pages/Invoice/InvoiceRecordPayment'));
const Quote = lazy(() => import('@/pages/Quote/index'));
const QuoteCreate = lazy(() => import('@/pages/Quote/QuoteCreate'));
const QuoteRead = lazy(() => import('@/pages/Quote/QuoteRead'));
const QuoteUpdate = lazy(() => import('@/pages/Quote/QuoteUpdate'));
const Payment = lazy(() => import('@/pages/Payment/index'));
const PaymentRead = lazy(() => import('@/pages/Payment/PaymentRead'));
const PaymentUpdate = lazy(() => import('@/pages/Payment/PaymentUpdate'));

const Settings = lazy(() => import('@/pages/Settings/Settings'));
const PaymentMode = lazy(() => import('@/pages/PaymentMode'));
const Taxes = lazy(() => import('@/pages/Taxes'));

const Profile = lazy(() => import('@/pages/Profile'));

const About = lazy(() => import('@/pages/About'));
const Repayment = lazy(() => import('@/pages/Repayment'));
const ClientRepayment = lazy(() => import('@/pages/Repayment/ClientRepayment'));
const CustomerCalendar = lazy(() => import('@/pages/Customer/CustomerCalendar'));
const StaffDashboard = lazy(() => import('@/pages/StaffDashboard'));
const Reports = lazy(() => import('@/pages/Reports'));
const Performance = lazy(() => import('@/pages/Performance'));
const PerformanceSummary = lazy(() => import('@/pages/PerformanceSummary'));



let routes = {
  expense: [],
  default: [
    {
      path: '/login',
      element: <Navigate to="/" />,
    },
    {
      path: '/logout',
      element: <Logout />,
    },
    {
      path: '/about',
      element: <About />,
    },
    // Dashboard - Admin only (owner, admin)
    {
      path: '/',
      element: (
        <ProtectedRoute allowedRoles={['owner', 'admin', 'staff']}>
          <Navigate to="/customer" />
        </ProtectedRoute>
      ),
    },
    {
      path: '/dashboard',
      element: (
        <ProtectedRoute allowedRoles={['owner', 'admin']}>
          <DashboardProtected />
        </ProtectedRoute>
      ),
    },
    {
      path: '/reports',
      element: (
        <ProtectedRoute allowedRoles={['owner', 'admin']}>
          <Reports />
        </ProtectedRoute>
      ),
    },
    {
      path: '/performance',
      element: (
        <ProtectedRoute allowedRoles={['owner', 'admin']}>
          <Performance />
        </ProtectedRoute>
      ),
    },


    {
      path: '/staff-dashboard',
      element: (
        <ProtectedRoute allowedRoles={['staff']}>
          <StaffDashboard />
        </ProtectedRoute>
      ),
    },

    {
      path: '/performance-summary',
      element: (
        <ProtectedRoute allowedRoles={['staff']}>
          <PerformanceSummary />
        </ProtectedRoute>
      ),
    },

    {
      path: '/customer',
      element: <Customer />,
    },
    // Staff Management - Admin only (owner, admin)
    {
      path: "/staff",
      element: (
        <ProtectedRoute allowedRoles={['owner', 'admin']}>
          <Staff />
        </ProtectedRoute>
      ),
    },

    {
      path: '/invoice',
      element: (
        <ProtectedRoute allowedRoles={['owner', 'admin']}>
          <Invoice />
        </ProtectedRoute>
      ),
    },
    {
      path: '/invoice/create',
      element: (
        <ProtectedRoute allowedRoles={['owner', 'admin']}>
          <InvoiceCreate />
        </ProtectedRoute>
      ),
    },
    {
      path: '/invoice/read/:id',
      element: (
        <ProtectedRoute allowedRoles={['owner', 'admin']}>
          <InvoiceRead />
        </ProtectedRoute>
      ),
    },
    {
      path: '/invoice/update/:id',
      element: (
        <ProtectedRoute allowedRoles={['owner', 'admin']}>
          <InvoiceUpdate />
        </ProtectedRoute>
      ),
    },
    {
      path: '/invoice/pay/:id',
      element: (
        <ProtectedRoute allowedRoles={['owner', 'admin']}>
          <InvoiceRecordPayment />
        </ProtectedRoute>
      ),
    },
    {
      path: '/quote',
      element: (
        <ProtectedRoute allowedRoles={['owner', 'admin']}>
          <Quote />
        </ProtectedRoute>
      ),
    },
    {
      path: '/quote/create',
      element: (
        <ProtectedRoute allowedRoles={['owner', 'admin']}>
          <QuoteCreate />
        </ProtectedRoute>
      ),
    },
    {
      path: '/quote/read/:id',
      element: (
        <ProtectedRoute allowedRoles={['owner', 'admin']}>
          <QuoteRead />
        </ProtectedRoute>
      ),
    },
    {
      path: '/quote/update/:id',
      element: (
        <ProtectedRoute allowedRoles={['owner', 'admin']}>
          <QuoteUpdate />
        </ProtectedRoute>
      ),
    },
    {
      path: '/payment',
      element: (
        <ProtectedRoute allowedRoles={['owner', 'admin']}>
          <Payment />
        </ProtectedRoute>
      ),
    },
    {
      path: '/payment/read/:id',
      element: (
        <ProtectedRoute allowedRoles={['owner', 'admin']}>
          <PaymentRead />
        </ProtectedRoute>
      ),
    },
    {
      path: '/payment/update/:id',
      element: (
        <ProtectedRoute allowedRoles={['owner', 'admin']}>
          <PaymentUpdate />
        </ProtectedRoute>
      ),
    },
    {
      path: '/settings',
      element: (
        <ProtectedRoute allowedRoles={['owner', 'admin']}>
          <Settings />
        </ProtectedRoute>
      ),
    },
    {
      path: '/settings/edit/:settingsKey',
      element: (
        <ProtectedRoute allowedRoles={['owner', 'admin']}>
          <Settings />
        </ProtectedRoute>
      ),
    },
    {
      path: '/payment/mode',
      element: (
        <ProtectedRoute allowedRoles={['owner', 'admin']}>
          <PaymentMode />
        </ProtectedRoute>
      ),
    },
    {
      path: '/taxes',
      element: (
        <ProtectedRoute allowedRoles={['owner', 'admin']}>
          <Taxes />
        </ProtectedRoute>
      ),
    },

    {
      path: '/profile',
      element: <Profile />,
    },
    {
      path: '/repayment',
      element: <Repayment />,
    },
    {
      path: '/repayment/client/:id',
      element: <ClientRepayment />,
    },
    {
      path: '/calendar/client/:clientId',
      element: <CustomerCalendar />,
    },
    {
      path: '*',
      element: <NotFound />,
    },
  ],
};

export default routes;
