import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Space, Modal, InputNumber, message } from 'antd';
import { GiftOutlined, ReloadOutlined, ClockCircleOutlined } from '@ant-design/icons';
import api from '../utils/api';

const AdminTrials = () => {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [extendModalVisible, setExtendModalVisible] = useState(false);
  const [selectedGym, setSelectedGym] = useState(null);
  const [additionalDays, setAdditionalDays] = useState(7);

  useEffect(() => {
    fetchTrialData();
  }, []);

  const fetchTrialData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/subscription/admin/trials');
      setGyms(response.data.gyms);
    } catch (error) {
      message.error('Failed to fetch trial data');
    }
    setLoading(false);
  };

  const handleResetTrial = async (gymId) => {
    Modal.confirm({
      title: 'Reset Trial',
      content: 'Are you sure you want to reset the trial for this gym? This will make the trial available again.',
      onOk: async () => {
        try {
          await api.post(`/subscription/admin/trials/${gymId}/reset`);
          message.success('Trial reset successfully');
          fetchTrialData();
        } catch (error) {
          message.error('Failed to reset trial');
        }
      }
    });
  };

  const handleExtendTrial = async () => {
    try {
      await api.post(`/subscription/admin/trials/${selectedGym._id}/extend`, {
        additionalDays
      });
      message.success(`Trial extended by ${additionalDays} days`);
      setExtendModalVisible(false);
      setSelectedGym(null);
      fetchTrialData();
    } catch (error) {
      message.error('Failed to extend trial');
    }
  };

  const getTrialStatusTag = (status) => {
    const statusConfig = {
      available: { color: 'blue', text: 'Available' },
      active: { color: 'green', text: 'Active' },
      expired: { color: 'red', text: 'Expired' },
      used: { color: 'orange', text: 'Used' }
    };
    
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getSubscriptionStatusTag = (status) => {
    const statusConfig = {
      trial: { color: 'cyan', text: 'Trial' },
      active: { color: 'green', text: 'Active' },
      inactive: { color: 'default', text: 'Inactive' },
      expired: { color: 'red', text: 'Expired' }
    };
    
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return '-';
    const now = new Date();
    const end = new Date(endDate);
    const days = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days` : 'Expired';
  };

  const columns = [
    {
      title: 'Gym Name',
      dataIndex: 'gym_name',
      key: 'gym_name',
      render: (name) => name || 'Unnamed Gym'
    },
    {
      title: 'Owner',
      dataIndex: ['owner_user_id', 'name'],
      key: 'owner_name',
      render: (name) => name || 'Unknown'
    },
    {
      title: 'Email',
      dataIndex: ['owner_user_id', 'email'],
      key: 'owner_email'
    },
    {
      title: 'Trial Status',
      dataIndex: 'trial_status',
      key: 'trial_status',
      render: (status) => getTrialStatusTag(status)
    },
    {
      title: 'Subscription Status',
      dataIndex: 'subscription_status',
      key: 'subscription_status',
      render: (status) => getSubscriptionStatusTag(status)
    },
    {
      title: 'Trial Start',
      dataIndex: 'trial_start_date',
      key: 'trial_start_date',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-'
    },
    {
      title: 'Trial End',
      dataIndex: 'trial_end_date',
      key: 'trial_end_date',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-'
    },
    {
      title: 'Days Remaining',
      dataIndex: 'trial_end_date',
      key: 'days_remaining',
      render: (endDate) => getDaysRemaining(endDate)
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<ReloadOutlined />}
            onClick={() => handleResetTrial(record._id)}
            disabled={record.trial_status === 'available'}
          >
            Reset
          </Button>
          <Button
            size="small"
            icon={<ClockCircleOutlined />}
            onClick={() => {
              setSelectedGym(record);
              setExtendModalVisible(true);
            }}
            disabled={record.trial_status !== 'active'}
          >
            Extend
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <GiftOutlined />
            Trial Subscriptions Management
          </div>
        }
        extra={
          <Button icon={<ReloadOutlined />} onClick={fetchTrialData}>
            Refresh
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={gyms}
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Extend Trial Modal */}
      <Modal
        title="Extend Trial"
        open={extendModalVisible}
        onOk={handleExtendTrial}
        onCancel={() => {
          setExtendModalVisible(false);
          setSelectedGym(null);
        }}
      >
        <p>Extend trial for: <strong>{selectedGym?.gym_name}</strong></p>
        <div style={{ marginBottom: 16 }}>
          <label>Additional Days:</label>
          <InputNumber
            min={1}
            max={365}
            value={additionalDays}
            onChange={setAdditionalDays}
            style={{ width: '100%', marginTop: 8 }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default AdminTrials;