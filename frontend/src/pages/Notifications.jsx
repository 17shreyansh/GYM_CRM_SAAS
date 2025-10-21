import React, { useState, useEffect } from 'react';
import { Card, List, Button, Typography, Empty, Tag, Space } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import api from '../utils/api';

const { Title, Text } = Typography;

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/user/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/user/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/user/notifications/read-all');
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'success': return 'green';
      case 'warning': return 'orange';
      case 'error': return 'red';
      default: return 'blue';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BellOutlined />
            Notifications
          </Title>
          <Text type="secondary">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All notifications read'}
          </Text>
        </div>
        {unreadCount > 0 && (
          <Button 
            type="primary" 
            icon={<CheckOutlined />}
            onClick={markAllAsRead}
          >
            Mark All Read
          </Button>
        )}
      </div>

      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <Empty 
            description="No notifications yet" 
            style={{ padding: 40 }}
          />
        ) : (
          <List
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                style={{
                  backgroundColor: item.read ? 'transparent' : '#f6ffed',
                  borderLeft: `4px solid ${item.type === 'success' ? '#52c41a' : item.type === 'warning' ? '#faad14' : item.type === 'error' ? '#ff4d4f' : '#1890ff'}`,
                  padding: '16px 24px',
                  cursor: item.read ? 'default' : 'pointer'
                }}
                onClick={() => !item.read && markAsRead(item._id)}
              >
                <List.Item.Meta
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: item.read ? 'normal' : 'bold' }}>
                        {item.title}
                      </span>
                      <Space>
                        <Tag color={getTypeColor(item.type)}>{item.type}</Tag>
                        {!item.read && (
                          <div style={{ 
                            width: 8, 
                            height: 8, 
                            borderRadius: '50%', 
                            backgroundColor: '#1890ff' 
                          }} />
                        )}
                      </Space>
                    </div>
                  }
                  description={
                    <div>
                      <p style={{ margin: '8px 0', color: '#595959' }}>
                        {item.message}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8c8c8c' }}>
                        <span>{item.gym_id?.gym_display_name || item.gym_id?.gym_name}</span>
                        <span>{new Date(item.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default Notifications;