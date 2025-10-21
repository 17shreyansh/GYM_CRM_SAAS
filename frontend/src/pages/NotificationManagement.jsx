import React, { useState } from 'react';
import { Card, Form, Input, Button, Select, message, Space } from 'antd';
import { NotificationOutlined, SendOutlined } from '@ant-design/icons';
import api from '../utils/api';

const { TextArea } = Input;
const { Option } = Select;

const NotificationManagement = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await api.post('/gym/notifications', values);
      message.success(`Notification sent to ${response.data.count} members`);
      form.resetFields();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <NotificationOutlined />
          Send Notification to Members
        </h2>
        <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)' }}>
          Send important updates and announcements to all active gym members
        </p>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Form.Item
            name="title"
            label="Notification Title"
            rules={[{ required: true, message: 'Please enter notification title' }]}
          >
            <Input 
              placeholder="e.g., Gym Closed Today, New Equipment Arrival, etc."
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="message"
            label="Message"
            rules={[{ required: true, message: 'Please enter notification message' }]}
          >
            <TextArea 
              rows={4}
              placeholder="Enter your message here. Keep it clear and informative for your members."
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="type"
            label="Notification Type"
            initialValue="info"
          >
            <Select size="large">
              <Option value="info">Information</Option>
              <Option value="warning">Warning</Option>
              <Option value="success">Good News</Option>
              <Option value="error">Important Alert</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<SendOutlined />}
                size="large"
              >
                Send to All Members
              </Button>
              <Button 
                onClick={() => form.resetFields()}
                size="large"
              >
                Clear
              </Button>
            </Space>
          </Form.Item>
        </Form>

        <div style={{ 
          marginTop: 24, 
          padding: 16, 
          background: 'var(--bg-tertiary)', 
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)'
        }}>
          <h4 style={{ margin: '0 0 8px 0' }}>💡 Tips for effective notifications:</h4>
          <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--text-secondary)' }}>
            <li>Keep messages clear and concise</li>
            <li>Use appropriate notification types (info, warning, etc.)</li>
            <li>Include specific dates and times when relevant</li>
            <li>Avoid sending too many notifications to prevent spam</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default NotificationManagement;