import { useState, useEffect } from 'react';

import { Button, Row, Col, Descriptions, Tag, Divider } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { FileTextOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { generate as uniqueId } from 'shortid';
import { useMoney } from '@/settings';
import { useNavigate } from 'react-router-dom';
import useLanguage from '@/locale/useLanguage';
import UpdatePayment from './UpdatePayment';
import { repaymentStatusColor as repaymentStatusColors } from '@/utils/repaymentStatusColor';

const normalizeRepaymentStatus = (status) => {
  const normalizedStatus = String(status || '')
    .trim()
    .toLowerCase();

  if (normalizedStatus === 'late payment') return 'late';
  if (normalizedStatus === 'not_started' || normalizedStatus === 'not started') return 'not-started';

  return normalizedStatus || 'not-started';
};

const getRepaymentDisplayStatus = (repayment) => {
  if (!repayment) return 'not-started';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(repayment.date);
  due.setHours(0, 0, 0, 0);

  const amount = Number(repayment.amount || 0);
  const amountPaid = Number(repayment.amountPaid || 0);
  const paymentDate = repayment.paymentDate || repayment.paidDate;

  if (amountPaid >= amount && amount > 0) {
    if (paymentDate && new Date(paymentDate) > due) return 'late';
    return 'paid';
  }

  if (amountPaid > 0 && amountPaid < amount) return 'partial';
  if (today < due) return 'not-started';
  return 'default';
};

export default function Payment({ config, currentItem }) {
  const translate = useLanguage();
  const { entity, ENTITY_NAME } = config;

  const money = useMoney();
  const navigate = useNavigate();

  const [currentErp, setCurrentErp] = useState(currentItem);

  useEffect(() => {
    const controller = new AbortController();
    if (currentItem) {
      const paymentReference = currentItem.reference;
      const invoiceReference = currentItem.invoice;
      const primaryRecord = paymentReference || invoiceReference || {};

      setCurrentErp({
        ...currentItem,
        details: primaryRecord,
        isRepaymentPayment: Boolean(paymentReference),
      });
    }
    return () => controller.abort();
  }, [currentItem]);

  const [client, setClient] = useState({});

  useEffect(() => {
    if (currentErp?.client) {
      setClient(currentErp.client);
    }
  }, [currentErp]);

  const details = currentErp?.details || {};
  const isRepaymentPayment = Boolean(currentErp?.isRepaymentPayment);
  const repaymentAmount = Number(details.amount || currentErp?.amount || 0);
  const repaymentAmountPaid = Number(
    details.amountPaid ?? currentErp?.amount ?? 0
  );
  const remainingBalance = Number(
    details.remainingBalance ?? Math.max(repaymentAmount - repaymentAmountPaid, 0)
  );
  const repaymentDisplayStatus = getRepaymentDisplayStatus({
    ...details,
    amountPaid: details.amountPaid ?? currentErp?.amount ?? 0,
  });
  const normalizedRepaymentStatus = normalizeRepaymentStatus(
    details.status || repaymentDisplayStatus
  );
  const repaymentStatusLabel = translate(normalizedRepaymentStatus).toUpperCase();
  const repaymentStatusTagColor =
    repaymentStatusColors[normalizedRepaymentStatus] || repaymentStatusColors['not-started'];
  const pageTitleNumber = currentErp.number || details.number || '';
  const pageTitleYear = currentErp.year || details.year || '';
  const clientName = client?.name || currentErp?.client?.name || '-';

  return (
    <>
      <Row gutter={[12, 12]}>
        <Col
          className="gutter-row"
          xs={{ span: 24 }}
          sm={{ span: 24 }}
          md={{ span: 24 }}
          lg={{ span: 20, push: 2 }}
        >
          <PageHeader
            onBack={() => navigate(`/${entity.toLowerCase()}`)}
            title={`Update  ${ENTITY_NAME} # ${pageTitleNumber}/${pageTitleYear || ''}`}
            ghost={false}
            tags={
              isRepaymentPayment ? (
                <Tag color={repaymentStatusTagColor}>{repaymentStatusLabel}</Tag>
              ) : (
                <span>{currentErp.paymentStatus}</span>
              )
            }
            // subTitle="This is cuurent erp page"
            extra={[
              <Button
                key={`${uniqueId()}`}
                onClick={() => {
                  navigate(`/${entity.toLowerCase()}`);
                }}
                icon={<CloseCircleOutlined />}
              >
                {translate('Cancel')}
              </Button>,
              !isRepaymentPayment && currentErp.invoice ? (
                <Button
                  key={`${uniqueId()}`}
                  onClick={() => navigate(`/invoice/read/${currentErp.invoice._id || currentErp.invoice}`)}
                  icon={<FileTextOutlined />}
                >
                  {translate('Show invoice')}
                </Button>
              ) : null,
            ]}
            style={{
              padding: '20px 0px',
            }}
          ></PageHeader>
          <Divider dashed />
        </Col>
      </Row>
      <Row gutter={[12, 12]}>
        <Col
          className="gutter-row"
          xs={{ span: 24, order: 2 }}
          sm={{ span: 24, order: 2 }}
          md={{ span: 10, order: 2, push: 2 }}
          lg={{ span: 10, order: 2, push: 4 }}
        >
          <div className="space50"></div>
          <Descriptions title={`${translate('Client')} : ${clientName}`} column={1}>
            <Descriptions.Item label={translate('email')}>{client.email}</Descriptions.Item>
            <Descriptions.Item label={translate('Phone')}>{client.phone}</Descriptions.Item>
            <Divider dashed />
            {isRepaymentPayment ? (
              <>
                <Descriptions.Item label={translate('Installment Amount')}>
                  {money.moneyFormatter({
                    amount: repaymentAmount,
                    currency_code: currentErp.currency,
                  })}
                </Descriptions.Item>
                <Descriptions.Item label={translate('Amount Paid')}>
                  {money.moneyFormatter({
                    amount: repaymentAmountPaid,
                    currency_code: currentErp.currency,
                  })}
                </Descriptions.Item>
                <Descriptions.Item label={translate('Remaining Balance')}>
                  {money.moneyFormatter({
                    amount: remainingBalance,
                    currency_code: currentErp.currency,
                  })}
                </Descriptions.Item>
                <Descriptions.Item label={translate('Payment Status')}>
                  <Tag color={repaymentStatusTagColor}>{repaymentStatusLabel}</Tag>
                </Descriptions.Item>
              </>
            ) : (
              <>
                <Descriptions.Item label={translate('Payment Status')}>
                  <span>{currentErp.paymentStatus}</span>
                </Descriptions.Item>
                <Descriptions.Item label={translate('SubTotal')}>
                  {money.moneyFormatter({
                    amount: currentErp.details?.subTotal,
                    currency_code: currentErp.currency,
                  })}
                </Descriptions.Item>
                <Descriptions.Item label={translate('Total')}>
                  {money.moneyFormatter({
                    amount: currentErp.details?.total,
                    currency_code: currentErp.currency,
                  })}
                </Descriptions.Item>
                <Descriptions.Item label="Discount">
                  {money.moneyFormatter({
                    amount: currentErp.details?.discount,
                    currency_code: currentErp.currency,
                  })}
                </Descriptions.Item>
                <Descriptions.Item label="Balance">
                  {money.moneyFormatter({
                    amount: currentErp.details?.credit,
                    currency_code: currentErp.currency,
                  })}
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        </Col>

        <Col
          className="gutter-row"
          xs={{ span: 24, order: 1 }}
          sm={{ span: 24, order: 1 }}
          md={{ span: 12, order: 1 }}
          lg={{ span: 10, order: 1, push: 2 }}
        >
          <UpdatePayment config={config} currentPayment={currentErp} />
        </Col>
      </Row>
    </>
  );
}
