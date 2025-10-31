import React, { useState, useEffect } from 'react';
import { Avatar, Button, Form, Input, message, Upload } from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const [form] = Form.useForm();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/user/profile');
      setProfileData(response.data);
      form.setFieldsValue(response.data);
    } catch (error) {
      message.error('Failed to load profile');
    }
  };

  const handleSave = async (values) => {
    setLoading(true);
    try {
      const response = await api.put('/user/profile', values);
      setProfileData(response.data);
      updateUser(response.data);
      message.success('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('photo', file);
      
      const response = await api.post('/user/upload-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setProfileData(prev => ({ ...prev, photo: response.data.photoUrl }));
      updateUser({ ...user, photo: response.data.photoUrl });
      message.success('Photo updated successfully');
    } catch (error) {
      message.error('Failed to upload photo');
    }
    return false;
  };

  if (!profileData) return <div>Loading...</div>;

  return (
    <div>
      <div className="mobile-card">
        <div className="mobile-card-body" style={{ textAlign: 'center' }}>
          <Avatar 
            size={100} 
            src={profileData.photo} 
            icon={<UserOutlined />}
            style={{ marginBottom: '16px', boxShadow: 'var(--shadow-md)' }}
          />
          <h2 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
            {profileData.name}
          </h2>
          <p style={{ margin: '0 0 16px 0', color: 'var(--text-secondary)' }}>
            {profileData.email}
          </p>
          <Upload
            beforeUpload={handlePhotoUpload}
            showUploadList={false}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />} size="small">
              Change Photo
            </Button>
          </Upload>
        </div>
      </div>
      
      <div className="mobile-card">
        <div className="mobile-card-header">
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Profile Information</h3>
        </div>
        <div className="mobile-card-body">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            disabled={!editing}
          >
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: 'Please enter your name' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Phone"
              name="phone"
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Address"
              name="address"
            >
              <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item>
              {editing ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    icon={<SaveOutlined />}
                  >
                    Save
                  </Button>
                  <Button onClick={() => {
                    setEditing(false);
                    form.setFieldsValue(profileData);
                  }}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button 
                  type="primary" 
                  onClick={() => setEditing(true)}
                  icon={<EditOutlined />}
                  block
                >
                  Edit Profile
                </Button>
              )}
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;