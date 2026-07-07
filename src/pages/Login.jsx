import { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import useLanguage from '@/locale/useLanguage';

import { Form, Button } from 'antd';

import { login } from '@/redux/auth/actions';
import { selectAuth, selectCurrentAdmin } from '@/redux/auth/selectors';
import LoginForm from '@/forms/LoginForm';
import Loading from '@/components/Loading';
import AuthModule from '@/modules/AuthModule';
import { clearDashboardPinLock } from '@/utils/dashboardPin';

const LoginPage = () => {
  const translate = useLanguage();
  const { isLoading, isSuccess } = useSelector(selectAuth);
  const currentAdmin = useSelector(selectCurrentAdmin);
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const onFinish = (values) => {
    clearDashboardPinLock();
    console.log('[login] Submitting login form', { email: values?.email, remember: values?.remember });
    dispatch(login({ loginData: values }));
  };

  useEffect(() => {
    console.log('[login] Auth state changed', { isSuccess, currentAdmin });
    if (isSuccess && currentAdmin) {
      // Redirect based on role: staff goes to /customer, others go to /
      if (currentAdmin.role === 'staff') {
        navigate('/customer');
      } else {
        navigate('/customer');
      }
    }
  }, [isSuccess, currentAdmin, navigate]);

  const FormContainer = () => {
    return (
      <Loading isLoading={isLoading}>
        <Form
          layout="vertical"
          name="normal_login"
          className="login-form"
          initialValues={{
            remember: true
          }}
          onFinish={onFinish}
        >
          <LoginForm />

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
              loading={isLoading}
              size="large"
            >
              {translate('Log in')}
            </Button>
          </Form.Item>

        </Form>
      </Loading>
    );
  };

  return <AuthModule authContent={<FormContainer />} AUTH_TITLE="Sign in" />;
};

export default LoginPage;
