import React, { useState, useEffect } from 'react';
import { Badge, Dropdown, List, Button, Typography, Empty, Spin } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import api from '../utils/api';

const { Text } = Typography;

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/user/notifications/unread-count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    if (notifications.length > 0) return; // Already loaded
    
    setLoading(true);
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
      setUnreadCount(prev => Math.max(0, prev - 1));
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
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'success': return '#52c41a';
      case 'warning': return '#faad14';
      case 'error': return '#ff4d4f';
      default: return '#1890ff';
    }
  };

  const handleOpenChange = (flag) => {
    setOpen(flag);
    if (flag) {
      fetchNotifications();
    }
  };

  const dropdownRender = () => (
    <div style={{ 
      width: 380, 
      maxHeight: 450, 
      backgroundColor: '#fff',
      borderRadius: 8,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      border: '1px solid #e8e8e8'
    }}>
      <div style={{ 
        padding: '16px 20px', 
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fafafa'
      }}>
        <Text strong style={{ fontSize: 16 }}>Notifications</Text>
        {unreadCount > 0 && (
          <Button 
            type="link" 
            size="small" 
            onClick={markAllAsRead}
            icon={<CheckOutlined />}
            style={{ padding: 0 }}
          >
            Mark all read
          </Button>
        )}
      </div>
      
      <div style={{ maxHeight: 350, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <Spin />
          </div>
        ) : notifications.length === 0 ? (
          <Empty 
            description="No notifications" 
            style={{ padding: 40 }}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                style={{ 
                  padding: '16px 20px',
                  backgroundColor: item.read ? '#fff' : '#f6ffed',
                  borderLeft: `4px solid ${getTypeColor(item.type)}`,
                  cursor: 'pointer',
                  borderBottom: '1px solid #f5f5f5',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => !item.read && markAsRead(item._id)}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = item.read ? '#f9f9f9' : '#f0f9f0';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = item.read ? '#fff' : '#f6ffed';
                }}
              >
                <div style={{ width: '100%' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 6
                  }}>
                    <Text strong style={{ fontSize: 14, color: '#262626' }}>
                      {item.title}
                    </Text>
                    {!item.read && (
                      <div style={{ 
                        width: 10, 
                        height: 10, 
                        borderRadius: '50%', 
                        backgroundColor: '#1890ff',
                        marginTop: 2,
                        flexShrink: 0
                      }} />
                    )}
                  </div>
                  <Text style={{ fontSize: 13, color: '#595959', lineHeight: 1.4 }}>
                    {item.message}
                  </Text>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    marginTop: 10
                  }}>
                    <Text style={{ fontSize: 12, color: '#8c8c8c' }}>
                      {item.gym_id?.gym_display_name || item.gym_id?.gym_name}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#8c8c8c' }}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );

  return (
    <Dropdown
      dropdownRender={dropdownRender}
      trigger={['click']}
      open={open}
      onOpenChange={handleOpenChange}
      placement="bottomRight"
      overlayStyle={{
        position: 'fixed',
        zIndex: 9999
      }}
    >
      <Badge count={unreadCount} size="small">
        <Button 
          type="text" 
          icon={<BellOutlined />} 
          style={{ 
            border: 'none',
            boxShadow: 'none',
            color: unreadCount > 0 ? '#1890ff' : 'inherit',
            fontSize: '16px',
            width: 40,
            height: 40
          }}
        />
      </Badge>
    </Dropdown>
  );
};

export default NotificationBell;