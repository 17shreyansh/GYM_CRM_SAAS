import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Space, Modal, InputNumber, message, Dropdown, Checkbox, Select } from 'antd';
import { GiftOutlined, ReloadOutlined, ClockCircleOutlined, PlayCircleOutlined, PauseCircleOutlined, StopOutlined, ThunderboltOutlined, MoreOutlined } from '@ant-design/icons';
import api from '../utils/api';

const AdminTrials = () => {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [extendModalVisible, setExtendModalVisible] = useState(false);
  const [forceStartModalVisible, setForceStartModalVisible] = useState(false);
  const [bulkModalVisible, setBulkModalVisible] = useState(false);
  const [selectedGym, setSelectedGym] = useState(null);
  const [additionalDays, setAdditionalDays] = useState(7);
  const [customDuration, setCustomDuration] = useState(30);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [bulkOperation, setBulkOperation] = useState('extend');
  const [bulkOptions, setBulkOptions] = useState({ additionalDays: 7, duration: 30 });

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

  const handleForceStartTrial = async () => {
    try {
      await api.post(`/subscription/admin/trials/${selectedGym._id}/force-start`, {
        customDuration
      });
      message.success(`Trial force started for ${customDuration} days`);
      setForceStartModalVisible(false);
      setSelectedGym(null);
      fetchTrialData();
    } catch (error) {
      message.error('Failed to force start trial');
    }
  };

  const handlePauseTrial = async (gymId) => {
    Modal.confirm({
      title: 'Pause Trial',
      content: 'Are you sure you want to pause this trial? The gym will lose access immediately.',
      onOk: async () => {
        try {
          await api.post(`/subscription/admin/trials/${gymId}/pause`);
          message.success('Trial paused successfully');
          fetchTrialData();
        } catch (error) {
          message.error('Failed to pause trial');
        }
      }
    });
  };

  const handleResumeTrial = async (gymId) => {
    try {
      await api.post(`/subscription/admin/trials/${gymId}/resume`);
      message.success('Trial resumed successfully');
      fetchTrialData();
    } catch (error) {
      message.error('Failed to resume trial');
    }
  };

  const handleForceExpireTrial = async (gymId) => {
    Modal.confirm({
      title: 'Force Expire Trial',
      content: 'Are you sure you want to force expire this trial? This action cannot be undone.',
      onOk: async () => {
        try {
          await api.post(`/subscription/admin/trials/${gymId}/force-expire`);
          message.success('Trial expired successfully');
          fetchTrialData();
        } catch (error) {
          message.error('Failed to expire trial');
        }
      }
    });
  };

  const handleBulkOperation = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select at least one gym');
      return;
    }

    Modal.confirm({
      title: `Bulk ${bulkOperation.replace('_', ' ').toUpperCase()}`,
      content: `Are you sure you want to ${bulkOperation.replace('_', ' ')} ${selectedRowKeys.length} selected gyms?`,
      onOk: async () => {
        try {
          await api.post('/subscription/admin/trials/bulk', {
            gymIds: selectedRowKeys,
            operation: bulkOperation,
            options: bulkOptions
          });
          message.success(`Bulk ${bulkOperation.replace('_', ' ')} completed successfully`);
          setBulkModalVisible(false);
          setSelectedRowKeys([]);
          fetchTrialData();
        } catch (error) {
          message.error(`Failed to perform bulk ${bulkOperation.replace('_', ' ')}`);
        }
      }
    });
  };

  const getTrialStatusTag = (status) => {
    const statusConfig = {
      available: { color: 'blue', text: 'Available' },
      active: { color: 'green', text: 'Active' },
      expired: { color: 'red', text: 'Expired' },
      used: { color: 'orange', text: 'Used' },
      paused: { color: 'gold', text: 'Paused' }
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
      render: (_, record) => {
        const menuItems = [
          {
            key: 'extend',
            label: 'Extend Trial',
            icon: <ClockCircleOutlined />,
            disabled: record.trial_status !== 'active',
            onClick: () => {
              setSelectedGym(record);
              setExtendModalVisible(true);
            }
          },
          {
            key: 'force-start',
            label: 'Force Start',
            icon: <ThunderboltOutlined />,
            onClick: () => {
              setSelectedGym(record);
              setForceStartModalVisible(true);
            }
          },
          {
            key: 'pause',
            label: 'Pause Trial',
            icon: <PauseCircleOutlined />,
            disabled: record.trial_status !== 'active',
            onClick: () => handlePauseTrial(record._id)
          },
          {
            key: 'resume',
            label: 'Resume Trial',
            icon: <PlayCircleOutlined />,
            disabled: record.trial_status !== 'paused',
            onClick: () => handleResumeTrial(record._id)
          },
          {
            key: 'reset',
            label: 'Reset Trial',
            icon: <ReloadOutlined />,
            disabled: record.trial_status === 'available',
            onClick: () => handleResetTrial(record._id)
          },
          {
            key: 'expire',
            label: 'Force Expire',
            icon: <StopOutlined />,
            disabled: !['active', 'paused'].includes(record.trial_status),
            onClick: () => handleForceExpireTrial(record._id)
          }
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button size="small" icon={<MoreOutlined />}>
              Actions
            </Button>
          </Dropdown>
        );
      }
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
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button
              type="primary"
              onClick={() => setBulkModalVisible(true)}
              disabled={selectedRowKeys.length === 0}
            >
              Bulk Actions ({selectedRowKeys.length})
            </Button>
            <Button onClick={() => setSelectedRowKeys([])}>
              Clear Selection
            </Button>
          </Space>
        </div>
        
        <Table
          columns={columns}
          dataSource={gyms}
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            getCheckboxProps: (record) => ({
              name: record.gym_name,
            }),
          }}
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

      {/* Force Start Trial Modal */}
      <Modal
        title="Force Start Trial"
        open={forceStartModalVisible}
        onOk={handleForceStartTrial}
        onCancel={() => {
          setForceStartModalVisible(false);
          setSelectedGym(null);
        }}
      >
        <p>Force start trial for: <strong>{selectedGym?.gym_name}</strong></p>
        <p style={{ color: '#ff4d4f', fontSize: '12px' }}>This will override any existing trial status</p>
        <div style={{ marginBottom: 16 }}>
          <label>Trial Duration (Days):</label>
          <InputNumber
            min={1}
            max={365}
            value={customDuration}
            onChange={setCustomDuration}
            style={{ width: '100%', marginTop: 8 }}
          />
        </div>
      </Modal>

      {/* Bulk Operations Modal */}
      <Modal
        title={`Bulk Operations (${selectedRowKeys.length} selected)`}
        open={bulkModalVisible}
        onOk={handleBulkOperation}
        onCancel={() => setBulkModalVisible(false)}
        width={600}
      >
        <div style={{ marginBottom: 16 }}>
          <label>Operation:</label>
          <Select
            value={bulkOperation}
            onChange={setBulkOperation}
            style={{ width: '100%', marginTop: 8 }}
            options={[
              { value: 'extend', label: 'Extend Trials' },
              { value: 'reset', label: 'Reset Trials' },
              { value: 'pause', label: 'Pause Trials' },
              { value: 'resume', label: 'Resume Trials' },
              { value: 'expire', label: 'Force Expire Trials' },
              { value: 'force_start', label: 'Force Start Trials' }
            ]}
          />
        </div>
        
        {bulkOperation === 'extend' && (
          <div style={{ marginBottom: 16 }}>
            <label>Additional Days:</label>
            <InputNumber
              min={1}
              max={365}
              value={bulkOptions.additionalDays}
              onChange={(value) => setBulkOptions({...bulkOptions, additionalDays: value})}
              style={{ width: '100%', marginTop: 8 }}
            />
          </div>
        )}
        
        {bulkOperation === 'force_start' && (
          <div style={{ marginBottom: 16 }}>
            <label>Trial Duration (Days):</label>
            <InputNumber
              min={1}
              max={365}
              value={bulkOptions.duration}
              onChange={(value) => setBulkOptions({...bulkOptions, duration: value})}
              style={{ width: '100%', marginTop: 8 }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminTrials;