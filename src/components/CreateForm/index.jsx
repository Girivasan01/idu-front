import { useEffect } from 'react';
import dayjs from 'dayjs';

import { useDispatch, useSelector } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { useCrudContext } from '@/context/crud';
import { selectCreatedItem } from '@/redux/crud/selectors';
import { Form } from 'antd';
import Loading from '@/components/Loading';

export default function CreateForm({ config, formElements, withUpload = false, onCancel }) {
  let { entity } = config;
  const dispatch = useDispatch();
  const { result: createdResult, isLoading, isSuccess } = useSelector(selectCreatedItem);
  const { crudContextAction } = useCrudContext();
  const { panel, collapsedBox, readBox } = crudContextAction;
  const [form] = Form.useForm();

  const serializeValue = (key, value) => {
    if (value === undefined || value === null) return null;

    if (key === 'paymentDetails') {
      return JSON.stringify(value || {});
    }

    if (key === 'assigned' && typeof value === 'object') {
      return value?._id || value?.id || null;
    }

    if (dayjs.isDayjs(value)) {
      return value.toISOString();
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (typeof value === 'object') {
      return null;
    }

    return String(value);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
      return;
    }

    form.resetFields();
    readBox.close();
    collapsedBox.close();
    panel.close();
  };

  const onSubmit = (fieldsValue) => {
    const payload = { ...fieldsValue };

    if (payload.collectionTime?.format) {
      payload.collectionTime = payload.collectionTime.format('HH:mm:ss');
    }

    delete payload.interestType;

    if (withUpload) {
      const uploadedFile = Array.isArray(payload.file) ? payload.file[0]?.originFileObj : null;

      const formData = new FormData();

      Object.entries(payload).forEach(([key, value]) => {
        if (key === 'file') return;
        if (Array.isArray(value)) return;

        const serializedValue = serializeValue(key, value);
        if (serializedValue !== null) {
          formData.append(key, serializedValue);
        }
      });

      if (uploadedFile) {
        formData.append('file', uploadedFile);
      }

      console.log('[DEBUG] create client values:', payload);
      console.log('[DEBUG] create client FormData:', Array.from(formData.entries()));

      dispatch(crud.create({ entity, jsonData: formData, withUpload }));
      return;
    }

    // const trimmedValues = Object.keys(fieldsValue).reduce((acc, key) => {
    //   acc[key] = typeof fieldsValue[key] === 'string' ? fieldsValue[key].trim() : fieldsValue[key];
    //   return acc;
    // }, {});

    dispatch(crud.create({ entity, jsonData: payload, withUpload }));
  };

  useEffect(() => {
    if (isSuccess) {
      // Ensure the read panel uses the latest entity data (including assigned staff and computed values)
      if (createdResult && createdResult._id) {
        dispatch(crud.currentItem({ data: createdResult }));

        // Re-read from server to ensure relational fields are fully populated (e.g., assigned staff name)
        dispatch(crud.read({ entity, id: createdResult._id }));
      }

      dispatch(crud.list({ entity }));

      if (config.closePanelOnSuccess) {
        form.resetFields();
        readBox.close();
        collapsedBox.close();
        panel.close();
      } else {
        readBox.open();
        collapsedBox.open();
        panel.open();
        form.resetFields();
      }

      dispatch(crud.resetAction({ actionType: 'create' }));
    }
  }, [isSuccess, createdResult]);

  return (
    <Loading isLoading={isLoading}>
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        {typeof formElements === 'function'
          ? formElements({ onCancel: handleCancel, loading: isLoading, isUpdateForm: false, form })
          : formElements}
      </Form>
    </Loading>
  );
}
