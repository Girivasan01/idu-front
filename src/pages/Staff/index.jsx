/**
 * pages/staff/index.jsx — Webaac Solutions Finance Management
 *
 * Mobile fixes:
 *  - Table scroll={{ x: 600 }} prevents overflow
 *  - Card-based layout on xs screens
 *  - Modal width responsive (95vw on mobile)
 *  - Typography sizes adjusted for mobile
 *  - Action buttons have sufficient tap targets (min 36px)
 */
import React, { useEffect, useState } from 'react';
import {
  Table, Button, Form, Input, Select, Modal,
  message, Space, Grid, Typography, Card, Row, Col, Tag,
} from 'antd';
import {
  EditOutlined, DeleteOutlined, PlusOutlined,
  UserOutlined, MailOutlined, PhoneOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { selectListItems } from '@/redux/crud/selectors';
import { ErpLayout } from '@/layout';
import { request } from '@/request';
import axios from 'axios';
import {
  validatePhoneNumber,
  handlePhoneInput,
  handlePhoneKeyPress,
  handlePhonePaste,
} from '@/utils/helpers';

const { useBreakpoint } = Grid;

export default function Staff() {
  const screens  = useBreakpoint();
  const isMobile = !screens.md;
  const dispatch = useDispatch();

  const { result = {} }  = useSelector(selectListItems);
  const items = (result?.items || []).filter((u) => u.role === 'staff');

  const [open, setOpen]               = useState(false);
  const [editOpen, setEditOpen]       = useState(false);
  const [form]                        = Form.useForm();
  const [editForm]                    = Form.useForm();
  const [currentStaff, setCurrentStaff] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading]   = useState(false);

  useEffect(() => {
    dispatch(crud.list({ entity: 'admin', options: { page: 1, items: 10 } }));
  }, [dispatch]);

  const refreshList = () => {
    dispatch(crud.list({ entity: 'admin', options: { page: 1, items: 10 } }));
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleEditClick = (record) => {
    setCurrentStaff(record);
    editForm.setFieldsValue({ name: record.name, phone: record.phone, email: record.email });
    setEditOpen(true);
  };

  const handleEditStaff = async (values) => {
    setEditLoading(true);
    try {
      const response = await request.patch({
        entity:   `admin/updateStaff/${currentStaff._id}`,
        jsonData: values,
      });
      if (!response?.success) { message.error(response?.message || 'Failed to update staff'); return; }
      message.success('Staff updated successfully');
      editForm.resetFields();
      setEditOpen(false);
      setCurrentStaff(null);
      refreshList();
    } catch (error) {
      message.error(error?.response?.data?.message || 'Failed to update staff');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteClick = (record) => {
    if (!record?._id) { message.error('Invalid staff record. Cannot delete.'); return; }
    Modal.confirm({
      title:      'Delete staff member?',
      content:    `This will remove ${record.name} from the system.`,
      okText:     'Yes, Delete',
      okType:     'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await axios.delete(`/admin/deleteStaff/${record._id}`);
          message.success('Staff deleted successfully');
          refreshList();
        } catch (error) {
          message.error(error?.response?.data?.message || 'Failed to delete staff');
        }
      },
    });
  };

  const handleCreateStaff = async (values) => {
    setCreateLoading(true);
    const payload = {
      name:     values.name?.trim(),
      email:    values.email?.trim().toLowerCase(),
      phone:    values.phone,
      role:     values.role,
      password: values.password,
    };
    try {
      const response = await request.post({ entity: 'admin/createStaff', jsonData: payload });
      if (!response?.success) { message.error(response?.message || 'Failed to create staff'); return; }
      message.success('Staff created successfully');
      form.resetFields();
      setOpen(false);
      refreshList();
    } catch (error) {
      message.error(error?.response?.data?.message || 'Failed to create staff');
    } finally {
      setCreateLoading(false);
    }
  };

  // ── Table columns (desktop) ──────────────────────────────────────────────
  const columns = [
    {
      title: 'Name', dataIndex: 'name', key: 'name',
      render: (v) => <span style={{ fontWeight: 500 }}>{v}</span>,
    },
    { title: 'Mobile', dataIndex: 'phone', key: 'phone' },
    { title: 'Email',  dataIndex: 'email', key: 'email'  },
    {
      title:  'Role', dataIndex: 'role', key: 'role',
      render: (v) => <Tag color="blue" style={{ textTransform: 'capitalize' }}>{v}</Tag>,
    },
    {
      title: 'Actions', key: 'actions', width: 100, fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary" shape="circle" icon={<EditOutlined />} size="middle"
            onClick={() => handleEditClick(record)}
            style={{ minWidth: 36, minHeight: 36 }}
          />
          <Button
            danger shape="circle" icon={<DeleteOutlined />} size="middle"
            onClick={() => handleDeleteClick(record)}
            style={{ minWidth: 36, minHeight: 36 }}
          />
        </Space>
      ),
    },
  ];

  // ── Mobile card render ───────────────────────────────────────────────────
  const StaffCard = ({ record }) => (
    <Card
      size="small"
      style={{ marginBottom: 10, borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      styles={{ body: { padding: '12px 14px' } }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <UserOutlined style={{ color: '#1890ff' }} />
            {record.name}
            <Tag color="blue" style={{ fontSize: 11, marginLeft: 4 }}>{record.role}</Tag>
          </div>
          <div style={{ color: '#595959', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
            <PhoneOutlined style={{ fontSize: 12 }} />{record.phone}
          </div>
          <div style={{ color: '#595959', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
            <MailOutlined style={{ fontSize: 12 }} />
            <span style={{ wordBreak: 'break-all' }}>{record.email}</span>
          </div>
        </div>
        <Space size="small" style={{ marginLeft: 10, flexShrink: 0 }}>
          <Button
            type="primary" shape="circle" icon={<EditOutlined />} size="middle"
            onClick={() => handleEditClick(record)}
          />
          <Button
            danger shape="circle" icon={<DeleteOutlined />} size="middle"
            onClick={() => handleDeleteClick(record)}
          />
        </Space>
      </div>
    </Card>
  );

  // ── Phone field (reused in both modals) ──────────────────────────────────
  const PhoneField = ({ name = 'phone', label = 'Mobile Number' }) => (
    <Form.Item
      label={label} name={name}
      rules={[
        { required: true, message: 'Please enter mobile number' },
        { pattern: validatePhoneNumber, message: 'Enter valid 10-digit number starting with 9,8,7,6' },
      ]}
    >
      <Input
        placeholder="Enter mobile number" maxLength={10} inputMode="numeric"
        onInput={handlePhoneInput} onKeyPress={handlePhoneKeyPress} onPaste={handlePhonePaste}
      />
    </Form.Item>
  );

  return (
    <ErpLayout>
      <div
        style={{
          margin:  isMobile ? 10 : '24px 32px',
          padding: isMobile ? '14px 12px' : '24px',
          background: '#ffffff',
          border:     '1px solid #f0f0f0',
          borderRadius: 10,
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            gap: 12, flexWrap: 'wrap', marginBottom: 20,
          }}
        >
          <Typography.Title level={isMobile ? 4 : 2} style={{ margin: 0 }}>
            Staff
          </Typography.Title>
          <Button
            type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}
            style={{ minWidth: isMobile ? '100%' : undefined }}
          >
            Create Staff
          </Button>
        </div>

        {/* ── Content: Cards on mobile, Table on desktop ── */}
        {isMobile ? (
          items.length === 0
            ? <div style={{ textAlign: 'center', color: '#8c8c8c', padding: 32 }}>No staff members found.</div>
            : items.map((record) => <StaffCard key={record._id} record={record} />)
        ) : (
          <Table
            columns={columns}
            dataSource={items}
            rowKey="_id"
            scroll={{ x: 600 }}
            pagination={{
              pageSize:        10,
              showSizeChanger: true,
              showTotal:       (t, r) => `${r[0]}–${r[1]} of ${t} items`,
            }}
          />
        )}
      </div>

      {/* ── Create Staff Modal ── */}
      <Modal
        title="Create Staff" open={open}
        onCancel={() => { setOpen(false); form.resetFields(); }}
        footer={null} width={isMobile ? '95vw' : 560}
        style={{ top: isMobile ? 10 : 40 }}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateStaff}>
          <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please enter name' }]}>
            <Input placeholder="Enter staff name" />
          </Form.Item>
          <PhoneField />
          <Form.Item
            label="Login Email" name="email"
            rules={[{ required: true, message: 'Please enter login email' }, { type: 'email' }]}
          >
            <Input placeholder="Enter login email" onInput={(e) => { e.target.value = e.target.value.replace(/\s/g, '').toLowerCase(); }} />
          </Form.Item>
          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Login Password" name="password"
                rules={[{ required: true, message: 'Password is required' }, { min: 6, message: 'Minimum 6 characters' }]}
              >
                <Input.Password placeholder="Enter password" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Confirm Password" name="confirmPassword" dependencies={['password']}
                rules={[
                  { required: true, message: 'Confirm password' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) return Promise.resolve();
                      return Promise.reject(new Error('Passwords do not match'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Confirm password" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Role" name="role" initialValue="staff">
            <Select><Select.Option value="staff">Staff</Select.Option></Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={createLoading}>Create Staff</Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Edit Staff Modal ── */}
      <Modal
        title="Edit Staff" open={editOpen}
        onCancel={() => { setEditOpen(false); setCurrentStaff(null); editForm.resetFields(); }}
        footer={null} width={isMobile ? '95vw' : 500}
        style={{ top: isMobile ? 10 : 40 }}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditStaff}>
          <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please enter name' }]}>
            <Input placeholder="Enter staff name" />
          </Form.Item>
          <PhoneField />
          <Form.Item
            label="Login Email" name="email"
            rules={[{ required: true, message: 'Please enter login email' }, { type: 'email' }]}
          >
            <Input placeholder="Enter login email" onInput={(e) => { e.target.value = e.target.value.replace(/\s/g, '').toLowerCase(); }} />
          </Form.Item>
          <Form.Item label="New Password (leave blank to keep current)" name="password">
            <Input.Password placeholder="Enter new password" />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: isMobile ? 'stretch' : 'flex-start' }}>
              <Button type="primary" htmlType="submit" loading={editLoading} block={isMobile}>Update Staff</Button>
              <Button onClick={() => { setEditOpen(false); setCurrentStaff(null); editForm.resetFields(); }}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </ErpLayout>
  );
}
