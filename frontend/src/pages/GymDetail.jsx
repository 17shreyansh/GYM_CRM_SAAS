import React, { useState, useEffect } from 'react';
import { Button, message, Tag } from 'antd';
import { ArrowLeftOutlined, EnvironmentOutlined, ClockCircleOutlined, PhoneOutlined, QrcodeOutlined } from '@ant-design/icons';
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

  const joinGym = async (planId) => {
    // Redirect directly to payment page without creating membership yet
    navigate(`/payment/${gym._id}/${planId}`);
  };

  if (loading) return <div>Loading...</div>;
  if (!gym) return <div>Gym not found</div>;

  return (
    <div>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/gyms')}
        style={{ marginBottom: 16 }}
      >
        Back to Gyms
      </Button>
      
      <div className="mobile-card">
        <div style={{ position: 'relative', marginBottom: 20 }}>
          {gym.logo ? (
            <img
              src={gym.logo}
              alt={gym.name}
              style={{ 
                width: '100%', 
                height: 200, 
                objectFit: 'cover', 
                borderRadius: 'var(--radius-lg)'
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: 200,
              background: 'var(--bg-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '48px',
              fontWeight: 'bold',
              borderRadius: 'var(--radius-lg)'
            }}>
              {gym.name.charAt(0)}
            </div>
          )}
        </div>
        
        <div className="mobile-card-body">
          <h1 style={{ fontSize: '24px', margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
            {gym.name}
          </h1>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <EnvironmentOutlined style={{ color: 'var(--primary-color)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>{gym.address}</span>
            </div>
            
            {gym.operatingHours && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ClockCircleOutlined style={{ color: 'var(--success-color)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>
                  {gym.operatingHours.open} - {gym.operatingHours.close}
                </span>
              </div>
            )}
            
            {gym.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PhoneOutlined style={{ color: 'var(--warning-color)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>{gym.phone}</span>
              </div>
            )}
            
            {gym.description && (
              <p style={{ 
                color: 'var(--text-secondary)', 
                marginTop: 16, 
                lineHeight: 1.6,
                margin: '16px 0 0 0'
              }}>
                {gym.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mobile-card">
        <div className="mobile-card-header">
          <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Membership Plans</h2>
        </div>
        <div className="mobile-card-body">
          {plans.length > 0 ? (
            <div style={{ display: 'grid', gap: '16px' }}>
              {plans.map(plan => (
                <div key={plan._id} className="mobile-card">
                  <div className="mobile-card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{plan.name}</h3>
                      <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                        ₹{plan.price}
                      </Tag>
                    </div>
                    
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: '14px' }}>
                      {plan.description}
                    </p>
                    
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '16px',
                      padding: '16px',
                      background: 'var(--bg-tertiary)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: 16
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                          {plan.duration}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Days</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--success-color)' }}>
                          ₹{Math.round(plan.price / plan.duration)}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Per Day</div>
                      </div>
                    </div>
                    
                    <Button 
                      type="primary" 
                      icon={<QrcodeOutlined />}
                      onClick={() => joinGym(plan._id)}
                      block
                      size="large"
                    >
                      Select Plan - ₹{plan.price}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px', 
              color: 'var(--text-secondary)'
            }}>
              <QrcodeOutlined style={{ fontSize: '48px', marginBottom: '16px', color: 'var(--text-muted)' }} />
              <h3 style={{ color: 'var(--text-secondary)' }}>No Plans Available</h3>
              <p>No membership plans available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GymDetail;