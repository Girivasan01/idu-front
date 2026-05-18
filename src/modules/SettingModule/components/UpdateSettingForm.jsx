import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { settingsAction } from '@/redux/settings/actions';
import { selectSettings } from '@/redux/settings/selectors';
import { Button, Form } from 'antd';
import Loading from '@/components/Loading';
import useLanguage from '@/locale/useLanguage';

export default function UpdateSettingForm({ config, children, withUpload, uploadSettingKey }) {
  let { entity, settingsCategory } = config;
  const dispatch   = useDispatch();
  const { result, isLoading } = useSelector(selectSettings);
  const translate  = useLanguage();
  const [form]     = Form.useForm();

  const onSubmit = (fieldsValue) => {
    console.log('🚀 ~ onSubmit ~ fieldsValue:', fieldsValue);

    if (withUpload) {
      // ✅ FIX: find the file field dynamically — works regardless of field name or case
      // Previously hardcoded to fieldsValue.file which broke when field is named 'logo', 'Logo', etc.
      let processedValues = { ...fieldsValue };

      for (const key of Object.keys(processedValues)) {
        const val = processedValues[key];
        // Detect antd Upload fileList arrays
        if (Array.isArray(val) && val.length > 0 && val[0]?.originFileObj) {
          processedValues[key] = val[0].originFileObj;
          break; // only one file upload expected
        }
      }

      dispatch(
        settingsAction.upload({
          entity,
          settingKey: uploadSettingKey,
          jsonData:   processedValues,
        })
      );
    } else {
      const settings = [];
      for (const [key, value] of Object.entries(fieldsValue)) {
        settings.push({ settingKey: key, settingValue: value });
      }
      dispatch(settingsAction.updateMany({ entity, jsonData: { settings } }));
    }
  };

  useEffect(() => {
    const current = result[settingsCategory];
    form.setFieldsValue(current);
  }, [result]);

  return (
    <div>
      <Loading isLoading={isLoading}>
        <Form
          form={form}
          onFinish={onSubmit}
          labelCol={{ span: 10 }}
          labelAlign="left"
          wrapperCol={{ span: 16 }}
        >
          {children}
          <Form.Item style={{ display: 'inline-block', paddingRight: '5px' }}>
            <Button type="primary" htmlType="submit">
              {translate('Save')}
            </Button>
          </Form.Item>
          <Form.Item style={{ display: 'inline-block', paddingLeft: '5px' }} />
        </Form>
      </Loading>
    </div>
  );
}
