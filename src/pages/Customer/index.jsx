import CrudModule from '@/modules/CrudModule/CrudModule';
import CustomerForm from '@/forms/CustomerForm';
import { fields } from './config';
import useLanguage from '@/locale/useLanguage';
import { HistoryOutlined, EyeOutlined } from '@ant-design/icons';

export default function Customer() {
  const translate = useLanguage();
  const entity = 'client';
  const searchConfig = {
    displayLabels: ['name'],
    searchFields: 'name',
  };
  const deleteModalLabels = ['name'];

  const filters = [
    {
      key: 'repaymentType',
      label: translate('repayment_type'),
      allLabel: 'all_repayment_types',
      options: [
        { value: 'Daily', label: translate('daily') },
        { value: 'Weekly', label: translate('weekly') },
        { value: 'Monthly EMI', label: translate('monthly_emi') },
      ],
    },
  ];

  const Labels = {
    PANEL_TITLE: translate('client'),
    DATATABLE_TITLE: translate('client_list'),
    ADD_NEW_ENTITY: translate('add_new_client'),
    ENTITY_NAME: translate('client'),
  };
  const configPage = {
    entity,
    ...Labels,
  };
  const config = {
    ...configPage,
    fields,
    searchConfig,
    deleteModalLabels,
    filters,
  };

  const extra = [
    {
      label: translate('View'),
      key: 'view',
      icon: <EyeOutlined />,
    },
    {
      label: translate('Repayments'),
      key: 'repayments',
      icon: <HistoryOutlined />,
    },
  ];

  return (
    <CrudModule
      createForm={(props) => <CustomerForm {...props} />}
      updateForm={(props) => (
        <CustomerForm {...props} isUpdateForm={true} clientId={props.clientId} />
      )}
      config={config}
      extra={extra}
      withUpload
    />
  );
}
