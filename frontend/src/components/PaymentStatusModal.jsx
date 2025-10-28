import React, { useState } from 'react';
import { Modal, Form, Select, Input, Button, Space, message, Timeline, Tag } from 'antd';
import { DollarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import api from '../utils/api';

const { Option } = Select;
const { TextArea } = Input;

const PaymentStatusModal = ({ visible, onCancel, onSuccess, member }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await api.patch(`/gym/members/${member._id}/payment`, values);
      
      message.success('Payment status updated successfully');
      onSuccess();
      onCancel();
      form.resetFields();
    } catch (error) {
      message.error('Failed to update payment status');
    }
    setLoading(false);
  };

  const getMemberName = () => {
    return member?.isOfflineMember ? member.offlineDetails?.name : member?.user?.name;
  };

  const getPlanDetails = () => {
    if (member?.customPlan?.isCustom) {
      return `${member.customPlan.name} - ₹${member.customPlan.price}`;
    }
    return `${member?.plan?.name} - ₹${member?.plan?.price}`;
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DollarOutlined style={{ color: 'var(--primary-color)' }} />
          <span>Update Payment Status</span>
        </div>
      }
      open={visible}
      onCancel={() => {
        onCancel();
        form.resetFields();
      }}
      footer={null}
      width={600}
    >
      <div style={{ marginBottom: '20px', padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
        <div style={{ fontWeight: 600, marginBottom: '8px' }}>Member: {getMemberName()}</div>
        <div style={{ color: 'var(--text-secondary)' }}>Plan: {getPlanDetails()}</div>
        <div style={{ marginTop: '8px' }}>
          Current Status: 
          <Tag color={member?.paymentStatus === 'paid' ? 'green' : 'red'} style={{ marginLeft: '8px' }}>
            {member?.paymentStatus?.toUpperCase()}
          </Tag>
        </div>
      </div>

      {member?.paymentHistory?.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4>Payment History</h4>
          <Timeline size="small">
            {member.paymentHistory.slice(-3).reverse().map((history, index) => (
              <Timeline.Item 
                key={index}
                dot={<ClockCircleOutlined style={{ fontSize: '12px' }} />}
                color={history.status === 'paid' ? 'green' : 'red'}
              >
                <div style={{ fontSize: '12px' }}>
                  <Tag color={history.status === 'paid' ? 'green' : 'red'} size="small">
                    {history.status.toUpperCase()}
                  </Tag>
                  <span style={{ marginLeft: '8px', color: 'var(--text-secondary)' }}>
                    {new Date(history.updatedAt).toLocaleString()}
                  </span>
                  {history.notes && (
                    <div style={{ marginTop: '4px', color: 'var(--text-muted)' }}>
                      {history.notes}
                    </div>
                  )}
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        </div>
      )}

      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item 
          name="paymentStatus" 
          label="Payment Status" 
          rules={[{ required: true, message: 'Please select payment status' }]}
        >
          <Select placeholder="Select payment status" size="large">
            <Option value="paid">Paid</Option>
            <Option value="unpaid">Unpaid</Option>
          </Select>
        </Form.Item>

        <Form.Item name="notes" label="Notes (Optional)">
          <TextArea 
            placeholder="Add any notes about this payment update..." 
            rows={3}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => {
              onCancel();
              form.resetFields();
            }}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={loading}
            >
              Update Status
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PaymentStatusModal;