import { useLayoutEffect, useEffect, useState } from 'react';
import { Row, Col, Button } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

import CreateForm from '@/components/CreateForm';
import UpdateForm from '@/components/UpdateForm';
import DeleteModal from '@/components/DeleteModal';
import ReadItem from '@/components/ReadItem';
import SearchItem from '@/components/SearchItem';
import DataTable from '@/components/DataTable/DataTable';

import { useDispatch, useSelector } from 'react-redux';

import { selectCurrentItem } from '@/redux/crud/selectors';
import useLanguage from '@/locale/useLanguage';
import { crud } from '@/redux/crud/actions';
import { useCrudContext } from '@/context/crud';

import { CrudLayout } from '@/layout';

function SidePanelTopContent({ config, formElements, withUpload, onCancel }) {
  const translate = useLanguage();
  const { crudContextAction, state } = useCrudContext();
  const { deleteModalLabels } = config;
  const { modal, editBox } = crudContextAction;

  const currentAdmin = useSelector((state) => state.auth.current);
  const isAdmin = currentAdmin?.role === 'admin' || currentAdmin?.role === 'owner';
  const showEditDelete = !(config.entity === 'client' && !isAdmin);

  const { isReadBoxOpen, isEditBoxOpen } = state;
  const { result: currentItem } = useSelector(selectCurrentItem);
  const dispatch = useDispatch();

  const [labels, setLabels] = useState('');
  useEffect(() => {
    if (currentItem) {
      const currentlabels = deleteModalLabels.map((x) => currentItem[x]).join(' ');

      setLabels(currentlabels);
    }
  }, [currentItem]);

  const removeItem = () => {
    dispatch(crud.currentAction({ actionType: 'delete', data: currentItem }));
    modal.open();
  };
  const editItem = () => {
    dispatch(crud.currentAction({ actionType: 'update', data: currentItem }));
    editBox.open();
  };

  const show = isReadBoxOpen || isEditBoxOpen ? { opacity: 1 } : { opacity: 0 };
  return (
    <>
      <Row style={show} gutter={[24, 24]}>
        <Col xs={24} md={10}>
          <p style={{ marginBottom: '10px' }}>{labels}</p>
        </Col>
        <Col xs={24} md={14}>
          {showEditDelete && (
            <>
              <Button
                onClick={removeItem}
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                style={{ float: 'right', marginLeft: '5px', marginTop: '10px' }}
              >
                {translate('remove')}
              </Button>
              <Button
                onClick={editItem}
                type="text"
                icon={<EditOutlined />}
                size="small"
                style={{ float: 'right', marginLeft: '0px', marginTop: '10px' }}
              >
                {translate('edit')}
              </Button>
            </>
          )}
        </Col>

        <Col span={24}>
          <div className="line"></div>
        </Col>
        <div className="space10"></div>
      </Row>
      <ReadItem config={config} />
      <UpdateForm config={config} formElements={formElements} withUpload={withUpload} onCancel={onCancel} />
    </>
  );
}

function FixHeaderPanel() {
  return null; // ✅ no header at all
}

function CrudModule({ config, createForm, updateForm, extra = [], withUpload = false }) {
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    dispatch(crud.resetState());
  }, []);

  return (
    <CrudLayout
      config={config}
      fixHeaderPanel={<FixHeaderPanel config={config} />}
      sidePanelBottomContent={
        <CreateForm config={config} formElements={createForm} withUpload={withUpload} />
      }
      sidePanelTopContent={
        <SidePanelTopContent config={config} formElements={updateForm} withUpload={withUpload} />
      }
    >
      <DataTable config={config} extra={extra} />
      <DeleteModal config={config} />
    </CrudLayout>
  );
}

export default CrudModule;
