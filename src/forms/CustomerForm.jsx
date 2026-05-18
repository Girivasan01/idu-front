import { Form, Input, DatePicker, TimePicker, InputNumber, Select, Button, Row, Col, Upload, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  validatePhoneNumber,
  handlePhoneInput,
  handlePhoneKeyPress,
  handlePhonePaste,
} from '@/utils/helpers';

import useLanguage from '@/locale/useLanguage';
import useRole from '@/hooks/useRole';
import { request } from '@/request';
import { useState, useEffect } from 'react';

export default function CustomerForm({ isUpdateForm = false, form }) {
  const translate = useLanguage();
  const { isAdmin } = useRole();

  const [staffOptions, setStaffOptions] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  const beforeUpload = (file) => {
    const isImage = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isImage) {
      message.error('You can only upload JPG/PNG file!');
      return Upload.LIST_IGNORE;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!');
      return Upload.LIST_IGNORE;
    }

    return false;
  };

  const normalizeFile = (e) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  /**
   * Fetch staff list
   */
  useEffect(() => {
    if (!isAdmin) return;

    const fetchStaff = async () => {
      setLoadingStaff(true);

      try {
        const response = await request.get({
          entity: 'admin/listAllStaff',
        });

        if (response.success && response.result) {
          const staff = response.result.map((s) => ({
            value: s._id,
            label: s.name || s.email,
          }));

          setStaffOptions(staff);
        }
      } catch (error) {
        console.error('Error fetching staff:', error);
      } finally {
        setLoadingStaff(false);
      }
    };

    fetchStaff();
  }, [isAdmin]);

  /**
   * Convert assigned object -> assigned _id
   * So dropdown shows correct value in edit mode
   */
  useEffect(() => {
    if (!form) return;
    const assigned = form.getFieldValue('assigned');
    if (assigned && typeof assigned === 'object') {
      setStaffOptions((prev) => {
        const exists = prev.find((opt) => opt.value === assigned._id);
        if (!exists) {
          return [...prev, { value: assigned._id, label: assigned.name || assigned.email || 'Unknown Staff' }];
        }
        return prev;
      });
      form.setFieldsValue({
        assigned: assigned._id,
      });
    }
  }, [form]);

  /**
   * Prevent empty string values
   */
  const validateEmptyString = (_, value) => {
    if (value && value.trim() === '') {
      return Promise.reject(new Error('Field cannot be empty'));
    }
    return Promise.resolve();
  };

  const validateMapLink = (_, value) => {
    const mapLink = value ? String(value).trim() : '';
    if (mapLink && !mapLink.startsWith('http')) {
      return Promise.reject(new Error('Map link must start with http'));
    }
    return Promise.resolve();
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <h2 style={{ margin: 0 }}>
          {isUpdateForm ? 'Edit Client' : ''}
        </h2>
      </div>
      {/* Photo */}
      <Form.Item
        name="file"
        label={translate('photo') || 'Photo'}
        valuePropName="fileList"
        getValueFromEvent={normalizeFile}
      >
        <Upload
          beforeUpload={beforeUpload}
          maxCount={1}
          accept="image/png,image/jpeg"
          listType="picture-card"
        >
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8, fontSize: 12 }}>{translate('click_to_upload') || 'Take / Upload'}</div>
          </div>
        </Upload>
      </Form.Item>

      {/* Name */}
      <Form.Item
        label={translate('name')}
        name="name"
        rules={[
          { required: true },
          { validator: validateEmptyString },
        ]}
      >
        <Input placeholder="Enter name"/>
      </Form.Item>

      {/* Address */}
      <Form.Item
        label={translate('address')}
        name="address"
        rules={[
          { required: true },
          { validator: validateEmptyString },
        ]}
      >
        <Input placeholder="Enter address"/>
      </Form.Item>

      <Form.Item
        label="Client Location (Map)"
        name="map_link"
        rules={[
          { max: 500, message: 'Map link cannot exceed 500 characters' },
          { validator: validateMapLink },
        ]}
      >
        <Input placeholder="Paste Google Maps link" />
      </Form.Item>

      {/* Phone + Email */}
      <Row gutter={12}>
        <Col span={12}>
          <Form.Item
            name="phone"
            label={translate('Phone')}
            rules={[
              { required: true },
              { validator: validateEmptyString },
              {
                pattern: validatePhoneNumber,
                message: 'Enter valid 10-digit mobile number starting with 9,8,7,6',
              },
            ]}
          >
            <Input
              maxLength={10}
              inputMode="numeric"
              placeholder="Enter mobile number"
              onInput={handlePhoneInput}
              onKeyPress={handlePhoneKeyPress}
              onPaste={handlePhonePaste}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="email"
            label={translate('email')}
            rules={[
              { type: 'email' },
              { required: true },
              { validator: validateEmptyString },
            ]}
          >
            <Input placeholder="Enter email address"/>
          </Form.Item>
        </Col>
      </Row>

      {/* Loan Amount + Interest */}
      <Row gutter={[16, 0]}>
        <Col span={12}>
          <Form.Item
            label={translate('loanAmount')}
            name="loanAmount"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="Enter loan amount"/>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label={
              <span style={{ whiteSpace: 'nowrap' }}>
                {translate('interestRate')}(% Per Month)
              </span>
            }
            name="interestRate"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="Enter interest rate"/>
          </Form.Item>
        </Col>
      </Row>

      {/* Term + Start Date + Collection Time */}
      <Row gutter={[16, 12]}>
        {/* Start Date - full width */}
        <Col xs={24}>
          <Form.Item
            label={translate('startDate')}
            name="startDate"
            rules={[{ required: true }]}
            getValueProps={(value) => ({
              value: value ? dayjs(value) : undefined,
            })}
          >
            <DatePicker
              style={{ width: '100%' }}
              size="large"
              format="DD/MM/YYYY"
              inputReadOnly
              placeholder="Select start date"
              getPopupContainer={(trigger) => trigger.parentNode}
            />
          </Form.Item>
        </Col>

        {/* Collection Time */}
        <Col xs={24} sm={12}>
          <Form.Item
            label={<span style={{ whiteSpace: 'nowrap' }}>Collection Time</span>}
            name="collectionTime"
            getValueProps={(value) => ({
              value: value ? dayjs(value, 'HH:mm:ss') : undefined,
            })}
          >
            <TimePicker
              format="h:mm A"
              use12Hours
              size="large"
              style={{ width: "100%" }}
              getPopupContainer={(trigger) => trigger.parentNode}
            />
          </Form.Item>
        </Col>

        {/* Term */}
        <Col xs={24} sm={12}>
          <Form.Item
            label={translate('term')}
            name="term"
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter term" size="large" />
          </Form.Item>
        </Col>
      </Row>


      {/* Repayment / Status */}
      <Row gutter={12}>
        <Col span={12}>
          <Form.Item
            label={translate('repaymentType')}
            name="repaymentType"
            rules={[{ required: true }]}
          >
            <Select
            placeholder="Select repayment type"
              options={[
                { value: 'Monthly EMI', label: translate('monthly_emi') },
                { value: 'Weekly', label: translate('weekly') },
                { value: 'Daily', label: translate('daily') },
              ]}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label={translate('status')}
            name="status"
            rules={[{ required: true }]}
          >
            <Select
            placeholder="Select status"
              options={[
                { value: 'active', label: translate('active') },
                { value: 'paid', label: translate('paid') },
                { value: 'defaulted', label: translate('defaulted') },
              ]}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Assigned Staff - Admin Only */}
      {isAdmin && (
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              label={translate('assignedStaff') || 'Assigned Staff'}
              name="assigned"
              getValueProps={(value) => {
                if (!value) return { value: undefined };
                if (typeof value === "object") return { value: value._id };
                return { value };
              }}
            >
              <Select
                showSearch
                allowClear
                placeholder={translate('select_staff') || 'Select Staff'}
                loading={loadingStaff}
                options={staffOptions}
                optionFilterProp="label"
                filterOption={(input, option) =>
                  (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>
      )}

      {/* Payment Details */}
      <div style={{ marginTop: 24, marginBottom: 16 }}>
        <h4 style={{ color: '#1890ff', borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>
          {translate('Payment Details') || 'Payment Details'}
        </h4>
      </div>

      <Row gutter={12}>
        <Col span={24}>
          <Form.Item label={translate('UPI ID') || 'UPI ID'} name={['paymentDetails', 'upiId']}>
            <Input placeholder={translate('enter_upi_id') || 'Enter UPI ID (optional)'} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={12}>
        <Col span={24}>
          <Form.Item label={translate('Bank Name') || 'Bank Name'} name={['paymentDetails', 'bankName']}>
            <Input placeholder={translate('enter_bank_name') || 'Enter Bank Name'} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={12}>
        <Col span={12}>
          <Form.Item label={translate('Account Number') || 'Account Number'} name={['paymentDetails', 'accountNumber']}>
            <Input placeholder={translate('enter_account_number') || 'Enter Account Number'} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={translate('IFSC Code') || 'IFSC Code'} name={['paymentDetails', 'ifscCode']}>
            <Input placeholder={translate('enter_ifsc_code') || 'Enter IFSC Code'} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={12}>
        <Col span={24}>
          <Form.Item label={translate('Account Holder Name') || 'Account Holder Name'} name={['paymentDetails', 'accountHolderName']}>
            <Input placeholder={translate('enter_account_holder_name') || 'Enter Account Holder Name'} />
          </Form.Item>
        </Col>
      </Row>

      {/* Save Button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: 30,
          borderTop: '1px solid #f0f0f0',
          paddingTop: 20,
          marginBottom: 20,
        }}
      >
        <Button type="primary" htmlType="submit">
          {isUpdateForm ? translate('Save') : translate('Submit')}
        </Button>
      </div>
    </>
  );
}
