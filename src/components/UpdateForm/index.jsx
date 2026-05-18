import { useEffect } from 'react';
import dayjs from 'dayjs';

import { useDispatch, useSelector } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { useCrudContext } from '@/context/crud';
import { selectUpdatedItem } from '@/redux/crud/selectors';
import { Form } from 'antd';
import Loading from '@/components/Loading';

export default function UpdateForm({ config, formElements, withUpload = false, onCancel }) {
  let { entity } = config;
  const dispatch = useDispatch();
  const { current, isLoading, isSuccess } = useSelector(selectUpdatedItem);

  const { state, crudContextAction } = useCrudContext();

  /////

  const { panel, collapsedBox, readBox } = crudContextAction;

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      readBox.open();
    }
  };

  /////
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

  const onSubmit = (fieldsValue) => {
    const id = current._id;
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

      console.log('[DEBUG] update client values:', payload);
      console.log('[DEBUG] update client FormData:', Array.from(formData.entries()));

      dispatch(crud.update({ entity, id, jsonData: formData, withUpload }));
      return;
    }
    // const trimmedValues = Object.keys(fieldsValue).reduce((acc, key) => {
    //   acc[key] = typeof fieldsValue[key] === 'string' ? fieldsValue[key].trim() : fieldsValue[key];
    //   return acc;
    // }, {});
    dispatch(crud.update({ entity, id, jsonData: payload, withUpload }));
  };
  useEffect(() => {
    if (current) {
      let newValues = { ...current };
      if (newValues.birthday) {
        newValues = {
          ...newValues,
          birthday: dayjs(newValues['birthday']),
        };
      }
      if (newValues.date) {
        newValues = {
          ...newValues,
          date: dayjs(newValues['date']),
        };
      }
      if (newValues.startDate) {
        newValues = {
          ...newValues,
          startDate: dayjs(newValues['startDate']),
        };
      }
      if (newValues.expiredDate) {
        newValues = {
          ...newValues,
          expiredDate: dayjs(newValues['expiredDate']),
        };
      }
      if (newValues.created) {
        newValues = {
          ...newValues,
          created: dayjs(newValues['created']),
        };
      }
      if (newValues.collectionTime) {
        newValues = {
          ...newValues,
          collectionTime: dayjs(newValues.collectionTime, 'HH:mm:ss'),
        };
      }
      if (newValues.updated) {
        newValues = {
          ...newValues,
          updated: dayjs(newValues['updated']),
        };
      }
      if (withUpload && newValues.photo) {
        const fileName = String(newValues.photo).split('/').pop() || 'photo';
        newValues = {
          ...newValues,
          file: [
            {
              uid: '-1',
              name: fileName,
              status: 'done',
              url: newValues.photo,
            },
          ],
        };
      }
      form.resetFields();
      form.setFieldsValue(newValues);
    }
  }, [current, form, withUpload]);

  useEffect(() => {
    if (isSuccess) {
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

      dispatch(crud.resetAction({ actionType: 'update' }));
    }
  }, [isSuccess]);

  const { isEditBoxOpen } = state;

  const show = isEditBoxOpen ? { display: 'block', opacity: 1 } : { display: 'none', opacity: 0 };
  return (
    <div style={show}>
      <Loading isLoading={isLoading}>
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          {typeof formElements === 'function'
            ? formElements({ onCancel: handleCancel, loading: isLoading, isUpdateForm: true, form })
            : formElements}
        </Form>
      </Loading>
    </div>
  );
}
