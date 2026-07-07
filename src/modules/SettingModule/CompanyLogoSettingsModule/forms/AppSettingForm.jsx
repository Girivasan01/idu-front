import { Button, Form, message, Upload, Image, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { selectSettings } from '@/redux/settings/selectors';
import useLanguage from '@/locale/useLanguage';

const API_BASE = import.meta.env.VITE_BACKEND_SERVER || 'http://localhost:8888';

export default function AppSettingForm() {
  const translate  = useLanguage();
  const { result } = useSelector(selectSettings);

  // Read current saved logo from Redux settings
  // settingKey is 'company_logo', stored under app_settings category
  const currentLogo =
    result?.app_settings?.company_logo ||
    result?.company_logo ||
    null;

  const logoUrl = currentLogo
    ? currentLogo.startsWith('http')
      ? currentLogo
      : `${API_BASE}${currentLogo}`
    : null;

  const beforeUpload = (file) => {
    const isValidType = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isValidType) {
      message.error('You can only upload JPG/PNG file!');
      return Upload.LIST_IGNORE;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image must be smaller than 5MB!');
      return Upload.LIST_IGNORE;
    }
    return false; // manual upload — form handles submission
  };

  return (
    <>
      {/* ── Current logo preview ── */}
      {logoUrl && (
        <Form.Item label={translate('Current Logo')}>
          <div
            style={{
              padding:      '10px 14px',
              background:   '#f9f9f9',
              borderRadius: 8,
              border:       '1px solid #e8e8e8',
              display:      'inline-flex',
              alignItems:   'center',
              gap:          12,
            }}
          >
            <Image
              src={logoUrl}
              alt="Company Logo"
              height={60}
              style={{ objectFit: 'contain', maxWidth: 200 }}
              preview={false}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <Typography.Text type="secondary" style={{ fontSize: 11 }}>
              {currentLogo}
            </Typography.Text>
          </div>
        </Form.Item>
      )}

      {/* ── Upload new logo ── */}
      <Form.Item
        name="logo"
        label={translate('Upload New Logo')}
        valuePropName="fileList"
        getValueFromEvent={(e) => e?.fileList || []}
        extra="JPG or PNG, max 5MB"
      >
        <Upload
          name="logo"
          beforeUpload={beforeUpload}
          listType="picture"
          accept="image/png, image/jpeg"
          maxCount={1}
        >
          <Button icon={<UploadOutlined />}>
            {translate('click_to_upload')}
          </Button>
        </Upload>
      </Form.Item>
    </>
  );
}
