import React, { useState } from 'react';
import { Card, Button, Space, Modal, Select, Form, message, Popconfirm } from 'antd';
import { 
  PlusOutlined, SendOutlined, CalendarOutlined, 
  FileExcelOutlined, SettingOutlined, AppstoreOutlined 
} from '@ant-design/icons';

const { Option } = Select;

const StaffQuickActions = ({ onAddStaff, selectedStaff, onBulkAction }) => {
  const [bulkModal, setBulkModal] = useState(false);
  const [bulkForm] = Form.useForm();

  const handleBulkAction = async (values) => {
    try {
      await onBulkAction(values.action, selectedStaff, values);
      setBulkModal(false);
      bulkForm.resetFields();
      message.success('Bulk action completed successfully');
    } catch (error) {
      message.error('Bulk action failed');
    }
  };

  const quickActions = [
    {
      key: 'add',
      title: 'Add Staff',
      icon: <PlusOutlined />,
      type: 'primary',
      onClick: onAddStaff
    },
    {
      key: 'bulk',
      title: 'Bulk Actions',
      icon: <AppstoreOutlined />,
      disabled: selectedStaff?.length === 0,
      onClick: () => setBulkModal(true)
    },
    {
      key: 'schedule',
      title: 'Schedule',
      icon: <CalendarOutlined />,
      onClick: () => message.info('Schedule management coming soon')
    },
    {
      key: 'export',
      title: 'Export',
      icon: <FileExcelOutlined />,
      onClick: () => message.info('Export functionality coming soon')
    },
    {
      key: 'notify',
      title: 'Send Notice',
      icon: <SendOutlined />,
      onClick: () => message.info('Notification system coming soon')
    }
  ];

  return (
    <>
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap>
          {quickActions.map(action => (
            <Button
              key={action.key}
              type={action.type || 'default'}
              icon={action.icon}
              onClick={action.onClick}
              disabled={action.disabled}
              className="quick-action-btn"
            >
              {action.title}
            </Button>
          ))}
        </Space>
        
        {selectedStaff?.length > 0 && (
          <div style={{ marginTop: 12, padding: 8, background: '#f0f2ff', borderRadius: 6 }}>
            <span style={{ fontSize: '12px', color: '#1890ff' }}>
              {selectedStaff.length} staff member(s) selected
            </span>
          </div>
        )}
      </Card>

      <Modal
        title="Bulk Actions"
        open={bulkModal}
        onCancel={() => setBulkModal(false)}
        footer={null}
      >
        <Form form={bulkForm} onFinish={handleBulkAction} layout="vertical">
          <Form.Item
            name="action"
            label="Select Action"
            rules={[{ required: true, message: 'Please select an action' }]}
          >
            <Select placeholder="Choose bulk action">
              <Option value="update_status">Update Status</Option>
              <Option value="assign_role">Change Role</Option>
              <Option value="update_department">Update Department</Option>
              <Option value="send_notification">Send Notification</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => 
              prevValues.action !== currentValues.action
            }
          >
            {({ getFieldValue }) => {
              const action = getFieldValue('action');
              
              if (action === 'update_status') {
                return (
                  <Form.Item
                    name="status"
                    label="New Status"
                    rules={[{ required: true }]}
                  >
                    <Select>
                      <Option value="active">Active</Option>
                      <Option value="inactive">Inactive</Option>
                      <Option value="on_leave">On Leave</Option>
                    </Select>
                  </Form.Item>
                );
              }
              
              if (action === 'assign_role') {
                return (
                  <Form.Item
                    name="role"
                    label="New Role"
                    rules={[{ required: true }]}
                  >
                    <Select>
                      <Option value="trainer">Trainer</Option>
                      <Option value="front_desk">Front Desk</Option>
                      <Option value="nutritionist">Nutritionist</Option>
                      <Option value="manager">Manager</Option>
                      <Option value="cleaner">Cleaner</Option>
                      <Option value="maintenance">Maintenance</Option>
                    </Select>
                  </Form.Item>
                );
              }
              
              if (action === 'update_department') {
                return (
                  <Form.Item
                    name="department"
                    label="Department"
                    rules={[{ required: true }]}
                  >
                    <Select mode="tags">
                      <Option value="Fitness">Fitness</Option>
                      <Option value="Nutrition">Nutrition</Option>
                      <Option value="Administration">Administration</Option>
                      <Option value="Maintenance">Maintenance</Option>
                    </Select>
                  </Form.Item>
                );
              }
              
              return null;
            }}
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => setBulkModal(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Apply to {selectedStaff?.length} staff
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default StaffQuickActions;