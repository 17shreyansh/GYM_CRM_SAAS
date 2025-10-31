import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Tag } from 'antd';
import { SearchOutlined, EnvironmentOutlined, ClockCircleOutlined, PhoneOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const { Search } = Input;
const { Option } = Select;

const GymDiscovery = () => {
  const navigate = useNavigate();
  const [gyms, setGyms] = useState([]);
  const [filteredGyms, setFilteredGyms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchGyms();
  }, []);

  useEffect(() => {
    filterAndSortGyms();
  }, [gyms, searchTerm, sortBy]);

  const fetchGyms = async () => {
    try {
      const response = await api.get('/user/gyms');
      setGyms(response.data);
    } catch (error) {
      console.error('Failed to fetch gyms:', error);
    }
  };

  const filterAndSortGyms = () => {
    let filtered = gyms.filter(gym => 
      gym.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gym.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'location':
          return a.address.localeCompare(b.address);
        default:
          return 0;
      }
    });

    setFilteredGyms(filtered);
  };



  return (
    <div>
      {/* Modern Search Section */}
      <div className="mobile-card" style={{ marginBottom: 20 }}>
        <div className="mobile-card-body">
          <div style={{ marginBottom: 16 }}>
            <Search
              placeholder="Search gyms by name or location..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="large"
              style={{ marginBottom: 12 }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Select
              placeholder="Sort by"
              value={sortBy}
              onChange={setSortBy}
              style={{ width: 120 }}
              size="large"
            >
              <Option value="name">Name</Option>
              <Option value="location">Location</Option>
            </Select>
            <Tag color="blue" style={{ margin: 0 }}>
              {filteredGyms.length} gyms found
            </Tag>
          </div>
        </div>
      </div>

      {/* Modern Gyms Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {filteredGyms.map(gym => (
          <div key={gym._id} className="mobile-card">
            {/* Gym Image/Logo */}
            <div style={{ position: 'relative', overflow: 'hidden' }}>
              {gym.logo ? (
                <img 
                  alt={gym.name} 
                  src={gym.logo} 
                  style={{ 
                    width: '100%',
                    height: 180, 
                    objectFit: 'cover'
                  }} 
                />
              ) : (
                <div style={{ 
                  height: 180, 
                  background: 'var(--bg-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '32px',
                  fontWeight: 'bold'
                }}>
                  {gym.name.charAt(0)}
                </div>
              )}
            </div>
            
            {/* Gym Info */}
            <div className="mobile-card-body">
              <h3 style={{ 
                margin: '0 0 12px 0', 
                fontSize: '18px', 
                fontWeight: 600, 
                color: 'var(--text-primary)'
              }}>
                {gym.name}
              </h3>
              
              <div style={{ marginBottom: 16 }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: 8,
                  color: 'var(--text-secondary)',
                  fontSize: '14px'
                }}>
                  <EnvironmentOutlined style={{ marginRight: 8, color: 'var(--primary-color)' }} />
                  {gym.address}
                </div>
                
                {gym.operatingHours && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: 8,
                    color: 'var(--text-secondary)',
                    fontSize: '14px'
                  }}>
                    <ClockCircleOutlined style={{ marginRight: 8, color: 'var(--primary-color)' }} />
                    {gym.operatingHours.open} - {gym.operatingHours.close}
                  </div>
                )}
                
                {gym.phone && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    color: 'var(--text-secondary)',
                    fontSize: '14px'
                  }}>
                    <PhoneOutlined style={{ marginRight: 8, color: 'var(--primary-color)' }} />
                    {gym.phone}
                  </div>
                )}
              </div>
              
              <Button 
                type="primary" 
                icon={<EyeOutlined />}
                block
                size="large"
                onClick={() => navigate(`/gym/${gym.slug}`)}
              >
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredGyms.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          color: 'var(--text-secondary)'
        }}>
          <SearchOutlined style={{ fontSize: '48px', marginBottom: '16px', color: 'var(--text-muted)' }} />
          <h3 style={{ color: 'var(--text-secondary)' }}>No gyms found</h3>
          <p>Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};

export default GymDiscovery;