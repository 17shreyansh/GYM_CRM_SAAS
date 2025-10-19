import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Modal, Descriptions, Tabs } from 'antd';
import api from '../utils/api';

const AdminGyms = () => {
  const [gyms, setGyms] = useState([]);
  const [selectedGym, setSelectedGym] = useState(null);
  const [gymModal, setGymModal] = useState(false);

  useEffect(() => {
    fetchGyms();
  }, []);

  const fetchGyms = async () => {
    try {
      const response = await api.get('/gym/all');
      setGyms(response.data.gyms || []);
    } catch (error) {
      console.error('Failed to fetch gyms:', error);
    }
  };

  const updateGymStatus = async (gymId, status) => {
    try {
      await api.patch(`/gym/status/${gymId}`, { status });
      fetchGyms();
    } catch (error) {
      console.error('Failed to update gym status:', error);
    }
  };

  const fetchGymDetails = (gym) => {
    setSelectedGym(gym);
    setGymModal(true);
  };

  const columns = [
    { title: 'Gym ID', dataIndex: 'gym_id', key: 'gym_id' },
    { title: 'Official Name', dataIndex: 'gym_name', key: 'gym_name' },
    { title: 'Display Name', dataIndex: 'gym_display_name', key: 'gym_display_name' },
    { title: 'Owner', dataIndex: 'owner_full_name', key: 'owner_full_name' },
    { title: 'Business Email', dataIndex: 'business_email', key: 'business_email' },
    { title: 'Plan', dataIndex: 'plan_type', key: 'plan_type',
      render: (plan) => <Tag color="blue">{plan?.toUpperCase()}</Tag>
    },
    { title: 'Status', dataIndex: 'status', key: 'status',
      render: (status) => (
        <Tag color={status === 'approved' ? 'green' : status === 'pending' ? 'orange' : 'red'}>
          {status?.toUpperCase()}
        </Tag>
      )
    },
    { title: 'Verified', dataIndex: 'verified', key: 'verified',
      render: (verified) => <Tag color={verified ? 'green' : 'red'}>{verified ? 'YES' : 'NO'}</Tag>
    },
    { title: 'Actions', key: 'actions',
      render: (_, record) => (
        <>
          <Button size="small" onClick={() => fetchGymDetails(record)}>
            View Details
          </Button>
          {record.status === 'pending' && (
            <>
              <Button size="small" type="primary" onClick={() => updateGymStatus(record._id, 'approved')}>
                Approve
              </Button>
              <Button size="small" danger onClick={() => updateGymStatus(record._id, 'rejected')}>
                Reject
              </Button>
            </>
          )}
          {record.status === 'approved' && (
            <Button size="small" danger onClick={() => updateGymStatus(record._id, 'banned')}>
              Ban
            </Button>
          )}
        </>
      )
    }
  ];

  return (
    <div>
      <h2>Gym Management</h2>
      <Table dataSource={gyms} columns={columns} rowKey="_id" />

      <Modal title={selectedGym?.gym_display_name || selectedGym?.gym_name} open={gymModal} onCancel={() => setGymModal(false)} width={800} footer={null}>
        {selectedGym && (
          <Tabs>
            <Tabs.TabPane tab="Core Details" key="core">
              <Descriptions>
                <Descriptions.Item label="Gym ID">{selectedGym.gym_id}</Descriptions.Item>
                <Descriptions.Item label="Official Name">{selectedGym.gym_name}</Descriptions.Item>
                <Descriptions.Item label="Display Name">{selectedGym.gym_display_name}</Descriptions.Item>
                <Descriptions.Item label="Owner">{selectedGym.owner_full_name}</Descriptions.Item>
                <Descriptions.Item label="Business Email">{selectedGym.business_email}</Descriptions.Item>
                <Descriptions.Item label="Business Phone">{selectedGym.business_phone_number}</Descriptions.Item>
                <Descriptions.Item label="Registered Address">{selectedGym.registered_address}</Descriptions.Item>
                <Descriptions.Item label="GST Number">{selectedGym.gst_number}</Descriptions.Item>
                <Descriptions.Item label="PAN Number">{selectedGym.pan_number}</Descriptions.Item>
                <Descriptions.Item label="Plan Type">{selectedGym.plan_type}</Descriptions.Item>
              </Descriptions>
            </Tabs.TabPane>
            <Tabs.TabPane tab="Analytics" key="analytics">
              <Descriptions>
                <Descriptions.Item label="Active Members">{selectedGym.analytics?.active_members || 0}</Descriptions.Item>
                <Descriptions.Item label="Total Visitors">{selectedGym.analytics?.total_visitors || 0}</Descriptions.Item>
                <Descriptions.Item label="Total Trainers">{selectedGym.trainers_list?.length || 0}</Descriptions.Item>
                <Descriptions.Item label="Total Revenue">₹{selectedGym.analytics?.total_revenue || 0}</Descriptions.Item>
                <Descriptions.Item label="Last Login">{selectedGym.last_login ? new Date(selectedGym.last_login).toLocaleDateString() : 'Never'}</Descriptions.Item>
                <Descriptions.Item label="Subscription Status">{selectedGym.subscription_status}</Descriptions.Item>
              </Descriptions>
            </Tabs.TabPane>
            <Tabs.TabPane tab="Services" key="services">
              <Descriptions>
                <Descriptions.Item label="Amenities">{selectedGym.amenities_list?.join(', ') || 'None'}</Descriptions.Item>
                <Descriptions.Item label="Services">{selectedGym.services_offered?.join(', ') || 'None'}</Descriptions.Item>
                <Descriptions.Item label="Trainers">{selectedGym.trainers_list?.length || 0}</Descriptions.Item>
                <Descriptions.Item label="Location">{selectedGym.location?.city}, {selectedGym.location?.state} - {selectedGym.location?.pin}</Descriptions.Item>
              </Descriptions>
            </Tabs.TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
};

export default AdminGyms;