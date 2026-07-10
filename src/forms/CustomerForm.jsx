import {
  Form,
  Input,
  DatePicker,
  TimePicker,
  InputNumber,
  Select,
  Button,
  Row,
  Col,
  Upload,
  message,
  Divider,
  Typography,
  notification,
  Image,
} from 'antd';
import { CameraOutlined, UploadOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
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
import { useState, useEffect, useRef } from 'react';
import { API_BASE_URL, FILE_BASE_URL } from '@/config/serverApiConfig';
import storePersist from '@/redux/storePersist';
import ClientDocumentsDrawer from '@/components/ClientDocumentsDrawer';

const getAuthToken = () => {
  const auth = storePersist.get('auth');
  return auth?.token || auth?.current?.token || window.localStorage.getItem('token') || null;
};

/** Build an absolute URL from a raw photo path or existing full URL */
const buildPhotoUrl = (raw) => {
  if (!raw) return '';
  if (typeof raw === 'object') return raw.url || raw.thumbUrl || '';
  const normalized = String(raw).replace(/\\/g, '/');
  if (/^(https?:)?\/\//i.test(normalized) || normalized.startsWith('data:')) return normalized;
  const base = (FILE_BASE_URL || '').replace(/\/$/, '');
  return `${base}/${normalized.replace(/^\//, '')}`;
};

export default function CustomerForm({ isUpdateForm = false, form, clientId }) {
  const translate = useLanguage();
  const { isAdmin } = useRole();

  const [staffOptions, setStaffOptions] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const assignedInitialized = useRef(false);

  const [photoUrl, setPhotoUrl] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [photoHovered, setPhotoHovered] = useState(false);

  const [pendingDocs, setPendingDocs] = useState([]);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const uploadedForClientRef = useRef(null);

  // ── Upload pending docs once clientId arrives ──────────────
  useEffect(() => {
    if (isUpdateForm) return;
    if (!clientId || clientId === uploadedForClientRef.current) return;
    if (!pendingDocs.length) return;
    uploadedForClientRef.current = clientId;
    const filesToUpload = [...pendingDocs];
    setPendingDocs([]);
    const upload = async () => {
      setUploadingDocs(true);
      try {
        const formData = new FormData();
        filesToUpload.forEach((f) => formData.append('files', f));
        const token = getAuthToken();
        const res = await fetch(`${API_BASE_URL}/client/${clientId}/documents`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
        const data = await res.json();
        if (data.success)
          notification.success({
            message: `${filesToUpload.length} document(s) uploaded`,
            duration: 3,
          });
      } catch (e) {
        notification.error({ message: 'Failed to upload documents: ' + e.message });
      } finally {
        setUploadingDocs(false);
      }
    };
    upload();
  }, [clientId, isUpdateForm]);

  const photoSyncRef = useRef(null);
  useEffect(() => {
    if (!isUpdateForm || !form) return;
    let attempts = 0;
    const trySync = () => {
      const fileField = form.getFieldValue('file');
      const photoField = form.getFieldValue('photo');
      const raw =
        Array.isArray(fileField) && fileField[0]
          ? fileField[0].url || fileField[0].thumbUrl
          : photoField;
      const url = buildPhotoUrl(raw);
      if (url) {
        setPhotoUrl(url);
      } else if (attempts < 10) {
        attempts++;
        photoSyncRef.current = setTimeout(trySync, 150);
      }
    };
    photoSyncRef.current = setTimeout(trySync, 100);
    return () => clearTimeout(photoSyncRef.current);
  }, [isUpdateForm, form]);

  // ── Photo beforeUpload ──────────
  const handlePhotoChange = (file) => {
    const isImage = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isImage) {
      message.error('Only JPG/PNG allowed');
      return false;
    }
    if (file.size / 1024 / 1024 > 2) {
      message.error('Image must be under 2MB');
      return false;
    }

    const previewUrl = URL.createObjectURL(file);
    setPhotoUrl(previewUrl);
    setPhotoFile(file);

    const entry = {
      uid: file.uid || String(Date.now()),
      name: file.name,
      status: 'done',
      originFileObj: file,
      url: previewUrl,
      thumbUrl: previewUrl,
    };
    form?.setFieldsValue({ file: [entry] });
    return false;
  };

  const handlePhotoRemove = () => {
    setPhotoUrl('');
    setPhotoFile(null);
    form?.setFieldsValue({ file: [] });
  };

  // ── Staff fetch ─────────
  useEffect(() => {
    if (!isAdmin) return;
    const fetchStaff = async () => {
      setLoadingStaff(true);
      try {
        const res = await request.get({ entity: 'admin/listAllStaff' });
        if (res.success && res.result)
          setStaffOptions(res.result.map((s) => ({ value: s._id, label: s.name || s.email })));
      } catch (e) {
        console.error('Error fetching staff:', e);
      } finally {
        setLoadingStaff(false);
      }
    };
    fetchStaff();
  }, [isAdmin]);

  // Populate _createdByName
  useEffect(() => {
    if (!form || !isUpdateForm || !isAdmin) return;
    const creatorName = form.getFieldValue('creatorName');
    if (creatorName) form.setFieldsValue({ _createdByName: creatorName });
  }, [form, isUpdateForm, isAdmin]);

  useEffect(() => {
    if (!form || assignedInitialized.current) return;
    assignedInitialized.current = true;
    const assigned = form.getFieldValue('assigned');
    if (assigned && typeof assigned === 'object') {
      setStaffOptions((prev) => {
        const exists = prev.find((opt) => opt.value === assigned._id);
        return exists
          ? prev
          : [
              ...prev,
              { value: assigned._id, label: assigned.name || assigned.email || 'Unknown Staff' },
            ];
      });
      form.setFieldsValue({ assigned: assigned._id });
    }
  }, []);

  const validateEmptyString = (_, value) => {
    if (value && value.trim() === '') return Promise.reject(new Error('Field cannot be empty'));
    return Promise.resolve();
  };

  const validateMapLink = (_, value) => {
    const v = value ? String(value).trim() : '';
    if (v && !v.startsWith('http'))
      return Promise.reject(new Error('Map link must start with http'));
    return Promise.resolve();
  };

  // Pending doc handler (create mode)
  const beforeUploadDoc = (file, fileList) => {
    if (fileList[fileList.length - 1] !== file) return false;
    setPendingDocs((prev) => {
      const combined = [...prev, ...fileList];
      if (combined.length > 10) {
        notification.warning({ message: 'Maximum 10 documents allowed', duration: 3 });
        return combined.slice(0, 10);
      }
      return combined;
    });
    return false;
  };

  // ── Photo box UI ─────
  const PhotoBox = () => (
    <div style={{ marginBottom: 4 }}>
      <Typography.Text strong style={{ display: 'block', marginBottom: 6, fontSize: 13 }}>
        {translate('photo') || 'Profile Photo'}
      </Typography.Text>

      {/* Hidden Form.Item keeps the value in form state for submit */}
      <Form.Item
        name="file"
        valuePropName="fileList"
        getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
        noStyle
      >
        <Upload
          beforeUpload={() => false}
          maxCount={1}
          showUploadList={false}
          accept="image/png,image/jpeg"
          style={{ display: 'none' }}
        />
      </Form.Item>

      <div
        style={{ position: 'relative', width: 104, height: 104, cursor: 'pointer' }}
        onMouseEnter={() => setPhotoHovered(true)}
        onMouseLeave={() => setPhotoHovered(false)}
      >
        <div
          style={{
            width: 104,
            height: 104,
            borderRadius: 8,
            border: '1px dashed #d9d9d9',
            overflow: 'hidden',
            background: '#fafafa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="profile"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={() => setPhotoUrl('')}
            />
          ) : (
            <div style={{ textAlign: 'center', color: '#bfbfbf' }}>
              <CameraOutlined style={{ fontSize: 28 }} />
              <div style={{ fontSize: 11, marginTop: 4 }}>No Photo</div>
            </div>
          )}
        </div>

        {photoHovered && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 8,
              background: 'rgba(0,0,0,0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
            }}
          >
            <Upload
              beforeUpload={handlePhotoChange}
              maxCount={1}
              accept="image/png,image/jpeg"
              showUploadList={false}
            >
              <CameraOutlined
                title="Upload photo"
                style={{
                  color: '#fff',
                  fontSize: 18,
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, font-size 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.4)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              />
            </Upload>

            {photoUrl && (
              <EyeOutlined
                title="Preview"
                style={{
                  color: '#fff',
                  fontSize: 18,
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.4)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                onClick={() => setPreviewOpen(true)}
              />
            )}

            {photoUrl && (
              <DeleteOutlined
                title="Remove photo"
                style={{
                  color: '#ff7875',
                  fontSize: 18,
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.4)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                onClick={handlePhotoRemove}
              />
            )}
          </div>
        )}
      </div>

      {/* Hidden preview modal */}
      <Image
        src={photoUrl}
        style={{ display: 'none' }}
        preview={{
          visible: previewOpen,
          onVisibleChange: (v) => setPreviewOpen(v),
          src: photoUrl,
        }}
      />
    </div>
  );

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
        <h2 style={{ margin: 0 }}>{isUpdateForm ? 'Edit Client' : ''}</h2>
      </div>

      {/* Photo + Documents side by side */}
      <Row gutter={24} align="top" style={{ marginBottom: 16 }}>
        <Col>
          <PhotoBox />
        </Col>

        <Col flex="1">
          <div style={{ marginBottom: 8 }}>
            <Typography.Text strong style={{ fontSize: 13 }}>
              Documents
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12, marginLeft: 6 }}>
              {isUpdateForm ? '(max 10)' : '(optional)'}
            </Typography.Text>
          </div>

          {isUpdateForm && clientId ? (
            <ClientDocumentsDrawer clientId={clientId} photo={null} name={null} inlineMode={true} />
          ) : (
            <>
              <Upload
                beforeUpload={beforeUploadDoc}
                multiple
                showUploadList={false}
                accept="image/*,.pdf,.doc,.docx"
                disabled={pendingDocs.length >= 10}
              >
                <Button icon={<UploadOutlined />} size="small" loading={uploadingDocs}>
                  {uploadingDocs ? 'Uploading…' : 'Attach Files'}
                </Button>
              </Upload>
              {pendingDocs.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {pendingDocs.map((f, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: '#fafafa',
                        border: '1px solid #f0f0f0',
                        borderRadius: 4,
                        padding: '3px 8px',
                        fontSize: 12,
                      }}
                    >
                      <span
                        style={{
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {f.name}
                      </span>
                      <Button
                        type="text"
                        size="small"
                        danger
                        style={{ padding: '0 4px', fontSize: 11, height: 20, minWidth: 'unset' }}
                        onClick={() => setPendingDocs((p) => p.filter((_, j) => j !== i))}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                  <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                    {pendingDocs.length}/10 — will upload after client is saved
                  </Typography.Text>
                </div>
              )}
            </>
          )}
        </Col>
      </Row>

      {/* Name */}
      <Form.Item
        label={translate('name')}
        name="name"
        rules={[{ required: true }, { validator: validateEmptyString }]}
      >
        <Input placeholder="Enter name" />
      </Form.Item>

      {/* Address */}
      <Form.Item
        label={translate('address')}
        name="address"
        rules={[{ required: true }, { validator: validateEmptyString }]}
      >
        <Input placeholder="Enter address" />
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
    { type: 'email', message: 'Please enter a valid email address' },
    { validator: validateEmptyString },
  ]}
>
  <Input placeholder="Enter email address (optional)" />
</Form.Item>
        </Col>
      </Row>

      {/* Loan Amount + Interest */}
      <Row gutter={[16, 0]}>
        <Col span={12}>
          <Form.Item label={translate('loanAmount')} name="loanAmount" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} placeholder="Enter loan amount" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={
              <span style={{ whiteSpace: 'nowrap' }}>{translate('interestRate')}(% Per Month)</span>
            }
            name="interestRate"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="Enter interest rate" />
          </Form.Item>
        </Col>
      </Row>

      {/* Term + Start Date + Collection Time */}
      <Row gutter={[16, 12]}>
        <Col xs={24}>
          <Form.Item
            label={translate('startDate')}
            name="startDate"
            rules={[{ required: true }]}
            getValueProps={(v) => ({ value: v ? dayjs(v) : undefined })}
          >
            <DatePicker
              style={{ width: '100%' }}
              size="large"
              format="DD/MM/YYYY"
              inputReadOnly
              placeholder="Select start date"
              getPopupContainer={(t) => t.parentNode}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            label={<span style={{ whiteSpace: 'nowrap' }}>Collection Time</span>}
            name="collectionTime"
            getValueProps={(v) => ({ value: v ? dayjs(v, 'HH:mm:ss') : undefined })}
          >
            <TimePicker
              format="h:mm A"
              use12Hours
              size="large"
              style={{ width: '100%' }}
              getPopupContainer={(t) => t.parentNode}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item label={translate('term')} name="term" rules={[{ required: true }]}>
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
            initialValue={!isAdmin ? 'inactive' : undefined}
          >
            <Select
              placeholder="Select status"
              disabled={!isAdmin && !isUpdateForm}
              options={
                isAdmin
                  ? [
                      { value: 'active', label: translate('active') },
                      { value: 'inactive', label: 'Inactive' },
                      { value: 'paid', label: translate('paid') },
                      { value: 'defaulted', label: translate('defaulted') },
                    ]
                  : [{ value: 'inactive', label: 'Inactive (Pending Admin Approval)' }]
              }
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
              getValueProps={(v) => {
                if (!v) return { value: undefined };
                if (typeof v === 'object') return { value: v._id };
                return { value: v };
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
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          {isUpdateForm && (
            <Col span={12}>
              <Form.Item label="Created By" name={['_createdByName']}>
                <Input readOnly style={{ background: '#fafafa', cursor: 'default' }} />
              </Form.Item>
            </Col>
          )}
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
          <Form.Item
            label={translate('Bank Name') || 'Bank Name'}
            name={['paymentDetails', 'bankName']}
          >
            <Input placeholder={translate('enter_bank_name') || 'Enter Bank Name'} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={12}>
          <Form.Item
            label={translate('Account Number') || 'Account Number'}
            name={['paymentDetails', 'accountNumber']}
          >
            <Input placeholder={translate('enter_account_number') || 'Enter Account Number'} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={translate('IFSC Code') || 'IFSC Code'}
            name={['paymentDetails', 'ifscCode']}
          >
            <Input placeholder={translate('enter_ifsc_code') || 'Enter IFSC Code'} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={24}>
          <Form.Item
            label={translate('Account Holder Name') || 'Account Holder Name'}
            name={['paymentDetails', 'accountHolderName']}
          >
            <Input
              placeholder={translate('enter_account_holder_name') || 'Enter Account Holder Name'}
            />
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
