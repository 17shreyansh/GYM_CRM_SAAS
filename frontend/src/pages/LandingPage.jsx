import React from 'react';
import { Card, Button, Row, Col } from 'antd';
import { CrownOutlined, ShopOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const portals = [
    {
      title: 'Member Portal',
      description: 'Join gyms, manage memberships, track attendance',
      icon: <TeamOutlined style={{ fontSize: 48, color: '#52c41a' }} />,
      color: '#52c41a',
      path: '/member-login',
      features: ['Discover Gyms', 'Join Memberships', 'Track Attendance', 'Payment History']
    },
    {
      title: 'Gym Owner Portal',
      description: 'Manage your gym, members, and business operations',
      icon: <ShopOutlined style={{ fontSize: 48, color: '#1890ff' }} />,
      color: '#1890ff',
      path: '/gym-login',
      features: ['Gym Management', 'Member Management', 'Plan Creation', 'Analytics']
    },
    {
      title: 'Admin Portal',
      description: 'Platform administration and oversight',
      icon: <CrownOutlined style={{ fontSize: 48, color: '#faad14' }} />,
      color: '#faad14',
      path: '/login',
      features: ['Gym Approval', 'User Management', 'Revenue Tracking', 'System Analytics']
    }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{ textAlign: 'center', marginBottom: 48, color: 'white' }}>
        <h1 style={{ fontSize: 48, margin: 0, color: 'white', fontWeight: 'bold' }}>
          Gym SaaS Platform
        </h1>
        <p style={{ fontSize: 20, margin: '16px 0 0 0', opacity: 0.9 }}>
          Complete gym management solution for everyone
        </p>
      </div>

      <Row gutter={[32, 32]} style={{ maxWidth: 1200, width: '100%' }}>
        {portals.map((portal, index) => (
          <Col xs={24} md={8} key={index}>
            <Card
              hoverable
              style={{
                height: '100%',
                textAlign: 'center',
                borderRadius: 16,
                border: 'none',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)'
              }}
              bodyStyle={{ padding: 32 }}
            >
              <div style={{ marginBottom: 24 }}>
                {portal.icon}
              </div>
              
              <h2 style={{ 
                fontSize: 24, 
                fontWeight: 'bold', 
                margin: '0 0 12px 0',
                color: portal.color 
              }}>
                {portal.title}
              </h2>
              
              <p style={{ 
                fontSize: 16, 
                color: '#666', 
                margin: '0 0 24px 0',
                lineHeight: 1.5 
              }}>
                {portal.description}
              </p>

              <div style={{ marginBottom: 32 }}>
                {portal.features.map((feature, idx) => (
                  <div key={idx} style={{
                    padding: '8px 0',
                    fontSize: 14,
                    color: '#888',
                    borderBottom: idx < portal.features.length - 1 ? '1px solid #f0f0f0' : 'none'
                  }}>
                    ✓ {feature}
                  </div>
                ))}
              </div>

              <Button
                type="primary"
                size="large"
                block
                style={{
                  height: 48,
                  fontSize: 16,
                  fontWeight: 'bold',
                  backgroundColor: portal.color,
                  borderColor: portal.color,
                  borderRadius: 8
                }}
                onClick={() => navigate(portal.path)}
              >
                Access {portal.title}
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      <div style={{ 
        marginTop: 48, 
        textAlign: 'center', 
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14 
      }}>
        <p>© 2024 Gym SaaS Platform. All rights reserved.</p>
      </div>
    </div>
  );
};

export default LandingPage;