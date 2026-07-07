import { useState, useEffect } from 'react';
import { Form, Button } from 'antd';
import dayjs from 'dayjs';
import { useSelector, useDispatch } from 'react-redux';
import { erp } from '@/redux/erp/actions';
import { selectUpdatedItem } from '@/redux/erp/selectors';

import useLanguage from '@/locale/useLanguage';

import Loading from '@/components/Loading';

import calculate from '@/utils/calculate';
import PaymentForm from '@/forms/PaymentForm';
import { useNavigate } from 'react-router-dom';

export default function UpdatePayment({ config, currentPayment }) {
  const translate = useLanguage();
  const navigate = useNavigate();
  let { entity } = config;
  const dispatch = useDispatch();

  const { isLoading, isSuccess } = useSelector(selectUpdatedItem);

  const [form] = Form.useForm();

  const [maxAmount, setMaxAmount] = useState(0);

  useEffect(() => {
    if (currentPayment) {
      const paymentReference = currentPayment.reference || currentPayment.details;
      const isRepaymentPayment = Boolean(currentPayment.isRepaymentPayment && paymentReference);

      if (isRepaymentPayment) {
        const installmentAmount = Number(paymentReference.amount || 0);
        const alreadyPaid = Number(paymentReference.amountPaid || currentPayment.amount || 0);
        const remainingBalance = Number(
          paymentReference.remainingBalance ?? Math.max(installmentAmount - alreadyPaid, 0)
        );
        setMaxAmount(remainingBalance > 0 ? remainingBalance : installmentAmount);
      } else {
        const { credit, total, discount, amount } = currentPayment.details || currentPayment;
        setMaxAmount(
          calculate.sub(calculate.sub(total, discount), calculate.sub(calculate.sub(credit, amount)))
        );
      }

      const newInvoiceValues = { ...currentPayment };
      if (newInvoiceValues.date) {
        newInvoiceValues.date = dayjs(newInvoiceValues.date);
      }
      form.setFieldsValue(newInvoiceValues);
    }
  }, [currentPayment, form]);

  useEffect(() => {
    if (isSuccess) {
      form.resetFields();
      dispatch(erp.resetAction({ actionType: 'recordPayment' }));
      dispatch(erp.list({ entity }));
      navigate(`/${entity.toLowerCase()}/read/${currentPayment._id}`);
    }
  }, [isSuccess, form, dispatch, entity, navigate, currentPayment]);

  const onSubmit = (fieldsValue) => {
    if (currentPayment) {
      const client = currentPayment.client && currentPayment.client._id;
      fieldsValue = {
        ...fieldsValue,
        client,
      };

      if (currentPayment.isRepaymentPayment && currentPayment.reference) {
        fieldsValue.reference = currentPayment.reference._id || currentPayment.reference;
      } else if (currentPayment.invoice) {
        fieldsValue.invoice = currentPayment.invoice._id || currentPayment.invoice;
      }
    }

    dispatch(
      erp.update({
        entity,
        id: currentPayment._id,
        jsonData: fieldsValue,
      })
    );
  };

  return (
    <>
      <Loading isLoading={isLoading}>
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          <PaymentForm maxAmount={maxAmount} />
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {translate('Update')}
            </Button>
          </Form.Item>
        </Form>
      </Loading>
    </>
  );
}
