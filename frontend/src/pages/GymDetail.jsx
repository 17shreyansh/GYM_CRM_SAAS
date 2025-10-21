import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, message, Tag, Space, Divider, Image } from 'antd';
import { ArrowLeftOutlined, EnvironmentOutlined, ClockCircleOutlined, PhoneOutlined, CreditCardOutlined, DollarOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const GymDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [gym, setGym] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGymDetails();
  }, [slug]);

  useEffect(() => {
    if (gym?._id) {
      fetchPlans();
    }
  }, [gym]);

  const fetchGymDetails = async () => {
    try {
      const response = await api.get(`/user/gyms/${slug}`);
      setGym(response.data);
    } catch (error) {
      console.error('Failed to fetch gym details:', error);
      message.error('Failed to load gym details');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await api.get(`/user/gyms/${gym._id}/plans`);
      setPlans(response.data);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

  const joinGym = async (planId, joinMethod) => {
    try {
      if (joinMethod === 'online') {
        const { initiatePayment } = await import('../utils/payment');
        await initiatePayment(gym._id, planId);
        message.success('Payment successful! Welcome to the gym!');
      } else {
        await api.post('/user/join', { gymId: gym._id, planId, joinMethod: 'cash' });
        message.success('Request sent to gym owner for approval');
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to join gym');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!gym) return <div>Gym not found</div>;

  return (
    <div>
      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/gyms')}
          style={{ marginBottom: 16 }}
        >
          Back to Gyms
        </Button>
        
        <Row gutter={24}>
          <Col span={8}>
            {gym.logo ? (
              <Image
                src={gym.logo}
                alt={gym.name}
                style={{ width: '100%', height: 250, objectFit: 'cover', borderRadius: 8 }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: 250,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '48px',
                fontWeight: 'bold',
                borderRadius: 8
              }}>
                {gym.name.charAt(0)}
              </div>
            )}
          </Col>
          
          <Col span={16}>
            <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>{gym.name}</h1>
            
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <EnvironmentOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                <span style={{ fontSize: '16px' }}>{gym.address}</span>
              </div>
              
              {gym.operatingHours && (
                <div>
                  <ClockCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                  <span style={{ fontSize: '16px' }}>
                    {gym.operatingHours.open} - {gym.operatingHours.close}
                  </span>
                </div>
              )}
              
              {gym.phone && (
                <div>
                  <PhoneOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                  <span style={{ fontSize: '16px' }}>{gym.phone}</span>
                </div>
              )}
              
              {gym.description && (
                <div>
                  <p style={{ fontSize: '16px', color: '#666', marginTop: 16 }}>
                    {gym.description}
                  </p>
                </div>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Membership Plans */}
      <Card title={<h2>Membership Plans</h2>}>
        <Row gutter={16}>
          {plans.map(plan => (
            <Col xs={24} sm={12} lg={8} key={plan._id} style={{ marginBottom: 24 }}>
              <Card
                title={plan.name}
                extra={<Tag color="blue">₹{plan.price}</Tag>}
                style={{ height: '100%' }}
                actions={[
                  <Button 
                    type="primary" 
                    icon={<CreditCardOutlined />}
                    onClick={() => joinGym(plan._id, 'online')}
                    block
                  >
                    Pay Online ₹{plan.price}
                  </Button>,
                  <Button 
                    icon={<DollarOutlined />}
                    onClick={() => joinGym(plan._id, 'cash')}
                    block
                  >
                    Pay in Cash
                  </Button>
                ]}
              >
                <div style={{ minHeight: 120 }}>
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: 16 }}>
                    {plan.description}
                  </p>
                  
                  <Divider style={{ margin: '12px 0' }} />
                  
                  <Row gutter={16}>
                    <Col span={12}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
                          {plan.duration}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Days</div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#52c41a' }}>
                          ₹{Math.round(plan.price / plan.duration)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Per Day</div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
        
        {plans.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            No membership plans available at the moment.
          </div>
        )}
      </Card>
    </div>
  );
};

export default GymDetail;