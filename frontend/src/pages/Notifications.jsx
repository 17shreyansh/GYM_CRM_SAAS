import React, { useState, useEffect } from 'react';
import { Button, Tag } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import api from '../utils/api';

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
      <div className="mobile-card">
        <div className="mobile-card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
                <BellOutlined />
                Notifications
              </h2>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
                {unreadCount > 0 ? `${unreadCount} unread` : 'All read'}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button 
                type="primary" 
                icon={<CheckOutlined />}
                onClick={markAllAsRead}
                size="small"
              >
                Mark All Read
              </Button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="mobile-card">
          <div className="mobile-card-body" style={{ textAlign: 'center', padding: 40 }}>
            <BellOutlined style={{ fontSize: 48, color: 'var(--text-muted)', marginBottom: 16 }} />
            <p style={{ color: 'var(--text-secondary)' }}>Loading notifications...</p>
          </div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="mobile-card">
          <div className="mobile-card-body" style={{ textAlign: 'center', padding: 40 }}>
            <BellOutlined style={{ fontSize: 48, color: 'var(--text-muted)', marginBottom: 16 }} />
            <h3 style={{ color: 'var(--text-secondary)' }}>No Notifications</h3>
            <p style={{ color: 'var(--text-muted)' }}>You're all caught up!</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {notifications.map((item) => (
            <div 
              key={item._id}
              className="mobile-card"
              style={{
                backgroundColor: item.read ? 'var(--bg-primary)' : 'rgb(99 102 241 / 0.05)',
                borderLeft: `4px solid ${item.type === 'success' ? 'var(--success-color)' : item.type === 'warning' ? 'var(--warning-color)' : item.type === 'error' ? 'var(--error-color)' : 'var(--primary-color)'}`,
                cursor: item.read ? 'default' : 'pointer'
              }}
              onClick={() => !item.read && markAsRead(item._id)}
            >
              <div className="mobile-card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <h4 style={{ 
                    margin: 0, 
                    fontWeight: item.read ? 500 : 600,
                    color: 'var(--text-primary)',
                    fontSize: '16px'
                  }}>
                    {item.title}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Tag color={getTypeColor(item.type)} style={{ margin: 0 }}>
                      {item.type}
                    </Tag>
                    {!item.read && (
                      <div style={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        backgroundColor: 'var(--primary-color)'
                      }} />
                    )}
                  </div>
                </div>
                
                <p style={{ 
                  margin: '8px 0 12px 0', 
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                  lineHeight: 1.5
                }}>
                  {item.message}
                </p>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontSize: '12px', 
                  color: 'var(--text-muted)'
                }}>
                  <span>{item.gym_id?.gym_display_name || item.gym_id?.gym_name || 'System'}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;